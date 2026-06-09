import { LAYER_COLORS, LAYER_LABELS } from "../types";
import type { Layer } from "../types";

const LAYERS = Object.keys(LAYER_COLORS) as Layer[];

export default function Legend() {
  return (
    <div className="legend">
      {LAYERS.map((layer) => (
        <span key={layer} className="legend-item">
          <span className="legend-dot" style={{ background: LAYER_COLORS[layer] }} />
          {LAYER_LABELS[layer]}
        </span>
      ))}
      <span className="legend-item">
        <span className="legend-dot" style={{ background: "#ff4d4d" }} />
        Chokepoint flow
      </span>
    </div>
  );
}
