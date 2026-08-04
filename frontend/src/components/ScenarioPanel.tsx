import { useMemo } from "react";
import type { GraphData, GraphNode, PricesData } from "../types";
import { exposureFromNode } from "../graph/traversal";
import type { ExposureStatus } from "../graph/traversal";
import Sparkline from "./Sparkline";
import ExposurePath from "./ExposurePath";

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

export default function ScenarioPanel({ origin, graph, prices, onSelectNode, onClear }: Props) {
  const exposures = useMemo(() => exposureFromNode(graph, origin.id), [graph, origin.id]);

  const singleSourced = exposures.filter((e) => e.status === "single-source").length;

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
                  <ExposurePath
                    originLabel={origin.name}
                    path={exp.path}
                    graph={graph}
                    onSelectNode={onSelectNode}
                  />
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
