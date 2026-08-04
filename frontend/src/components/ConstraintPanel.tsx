import type { Constraint } from "../types";
import type { TimeStop } from "../graph/timeline";
import { asOfSortKey, metricAtOrBefore } from "../graph/timeline";

interface Props {
  constraints: Constraint[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** The active point in time. When set, the selected constraint's metric
   *  table reads as-of-or-before this date (no lookahead); undefined = the
   *  full, untimed table (Phase 1/2 behavior). */
  asOf?: TimeStop | null;
}

export default function ConstraintPanel({ constraints, selectedId, onSelect, asOf }: Props) {
  if (constraints.length === 0) return null;
  const selected = constraints.find((c) => c.id === selectedId) ?? null;
  const activeKey = asOf?.key ?? null;
  const current =
    selected && activeKey != null ? metricAtOrBefore(selected.metrics, activeKey) : null;

  return (
    <div className="constraint-panel">
      <div className="constraint-header">Constraints</div>
      <div className="constraint-chips">
        {constraints.map((c) => (
          <button
            key={c.id}
            className={`constraint-chip ${c.id === selectedId ? "active" : ""} severity-${c.severity ?? "medium"}`}
            onClick={() => onSelect(c.id === selectedId ? null : c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="constraint-card">
          <p className="constraint-desc">{selected.description}</p>
          {activeKey != null && (
            <p className="constraint-asof">
              {!selected.metrics || selected.metrics.length === 0 ? (
                <>No metric series for this chokepoint.</>
              ) : current ? (
                <>
                  As of <b>{asOf!.asOf}</b>:{" "}
                  <b>
                    {current.value != null
                      ? `${current.value.toLocaleString()} ${current.unit ?? ""}`
                      : "n/a"}
                  </b>
                </>
              ) : (
                <>No data yet as of <b>{asOf!.asOf}</b>.</>
              )}
              <span className="constraint-asof-note"> · point-in-time, no lookahead</span>
            </p>
          )}
          {selected.metrics && selected.metrics.length > 0 && (
            <table className="constraint-metrics">
              <tbody>
                {selected.metrics.map((m, i) => {
                  const k = asOfSortKey(m.as_of);
                  const isFuture = activeKey != null && k != null && k > activeKey;
                  const isCurrent = current != null && m === current;
                  return (
                    <tr
                      key={i}
                      title={m.note}
                      className={isCurrent ? "metric-current" : isFuture ? "metric-future" : ""}
                    >
                      <td>{m.as_of}</td>
                      <td>
                        {m.value != null
                          ? `${m.value.toLocaleString()} ${m.unit ?? ""}`
                          : "n/a"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <p className="constraint-hint">
            Highlighted: everything downstream of this bottleneck.
          </p>
          <details className="constraint-sources">
            <summary>Sources ({selected.sources.length})</summary>
            <ul>
              {selected.sources.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.title ?? s.url}
                  </a>{" "}
                  <span className="source-date">({s.date})</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
