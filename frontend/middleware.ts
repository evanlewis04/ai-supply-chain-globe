/**
 * Gate the entire hosted demo behind HTTP Basic Auth.
 *
 * This Vercel Edge Middleware runs in front of every request — pages, static
 * assets, and the /api/ask proxy — so the demo is private and the proxy is only
 * reachable by someone who has the password. Credentials come from Vercel env
 * vars (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD); rotate them in the dashboard
 * with no code redeploy.
 */
export const config = {
  // Match everything except Vercel's own internals (/_vercel/*), which must
  // stay reachable for analytics/insights.
  matcher: "/((?!_vercel).*)",
};

const REALM = 'Basic realm="AI Supply Chain Globe — demo", charset="UTF-8"';

export default function middleware(request: Request): Response {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  // Fail closed: if creds aren't configured, serve nothing rather than
  // exposing the site (and the proxy) unprotected.
  if (!user || !password) {
    return new Response("Auth is not configured for this deployment.", { status: 503 });
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(":");
    if (sep !== -1) {
      const u = decoded.slice(0, sep);
      const p = decoded.slice(sep + 1);
      if (safeEqual(u, user) && safeEqual(p, password)) {
        // Continue to the origin. This is exactly what @vercel/edge's `next()`
        // returns — emitted directly to avoid pulling in the dependency.
        return new Response(null, { headers: { "x-middleware-next": "1" } });
      }
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}

/** Length-invariant compare, so a mismatch doesn't leak length via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
