import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  /** Slot in App's bottom band where the zoom/reset controls render. */
  controlsContainer: HTMLElement | null;
}

const DIM_NODE = "rgba(110, 115, 145, 0.25)";
const DIM_ARC = "rgba(110, 115, 145, 0.12)";

// Default vantage: mid-Pacific, framing Taiwan and the US in one view.
const HOME_POV = { lat: 28, lng: -165, altitude: 2.2 };
// Camera altitude range the zoom slider maps onto (log scale — equal
// slider steps feel like equal zoom steps).
const MIN_ALT = 0.3;
const MAX_ALT = 4;

// Stack nodes radially by supply-chain layer so the directed
// energy → chips → infrastructure → models → applications structure is
// legible from the globe geometry itself, not just the README. Upstream
// layers sit lower (near the surface); downstream layers float higher.
const LAYER_ALTITUDE: Record<Layer, number> = {
  energy: 0.02,
  chips: 0.07,
  infrastructure: 0.12,
  models: 0.17,
  applications: 0.22,
};
// Selected node lifts slightly above its tier for emphasis.
const SELECT_BUMP = 0.03;

function altitudeToSlider(alt: number): number {
  const clamped = Math.min(MAX_ALT, Math.max(MIN_ALT, alt));
  // Slider runs zoomed-out (0) -> zoomed-in (100)
  return Math.round(100 * (1 - Math.log(clamped / MIN_ALT) / Math.log(MAX_ALT / MIN_ALT)));
}

function sliderToAltitude(value: number): number {
  return MIN_ALT * Math.pow(MAX_ALT / MIN_ALT, 1 - value / 100);
}

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
 * Compact map label: drop the parenthetical qualifier and any em/en-dash
 * suffix, which are the widest parts of the box and cause most overlap.
 * The full name still shows in the hover tooltip and the side panel.
 * "Microsoft Azure — West Des Moines campus" -> "Microsoft Azure";
 * "TSMC Fab 18 (GIGAFAB, N5/N3)" -> "TSMC Fab 18".
 */
function shortLabel(name: string): string {
  return name
    .replace(/\s*[—–-]\s.*$/, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
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
  controlsContainer,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const stageRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef<string | null>(selectedId);
  selectedIdRef.current = selectedId;
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [altitude, setAltitude] = useState(HOME_POV.altitude);

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Screen-space label de-clutter. Greedily keep higher-priority labels
  // (selected > highlighted > normal > dimmed) and hide any that overlap one
  // already kept; the dots + hover tooltips remain for hidden ones. Two
  // anti-flicker measures: the sweep runs ~8x/s instead of every frame, and
  // hiding/showing use different pads (hysteresis) so a label near the
  // threshold doesn't oscillate while the globe rotates.
  useEffect(() => {
    let raf = 0;
    let lastRun = 0;
    const HIDE_PAD = 2; // visible labels may sit this close before hiding
    const SHOW_PAD = 12; // hidden labels need this much clearance to return
    const sweep = (now: number) => {
      raf = requestAnimationFrame(sweep);
      if (now - lastRun < 120) return;
      lastRun = now;
      const stage = stageRef.current;
      if (!stage) return;
      const boxes = Array.from(
        stage.querySelectorAll<HTMLElement>(".node-label-wrap:not(.behind) .node-label")
      );
      const sel = selectedIdRef.current;
      const scored = boxes.map((el) => {
        const priority =
          el.dataset.nodeId === sel ? 3 : el.classList.contains("dimmed") ? 1 : 2;
        return { el, id: el.dataset.nodeId ?? "", rect: el.getBoundingClientRect(), priority };
      });
      // Deterministic order (priority, then id) so ties never swap between
      // sweeps — swapping is what reads as flicker.
      scored.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
      const kept: DOMRect[] = [];
      for (const { el, rect } of scored) {
        const pad = el.classList.contains("crowded") ? SHOW_PAD : HIDE_PAD;
        const clash = kept.some(
          (k) =>
            rect.left < k.right + pad &&
            rect.right > k.left - pad &&
            rect.top < k.bottom + pad &&
            rect.bottom > k.top - pad
        );
        if (clash) el.classList.add("crowded");
        else {
          el.classList.remove("crowded");
          kept.push(rect);
        }
      }
    };
    raf = requestAnimationFrame(sweep);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Idle spin until the user interacts (re-armed by the recenter button).
  const startAutoRotate = () => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    const stop = () => (controls.autoRotate = false);
    globe.renderer().domElement.addEventListener("pointerdown", stop, { once: true });
  };

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView(HOME_POV, 0);
    startAutoRotate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // globe.gl only emits onZoom for user-driven camera changes, so our own
  // programmatic moves must update the slider state themselves.
  const setZoom = (sliderValue: number) => {
    const globe = globeRef.current;
    if (!globe) return;
    const alt = sliderToAltitude(sliderValue);
    const pov = globe.pointOfView();
    globe.controls().autoRotate = false;
    globe.pointOfView({ ...pov, altitude: alt }, 0);
    setAltitude(alt);
  };

  const recenter = () => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView(HOME_POV, 1000);
    setAltitude(HOME_POV.altitude);
    startAutoRotate();
  };

  const displayPos = useMemo(() => displacedPositions(graph.nodes), [graph]);

  // Fly the camera to frame the active highlight (constraint selection or
  // an Ask answer). Centroid via 3D vector mean — a plain lat/lng average
  // puts Taiwan↔Iowa over Africa instead of the Pacific.
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !highlight || highlight.nodes.size === 0) return;
    const r = Math.PI / 180;
    let x = 0, y = 0, z = 0, count = 0;
    highlight.nodes.forEach((id) => {
      const p = displayPos.get(id);
      if (!p) return;
      x += Math.cos(p.lat * r) * Math.cos(p.lng * r);
      y += Math.cos(p.lat * r) * Math.sin(p.lng * r);
      z += Math.sin(p.lat * r);
      count++;
    });
    if (count === 0) return;
    const lat = Math.atan2(z, Math.hypot(x, y)) / r;
    const lng = Math.atan2(y, x) / r;
    let spread = 0;
    highlight.nodes.forEach((id) => {
      const p = displayPos.get(id);
      if (p) spread = Math.max(spread, angularDistanceDeg(lat, lng, p.lat, p.lng));
    });
    const altitude = Math.min(2.6, Math.max(0.8, 0.7 + spread / 38));
    globe.controls().autoRotate = false;
    globe.pointOfView({ lat, lng, altitude }, 1400);
    setAltitude(altitude);
  }, [highlight, displayPos]);

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
    <div className="globe-stage" ref={stageRef}>
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
        pointAltitude={(d: object) => {
          const p = d as PointDatum;
          return LAYER_ALTITUDE[p.node.layer] + (p.node.id === selectedId ? SELECT_BUMP : 0);
        }}
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
        htmlAltitude={(d: object) => LAYER_ALTITUDE[(d as PointDatum).node.layer]}
        htmlElement={(d: object) => {
          const { node, angle, dimmed } = d as PointDatum;
          const wrap = document.createElement("div");
          wrap.className = "node-label-wrap";
          const box = document.createElement("div");
          box.className = "node-label" + (dimmed ? " dimmed" : "");
          box.textContent = shortLabel(node.name);
          box.title = node.name;
          box.dataset.nodeId = node.id;
          box.style.borderLeftColor = LAYER_COLORS[node.layer];
          box.style.transform = labelOffsetTransform(angle);
          box.onclick = (ev) => {
            ev.stopPropagation();
            onSelect(node.id);
          };
          // globe.gl detects clicks from pointerdown/up pairs that bubble to
          // its container; from a label they raycast the globe *behind* the
          // box and fire onGlobeClick — instantly deselecting what the click
          // just selected. Keep pointer events out of the canvas entirely.
          box.onpointerdown = (ev) => ev.stopPropagation();
          box.onpointerup = (ev) => ev.stopPropagation();
          wrap.appendChild(box);
          return wrap;
        }}
        htmlElementVisibilityModifier={(el: HTMLElement, isVisible: boolean) => {
          el.classList.toggle("behind", !isVisible);
        }}
        onZoom={(pov: { altitude: number }) => setAltitude(pov.altitude)}
      />
      {controlsContainer &&
        createPortal(
          <div className="view-controls">
            <span className="view-zoom-icon" aria-hidden>
              −
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={altitudeToSlider(altitude)}
              onChange={(ev) => setZoom(Number(ev.target.value))}
              aria-label="Zoom"
              title="Zoom"
            />
            <span className="view-zoom-icon" aria-hidden>
              +
            </span>
            <button className="view-recenter" onClick={recenter} title="Reset view">
              ⌖ Reset view
            </button>
          </div>,
          controlsContainer
        )}
    </div>
  );
}
