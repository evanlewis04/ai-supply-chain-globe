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

/** A node reached during traversal, with its shortest hop distance from the start. */
export interface ChainNode {
  id: string;
  depth: number;
}

/** Level-order traversal of `adj` from `start`, excluding `start`, recording the
 *  first (shortest) depth each node is reached at. Cycle-safe via the seen set. */
function bfsDepth(adj: Map<string, string[]>, start: string): ChainNode[] {
  const seen = new Set<string>([start]);
  const out: ChainNode[] = [];
  let frontier = [start];
  let depth = 0;
  while (frontier.length > 0) {
    depth++;
    const next: string[] = [];
    for (const current of frontier) {
      for (const neighbor of adj.get(current) ?? []) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          out.push({ id: neighbor, depth });
          next.push(neighbor);
        }
      }
    }
    frontier = next;
  }
  return out;
}

/** Everything that flows INTO `nodeId`, transitively (directed edges, followed
 *  backward to → from). The node's full upstream dependency chain. */
export function upstreamOfNode(graph: GraphData, nodeId: string): ChainNode[] {
  const incoming = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = incoming.get(edge.to) ?? [];
    list.push(edge.from);
    incoming.set(edge.to, list);
  }
  return bfsDepth(incoming, nodeId);
}

/** Everything `nodeId` flows INTO, transitively (directed edges, followed
 *  forward from → to). The node's full downstream blast radius. */
export function downstreamOfNode(graph: GraphData, nodeId: string): ChainNode[] {
  const outgoing = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge.to);
    outgoing.set(edge.from, list);
  }
  return bfsDepth(outgoing, nodeId);
}
