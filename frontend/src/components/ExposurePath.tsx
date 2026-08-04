import type { GraphData } from "../types";
import type { ExposurePathEdge } from "../graph/traversal";

interface Props {
  /** label for the path's origin (the shock node, or a constraint's name) */
  originLabel: string;
  path: ExposurePathEdge[];
  graph: GraphData;
  onSelectNode: (id: string) => void;
}

/** Human phrasing for an edge's substitutability, honest about the unknown. */
function subLabel(sub: ExposurePathEdge["substitutability"]): string {
  if (sub === null) return "substitutability undisclosed";
  if (sub === "low") return "low-substitutability";
  return `${sub} substitutability`;
}

/**
 * The traced origin → company path: node, edge (flow + substitutability +
 * source), node, … with the low-substitutability bottleneck hop marked. Shared
 * by the Phase 1 scenario readout and the Phase 2 exposure matrix so both cite
 * a supply route the same way.
 */
export default function ExposurePath({ originLabel, path, graph, onSelectNode }: Props) {
  const edgeById = new Map(graph.edges.map((e) => [e.id, e]));
  const nodeName = (id: string) => graph.nodes.find((n) => n.id === id)?.name ?? id;

  return (
    <ol className="exp-path">
      <li className="exp-path-node origin">{originLabel}</li>
      {path.map((hop) => {
        const edge = edgeById.get(hop.edgeId);
        const cite = edge?.sources[0];
        return [
          <li key={`${hop.edgeId}-edge`} className="exp-path-edge">
            <span className="exp-flow">{hop.flowType.replace(/_/g, " ")}</span>
            <span className={hop.bottleneck ? "exp-sub bottleneck" : "exp-sub"}>
              {subLabel(hop.substitutability)}
            </span>
            {cite && (
              <a
                className="exp-cite"
                href={cite.url}
                target="_blank"
                rel="noreferrer"
                title={cite.title ?? cite.url}
              >
                source ({cite.date})
              </a>
            )}
          </li>,
          <li key={`${hop.edgeId}-node`} className="exp-path-node">
            <button className="link-btn" onClick={() => onSelectNode(hop.to)}>
              {nodeName(hop.to)}
            </button>
          </li>,
        ];
      })}
    </ol>
  );
}
