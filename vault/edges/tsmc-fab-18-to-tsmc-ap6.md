---
id: tsmc-fab-18-to-tsmc-ap6
from: tsmc-fab-18
to: tsmc-ap6-zhunan
flow_type: wafers
volume:
  value: null
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: low
substitutability: low
constraints: []
notes: >
  Processed leading-edge wafers (Nvidia GH100-class dies on TSMC 4N,
  N5 family) moving from front-end fabrication into advanced packaging.
  Intra-TSMC logistics — the constraint sits at the packaging step, not
  this transfer.
sources:
  - url: https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/
    title: "NVIDIA Hopper Architecture In-Depth"
    date: 2022-03
    supports: H100 dies fabricated on TSMC 4N (N5 family, produced at Fab 18)
  - url: https://pr.tsmc.com/english/news/3033
    title: "TSMC Announces the Opening of Advanced Backend Fab 6"
    date: 2023-06-08
    supports: AP6 as the advanced packaging/testing destination for front-end output
---

# tsmc-fab-18 → tsmc-ap6-zhunan

Replaces the v1-skeleton direct fab→Nvidia edge: wafers now flow through
the packaging step as the data model intended. The interesting economics
happen at the next hop.
