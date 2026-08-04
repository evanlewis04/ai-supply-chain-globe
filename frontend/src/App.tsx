import { useEffect, useMemo, useState } from "react";
import GlobeView from "./components/GlobeView";
import SidePanel from "./components/SidePanel";
import Legend from "./components/Legend";
import ConstraintPanel from "./components/ConstraintPanel";
import AskGlobe from "./components/AskGlobe";
import ScenarioPanel from "./components/ScenarioPanel";
import ExposureMatrixPanel from "./components/ExposureMatrixPanel";
import TimeSlider from "./components/TimeSlider";
import { downstreamOfConstraint, downstreamAffectedSet } from "./graph/traversal";
import { constraintTimeline } from "./graph/timeline";
import type { AskResult } from "./lib/askGlobe";
import type { GraphData, Layer, PricesData } from "./types";

export default function App() {
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [prices, setPrices] = useState<PricesData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [constraintId, setConstraintId] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [shockOriginId, setShockOriginId] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState(false);
  // Point-in-time slider index into the constraint timeline. null = latest
  // (opens on "now"; the user scrubs back).
  const [asOfIndex, setAsOfIndex] = useState<number | null>(null);
  const [hiddenLayers, setHiddenLayers] = useState<Set<Layer>>(new Set());
  const [error, setError] = useState<string | null>(null);
  // Bottom-band slot the globe's zoom/reset controls portal into.
  const [controlsSlot, setControlsSlot] = useState<HTMLDivElement | null>(null);

  // Constraint selections, Ask answers, and disruption scenarios all drive the
  // one `highlight` channel, so they are mutually exclusive: activating one
  // clears the others. A manual chip click clears the answer, while an answer
  // activates the constraint chip the model judged central (or clears a stale one).
  const selectConstraint = (id: string | null) => {
    setConstraintId(id);
    if (id) {
      setAskResult(null);
      setShockOriginId(null);
    }
  };
  const applyAskResult = (result: AskResult | null) => {
    setAskResult(result);
    setConstraintId(result?.constraintId ?? null);
    if (result) setShockOriginId(null);
  };
  const startShock = (id: string) => {
    setShockOriginId(id);
    setConstraintId(null);
    setAskResult(null);
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
        // Shareable demo states: ?constraint=cowos-capacity, ?node=tsmc-fab-18,
        // or ?shock=spruce-pine-quartz-district (disruption scenario).
        const params = new URLSearchParams(window.location.search);
        const c = params.get("constraint");
        const n = params.get("node");
        const s = params.get("shock");
        if (s && g.nodes.some((x) => x.id === s)) setShockOriginId(s);
        else if (c && g.constraints.some((x) => x.id === c)) setConstraintId(c);
        if (n && g.nodes.some((x) => x.id === n)) setSelectedId(n);
        if (params.get("matrix") === "1") setShowMatrix(true);
        // ?asof=2024 opens the slider at that stop (else it defaults to latest).
        const a = params.get("asof");
        if (a) {
          const idx = constraintTimeline(g).findIndex((st) => st.asOf === a);
          if (idx >= 0) setAsOfIndex(idx);
        }
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

  const shockOrigin = useMemo(
    () => graph?.nodes.find((n) => n.id === shockOriginId) ?? null,
    [graph, shockOriginId]
  );

  // Distinct real as_of dates across all constraints — the slider's stops.
  const timeline = useMemo(() => (graph ? constraintTimeline(graph) : []), [graph]);
  const effectiveIndex = timeline.length
    ? Math.min(asOfIndex ?? timeline.length - 1, timeline.length - 1)
    : 0;
  const activeStop = timeline.length ? timeline[effectiveIndex] : null;

  const highlight = useMemo(() => {
    if (graph && shockOrigin) return downstreamAffectedSet(graph, shockOrigin.id);
    if (askResult && askResult.affected.nodes.size > 0) return askResult.affected;
    if (graph && constraintId) return downstreamOfConstraint(graph, constraintId);
    return null;
  }, [graph, constraintId, askResult, shockOrigin]);

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
      {/* The left rail (title + constraints) yields to the scenario readout,
          which docks in the same place while a disruption is active. */}
      {!shockOrigin && (
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
            asOf={activeStop}
          />
          <TimeSlider timeline={timeline} index={effectiveIndex} onChange={setAsOfIndex} />
          <button className="matrix-open" onClick={() => setShowMatrix(true)}>
            Exposure matrix ▸
          </button>
        </div>
      )}
      <GlobeView
        graph={graph}
        prices={prices}
        selectedId={selectedId}
        highlight={highlight}
        shockOriginId={shockOriginId}
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
      {shockOrigin && (
        <ScenarioPanel
          origin={shockOrigin}
          graph={graph}
          prices={prices}
          onSelectNode={setSelectedId}
          onClear={() => setShockOriginId(null)}
        />
      )}
      {showMatrix && (
        <ExposureMatrixPanel
          graph={graph}
          onSelectNode={(id) => {
            setSelectedId(id);
            setShowMatrix(false);
          }}
          onSelectConstraint={selectConstraint}
          onClose={() => setShowMatrix(false)}
        />
      )}
      {selectedNode && (
        <SidePanel
          node={selectedNode}
          graph={graph}
          prices={prices}
          isShockOrigin={selectedNode.id === shockOriginId}
          onSimulateShock={startShock}
          onSelect={setSelectedId}
          onSelectConstraint={selectConstraint}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
