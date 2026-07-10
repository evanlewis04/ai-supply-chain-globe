import { useEffect, useMemo, useState } from "react";
import GlobeView from "./components/GlobeView";
import SidePanel from "./components/SidePanel";
import Legend from "./components/Legend";
import ConstraintPanel from "./components/ConstraintPanel";
import AskGlobe from "./components/AskGlobe";
import { downstreamOfConstraint } from "./graph/traversal";
import type { AskResult } from "./lib/askGlobe";
import type { GraphData, Layer, PricesData } from "./types";

export default function App() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [prices, setPrices] = useState<PricesData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [constraintId, setConstraintId] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<Layer>>(new Set());
  const [error, setError] = useState<string | null>(null);
  // Bottom-band slot the globe's zoom/reset controls portal into.
  const [controlsSlot, setControlsSlot] = useState<HTMLDivElement | null>(null);

  // Ask-answers and constraint selections drive the same highlight channel;
  // a manual chip click clears the answer, while an answer activates the
  // constraint chip the model judged central (or clears any stale one).
  const selectConstraint = (id: string | null) => {
    setConstraintId(id);
    if (id) setAskResult(null);
  };
  const applyAskResult = (result: AskResult | null) => {
    setAskResult(result);
    setConstraintId(result?.constraintId ?? null);
  };

  const toggleLayer = (layer: Layer) =>
    setHiddenLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });

  useEffect(() => {
    fetch("graph.json")
      .then((r) => {
        if (!r.ok) throw new Error(`graph.json: HTTP ${r.status}`);
        return r.json();
      })
      .then((g: GraphData) => {
        setGraph(g);
        // Shareable demo states: ?constraint=cowos-capacity or ?node=tsmc-fab-18
        const params = new URLSearchParams(window.location.search);
        const c = params.get("constraint");
        const n = params.get("node");
        if (c && g.constraints.some((x) => x.id === c)) setConstraintId(c);
        if (n && g.nodes.some((x) => x.id === n)) setSelectedId(n);
      })
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

  const highlight = useMemo(() => {
    if (askResult && askResult.affected.nodes.size > 0) return askResult.affected;
    if (graph && constraintId) return downstreamOfConstraint(graph, constraintId);
    return null;
  }, [graph, constraintId, askResult]);

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
      <div className="left-rail">
        <header className="header">
          <h1>AI Supply Chain Globe</h1>
          <span className="header-sub">
            {graph.meta.counts.nodes} nodes · {graph.meta.counts.edges} edges ·
            every claim sourced
          </span>
          <span className="header-hint">
            Click a node for details &amp; sources · pick a constraint to trace
            the bottleneck · hover arcs for flows
          </span>
        </header>
        <ConstraintPanel
          constraints={graph.constraints}
          selectedId={constraintId}
          onSelect={selectConstraint}
        />
      </div>
      <GlobeView
        graph={graph}
        prices={prices}
        selectedId={selectedId}
        highlight={highlight}
        hiddenLayers={hiddenLayers}
        onSelect={setSelectedId}
        controlsContainer={controlsSlot}
      />
      {/* One flex band: nothing in it can overlap, whatever each piece's height. */}
      <div className="bottom-band">
        <div className="bottom-left">
          <div ref={setControlsSlot} />
          <Legend hiddenLayers={hiddenLayers} onToggleLayer={toggleLayer} />
        </div>
        <AskGlobe
          graph={graph}
          result={askResult}
          onResult={applyAskResult}
          onSelectNode={setSelectedId}
        />
      </div>
      {selectedNode && (
        <SidePanel
          node={selectedNode}
          graph={graph}
          prices={prices}
          onSelect={setSelectedId}
          onSelectConstraint={selectConstraint}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
