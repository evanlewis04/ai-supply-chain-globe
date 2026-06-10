---
id: taipower-grid
name: Taiwan power grid (Taipower)
layer: energy
type: grid_region
operator: Taiwan Power Company (state-owned)
location:
  lat: 23.7
  lon: 121.0
  country: TW
  region: Taiwan (island grid)
  precision: region
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: []
tags: [grid, island-grid, semiconductor-load]
sources:
  - url: https://www.taipeitimes.com/News/taiwan/archives/2025/04/11/2003834993
    title: "TSMC should lead green power transition: report"
    date: 2025-04-11
    quote: "TSMC's power consumption made up 8.4 percent of domestic power consumption in 2023 and is projected to climb to 23.7 percent in 2030."
    supports: TSMC share of Taiwan electricity consumption
  - url: https://english.cw.com.tw/article/article.action?id=3766
    title: "TSMC to Consume Three Nuclear Reactors' Worth of Power (CommonWealth Magazine)"
    date: 2024-08-28
    supports: scale and trajectory of TSMC's power demand on the Taiwan grid
  - url: https://www.digitimes.com/news/a20260303PD228/taiwan-power-company-demand-2030-electricity-taiwan.html
    title: "Taipower forecasts over 5GW new power demand by 2030 amid semiconductor and AI data center expansion (DigiTimes)"
    date: 2026-03-03
    supports: forward demand growth (~1GW/year through 2030, driven by foundry, memory, advanced packaging, AI)
  - url: https://www.digitimes.com/news/a20260119PD213/taiwan-electricity-data-center-taiwan-power-company-data.html
    title: "Taiwan rolls out tiered electricity rates for data centers amid AI power crunch (DigiTimes)"
    date: 2026-01-19
    supports: policy response to grid pressure from AI loads
---

# Taiwan power grid (Taipower)

Taiwan is an island grid with no interconnections — every leading-edge
wafer and CoWoS package depends on Taipower keeping the lights on. TSMC
alone drew 8.4% of Taiwan's total power consumption in 2023 (S&P Global
Ratings, via Taipei Times), projected to approach a quarter of the island's
consumption by 2030 as fab and packaging expansion compounds.

This makes Taiwan's grid one of the most leveraged single points in the
global AI economy: a `power-taiwan` constraint entity (post-v1) will carry
reserve-margin and energy-mix metrics.

The squeeze is tightening, not easing: Taipower's March 2026 forecast adds
over 5GW of new demand by 2030 (~1GW/year) from foundry, memory, advanced
packaging, and AI data centers, and Taiwan introduced tiered electricity
rates for data centers in January 2026 — the grid is now actively rationing
AI growth by price.

**Reviewer notes:** Node is the island grid as a region (centroid
coordinates, precision `region`). Per-plant generation nodes are post-v1.
