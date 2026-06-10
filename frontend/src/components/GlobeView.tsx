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
  /** Ring angle (radians) for cluster members; null for standalone nodes. */
  angle: number | null;
  dimmed?: boolean;
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
  animTime: number;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Display-only cartographic displacement: nodes within ~2° of each other
 * (OpenAI/ChatGPT share coordinates; Nvidia is ~60km away; the two Des
 * Moines nodes nearly touch) get spread on a small ring around their
 * shared centroid so each dot is legible and clickable. True coordinates
 * remain untouched in the vault and in the side panel.
 */
function displacedPositions(
  nodes: GraphNode[]
): Map<string, { lat: number; lng: number; angle: number | null }> {
  const CLUSTER_DEG = 2.2;
  const RING_DEG = 1.6;
  const groups: GraphNode[][] = [];
  for (const node of nodes) {
    const group = groups.find((g) =>
      g.some(
        (m) =>
          Math.abs(m.location.lat - node.location.lat) < CLUSTER_DEG &&
          Math.abs(m.location.lon - node.location.lon) < CLUSTER_DEG
      )
    );
    if (group) group.push(node);
    else groups.push([node]);
  }

  const positions = new Map<string, { lat: number; lng: number; angle: number | null }>();
  for (const group of groups) {
    if (group.length === 1) {
      const n = group[0];
      positions.set(n.id, { lat: n.location.lat, lng: n.location.lon, angle: null });
      continue;
    }
    const centerLat = group.reduce((s, n) => s + n.location.lat, 0) / group.length;
    const centerLng = group.reduce((s, n) => s + n.location.lon, 0) / group.length;
    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
    sorted.forEach((n, i) => {
      const angle = (2 * Math.PI * i) / sorted.length - Math.PI / 2;
      positions.set(n.id, {
        lat: centerLat + RING_DEG * Math.sin(angle),
        lng: centerLng + (RING_DEG * Math.cos(angle)) / Math.max(0.3, Math.cos((centerLat * Math.PI) / 180)),
        angle,
      });
    });
  }
  return positions;
}

/**
 * Label boxes extend outward from their cluster centroid (the same
 * direction the dot was displaced), so labels within a cluster fan away
 * from each other instead of stacking. Standalone nodes label below.
 */
function labelOffsetTransform(angle: number | null): string {
  if (angle === null) return "translate(-50%, 9px)";
  const dx = Math.cos(angle);
  const dy = -Math.sin(angle); // screen y is inverted vs latitude
  if (dx > 0.45) return "translate(9px, -50%)";
  if (dx < -0.45) return "translate(calc(-100% - 9px), -50%)";
  if (dy < 0) return "translate(-50%, calc(-100% - 9px))";
  return "translate(-50%, 9px)";
}

/** Great-circle angular distance in degrees. */
function angularDistanceDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = Math.PI / 180;
  const cosD =
    Math.sin(aLat * r) * Math.sin(bLat * r) +
    Math.cos(aLat * r) * Math.cos(bLat * r) * Math.cos((aLng - bLng) * r);
  return Math.acos(Math.min(1, Math.max(-1, cosD))) / r;
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

  const displayPos = useMemo(() => displacedPositions(graph.nodes), [graph]);

  const points = useMemo<PointDatum[]>(
    () =>
      graph.nodes
        .filter((node) => !hiddenLayers.has(node.layer))
        .map((node) => ({
          node,
          ...displayPos.get(node.id)!,
        })),
    [graph, hiddenLayers, displayPos]
  );

  // Separate identity for label data so highlight changes rebuild the
  // DOM label boxes with the right dim state.
  const labelData = useMemo<PointDatum[]>(
    () =>
      points.map((p) => ({
        ...p,
        dimmed: !!highlight && !highlight.nodes.has(p.node.id),
      })),
    [points, highlight]
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
        const start = displayPos.get(from.id)!;
        const end = displayPos.get(to.id)!;
        // Constant dash time makes long arcs sweep absurdly fast; scale
        // animation time with distance so flow speed feels uniform.
        const dist = angularDistanceDeg(start.lat, start.lng, end.lat, end.lng);
        const animTime = Math.min(9000, Math.max(2000, 1400 + dist * 65));
        return [
          {
            id: e.id,
            startLat: start.lat,
            startLng: start.lng,
            endLat: end.lat,
            endLng: end.lng,
            animTime,
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
    [graph, nodeById, hiddenLayers, displayPos]
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
      pointRadius={0.75}
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
      arcDashAnimateTime={(d: object) => (d as ArcDatum).animTime}
      arcAltitudeAutoScale={0.4}
      arcLabel={(d: object) => (d as ArcDatum).label}
      htmlElementsData={labelData}
      htmlLat="lat"
      htmlLng="lng"
      htmlAltitude={0.015}
      htmlElement={(d: object) => {
        const { node, angle, dimmed } = d as PointDatum;
        const wrap = document.createElement("div");
        wrap.className = "node-label-wrap";
        const box = document.createElement("div");
        box.className = "node-label" + (dimmed ? " dimmed" : "");
        box.textContent = node.name;
        box.style.borderLeftColor = LAYER_COLORS[node.layer];
        box.style.transform = labelOffsetTransform(angle);
        box.onclick = (ev) => {
          ev.stopPropagation();
          onSelect(node.id);
        };
        wrap.appendChild(box);
        return wrap;
      }}
      htmlElementVisibilityModifier={(el: HTMLElement, isVisible: boolean) => {
        el.classList.toggle("behind", !isVisible);
      }}
    />
  );
}
