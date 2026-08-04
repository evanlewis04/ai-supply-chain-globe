import type { TimeStop } from "../graph/timeline";

interface Props {
  timeline: TimeStop[];
  /** index into `timeline` of the active point in time */
  index: number;
  onChange: (index: number) => void;
}

/**
 * Scrubs the shared `as_of` timeline. The stops are the vault's real dates only
 * (see `constraintTimeline`); dragging drives which metric each constraint shows
 * as "current" in `ConstraintPanel`, strictly as-of-or-before. The active date
 * and the "no lookahead" label make the no-backfill behavior read as intended.
 */
export default function TimeSlider({ timeline, index, onChange }: Props) {
  if (timeline.length === 0) return null;
  const clamped = Math.min(Math.max(index, 0), timeline.length - 1);
  const active = timeline[clamped];

  return (
    <div className="time-slider">
      <div className="time-slider-head">
        <span className="time-slider-label">Point in time</span>
        <span className="time-slider-date">{active.asOf}</span>
      </div>
      <input
        type="range"
        min={0}
        max={timeline.length - 1}
        step={1}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Point in time"
        list="time-slider-stops"
      />
      <datalist id="time-slider-stops">
        {timeline.map((s) => (
          <option key={s.asOf} value={timeline.indexOf(s)} label={s.asOf} />
        ))}
      </datalist>
      <div className="time-slider-ends">
        <span>{timeline[0].asOf}</span>
        <span className="time-slider-note">point-in-time · no lookahead</span>
        <span>{timeline[timeline.length - 1].asOf}</span>
      </div>
    </div>
  );
}
