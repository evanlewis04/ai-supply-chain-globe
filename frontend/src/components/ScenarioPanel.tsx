import { useMemo } from "react";
import type { GraphData, GraphNode, PricesData } from "../types";
import { exposureFromNode } from "../graph/traversal";
import type { CompanyExposure, ExposurePathEdge, ExposureStatus } from "../graph/traversal";
import Sparkline from "./Sparkline";

interface Props {
  origin: GraphNode;
  graph: GraphData;
  prices: PricesData | null;
  onSelectNode: (id: string) => void;
  onClear: () => void;
}

const STATUS_LABEL: Record<ExposureStatus, string> = {
  "single-source": "Single-source exposed",
  "has-redundancy": "Has redundancy",
  unknown: "Redundancy unknown",
};

/** Human phrasing for an edge's substitutability, honest about the unknown. */
function subLabel(sub: ExposurePathEdge["substitutability"]): string {
  if (sub === null) return "substitutability undisclosed";
  if (sub === "low") return "low-substitutability";
  return `${sub} substitutability`;
}

export default function ScenarioPanel({ origin, graph, prices, onSelectNode, onClear }: Props) {
  const exposures = useMemo(() => exposureFromNode(graph, origin.id), [graph, origin.id]);
  const edgeById = useMemo(() => {
    const m = new Map(graph.edges.map((e) => [e.id, e]));
    return m;
  }, [graph]);
  const nodeName = (id: string) => graph.nodes.find((n) => n.id === id)?.name ?? id;

  const singleSourced = exposures.filter((e) => e.status === "single-source").length;

  const renderPath = (exp: CompanyExposure) => (
    <ol className="exp-path">
      <li className="exp-path-node origin">{origin.name}</li>
      {exp.path.map((hop) => {
        const edge = edgeById.get(hop.edgeId);
        const cite = edge?.sources[0];
        return [
          <li key={`${hop.edgeId}-edge`} className="exp-path-edge">
            <span className="exp-flow">{hop.flowType.replace(/_/g, " ")}</span>
            <span className={hop.bottleneck ? "exp-sub bottleneck" : "exp-sub"}>
              {subLabel(hop.substitutability)}
            </span>
            {cite && (
              <a className="exp-cite" href={cite.url} target="_blank" rel="noreferrer" title={cite.title ?? cite.url}>
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

  return (
    <aside className="scenario-panel">
      <button className="scenario-back" onClick={onClear}>
        ← Back to map
      </button>

      <span className="scenario-tag">Disruption scenario</span>
      <h2>{origin.name}</h2>
      <p className="scenario-lede">
        If this node goes offline, the public companies below sit downstream.{" "}
        {singleSourced > 0 ? (
          <>
            <b>{singleSourced}</b> of <b>{exposures.length}</b> are{" "}
            <span className="exp-badge single-source inline">single-source exposed</span> — every
            supply route from here crosses a low-substitutability link.
          </>
        ) : (
          <>
            {exposures.length} affected; none is single-source exposed for this shock.
          </>
        )}
      </p>
      <p className="scenario-rule">
        <b>Single-source</b> = <i>every</i> path from the origin passes through a
        low-substitutability edge, so the company cannot re-source around the shock. Structural and
        sourced only — no revenue-at-risk estimate.
      </p>

      {exposures.length === 0 ? (
        <p className="scenario-empty">No public companies are downstream of this node.</p>
      ) : (
        <ul className="exp-list">
          {exposures.map((exp) => {
            const node = graph.nodes.find((n) => n.id === exp.nodeId);
            if (!node) return null;
            const series = node.ticker ? prices?.series[node.ticker.symbol] : undefined;
            return (
              <li key={exp.nodeId} className="exp-card">
                <div className="exp-head">
                  <button className="exp-name link-btn" onClick={() => onSelectNode(exp.nodeId)}>
                    {node.name}
                  </button>
                  <span className={`exp-badge ${exp.status}`}>{STATUS_LABEL[exp.status]}</span>
                </div>
                <div className="exp-meta">
                  {node.ticker && <span className="exp-ticker">{node.ticker.symbol}</span>}
                  {series?.change_pct != null && (
                    <span className={series.change_pct >= 0 ? "perf up" : "perf down"}>
                      {series.change_pct >= 0 ? "+" : ""}
                      {series.change_pct}% / {prices?.meta.period ?? "2y"}
                    </span>
                  )}
                  <span className="exp-hops">
                    {exp.depth} hop{exp.depth === 1 ? "" : "s"} from origin
                  </span>
                </div>
                {series && <Sparkline series={series} width={300} height={72} />}
                <details className="exp-trace">
                  <summary>Traced path &amp; sources</summary>
                  {renderPath(exp)}
                </details>
              </li>
            );
          })}
        </ul>
      )}

      <p className="scenario-foot">
        Not investment advice. Exposure is derived from sourced supply-chain structure, not a
        forecast.
      </p>
    </aside>
  );
}
