import { describe, expect, it } from "vitest";
import { downstreamOfConstraint } from "./traversal";
import type { GraphData } from "../types";

/**
 * Fixture mirroring the v1 slice shape:
 *
 *   grid ──power──▶ fab ──wafers──▶ pack ──modules*──▶ designer ──chips──▶ dc ──compute──▶ app
 *   hbm  ──memory──▶ pack                 (* gated by test-constraint)
 *
 * pack and designer are tagged with the constraint; hbm/fab/grid feed the
 * constrained node but are upstream, so they must NOT highlight.
 */
function fixture(): GraphData {
  const node = (id: string, constraints: string[] = []) => ({
    id,
    name: id,
    layer: "chips" as const,
    type: "fab",
    location: { lat: 0, lon: 0, country: "TW" },
    status: "operational",
    constraints,
    sources: [{ url: "https://example.com", date: "2024-01" }],
  });
  const edge = (id: string, from: string, to: string, constraints: string[] = []) => ({
    id,
    from,
    to,
    flow_type: "wafers",
    constraints,
    sources: [{ url: "https://example.com", date: "2024-01" }],
  });
  return {
    meta: { generated_at: "", counts: {}, schema_version: "1.0.0" },
    nodes: [
      node("grid"),
      node("fab"),
      node("hbm"),
      node("pack", ["test-constraint"]),
      node("designer", ["test-constraint"]),
      node("dc"),
      node("app"),
    ],
    edges: [
      edge("grid-fab", "grid", "fab"),
      edge("fab-pack", "fab", "pack"),
      edge("hbm-pack", "hbm", "pack"),
      edge("pack-designer", "pack", "designer", ["test-constraint"]),
      edge("designer-dc", "designer", "dc"),
      edge("dc-app", "dc", "app"),
    ],
    constraints: [],
  };
}

describe("downstreamOfConstraint", () => {
  it("includes tagged nodes and everything downstream of them", () => {
    const { nodes } = downstreamOfConstraint(fixture(), "test-constraint");
    expect([...nodes].sort()).toEqual(["app", "dc", "designer", "pack"]);
  });

  it("excludes upstream feeders of constrained nodes", () => {
    const { nodes } = downstreamOfConstraint(fixture(), "test-constraint");
    expect(nodes.has("fab")).toBe(false);
    expect(nodes.has("hbm")).toBe(false);
    expect(nodes.has("grid")).toBe(false);
  });

  it("includes tagged edges and edges leaving affected nodes, not edges arriving from upstream", () => {
    const { edges } = downstreamOfConstraint(fixture(), "test-constraint");
    expect([...edges].sort()).toEqual(["dc-app", "designer-dc", "pack-designer"]);
  });

  it("returns empty sets for an unknown constraint", () => {
    const { nodes, edges } = downstreamOfConstraint(fixture(), "nonexistent");
    expect(nodes.size).toBe(0);
    expect(edges.size).toBe(0);
  });

  it("seeds from a tagged edge's target even when no node is tagged", () => {
    const g = fixture();
    g.nodes = g.nodes.map((n) => ({ ...n, constraints: [] }));
    const { nodes } = downstreamOfConstraint(g, "test-constraint");
    expect([...nodes].sort()).toEqual(["app", "dc", "designer"]);
  });
});
