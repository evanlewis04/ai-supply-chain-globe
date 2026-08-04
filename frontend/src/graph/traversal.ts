import type { GraphData, GraphEdge } from "../types";

export interface AffectedSet {
  nodes: Set<string>;
  edges: Set<string>;
}

/**
 * The nodes a constraint enters the graph at: nodes tagged with the constraint,
 * plus the `to` endpoints of edges tagged with it. This is the constraint's
 * origin/seed set — where its bottleneck first bites — reused by both the
 * downstream blast radius and the Phase 2 exposure matrix so the seeding rule
 * lives in exactly one place.
 */
export function constraintSeeds(graph: GraphData, constraintId: string): Set<string> {
  const seeds = new Set<string>();
  for (const node of graph.nodes) {
    if (node.constraints?.includes(constraintId)) seeds.add(node.id);
  }
  for (const edge of graph.edges) {
    if (edge.constraints?.includes(constraintId)) seeds.add(edge.to);
  }
  return seeds;
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
  const seedNodes = constraintSeeds(graph, constraintId);

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

/** Rank for ordering by exposure severity — most-exposed (single-source) first.
 *  Shared by the per-node readout and the matrix column ordering. */
const EXPOSURE_RANK: Record<ExposureStatus, number> = {
  "single-source": 0,
  unknown: 1,
  "has-redundancy": 2,
};

/**
 * All simple forward paths from any of `origins`, keyed by the node each path
 * ends at (each path is its edge chain, origin → node).
 *
 * Paths are enumerated per origin with its own on-path guard, then unioned. The
 * per-origin guard (rather than one shared visited set) is deliberate: under a
 * multi-seed constraint a node that is itself a seed still appears as exposed
 * when a *different* seed reaches it (e.g. TSMC-packaging → Nvidia), which is
 * exactly the downstream-victim relationship the matrix must show.
 *
 * The graph is a small DAG (≈16 edges), so exhaustively enumerating simple
 * paths is cheap; the on-path guard keeps it safe against accidental cycles.
 */
function enumeratePathsFrom(graph: GraphData, origins: Iterable<string>): Map<string, GraphEdge[][]> {
  const outgoing = new Map<string, GraphEdge[]>();
  for (const edge of graph.edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge);
    outgoing.set(edge.from, list);
  }

  const pathsTo = new Map<string, GraphEdge[][]>();
  for (const origin of origins) {
    const onPath = new Set<string>([origin]);
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
    dfs(origin);
  }
  return pathsTo;
}

/**
 * The all-paths single-source rule applied to every path reaching one company:
 * returns the verdict, the shortest-hop depth, and one representative traced
 * path (a shortest bottleneck path for single-source — guaranteed to carry the
 * low edge; the known-redundant route otherwise). The single classifier behind
 * both `exposureFromNode` and `exposureMatrix`, so there is exactly one rule.
 */
function classifyPaths(paths: GraphEdge[][]): {
  status: ExposureStatus;
  depth: number;
  path: ExposurePathEdge[];
} {
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
  return { status, depth, path: chosen.map(toPathEdge) };
}

/**
 * Structural exposure readout for a disruption at `originId`: for every
 * downstream node that carries a `ticker` (a public company), classify whether
 * this shock leaves it single-sourced, using the all-paths rule above, and
 * return a citable traced path. Purely structural — asserts only what the
 * edges' `substitutability` supports, never a dollar impact.
 *
 * Delegates path enumeration to `enumeratePathsFrom` with a one-element origin
 * set, so its behavior (and `exposure.test.ts`) is unchanged by the Phase 2
 * generalization — that regression is the proof the refactor is behavior-safe.
 */
export function exposureFromNode(graph: GraphData, originId: string): CompanyExposure[] {
  const pathsTo = enumeratePathsFrom(graph, [originId]);
  const tickerNodes = new Set(graph.nodes.filter((n) => n.ticker).map((n) => n.id));

  const result: CompanyExposure[] = [];
  for (const [nodeId, paths] of pathsTo) {
    if (!tickerNodes.has(nodeId)) continue;
    const { status, depth, path } = classifyPaths(paths);
    result.push({ nodeId, depth, status, path });
  }

  // Most-exposed first, then nearest, then id — stable for snapshots/tests.
  result.sort(
    (a, b) =>
      EXPOSURE_RANK[a.status] - EXPOSURE_RANK[b.status] ||
      a.depth - b.depth ||
      a.nodeId.localeCompare(b.nodeId)
  );
  return result;
}

/** One (constraint → company) exposure verdict with its citable traced path. */
export interface MatrixCell {
  companyId: string;
  status: ExposureStatus;
  /** shortest hop distance from the nearest reaching seed */
  depth: number;
  /** seed → company, edge by edge, carrying the justifying substitutability. */
  path: ExposurePathEdge[];
}

/** One row of the exposure matrix: a constraint and its exposed public
 *  companies, keyed by company id. A company absent from `cells` is unreachable
 *  from this constraint (a blank cell — never a zero). */
export interface MatrixRow {
  constraintId: string;
  cells: Record<string, MatrixCell>;
}

export interface ExposureMatrix {
  /** column order: every company reachable from ≥1 constraint, most-exposed first */
  companies: string[];
  /** row order: `graph.constraints` order (stable) */
  rows: MatrixRow[];
}

/**
 * The chokepoint exposure matrix: rows = constraints, columns = the public
 * companies reachable from ≥1 constraint, each cell = the structural
 * single-source verdict for that (constraint → company) pair with a citable
 * traced path.
 *
 * For each constraint the origin set is its seed set (`constraintSeeds`), and a
 * company is single-sourced under the constraint iff *every* path from *any*
 * seed to it crosses a `substitutability: "low"` edge — the same all-paths rule
 * `exposureFromNode` uses (`classifyPaths`), generalized to the seed set. No new
 * classifier, no invented numeric score, no dollar figures.
 */
export function exposureMatrix(graph: GraphData): ExposureMatrix {
  const tickerNodes = new Set(graph.nodes.filter((n) => n.ticker).map((n) => n.id));

  const rows: MatrixRow[] = graph.constraints.map((c) => {
    const seeds = constraintSeeds(graph, c.id);
    const pathsTo = enumeratePathsFrom(graph, seeds);
    const cells: Record<string, MatrixCell> = {};
    for (const [nodeId, paths] of pathsTo) {
      if (!tickerNodes.has(nodeId)) continue;
      const { status, depth, path } = classifyPaths(paths);
      cells[nodeId] = { companyId: nodeId, status, depth, path };
    }
    return { constraintId: c.id, cells };
  });

  // Column set = every company appearing in ≥1 row. Order most-exposed first:
  // by best (lowest-rank) verdict anywhere, then by how many constraints flag it
  // single-source, then by breadth of exposure, then id — deterministic.
  const stats = new Map<string, { best: number; singles: number; total: number }>();
  for (const row of rows) {
    for (const cell of Object.values(row.cells)) {
      const s = stats.get(cell.companyId) ?? { best: Infinity, singles: 0, total: 0 };
      s.best = Math.min(s.best, EXPOSURE_RANK[cell.status]);
      if (cell.status === "single-source") s.singles += 1;
      s.total += 1;
      stats.set(cell.companyId, s);
    }
  }
  const companies = [...stats.keys()].sort((a, b) => {
    const sa = stats.get(a)!;
    const sb = stats.get(b)!;
    return (
      sa.best - sb.best ||
      sb.singles - sa.singles ||
      sb.total - sa.total ||
      a.localeCompare(b)
    );
  });

  return { companies, rows };
}
