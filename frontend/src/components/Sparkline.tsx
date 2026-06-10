import type { PriceSeries } from "../types";

interface Props {
  series: PriceSeries;
  width?: number;
  height?: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2024-06-10" → "Jun '24" without timezone-sensitive Date parsing. */
function formatDate(iso: string): string {
  const [y, m] = iso.split("-");
  return `${MONTHS[Number(m) - 1]} '${y.slice(2)}`;
}

function formatPrice(v: number): string {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : v >= 10 ? v.toFixed(0) : v.toFixed(1);
}

/** Round tick values within [min, max] at a 1/2/5×10^k step. */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1;
  const rough = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? 10 * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(v);
  return ticks;
}

export default function Sparkline({ series, width = 280, height = 96 }: Props) {
  const values = series.points.map((p) => p[1]);
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  // Gutters for axis labels: price on the left, dates along the bottom.
  const m = { top: 5, right: 6, bottom: 16, left: 36 };
  const plotW = width - m.left - m.right;
  const plotH = height - m.top - m.bottom;

  const xAt = (i: number) => m.left + (i / (values.length - 1)) * plotW;
  const yAt = (v: number) => m.top + (1 - (v - min) / range) * plotH;

  const coords = values.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`);

  const yTicks = niceTicks(min, max, 3);
  const last = series.points.length - 1;
  const xTickIdx = [0, Math.round(last / 2), last];

  const up = (series.change_pct ?? 0) >= 0;
  const stroke = up ? "#57cc99" : "#ff6b6b";

  return (
    <svg
      width={width}
      height={height}
      className="sparkline"
      role="img"
      aria-label={`Price history: ${series.change_pct}% change`}
    >
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={m.left}
            x2={width - m.right}
            y1={yAt(v)}
            y2={yAt(v)}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeDasharray="3 3"
          />
          <text x={m.left - 5} y={yAt(v)} className="axis-label" textAnchor="end" dominantBaseline="middle">
            {formatPrice(v)}
          </text>
        </g>
      ))}
      {xTickIdx.map((i, k) => (
        <text
          key={i}
          x={xAt(i)}
          y={height - 4}
          className="axis-label"
          textAnchor={k === 0 ? "start" : k === xTickIdx.length - 1 ? "end" : "middle"}
        >
          {formatDate(series.points[i][0])}
        </text>
      ))}
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
