import { describe, expect, it } from "vitest";
import { asOfSortKey, constraintTimeline, metricAtOrBefore } from "./timeline";
import type { ConstraintMetric } from "./timeline";
import type { GraphData } from "../types";

const metric = (as_of: string, value: number): ConstraintMetric => ({
  value,
  unit: "u",
  as_of,
});

/** Mirrors the vault's actual as_of zoo across constraints, incl. an
 *  empty-series constraint (euv-optics) and a shared date across two rows. */
function fixture(): GraphData {
  const constraint = (id: string, metrics: ConstraintMetric[]) => ({
    id,
    name: id,
    category: "test",
    description: id,
    metrics,
    sources: [{ url: "https://example.com", date: "2024-01" }],
  });
  return {
    meta: { generated_at: "", counts: {}, schema_version: "1.0.0" },
    nodes: [],
    edges: [],
    constraints: [
      constraint("cowos", [metric("2024", 37500), metric("2025", 75000), metric("2026-Q4", 127500)]),
      constraint("photoresist", [metric("2026-05", 85)]),
      constraint("grid", [metric("2025-Q2", 128), metric("2025", 119)]),
      constraint("quartz", [metric("2024-10", 80)]),
      constraint("optics", []),
    ],
  };
}

describe("asOfSortKey", () => {
  it("parses every format the vault uses", () => {
    expect(asOfSortKey("2024")).toBe(202401); // bare year → start of year
    expect(asOfSortKey("2025")).toBe(202501);
    expect(asOfSortKey("2024-10")).toBe(202410);
    expect(asOfSortKey("2026-05")).toBe(202605);
    expect(asOfSortKey("2025-Q2")).toBe(202504); // Q2 → April
    expect(asOfSortKey("2026-Q4")).toBe(202610); // Q4 → October
  });

  it("orders mixed formats chronologically by key", () => {
    const keys = ["2024", "2024-10", "2025", "2025-Q2", "2026-05", "2026-Q4"].map(asOfSortKey);
    expect(keys).toEqual([...keys].sort((a, b) => (a as number) - (b as number)));
  });

  it("returns null for unparseable or out-of-range values", () => {
    expect(asOfSortKey("soon")).toBeNull();
    expect(asOfSortKey("2024-13")).toBeNull();
    expect(asOfSortKey("2024-00")).toBeNull();
    expect(asOfSortKey("2024-Q5")).toBeNull();
    expect(asOfSortKey("24")).toBeNull();
  });
});

describe("constraintTimeline", () => {
  it("returns the distinct as_of values across all constraints, sorted", () => {
    const stops = constraintTimeline(fixture());
    // "2025" appears in both cowos and grid → deduped to one stop.
    expect(stops.map((s) => s.asOf)).toEqual([
      "2024",
      "2024-10",
      "2025",
      "2025-Q2",
      "2026-05",
      "2026-Q4",
    ]);
    expect(stops.map((s) => s.key)).toEqual([202401, 202410, 202501, 202504, 202605, 202610]);
  });

  it("ignores constraints with no metrics", () => {
    // optics (empty) contributes nothing; only real dates become stops.
    const stops = constraintTimeline(fixture());
    expect(stops).toHaveLength(6);
  });
});

describe("metricAtOrBefore", () => {
  const cowos = fixture().constraints[0].metrics!;

  it("walks the CoWoS series with the slider (as-of-or-before, no lookahead)", () => {
    expect(metricAtOrBefore(cowos, asOfSortKey("2024")!)?.value).toBe(37500);
    expect(metricAtOrBefore(cowos, asOfSortKey("2025")!)?.value).toBe(75000);
    expect(metricAtOrBefore(cowos, asOfSortKey("2026-Q4")!)?.value).toBe(127500);
  });

  it("never looks ahead: an intermediate date shows the last known value, not a future one", () => {
    // At 2025-Q2 the latest cowos datapoint at/before is 2025 (75k) — never 2026-Q4.
    expect(metricAtOrBefore(cowos, asOfSortKey("2025-Q2")!)?.value).toBe(75000);
  });

  it("returns null before a constraint's first datapoint", () => {
    const photoresist = fixture().constraints[1].metrics!; // only 2026-05
    expect(metricAtOrBefore(photoresist, asOfSortKey("2024")!)).toBeNull();
  });

  it("returns null for an empty series", () => {
    expect(metricAtOrBefore([], 202610)).toBeNull();
    expect(metricAtOrBefore(undefined, 202610)).toBeNull();
  });
});
