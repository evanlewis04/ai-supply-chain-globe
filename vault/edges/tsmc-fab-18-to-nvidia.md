---
id: tsmc-fab-18-to-nvidia
from: tsmc-fab-18
to: nvidia-santa-clara
flow_type: wafers
volume:
  value: null
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: medium
substitutability: low
constraints: []
notes: >
  Leading-edge logic wafers. Nvidia's Hopper-generation GPUs (H100) are
  fabricated on TSMC "4N," an N5-family process customized for Nvidia and
  produced at TSMC's 5nm site, Fab 18. No second source exists at this
  node class. Constraint level set medium rather than high because the
  binding bottleneck downstream has been advanced packaging (CoWoS), not
  wafer starts — the cowos-capacity constraint entity (M2) will carry that.
sources:
  - url: https://developer.nvidia.com/blog/nvidia-hopper-architecture-in-depth/
    title: "NVIDIA Hopper Architecture In-Depth"
    date: 2022-03
    quote: "The full GH100 GPU is fabricated using the TSMC 4N process customized for NVIDIA."
    supports: relationship (H100 fabricated on TSMC 4N)
  - url: https://pr.tsmc.com/english/news/2986
    title: "TSMC Holds 3nm Volume Production and Capacity Expansion Ceremony"
    date: 2022-12-29
    supports: Fab 18 as TSMC's 5nm/3nm production site
---

# tsmc-fab-18 → nvidia-santa-clara

The wafer supply line under the entire AI buildout. "Nvidia" here is the
design/allocation node — physically, wafers flow from Fab 18 into TSMC's
packaging operations, but economically the allocation belongs to Nvidia.
When the CoWoS packaging node is added in M2, this edge will be re-pointed
through it (fab → packaging → Nvidia) per the data model.

**Reviewer notes:** (1) Verify the 4N quote wording against the Nvidia
developer blog. (2) Wafer volume estimates exist from analysts but rarely
with public methodology — likely stays null in v1.
