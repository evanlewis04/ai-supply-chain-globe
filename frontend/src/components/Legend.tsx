import { LAYER_COLORS, LAYER_LABELS } from "../types";
import type { Layer } from "../types";

const LAYERS = Object.keys(LAYER_COLORS) as Layer[];

interface Props {
  hiddenLayers: Set<Layer>;
  onToggleLayer: (layer: Layer) => void;
}

export default function Legend({ hiddenLayers, onToggleLayer }: Props) {
  return (
    <div className="legend">
      {LAYERS.map((layer) => (
        <button
          key={layer}
          className={`legend-item legend-toggle ${hiddenLayers.has(layer) ? "off" : ""}`}
          onClick={() => onToggleLayer(layer)}
          title={`Toggle ${LAYER_LABELS[layer]} layer`}
        >
          <span className="legend-dot" style={{ background: LAYER_COLORS[layer] }} />
          {LAYER_LABELS[layer]}
        </button>
      ))}
      <span className="legend-item">
        <span className="legend-dot" style={{ background: "#ff4d4d" }} />
        Chokepoint flow
      </span>
      <span className="legend-note">
        Dots stack by layer (energy lowest → applications highest). Arcs are
        colored by flow type (hover to identify); red &amp; thicker = chokepoint
        gated by a named constraint.
      </span>
    </div>
  );
}
