---
id: cowos-capacity
name: CoWoS advanced packaging capacity
category: capacity
description: >
  CoWoS (Chip-on-Wafer-on-Substrate) is TSMC's 2.5D advanced packaging
  technology that mounts GPU dies and HBM stacks on a silicon interposer —
  required for essentially every high-end AI accelerator. From 2023 onward,
  packaging capacity, not wafer fabrication, has been the binding
  constraint on AI accelerator supply: every H100 that exists passed
  through this bottleneck.
metrics:
  - value: 37500
    unit: wafers_per_month
    as_of: 2024
    note: "TrendForce: 35,000-40,000 wpm during 2024 (midpoint recorded)"
  - value: 75000
    unit: wafers_per_month
    as_of: 2025
    note: "Record high, roughly doubling 2024; includes AP8 (ex-Innolux) and Taichung capacity"
  - value: 125000
    unit: wafers_per_month
    as_of: 2026-Q4
    note: "Projection: 120,000-130,000 wpm by end-2026 (midpoint recorded)"
severity: high
tags: [advanced-packaging, tsmc, bottleneck]
sources:
  - url: https://www.trendforce.com/news/2024/10/21/news-cowos-capacity-doubles-for-two-years-still-insufficient-positive-outlook-for-suppliers/
    title: "TSMC's CoWoS Capacity Doubles for Two Years, Still Insufficient"
    date: 2024-10-21
    supports: 2024 capacity range, demand exceeding supply
  - url: https://www.trendforce.com/news/2025/01/02/news-tsmc-set-to-expand-cowos-capacity-to-record-75000-wafers-in-2025-doubling-2024-output/
    title: "TSMC Set to Expand CoWoS Capacity to Record 75,000 Wafers in 2025, Doubling 2024 Output"
    date: 2025-01-02
    supports: 2025 capacity metric
  - url: https://www.trendforce.com/news/2024/12/13/news-tsmc-ramps-up-cowos-capacity-across-taiwan-projected-to-nearly-triple-by-2026/
    title: "TSMC Ramps up CoWoS Capacity across Taiwan, Projected to Nearly Triple by 2026"
    date: 2024-12-13
    supports: 2026 projection, multi-site expansion
  - url: https://newsletter.semianalysis.com/p/ai-capacity-constraints-cowos-and
    title: "AI Capacity Constraints: CoWoS and HBM (SemiAnalysis)"
    date: 2023-07-05
    quote: "CoWoS and HBM are already majority AI-facing technologies, so all slack was already absorbed in Q1. With GPU demand exploding, these are the parts of the supply chain that just cannot keep up and are bottlenecking GPU supply."
    supports: CoWoS as the binding bottleneck on GPU supply (2023)
---

# CoWoS advanced packaging capacity

The defining bottleneck of the 2023-2025 AI buildout. Wafer starts were
never the limit — packaging was: attaching HBM to GPU dies on silicon
interposers at scale. TSMC's CoWoS capacity has roughly doubled every year
since 2023 and demand has stayed ahead of it; TrendForce reported capacity
"still insufficient" even after two consecutive doublings.

Selecting this constraint in the UI highlights everything downstream:
packaged-module flow to Nvidia, GPU deployment into Azure, OpenAI's
training compute, and ChatGPT itself. When the bottleneck migrates (HBM,
substrates, power), new constraint entities will tell that story the same
way — the system is deliberately agnostic about which bottleneck matters.

**Reviewer notes:** (1) Metric values record midpoints of reported ranges;
the ranges are preserved in each metric's note. (2) Figures are TrendForce
reporting (supply-chain checks), not TSMC disclosures — TSMC does not
publish CoWoS capacity. This is the standard public source for these
numbers, but treat precision accordingly. (3) The 2026 figure is a
projection, marked as such.
