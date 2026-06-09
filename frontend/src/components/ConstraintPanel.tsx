import type { Constraint } from "../types";

interface Props {
  constraints: Constraint[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function ConstraintPanel({ constraints, selectedId, onSelect }: Props) {
  if (constraints.length === 0) return null;
  const selected = constraints.find((c) => c.id === selectedId) ?? null;

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
          {selected.metrics && selected.metrics.length > 0 && (
            <table className="constraint-metrics">
              <tbody>
                {selected.metrics.map((m, i) => (
                  <tr key={i} title={m.note}>
                    <td>{m.as_of}</td>
                    <td>
                      {m.value != null
                        ? `${m.value.toLocaleString()} ${m.unit ?? ""}`
                        : "n/a"}
                    </td>
                  </tr>
                ))}
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
