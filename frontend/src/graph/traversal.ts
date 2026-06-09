import type { GraphData } from "../types";

export interface AffectedSet {
  nodes: Set<string>;
  edges: Set<string>;
}

/**
 * Everything downstream of a constraint.
 *
 * Seeds: nodes tagged with the constraint, plus the `to` endpoints of
 * tagged edges. From the seeds, follow directed edges (from -> to) to
 * exhaustion. An edge is affected if it is tagged directly or if it
 * leaves an affected node.
 */
export function downstreamOfConstraint(graph: GraphData, constraintId: string): AffectedSet {
  const seedNodes = new Set<string>();

  for (const node of graph.nodes) {
    if (node.constraints?.includes(constraintId)) seedNodes.add(node.id);
  }
  for (const edge of graph.edges) {
    if (edge.constraints?.includes(constraintId)) seedNodes.add(edge.to);
  }

  const outgoing = new Map<string, { to: string; id: string }[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push({ to: edge.to, id: edge.id });
    outgoing.set(edge.from, list);
  }

  const nodes = new Set<string>(seedNodes);
  const queue = [...seedNodes];
  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const { to } of outgoing.get(current) ?? []) {
      if (!nodes.has(to)) {
        nodes.add(to);
        queue.push(to);
      }
    }
  }

  const edges = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.constraints?.includes(constraintId) || nodes.has(edge.from)) {
      edges.add(edge.id);
    }
  }

  return { nodes, edges };
}
