---
id: sk-hynix-to-tsmc-ap6
from: sk-hynix-icheon
to: tsmc-ap6-zhunan
flow_type: memory
volume:
  value: null
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: []
notes: >
  HBM stacks shipped for co-packaging with GPU dies on CoWoS interposers.
  SK hynix was initially the exclusive HBM3 supplier for Nvidia's H100
  generation; Samsung and Micron qualified later. Substitutability is low
  in the relevant period and HBM remains allocation-constrained — a
  candidate hbm-supply constraint entity post-v1.
sources:
  - url: https://news.skhynix.com/sk-hynix-to-supply-industrys-first-hbm3-dram-to-nvidia/
    title: "SK hynix to Supply Industry's First HBM3 DRAM to NVIDIA"
    date: 2022-06
    supports: relationship (HBM3 supply for H100)
  - url: https://www.trendforce.com/presscenter/news/20240313-12075.html
    title: "HBM3 Initially Exclusively Supplied by SK Hynix, Samsung Rallies Fast After AMD Validation"
    date: 2024-03-13
    supports: initial exclusivity, later second-sourcing
---

# sk-hynix-icheon → tsmc-ap6-zhunan

The memory feed into the packaging bottleneck. HBM and CoWoS alternate as
the binding constraint — exactly the dynamic the constraint-entity design
exists to capture.
