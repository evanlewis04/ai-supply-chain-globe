import type { GraphData, GraphEdge } from "../types";

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

/**
 * The blast radius of a shock at `originId`, shaped as an `AffectedSet` so it
 * drops straight into the same `highlight` channel that constraints and Ask
 * answers drive. Nodes = the origin plus everything transitively downstream;
 * edges = every edge whose endpoints are both affected (the links carrying the
 * disruption forward). Mirrors the edge rule in `downstreamOfConstraint`.
 */
export function downstreamAffectedSet(graph: GraphData, originId: string): AffectedSet {
  const outgoing = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge.to);
    outgoing.set(edge.from, list);
  }

  const nodes = new Set<string>([originId]);
  const queue = [originId];
  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const to of outgoing.get(current) ?? []) {
      if (!nodes.has(to)) {
        nodes.add(to);
        queue.push(to);
      }
    }
  }

  const edges = new Set<string>();
  for (const edge of graph.edges) {
    if (nodes.has(edge.from) && nodes.has(edge.to)) edges.add(edge.id);
  }

  return { nodes, edges };
}

/** Whether a downstream public company can be re-sourced around a given shock.
 *  - `single-source`: EVERY path from the origin crosses a `substitutability:
 *    "low"` edge — no route avoids a hard bottleneck.
 *  - `has-redundancy`: at least one path exists whose links are all a KNOWN
 *    medium/high substitutability — a confirmed alternative route.
 *  - `unknown`: the only low-free route(s) contain a link whose substitutability
 *    is undisclosed, so redundancy can be neither confirmed nor ruled out. */
export type ExposureStatus = "single-source" | "has-redundancy" | "unknown";

/** One hop of a traced origin → company path, carrying the fields the readout
 *  needs to justify the exposure and cite it. */
export interface ExposurePathEdge {
  edgeId: string;
  from: string;
  to: string;
  flowType: string;
  substitutability: "low" | "medium" | "high" | null;
  /** true when `substitutability === "low"` — a structural single-source link. */
  bottleneck: boolean;
}

/** A public company caught in a shock's blast radius, with the structural
 *  single-source verdict and one representative traced+citable path. */
export interface CompanyExposure {
  nodeId: string;
  /** shortest hop distance from the origin */
  depth: number;
  status: ExposureStatus;
  /** origin → company, edge by edge. For `single-source` this is a shortest
   *  path (guaranteed to contain the bottleneck); for `has-redundancy` it is
   *  the substitutable route, so the alternative is what's shown. */
  path: ExposurePathEdge[];
}

function toPathEdge(e: GraphEdge): ExposurePathEdge {
  return {
    edgeId: e.id,
    from: e.from,
    to: e.to,
    flowType: e.flow_type,
    substitutability: e.substitutability ?? null,
    bottleneck: e.substitutability === "low",
  };
}

/**
 * Structural exposure readout for a disruption at `originId`: for every
 * downstream node that carries a `ticker` (a public company), classify whether
 * this shock leaves it single-sourced, using the all-paths rule above, and
 * return a citable traced path. Purely structural — asserts only what the
 * edges' `substitutability` supports, never a dollar impact.
 *
 * The graph is a small DAG (≈16 edges), so exhaustively enumerating simple
 * paths is cheap; the on-path guard keeps it safe against accidental cycles.
 */
export function exposureFromNode(graph: GraphData, originId: string): CompanyExposure[] {
  const outgoing = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge);
    outgoing.set(edge.from, list);
  }

  // All simple paths origin → X, each as its edge chain.
  const pathsTo = new Map<string, GraphEdge[][]>();
  const onPath = new Set<string>([originId]);
  const chain: GraphEdge[] = [];
  const dfs = (current: string) => {
    for (const edge of outgoing.get(current) ?? []) {
      if (onPath.has(edge.to)) continue; // never revisit a node on the current path
      chain.push(edge);
      const list = pathsTo.get(edge.to) ?? [];
      list.push([...chain]);
      pathsTo.set(edge.to, list);
      onPath.add(edge.to);
      dfs(edge.to);
      onPath.delete(edge.to);
      chain.pop();
    }
  };
  dfs(originId);

  const tickerNodes = new Set(graph.nodes.filter((n) => n.ticker).map((n) => n.id));

  const result: CompanyExposure[] = [];
  for (const [nodeId, paths] of pathsTo) {
    if (!tickerNodes.has(nodeId)) continue;
    const analyzed = paths.map((edges) => ({
      edges,
      hasLow: edges.some((e) => e.substitutability === "low"),
      hasUnknown: edges.some((e) => e.substitutability == null),
      len: edges.length,
    }));
    const depth = Math.min(...analyzed.map((a) => a.len));

    let status: ExposureStatus;
    let chosen: GraphEdge[];
    if (analyzed.every((a) => a.hasLow)) {
      status = "single-source";
      chosen = [...analyzed].sort((a, b) => a.len - b.len)[0].edges;
    } else {
      const lowFree = analyzed.filter((a) => !a.hasLow);
      const knownRedundant = lowFree
        .filter((a) => !a.hasUnknown)
        .sort((a, b) => a.len - b.len);
      if (knownRedundant.length > 0) {
        status = "has-redundancy";
        chosen = knownRedundant[0].edges;
      } else {
        status = "unknown";
        chosen = [...analyzed].sort((a, b) => a.len - b.len)[0].edges;
      }
    }
    result.push({ nodeId, depth, status, path: chosen.map(toPathEdge) });
  }

  // Most-exposed first, then nearest, then id — stable for snapshots/tests.
  const rank: Record<ExposureStatus, number> = {
    "single-source": 0,
    unknown: 1,
    "has-redundancy": 2,
  };
  result.sort(
    (a, b) =>
      rank[a.status] - rank[b.status] ||
      a.depth - b.depth ||
      a.nodeId.localeCompare(b.nodeId)
  );
  return result;
}
