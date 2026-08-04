import { useMemo, useState } from "react";
import type { GraphData } from "../types";
import { exposureMatrix } from "../graph/traversal";
import type { ExposureStatus } from "../graph/traversal";
import ExposurePath from "./ExposurePath";

interface Props {
  graph: GraphData;
  onSelectNode: (id: string) => void;
  onSelectConstraint: (id: string) => void;
  onClose: () => void;
}

const STATUS_LABEL: Record<ExposureStatus, string> = {
  "single-source": "Single-source",
  "has-redundancy": "Redundancy",
  unknown: "Unknown",
};

/**
 * The chokepoint exposure matrix: constraints (rows) × public companies
 * (columns), each cell the structural single-source verdict for that pair, with
 * the traced+cited path behind it. Reuses the Phase 1 all-paths engine
 * (`exposureMatrix`) and path rendering (`ExposurePath`) verbatim — no second
 * classifier, no invented score, no dollar figures.
 */
export default function ExposureMatrixPanel({
  graph,
  onSelectNode,
  onSelectConstraint,
  onClose,
}: Props) {
  const matrix = useMemo(() => exposureMatrix(graph), [graph]);
  const [selected, setSelected] = useState<{ constraintId: string; companyId: string } | null>(null);

  const constraintName = (id: string) => graph.constraints.find((c) => c.id === id)?.name ?? id;
  const companyNode = (id: string) => graph.nodes.find((n) => n.id === id);

  const selectedCell = selected
    ? matrix.rows.find((r) => r.constraintId === selected.constraintId)?.cells[selected.companyId]
    : undefined;

  return (
    <div className="matrix-overlay" role="dialog" aria-label="Chokepoint exposure matrix">
      <div className="matrix-panel">
        <div className="matrix-head">
          <div>
            <span className="scenario-tag">Chokepoint exposure matrix</span>
            <h2>Which public names sit single-source under each bottleneck</h2>
          </div>
          <button className="matrix-close" onClick={onClose} aria-label="Close matrix">
            ✕
          </button>
        </div>

        <p className="scenario-rule">
          Each cell is the <b>structural</b> verdict for a (chokepoint → company) pair:{" "}
          <b>single-source</b> means <i>every</i> sourced supply route from the chokepoint crosses a
          low-substitutability link, so the company cannot re-source around it. A blank cell means
          the company isn&apos;t reachable from that chokepoint — not zero risk, no structural link.
          Click a cell for its traced, cited path; click a chokepoint to light its blast radius on
          the globe. Structural and sourced only — no revenue-at-risk estimate.
        </p>

        <div className="matrix-scroll">
          <table className="matrix-table">
            <thead>
              <tr>
                <th className="matrix-corner">Chokepoint \ Company</th>
                {matrix.companies.map((id) => {
                  const node = companyNode(id);
                  return (
                    <th key={id} className="matrix-col" title={node?.name ?? id}>
                      <button className="link-btn" onClick={() => onSelectNode(id)}>
                        {node?.ticker?.symbol ?? node?.name ?? id}
                      </button>
                      {node?.name && <span className="matrix-col-name">{node.name}</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.constraintId}>
                  <th className="matrix-row-head" scope="row">
                    <button
                      className="link-btn"
                      title="Light this chokepoint's blast radius on the globe"
                      onClick={() => {
                        onSelectConstraint(row.constraintId);
                        onClose();
                      }}
                    >
                      {constraintName(row.constraintId)}
                    </button>
                  </th>
                  {matrix.companies.map((companyId) => {
                    const cell = row.cells[companyId];
                    const isSelected =
                      selected?.constraintId === row.constraintId &&
                      selected?.companyId === companyId;
                    if (!cell) {
                      return (
                        <td key={companyId} className="matrix-cell blank">
                          <span aria-label="no structural link">–</span>
                        </td>
                      );
                    }
                    return (
                      <td key={companyId} className="matrix-cell">
                        <button
                          className={`matrix-badge ${cell.status}${isSelected ? " selected" : ""}`}
                          onClick={() =>
                            setSelected(
                              isSelected ? null : { constraintId: row.constraintId, companyId }
                            )
                          }
                        >
                          {STATUS_LABEL[cell.status]}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCell ? (
          <div className="matrix-detail">
            <div className="matrix-detail-head">
              <span className={`exp-badge ${selectedCell.status}`}>
                {STATUS_LABEL[selectedCell.status]}
              </span>
              <span className="matrix-detail-pair">
                {constraintName(selected!.constraintId)} →{" "}
                {companyNode(selected!.companyId)?.name ?? selected!.companyId}
              </span>
            </div>
            <ExposurePath
              originLabel={constraintName(selected!.constraintId)}
              path={selectedCell.path}
              graph={graph}
              onSelectNode={onSelectNode}
            />
          </div>
        ) : (
          <p className="matrix-hint">Select a cell to trace its sourced supply route.</p>
        )}

        <p className="scenario-foot">
          Not investment advice. Exposure is derived from sourced supply-chain structure, not a
          forecast.
        </p>
      </div>
    </div>
  );
}
