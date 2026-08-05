import Anthropic from "@anthropic-ai/sdk";
import type { GraphData } from "../types";
import type { AffectedSet } from "../graph/traversal";

export const ASK_MODELS = {
  "claude-sonnet-4-6": "Sonnet 4.6 (best answers)",
  "claude-haiku-4-5": "Haiku 4.5 (fast & cheap)",
} as const;

export type AskModel = keyof typeof ASK_MODELS;
export const DEFAULT_ASK_MODEL: AskModel = "claude-sonnet-4-6";

export interface AskReference {
  /** Validated node id. */
  nodeId: string;
  /** The exact substring of the answer that names this entity. */
  text: string;
}

export interface AskResult {
  answer: string;
  /** Validated against the graph — hallucinated ids are dropped. */
  affected: AffectedSet;
  /** A constraint the model judged central to the answer, if any. */
  constraintId: string | null;
  /** Entity mentions in the answer, for click-to-open-node links. */
  references: AskReference[];
  /** Ids the model returned that don't exist in the graph (for transparency). */
  droppedIds: string[];
}

/**
 * Graph context for the prompt: the structured facts plus each entity's
 * analysis prose (the vault body, already stripped of reviewer notes at
 * build time) — the prose is what lets the model answer like an analyst
 * instead of a lookup table. Source bibliographies stay out (bulk without
 * answer value). Deterministic output — this string is the cached prefix,
 * so it must be byte-stable across calls.
 */
export function buildGraphContext(graph: GraphData): string {
  const nodes = graph.nodes.map((n) => ({
    id: n.id,
    name: n.name,
    layer: n.layer,
    type: n.type,
    operator: n.operator,
    region: n.location.region ?? n.location.country,
    capacity: n.capacity?.value != null ? `${n.capacity.value} ${n.capacity.unit}` : undefined,
    status: n.status,
    constraints: n.constraints?.length ? n.constraints : undefined,
    tags: n.tags?.length ? n.tags : undefined,
    analysis: n.body,
  }));
  const edges = graph.edges.map((e) => ({
    id: e.id,
    from: e.from,
    to: e.to,
    flow_type: e.flow_type,
    constraint_level: e.constraint_level,
    substitutability: e.substitutability,
    gated_by: e.constraints?.length ? e.constraints : undefined,
    notes: e.notes,
  }));
  const constraints = graph.constraints.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    severity: c.severity,
    description: c.description,
    metrics: c.metrics?.map((m) => `${m.value} ${m.unit} (as of ${m.as_of})${m.note ? ` — ${m.note}` : ""}`),
    analysis: c.body,
  }));
  return JSON.stringify({ nodes, edges, constraints });
}

export function systemPrompt(graph: GraphData): string {
  return `You are the resident analyst for an interactive 3D globe of the AI supply chain. \
The globe is a directed graph: nodes are real facilities/organizations, edges are typed \
flows between them (wafers, materials, equipment, power, compute...), and constraints \
are first-class bottleneck entities that gate specific edges. Every entity is backed by \
dated public sources in the underlying dataset.

The user asks a question; you answer it AND select which parts of the graph the globe \
should light up to illustrate the answer.

Voice — you are a sharp supply-chain analyst briefing a smart generalist:
- Lead with the answer, then support it with the sourced numbers. 2-4 sentences, plain \
prose, no markdown.
- Never mention "the graph", "the data", "the dataset", or your own limitations. If no \
public figure exists for exactly what was asked, give the closest sourced number and \
reason through the supply-chain structure to the honest expert conclusion. Example: \
asked what share of chips depend on Spruce Pine quartz, do not say the data lacks a \
per-chip figure — say that effectively all of them do, because every silicon ingot is \
pulled in an ultra-pure quartz crucible and an estimated 70-90% of those crucibles \
worldwide are made from Spruce Pine quartz.
- Stay within what the sourced facts support; structural inference is encouraged, \
invented numbers are forbidden. Only if the question is genuinely outside the supply \
chain covered here should you say so (and return empty id arrays).

Selection:
- node_ids / edge_ids: light up the full path that tells the story. For questions about \
dependency, disruption, or scale, that means the whole affected chain — upstream source \
through every downstream consumer (a good answer typically highlights 4-10 nodes and \
their connecting edges), not just the two endpoints. Use ONLY ids that exist in the \
graph data, and include the edges connecting the nodes you select.
- constraint_id: if one constraint entity is central to the answer, its id; else null.
- references: one entry per facility/company/product your answer mentions by name, \
with node_id (a real graph node id) and text set to the EXACT substring of your answer \
that names it (e.g. {"node_id": "tsmc-fab-18", "text": "TSMC's Fab 18"}). These become \
clickable links that open the node's detail panel with its sources.

Graph data:
${buildGraphContext(graph)}`;
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    node_ids: { type: "array", items: { type: "string" } },
    edge_ids: { type: "array", items: { type: "string" } },
    constraint_id: { anyOf: [{ type: "string" }, { type: "null" }] },
    references: {
      type: "array",
      items: {
        type: "object",
        properties: {
          node_id: { type: "string" },
          text: { type: "string" },
        },
        required: ["node_id", "text"],
        additionalProperties: false,
      },
    },
  },
  required: ["answer", "node_ids", "edge_ids", "constraint_id", "references"],
  additionalProperties: false,
} as const;

/** The raw Anthropic request. Identical for the dev direct-call path and the
 * hosted proxy path, so the cached prefix stays byte-stable across both. */
export function buildRequestParams(model: AskModel, graph: GraphData, question: string) {
  return {
    model,
    max_tokens: 1024,
    system: [
      {
        type: "text" as const,
        text: systemPrompt(graph),
        // The graph context is identical across questions — cache it so
        // repeat questions only pay for the question itself.
        cache_control: { type: "ephemeral" as const },
      },
    ],
    output_config: {
      format: { type: "json_schema" as const, schema: RESPONSE_SCHEMA },
    },
    messages: [{ role: "user" as const, content: question }],
  };
}

/** The model's JSON payload, before grounding against the graph. */
interface ParsedAnswer {
  answer: string;
  node_ids: string[];
  edge_ids: string[];
  constraint_id: string | null;
  references: { node_id: string; text: string }[];
}

/** Pull the model's JSON out of an Anthropic message response. */
function parseAnswer(content: { type: string; text?: string }[]): ParsedAnswer {
  const text = content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Empty response from the model.");
  return JSON.parse(text) as ParsedAnswer;
}

/** An error carrying the upstream HTTP status, so callers can special-case 401. */
export class AskError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "AskError";
  }
}

/**
 * Dev path: call Anthropic straight from the browser with a key the developer
 * pasted or supplied via VITE_ANTHROPIC_API_KEY. Never used in production
 * builds — the hosted demo goes through the server proxy (`askViaProxy`) so
 * the key is never in the browser.
 */
export async function askGlobe(
  apiKey: string,
  model: AskModel,
  graph: GraphData,
  question: string
): Promise<AskResult> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  const response = await client.messages.create(buildRequestParams(model, graph, question));
  return groundResult(graph, parseAnswer(response.content));
}

/**
 * Production path: POST the request to our own `/api/ask` serverless function,
 * which holds the demo key server-side (see frontend/api/ask.ts) and forwards
 * it to Anthropic. The key never reaches the browser; the whole site sits
 * behind Basic Auth so the proxy is not an open relay.
 */
export async function askViaProxy(
  model: AskModel,
  graph: GraphData,
  question: string
): Promise<AskResult> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildRequestParams(model, graph, question)),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    const message =
      (detail && typeof detail.error === "string" && detail.error) ||
      `Ask failed (HTTP ${res.status}).`;
    throw new AskError(message, res.status);
  }
  const response = (await res.json()) as { content: { type: string; text?: string }[] };
  return groundResult(graph, parseAnswer(response.content));
}

/**
 * Ground a model answer against the graph: drop ids that don't exist, pull in
 * every selected edge's endpoints, and keep only references that point at real
 * nodes and quote the answer verbatim. Pure — shared by both transports.
 */
export function groundResult(graph: GraphData, parsed: ParsedAnswer): AskResult {
  // Only ids that exist in the graph may render.
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const edgeIds = new Set(graph.edges.map((e) => e.id));
  const constraintIds = new Set(graph.constraints.map((c) => c.id));

  const droppedIds: string[] = [];
  const nodes = new Set<string>();
  for (const id of parsed.node_ids) {
    if (nodeIds.has(id)) nodes.add(id);
    else droppedIds.push(id);
  }
  const edges = new Set<string>();
  for (const id of parsed.edge_ids) {
    if (edgeIds.has(id)) edges.add(id);
    else droppedIds.push(id);
  }
  // An edge's endpoints belong in the highlight even if the model omitted them.
  for (const e of graph.edges) {
    if (edges.has(e.id)) {
      nodes.add(e.from);
      nodes.add(e.to);
    }
  }

  const constraintId =
    parsed.constraint_id && constraintIds.has(parsed.constraint_id) ? parsed.constraint_id : null;
  if (parsed.constraint_id && !constraintId) droppedIds.push(parsed.constraint_id);

  // References must point at real nodes and quote the answer verbatim;
  // anything mentioned by name belongs in the highlight too.
  const references: AskReference[] = [];
  for (const ref of parsed.references ?? []) {
    if (!nodeIds.has(ref.node_id)) {
      droppedIds.push(ref.node_id);
      continue;
    }
    if (!parsed.answer.includes(ref.text)) continue;
    references.push({ nodeId: ref.node_id, text: ref.text });
    nodes.add(ref.node_id);
  }

  return { answer: parsed.answer, affected: { nodes, edges }, constraintId, references, droppedIds };
}
