import type { PriceSeries } from "../types";

interface Props {
  series: PriceSeries;
  width?: number;
  height?: number;
}

export default function Sparkline({ series, width = 280, height = 64 }: Props) {
  const values = series.points.map((p) => p[1]);
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 4;

  const coords = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / range) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

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
