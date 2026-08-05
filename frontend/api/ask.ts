import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-side proxy for "Ask the Globe".
 *
 * The demo's Anthropic key lives ONLY here, as the server env var
 * ANTHROPIC_API_KEY. It is never VITE_-prefixed, so it is never bundled into
 * the browser and cannot be extracted from the shipped JavaScript. The client
 * POSTs the message body it wants to run; we inject the key and forward it to
 * Anthropic. The entire site sits behind Basic Auth (see ../middleware.ts), so
 * this is not an open relay — only a visitor who already has the demo password
 * can reach it.
 */
export const config = { runtime: "edge" };

// Bound abuse even for a password holder: only the two models the UI offers,
// and a hard output cap. Keep ALLOWED_MODELS in sync with ASK_MODELS in
// src/lib/askGlobe.ts.
const ALLOWED_MODELS = new Set(["claude-sonnet-4-6", "claude-haiku-4-5"]);
const MAX_TOKENS_CAP = 1024;

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json({ error: "Ask is not configured on this deployment." }, 503);
  }

  let body: {
    model?: string;
    system?: unknown;
    output_config?: unknown;
    messages?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const { model, system, output_config, messages } = body;
  if (typeof model !== "string" || !ALLOWED_MODELS.has(model)) {
    return json({ error: "Unsupported model." }, 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "Missing messages." }, 400);
  }

  // dangerouslyAllowBrowser only silences the SDK's browser guard, which can
  // false-positive on the Edge runtime. This is server code: the key comes from
  // a server env var and never leaves this function, so the guard is moot here.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  try {
    // max_tokens is fixed here, not taken from the client, so the cap holds.
    const response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS_CAP,
      system,
      output_config,
      messages,
    } as Anthropic.MessageCreateParamsNonStreaming);
    return json(response, 200);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 502;
    const message = e instanceof Error ? e.message : "Upstream error.";
    return json({ error: message }, status);
  }
}
