import type { GraphData, GraphNode, PricesData } from "../types";
import { LAYER_COLORS, LAYER_LABELS } from "../types";
import Sparkline from "./Sparkline";

interface Props {
  node: GraphNode;
  graph: GraphData;
  prices: PricesData | null;
  onSelect: (id: string) => void;
  onSelectConstraint: (id: string) => void;
  onClose: () => void;
}

export default function SidePanel({
  node,
  graph,
  prices,
  onSelect,
  onSelectConstraint,
  onClose,
}: Props) {
  const series = node.ticker ? prices?.series[node.ticker.symbol] : undefined;
  const connected = graph.edges.filter((e) => e.from === node.id || e.to === node.id);
  const nodeName = (id: string) => graph.nodes.find((n) => n.id === id)?.name ?? id;

  return (
    <aside className="side-panel">
      <button className="close-btn" onClick={onClose} aria-label="Close panel">
        ×
      </button>

      <span className="layer-chip" style={{ background: LAYER_COLORS[node.layer] }}>
        {LAYER_LABELS[node.layer]} · {node.type.replace(/_/g, " ")}
      </span>
      <h2>{node.name}</h2>

      <dl className="facts">
        {node.operator && (
          <>
            <dt>Operator</dt>
            <dd>{node.operator}</dd>
          </>
        )}
        <dt>Status</dt>
        <dd>{node.status}</dd>
        <dt>Location</dt>
        <dd>
          {node.location.region ?? node.location.country} ({node.location.country})
          {node.location.precision && (
            <span className="precision"> · precision: {node.location.precision}</span>
          )}
        </dd>
        <dt>Capacity</dt>
        <dd>
          {node.capacity?.value != null
            ? `${node.capacity.value.toLocaleString()} ${node.capacity.unit ?? ""} (as of ${node.capacity.as_of})`
            : "not publicly disclosed"}
        </dd>
        {node.constraints && node.constraints.length > 0 && (
          <>
            <dt>Gated by</dt>
            <dd>
              {node.constraints.map((cid) => (
                <button
                  key={cid}
                  className="link-btn"
                  onClick={() => onSelectConstraint(cid)}
                >
                  {graph.constraints.find((c) => c.id === cid)?.name ?? cid}
                </button>
              ))}
            </dd>
          </>
        )}
      </dl>

      {node.ticker && (
        <section className="finance">
          <h3>
            {node.ticker.symbol}
            {series?.change_pct != null && (
              <span className={series.change_pct >= 0 ? "perf up" : "perf down"}>
                {series.change_pct >= 0 ? "+" : ""}
                {series.change_pct}% / {prices?.meta.period ?? "2y"}
              </span>
            )}
          </h3>
          {series ? (
            <>
              <Sparkline series={series} />
              <p className="finance-detail">
                {series.points[0][0]} → {series.points[series.points.length - 1][0]} ·
                last close {series.last_close.toLocaleString()} {series.currency}
              </p>
              <p className="finance-note">
                {node.ticker.exchange && <>{node.ticker.exchange} · </>}
                {prices?.meta.source}, fetched {prices?.meta.fetched_at.slice(0, 10)}.
                Not investment advice.
              </p>
            </>
          ) : (
            <p className="finance-note">No price data — run scripts/fetch_prices.py</p>
          )}
        </section>
      )}

      {connected.length > 0 && (
        <section>
          <h3>Flows</h3>
          <ul className="flows">
            {connected.map((e) => {
              const outgoing = e.from === node.id;
              const otherId = outgoing ? e.to : e.from;
              return (
                <li key={e.id}>
                  <span className="flow-dir">{outgoing ? "→" : "←"}</span>{" "}
                  <button className="link-btn" onClick={() => onSelect(otherId)}>
                    {nodeName(otherId)}
                  </button>{" "}
                  <span className="flow-type">({e.flow_type.replace(/_/g, " ")})</span>
                  {e.constraint_level === "high" && e.substitutability === "low" && (
                    <span className="chokepoint"> chokepoint</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {node.body && (
        <section>
          <h3>Analysis</h3>
          <div className="body-text">
            {node.body
              .split(/\n{2,}/)
              .filter((p) => !p.startsWith("#"))
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </section>
      )}

      <section>
        <h3>Sources</h3>
        <ol className="sources">
          {node.sources.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title ?? s.url}
              </a>{" "}
              <span className="source-date">({s.date})</span>
              {s.quote && <blockquote>“{s.quote}”</blockquote>}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
