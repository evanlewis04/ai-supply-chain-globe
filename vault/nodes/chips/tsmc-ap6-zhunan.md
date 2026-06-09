---
id: tsmc-ap6-zhunan
name: TSMC Advanced Backend Fab 6 (Zhunan)
layer: chips
type: packaging_facility
operator: TSMC
ticker:
  symbol: TSM
  exchange: NYSE (ADR; primary listing TWSE 2330)
location:
  lat: 24.69
  lon: 120.88
  country: TW
  region: Zhunan Science Park, Miaoli
  precision: city
capacity:
  value: 1000000
  unit: 12in_wafer_equiv_per_year_3dfabric
  as_of: 2023-Q2
status: operational
constraints: [cowos-capacity]
tags: [advanced-packaging, cowos, soic, info, 3dfabric]
sources:
  - url: https://pr.tsmc.com/english/news/3033
    title: "TSMC Announces the Opening of Advanced Backend Fab 6"
    date: 2023-06-08
    quote: "Located in Zhunan Science Park, the fab has a base area of 14.3 hectares... will have the capacity to produce more than 1 million 12-inch wafer equivalent 3DFabric process technology per year."
    supports: location, capacity, status, packaging role
---

# TSMC Advanced Backend Fab 6 (Zhunan)

TSMC's largest advanced backend fab — the first all-in-one automated
advanced packaging and testing site, flexibly allocating capacity across
3DFabric technologies: CoWoS, SoIC, InFO, and advanced testing. This is
where leading-edge AI accelerator dies and HBM stacks become packaged
modules — the physical site of the industry's binding bottleneck since 2023.

Stated capacity (>1M 12-inch wafer-equivalents/year) covers **all 3DFabric
technologies**, not CoWoS alone — the CoWoS-specific company-wide capacity
lives on the [[cowos-capacity]] constraint entity, which is the analytically
meaningful number.

This node represents TSMC's CoWoS operations in v1; in reality CoWoS spans
multiple sites (Longtan AP3, Taichung AP5, the former Innolux AP8, plus
new Chiayi fabs). Splitting them into separate nodes is a post-v1 data task.

**Reviewer notes:** Coordinates are the Zhunan Science Park vicinity
(precision `city`). Verify the capacity quote wording against the TSMC PR.
