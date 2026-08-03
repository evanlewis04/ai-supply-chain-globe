import { describe, expect, it } from "vitest";
import { downstreamAffectedSet, exposureFromNode } from "./traversal";
import type { CompanyExposure } from "./traversal";
import type { GraphData, GraphEdge } from "../types";

type Sub = GraphEdge["substitutability"];

/**
 * Fixture exercising the all-paths single-source rule and its three verdicts:
 *
 *   origin ─low──▶ mid-a ─med──▶ comp-single      (only route crosses a low edge)
 *   origin ─med──▶ mid-b ─high─▶ comp-redundant   (a fully-known low-free route)
 *   origin ─low──▶ mid-a ─low──▶ comp-redundant   (…while another route is a bottleneck)
 *   origin ─med──▶ mid-b ─(?)──▶ comp-unknown     (low-free but substitutability undisclosed)
 *
 * comp-single/redundant/unknown carry tickers (public); mid-a/mid-b do not.
 */
function fixture(): GraphData {
  const node = (id: string, ticker = false) => ({
    id,
    name: id,
    layer: "chips" as const,
    type: "fab",
    ...(ticker ? { ticker: { symbol: id.toUpperCase() } } : {}),
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
  return {
    meta: { generated_at: "", counts: {}, schema_version: "1.0.0" },
    nodes: [
      node("origin"),
      node("mid-a"),
      node("mid-b"),
      node("comp-single", true),
      node("comp-redundant", true),
      node("comp-unknown", true),
    ],
    edges: [
      edge("o-a", "origin", "mid-a", "low"),
      edge("o-b", "origin", "mid-b", "medium"),
      edge("a-single", "mid-a", "comp-single", "medium"),
      edge("a-redundant", "mid-a", "comp-redundant", "low"),
      edge("b-redundant", "mid-b", "comp-redundant", "high"),
      edge("b-unknown", "mid-b", "comp-unknown"), // substitutability undisclosed
    ],
    constraints: [],
  };
}

const byId = (list: CompanyExposure[]) => Object.fromEntries(list.map((e) => [e.nodeId, e]));

describe("exposureFromNode", () => {
  it("returns only downstream public companies, ranked most-exposed first", () => {
    const list = exposureFromNode(fixture(), "origin");
    expect(list.map((e) => e.nodeId)).toEqual([
      "comp-single", // single-source ranks first
      "comp-unknown", // unknown next
      "comp-redundant", // has-redundancy last
    ]);
  });

  it("flags single-source when every path crosses a low-substitutability edge", () => {
    const e = byId(exposureFromNode(fixture(), "origin"))["comp-single"];
    expect(e.status).toBe("single-source");
    expect(e.depth).toBe(2);
    // The traced path carries the justifying bottleneck edge.
    expect(e.path.map((p) => p.edgeId)).toEqual(["o-a", "a-single"]);
    expect(e.path.filter((p) => p.bottleneck).map((p) => p.edgeId)).toEqual(["o-a"]);
  });

  it("flags has-redundancy and traces the substitutable route, not the bottleneck one", () => {
    const e = byId(exposureFromNode(fixture(), "origin"))["comp-redundant"];
    expect(e.status).toBe("has-redundancy");
    // Reachable via a low edge (mid-a) AND a fully medium/high route (mid-b);
    // the shown path is the redundant one, with no bottleneck hop.
    expect(e.path.map((p) => p.edgeId)).toEqual(["o-b", "b-redundant"]);
    expect(e.path.some((p) => p.bottleneck)).toBe(false);
  });

  it("flags unknown when the only low-free route has an undisclosed link", () => {
    const e = byId(exposureFromNode(fixture(), "origin"))["comp-unknown"];
    expect(e.status).toBe("unknown");
    expect(e.path.map((p) => p.edgeId)).toEqual(["o-b", "b-unknown"]);
    expect(e.path[1].substitutability).toBeNull();
  });

  it("excludes the origin itself and any non-public (ticker-less) node", () => {
    const ids = exposureFromNode(fixture(), "origin").map((e) => e.nodeId);
    expect(ids).not.toContain("origin");
    expect(ids).not.toContain("mid-a");
    expect(ids).not.toContain("mid-b");
  });

  it("is empty for a leaf origin with nothing downstream", () => {
    expect(exposureFromNode(fixture(), "comp-single")).toEqual([]);
  });
});

describe("downstreamAffectedSet", () => {
  it("includes the origin plus its full downstream blast radius", () => {
    const { nodes } = downstreamAffectedSet(fixture(), "origin");
    expect([...nodes].sort()).toEqual([
      "comp-redundant",
      "comp-single",
      "comp-unknown",
      "mid-a",
      "mid-b",
      "origin",
    ]);
  });

  it("includes every edge internal to the affected set", () => {
    const { edges } = downstreamAffectedSet(fixture(), "origin");
    expect([...edges].sort()).toEqual([
      "a-redundant",
      "a-single",
      "b-redundant",
      "b-unknown",
      "o-a",
      "o-b",
    ]);
  });

  it("is just the origin for a leaf node", () => {
    const { nodes, edges } = downstreamAffectedSet(fixture(), "comp-unknown");
    expect([...nodes]).toEqual(["comp-unknown"]);
    expect(edges.size).toBe(0);
  });
});
