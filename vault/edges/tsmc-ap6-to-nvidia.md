---
id: tsmc-ap6-to-nvidia
from: tsmc-ap6-zhunan
to: nvidia-santa-clara
flow_type: packaged_modules
volume:
  value: null
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: [cowos-capacity]
notes: >
  CoWoS-packaged AI accelerator modules (GPU die + HBM on interposer).
  THE bottleneck edge of the 2023-2025 AI buildout: Nvidia is the
  dominant consumer of CoWoS capacity, demand has exceeded supply through
  consecutive annual capacity doublings, and no alternative packaging
  route exists at equivalent scale. Volume null: Nvidia-specific CoWoS
  allocation is analyst-estimated, not disclosed; the constraint entity
  carries the sourced total-capacity numbers.
sources:
  - url: https://www.trendforce.com/news/2024/10/21/news-cowos-capacity-doubles-for-two-years-still-insufficient-positive-outlook-for-suppliers/
    title: "TSMC's CoWoS Capacity Doubles for Two Years, Still Insufficient"
    date: 2024-10-21
    supports: relationship, demand exceeding capacity
  - url: https://www.trendforce.com/news/2025/01/02/news-tsmc-set-to-expand-cowos-capacity-to-record-75000-wafers-in-2025-doubling-2024-output/
    title: "TSMC Set to Expand CoWoS Capacity to Record 75,000 Wafers in 2025"
    date: 2025-01-02
    supports: Nvidia as leading CoWoS consumer
---

# tsmc-ap6-zhunan → nvidia-santa-clara

The chokepoint. High constraint, low substitutability, gated by
[[cowos-capacity]] — this edge renders red on the globe, and selecting
the CoWoS constraint lights up everything downstream of it.
