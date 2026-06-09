import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import type { GraphData, GraphNode, Layer, PricesData } from "../types";
import { FLOW_COLORS, LAYER_COLORS } from "../types";
import type { AffectedSet } from "../graph/traversal";

interface Props {
  graph: GraphData;
  prices: PricesData | null;
  selectedId: string | null;
  highlight: AffectedSet | null;
  hiddenLayers: Set<Layer>;
  onSelect: (id: string | null) => void;
}

const DIM_NODE = "rgba(110, 115, 145, 0.25)";
const DIM_ARC = "rgba(110, 115, 145, 0.12)";

interface PointDatum {
  node: GraphNode;
  lat: number;
  lng: number;
}

interface ArcDatum {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
  emphasized: boolean;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function GlobeView({
  graph,
  prices,
  selectedId,
  highlight,
  hiddenLayers,
  onSelect,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    // Frame the whole slice: mid-Pacific vantage shows Taiwan and the US
    globe.pointOfView({ lat: 28, lng: -165, altitude: 2.2 }, 0);
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    const stop = () => (controls.autoRotate = false);
    globe.renderer().domElement.addEventListener("pointerdown", stop, { once: true });
  }, []);

  const points = useMemo<PointDatum[]>(
    () =>
      graph.nodes
        .filter((node) => !hiddenLayers.has(node.layer))
        .map((node) => ({
          node,
          lat: node.location.lat,
          lng: node.location.lon,
        })),
    [graph, hiddenLayers]
  );

  const nodeById = useMemo(() => {
    const m = new Map<string, GraphNode>();
    graph.nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [graph]);

  const arcs = useMemo<ArcDatum[]>(
    () =>
      graph.edges.flatMap((e) => {
        const from = nodeById.get(e.from);
        const to = nodeById.get(e.to);
        if (!from || !to) return [];
        if (hiddenLayers.has(from.layer) || hiddenLayers.has(to.layer)) return [];
        // Red = explicitly gated by a constraint entity. (High-constraint/
        // low-substitutability alone is common in this graph and is shown
        // in tooltips instead, so red stays scarce and meaningful.)
        const emphasized = (e.constraints?.length ?? 0) > 0;
        return [
          {
            id: e.id,
            startLat: from.location.lat,
            startLng: from.location.lon,
            endLat: to.location.lat,
            endLng: to.location.lon,
            color: emphasized ? "#ff4d4d" : FLOW_COLORS[e.flow_type] ?? "#888",
            label: `<div class="tooltip"><b>${escapeHtml(from.name)} → ${escapeHtml(
              to.name
            )}</b><br/>${escapeHtml(e.flow_type)} · constraint: ${
              e.constraint_level ?? "n/a"
            } · substitutability: ${e.substitutability ?? "n/a"}${
              emphasized ? "<br/><span style='color:#ff4d4d'>gated by: " + (e.constraints ?? []).join(", ") + "</span>" : ""
            }</div>`,
            emphasized,
          },
        ];
      }),
    [graph, nodeById, hiddenLayers]
  );

  const pointLabel = (d: object) => {
    const { node } = d as PointDatum;
    const series = node.ticker ? prices?.series[node.ticker.symbol] : undefined;
    const perf =
      node.ticker && series?.change_pct != null
        ? `<br/><b>${node.ticker.symbol}</b> <span style="color:${
            series.change_pct >= 0 ? "#57cc99" : "#ff6b6b"
          }">${series.change_pct >= 0 ? "+" : ""}${series.change_pct}%</span> over ${
            prices?.meta.period ?? "2y"
          }`
        : "";
    return `<div class="tooltip"><b>${escapeHtml(node.name)}</b><br/>${
      node.operator ? escapeHtml(node.operator) + " · " : ""
    }${escapeHtml(node.location.region ?? node.location.country)}${perf}</div>`;
  };

  return (
    <Globe
      ref={globeRef}
      width={size.w}
      height={size.h}
      globeImageUrl="textures/earth-night.jpg"
      backgroundImageUrl="textures/night-sky.png"
      atmosphereColor="#3a86ff"
      atmosphereAltitude={0.18}
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointColor={(d: object) => {
        const { node } = d as PointDatum;
        if (highlight && !highlight.nodes.has(node.id)) return DIM_NODE;
        return LAYER_COLORS[node.layer];
      }}
      pointAltitude={(d: object) =>
        (d as PointDatum).node.id === selectedId ? 0.09 : 0.04
      }
      pointRadius={0.55}
      pointLabel={pointLabel}
      onPointClick={(d: object) => onSelect((d as PointDatum).node.id)}
      onGlobeClick={() => onSelect(null)}
      arcsData={arcs}
      arcColor={(d: object) => {
        const arc = d as ArcDatum;
        if (highlight && !highlight.edges.has(arc.id)) return DIM_ARC;
        return arc.color;
      }}
      arcStroke={(d: object) => {
        const arc = d as ArcDatum;
        if (highlight) return highlight.edges.has(arc.id) ? 1.0 : 0.3;
        return arc.emphasized ? 0.9 : 0.5;
      }}
      arcDashLength={0.45}
      arcDashGap={0.25}
      arcDashAnimateTime={2500}
      arcAltitudeAutoScale={0.4}
      arcLabel={(d: object) => (d as ArcDatum).label}
      labelsData={points}
      labelLat="lat"
      labelLng="lng"
      labelText={(d: object) => (d as PointDatum).node.name}
      labelSize={0.65}
      labelDotRadius={0}
      labelColor={(d: object) => {
        const { node } = d as PointDatum;
        if (highlight && !highlight.nodes.has(node.id)) return "rgba(255,255,255,0.2)";
        return "rgba(255,255,255,0.75)";
      }}
      labelResolution={2}
      labelAltitude={0.05}
    />
  );
}
