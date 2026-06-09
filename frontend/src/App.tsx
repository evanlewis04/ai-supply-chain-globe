import { useEffect, useMemo, useState } from "react";
import GlobeView from "./components/GlobeView";
import SidePanel from "./components/SidePanel";
import Legend from "./components/Legend";
import ConstraintPanel from "./components/ConstraintPanel";
import { downstreamOfConstraint } from "./graph/traversal";
import type { GraphData, PricesData } from "./types";

export default function App() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [prices, setPrices] = useState<PricesData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [constraintId, setConstraintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("graph.json")
      .then((r) => {
        if (!r.ok) throw new Error(`graph.json: HTTP ${r.status}`);
        return r.json();
      })
      .then(setGraph)
      .catch((e) => setError(String(e)));
    fetch("prices.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(setPrices)
      .catch(() => setPrices(null)); // prices are optional enrichment
  }, []);

  const selectedNode = useMemo(
    () => graph?.nodes.find((n) => n.id === selectedId) ?? null,
    [graph, selectedId]
  );

  const highlight = useMemo(
    () => (graph && constraintId ? downstreamOfConstraint(graph, constraintId) : null),
    [graph, constraintId]
  );

  if (error) {
    return (
      <div className="boot-message">
        <p>Failed to load graph data: {error}</p>
        <p>
          Run <code>python scripts/build.py</code> to generate{" "}
          <code>frontend/public/graph.json</code>.
        </p>
      </div>
    );
  }
  if (!graph) return <div className="boot-message">Loading graph…</div>;

  return (
    <div className="app">
      <header className="header">
        <h1>AI Supply Chain Globe</h1>
        <span className="header-sub">
          {graph.meta.counts.nodes} nodes · {graph.meta.counts.edges} edges ·
          every claim sourced
        </span>
      </header>
      <GlobeView
        graph={graph}
        prices={prices}
        selectedId={selectedId}
        highlight={highlight}
        onSelect={setSelectedId}
      />
      <Legend />
      <ConstraintPanel
        constraints={graph.constraints}
        selectedId={constraintId}
        onSelect={setConstraintId}
      />
      {selectedNode && (
        <SidePanel
          node={selectedNode}
          graph={graph}
          prices={prices}
          onSelect={setSelectedId}
          onSelectConstraint={setConstraintId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
