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

**Reviewer notes:** Node is the island grid as a region (centroid
coordinates, precision `region`). Per-plant generation nodes are post-v1.
