---
id: taipower-to-tsmc-fab-18
from: taipower-grid
to: tsmc-fab-18
flow_type: power
volume:
  value: null
  unit: null
  as_of: 2023
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: []
notes: >
  Grid power to TSMC's fabs. TSMC company-wide drew 8.4% of Taiwan's
  electricity in 2023 (S&P Global Ratings), projected toward ~24% by 2030.
  Taiwan is an isolated island grid — no imports, no interconnection —
  making this a structurally low-substitutability dependency. Fab-18-
  specific draw is not disclosed; the company-level figure is recorded
  here as context, not as this edge's volume.
sources:
  - url: https://www.taipeitimes.com/News/taiwan/archives/2025/04/11/2003834993
    title: "TSMC should lead green power transition: report"
    date: 2025-04-11
    quote: "TSMC's power consumption made up 8.4 percent of domestic power consumption in 2023 and is projected to climb to 23.7 percent in 2030."
    supports: relationship, scale of TSMC grid dependency
  - url: https://english.cw.com.tw/article/article.action?id=3766
    title: "TSMC to Consume Three Nuclear Reactors' Worth of Power (CommonWealth)"
    date: 2024-08-28
    supports: trajectory of TSMC power demand
---

# taipower-grid → tsmc-fab-18

The energy layer's entry into the slice: every wafer and every CoWoS
package is downstream of an island grid with no fallback.
