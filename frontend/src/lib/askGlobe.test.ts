import { describe, it, expect } from "vitest";
import { groundResult } from "./askGlobe";
import type { GraphData } from "../types";

const graph: GraphData = {
  meta: { generated_at: "2026-01-01", counts: {}, schema_version: "1" },
  nodes: [
    { id: "n1", name: "Node One", layer: "chips", type: "fab",
      location: { lat: 0, lon: 0, country: "TW" }, status: "operational", sources: [] },
    { id: "n2", name: "Node Two", layer: "chips", type: "packaging",
      location: { lat: 1, lon: 1, country: "TW" }, status: "operational", sources: [] },
  ],
  edges: [
    { id: "e1", from: "n1", to: "n2", flow_type: "wafers", sources: [] },
  ],
  constraints: [
    { id: "c1", name: "Chokepoint", category: "capacity", description: "x", sources: [] },
  ],
};

describe("groundResult", () => {
  it("keeps real ids and drops ones not in the graph", () => {
    const r = groundResult(graph, {
      answer: "a",
      node_ids: ["n1", "ghost-node"],
      edge_ids: ["e1", "ghost-edge"],
      constraint_id: "c1",
      references: [],
    });
    expect([...r.affected.nodes].sort()).toEqual(["n1", "n2"]); // e1 pulls in n2
    expect([...r.affected.edges]).toEqual(["e1"]);
    expect(r.constraintId).toBe("c1");
    expect(r.droppedIds.sort()).toEqual(["ghost-edge", "ghost-node"]);
  });

  it("adds a selected edge's endpoints even when node_ids omits them", () => {
    const r = groundResult(graph, {
      answer: "a", node_ids: [], edge_ids: ["e1"], constraint_id: null, references: [],
    });
    expect([...r.affected.nodes].sort()).toEqual(["n1", "n2"]);
  });

  it("nulls an unknown constraint and records it as dropped", () => {
    const r = groundResult(graph, {
      answer: "a", node_ids: [], edge_ids: [], constraint_id: "nope", references: [],
    });
    expect(r.constraintId).toBeNull();
    expect(r.droppedIds).toContain("nope");
  });

  it("keeps references that hit a real node and quote the answer verbatim", () => {
    const r = groundResult(graph, {
      answer: "Node One drives it, Missing does not.",
      node_ids: [], edge_ids: [], constraint_id: null,
      references: [
        { node_id: "n1", text: "Node One" },      // real + verbatim -> kept
        { node_id: "n2", text: "not in answer" },  // verbatim miss -> skipped
        { node_id: "ghost", text: "Missing" },     // unknown node -> dropped
      ],
    });
    expect(r.references).toEqual([{ nodeId: "n1", text: "Node One" }]);
    expect(r.affected.nodes.has("n1")).toBe(true);
    expect(r.affected.nodes.has("n2")).toBe(false);
    expect(r.droppedIds).toContain("ghost");
  });
});
