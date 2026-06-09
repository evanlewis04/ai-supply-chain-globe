import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";
import type { GraphData, GraphNode, PricesData } from "../types";
import { FLOW_COLORS, LAYER_COLORS } from "../types";

interface Props {
  graph: GraphData;
  prices: PricesData | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

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

export default function GlobeView({ graph, prices, selectedId, onSelect }: Props) {
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
    globe.pointOfView({ lat: 30, lng: 180, altitude: 2.4 }, 0);
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    const stop = () => (controls.autoRotate = false);
    globe.renderer().domElement.addEventListener("pointerdown", stop, { once: true });
  }, []);

  const points = useMemo<PointDatum[]>(
    () =>
      graph.nodes.map((node) => ({
        node,
        lat: node.location.lat,
        lng: node.location.lon,
      })),
    [graph]
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
        const emphasized =
          e.constraint_level === "high" && e.substitutability === "low";
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
              emphasized ? "<br/><span style='color:#ff4d4d'>chokepoint: hard to substitute</span>" : ""
            }</div>`,
            emphasized,
          },
        ];
      }),
    [graph, nodeById]
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
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      atmosphereColor="#3a86ff"
      atmosphereAltitude={0.18}
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointColor={(d: object) => LAYER_COLORS[(d as PointDatum).node.layer]}
      pointAltitude={(d: object) =>
        (d as PointDatum).node.id === selectedId ? 0.09 : 0.04
      }
      pointRadius={0.55}
      pointLabel={pointLabel}
      onPointClick={(d: object) => onSelect((d as PointDatum).node.id)}
      onGlobeClick={() => onSelect(null)}
      arcsData={arcs}
      arcColor={(d: object) => (d as ArcDatum).color}
      arcStroke={(d: object) => ((d as ArcDatum).emphasized ? 0.9 : 0.5)}
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
      labelColor={() => "rgba(255,255,255,0.75)"}
      labelResolution={2}
      labelAltitude={0.05}
    />
  );
}
