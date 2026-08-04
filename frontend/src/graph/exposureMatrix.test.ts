import { describe, expect, it } from "vitest";
import { exposureMatrix } from "./traversal";
import type { GraphData, GraphEdge } from "../types";

type Sub = GraphEdge["substitutability"];

/**
 * Two-constraint fixture exercising the matrix rules:
 *
 *   cowos  (multi-seed: nodes `pack` and `chip` both tagged)
 *     pack ─low──▶ chip ─low──▶ dc
 *   → chip is itself a seed yet appears (reached from the OTHER seed `pack`),
 *     and both chip and dc are single-source. Neither compR nor compU is
 *     reachable from cowos → those pairs are blank.
 *
 *   quartz (single seed: node `q-mine`)
 *     q-mine ─med──▶ q-wafer ─high─▶ compR   (a fully-known low-free route)
 *     q-mine ─low───────────────────▶ compR  (…while another route is a bottleneck)
 *     q-mine ─med──▶ mid-u ─(?)─────▶ compU  (low-free but undisclosed link)
 *   → compR has-redundancy, compU unknown. chip/dc are blank under quartz.
 *
 * chip/dc/compR/compU carry tickers (public); pack/q-mine/q-wafer/mid-u do not.
 */
function fixture(): GraphData {
  const node = (id: string, ticker: boolean, constraints: string[] = []) => ({
    id,
    name: id,
    layer: "chips" as const,
    type: "fab",
    ...(ticker ? { ticker: { symbol: id.toUpperCase() } } : {}),
    constraints,
    location: { lat: 0, lon: 0, country: "TW" },
    status: "operational",
    sources: [{ url: "https://example.com", date: "2024-01" }],
  });
  const edge = (id: string, from: string, to: string, substitutability?: Sub) => ({
    id,
    from,
    to,
    flow_type: "wafers",
    ...(substitutability ? { substitutability } : {}),
    sources: [{ url: "https://example.com", date: "2024-01" }],
  });
  const constraint = (id: string) => ({
    id,
    name: id,
    category: "test",
    description: id,
    sources: [{ url: "https://example.com", date: "2024-01" }],
  });
  return {
    meta: { generated_at: "", counts: {}, schema_version: "1.0.0" },
    nodes: [
      node("pack", false, ["cowos"]),
      node("chip", true, ["cowos"]),
      node("dc", true),
      node("q-mine", false, ["quartz"]),
      node("q-wafer", false),
      node("mid-u", false),
      node("compR", true),
      node("compU", true),
    ],
    edges: [
      edge("pack-chip", "pack", "chip", "low"),
      edge("chip-dc", "chip", "dc", "low"),
      edge("mine-wafer", "q-mine", "q-wafer", "medium"),
      edge("wafer-compR", "q-wafer", "compR", "high"),
      edge("mine-compR", "q-mine", "compR", "low"),
      edge("mine-midu", "q-mine", "mid-u", "medium"),
      edge("midu-compU", "mid-u", "compU"), // substitutability undisclosed
    ],
    constraints: [constraint("cowos"), constraint("quartz")],
  };
}

describe("exposureMatrix", () => {
  it("emits one row per constraint, in graph.constraints order", () => {
    const m = exposureMatrix(fixture());
    expect(m.rows.map((r) => r.constraintId)).toEqual(["cowos", "quartz"]);
  });

  it("columns are the reachable companies, most-exposed first", () => {
    const m = exposureMatrix(fixture());
    // single-source names (chip, dc) rank ahead of unknown (compU) then
    // has-redundancy (compR); chip < dc breaks the single-source tie by id.
    expect(m.companies).toEqual(["chip", "dc", "compU", "compR"]);
  });

  it("flags single-source under cowos with a citable traced path", () => {
    const cowos = exposureMatrix(fixture()).rows[0];
    expect(cowos.cells["chip"].status).toBe("single-source");
    expect(cowos.cells["dc"].status).toBe("single-source");
    // dc's shortest path is chip → dc (via the chip seed), carrying the low hop.
    expect(cowos.cells["dc"].depth).toBe(1);
    expect(cowos.cells["dc"].path.map((p) => p.edgeId)).toEqual(["chip-dc"]);
    expect(cowos.cells["dc"].path.every((p) => p.bottleneck)).toBe(true);
  });

  it("includes a seed company reached from another seed (multi-seed union)", () => {
    // `chip` is itself tagged (a seed) yet must appear because the OTHER seed
    // `pack` reaches it — the downstream-victim relationship the matrix shows.
    const cowos = exposureMatrix(fixture()).rows[0];
    expect(cowos.cells["chip"]).toBeDefined();
    expect(cowos.cells["chip"].path.map((p) => p.edgeId)).toEqual(["pack-chip"]);
  });

  it("leaves unreachable (constraint, company) pairs blank, never zero", () => {
    const [cowos, quartz] = exposureMatrix(fixture()).rows;
    expect(cowos.cells["compR"]).toBeUndefined();
    expect(cowos.cells["compU"]).toBeUndefined();
    expect(quartz.cells["chip"]).toBeUndefined();
    expect(quartz.cells["dc"]).toBeUndefined();
  });

  it("flags has-redundancy and traces the substitutable route, not the bottleneck", () => {
    const quartz = exposureMatrix(fixture()).rows[1];
    expect(quartz.cells["compR"].status).toBe("has-redundancy");
    expect(quartz.cells["compR"].path.map((p) => p.edgeId)).toEqual(["mine-wafer", "wafer-compR"]);
    expect(quartz.cells["compR"].path.some((p) => p.bottleneck)).toBe(false);
  });

  it("flags unknown when the only low-free route has an undisclosed link", () => {
    const quartz = exposureMatrix(fixture()).rows[1];
    expect(quartz.cells["compU"].status).toBe("unknown");
    expect(quartz.cells["compU"].path[1].substitutability).toBeNull();
  });
});
