import type { Constraint, GraphData } from "../types";

/** One metric datapoint on a constraint (mirrors `Constraint.metrics[number]`). */
export type ConstraintMetric = NonNullable<Constraint["metrics"]>[number];

/** A distinct point on the shared timeline: the raw `as_of` label (shown
 *  verbatim — never reformatted) plus its comparable sort key. */
export interface TimeStop {
  asOf: string;
  key: number;
}

/**
 * Map an `as_of` label to a comparable `year*100 + month` key, so the vault's
 * heterogeneous formats sort on one axis. Handles exactly the formats the vault
 * uses — bare year, `YYYY-MM`, and `YYYY-QN` — and returns `null` for anything
 * else so callers can drop unparseable values rather than fabricate a position.
 *
 *   "2024"    → 202401   (bare year resolves to the start of the year)
 *   "2024-10" → 202410
 *   "2026-Q4" → 202610   (quarter → its first month: Q1→1 Q2→4 Q3→7 Q4→10)
 */
export function asOfSortKey(asOf: string): number | null {
  const year = /^(\d{4})$/.exec(asOf);
  if (year) return Number(year[1]) * 100 + 1;

  const month = /^(\d{4})-(\d{2})$/.exec(asOf);
  if (month) {
    const m = Number(month[2]);
    if (m < 1 || m > 12) return null;
    return Number(month[1]) * 100 + m;
  }

  const quarter = /^(\d{4})-Q([1-4])$/.exec(asOf);
  if (quarter) {
    const q = Number(quarter[2]);
    return Number(quarter[1]) * 100 + ((q - 1) * 3 + 1);
  }

  return null;
}

/**
 * The distinct, chronologically ordered `as_of` values across every
 * constraint's metrics — the slider's stops. Real dates only: unparseable
 * values are dropped, and each raw label appears once (deduped by label).
 */
export function constraintTimeline(graph: GraphData): TimeStop[] {
  const byLabel = new Map<string, number>();
  for (const c of graph.constraints) {
    for (const m of c.metrics ?? []) {
      const key = asOfSortKey(m.as_of);
      if (key === null) continue;
      if (!byLabel.has(m.as_of)) byLabel.set(m.as_of, key);
    }
  }
  return [...byLabel.entries()]
    .map(([asOf, key]) => ({ asOf, key }))
    .sort((a, b) => a.key - b.key || a.asOf.localeCompare(b.asOf));
}

/**
 * The latest metric with `as_of` at or before `key` — the point-in-time reading
 * with strict no-lookahead. Returns `null` when the constraint has no datapoint
 * at or before that time (before its series begins, or an empty series), so the
 * UI can say "no data yet" / "no series" instead of showing a future or
 * fabricated value. Metrics with an unparseable `as_of` are ignored.
 */
export function metricAtOrBefore(
  metrics: ConstraintMetric[] | undefined,
  key: number
): ConstraintMetric | null {
  let best: ConstraintMetric | null = null;
  let bestKey = -Infinity;
  for (const m of metrics ?? []) {
    const k = asOfSortKey(m.as_of);
    if (k === null || k > key) continue;
    if (k >= bestKey) {
      bestKey = k;
      best = m;
    }
  }
  return best;
}
