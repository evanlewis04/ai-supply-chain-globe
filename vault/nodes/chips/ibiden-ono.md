---
id: ibiden-ono
name: Ibiden Ono Plant (ABF substrates)
layer: chips
type: substrate_maker
operator: Ibiden
ticker:
  symbol: 4062.T
  exchange: TSE
location:
  lat: 35.47
  lon: 136.63
  country: JP
  region: Ono Town, Ibi District, Gifu
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: ramping
constraints: []
tags: [abf-substrate, ic-substrate, packaging-materials]
sources:
  - url: https://evertiq.com/design/2025-10-15-ibiden-expands-ic-substrate-production-with-ono-plant
    title: "Ibiden expands IC substrate production with Ono plant"
    date: 2025-10-15
    supports: location, status (opening ceremony Oct 2025, ramp into 2026)
  - url: https://www.taipeitimes.com/News/biz/archives/2024/12/31/2003829378
    title: "Ibiden weighs faster expansion for AI demand"
    date: 2024-12-31
    supports: role as leading substrate supplier to Nvidia
---

# Ibiden Ono Plant (ABF substrates)

Ibiden is the leading supplier of the ABF package substrates under Nvidia's
AI accelerators — the layer of the stack almost nobody outside the industry
has heard of, and one of the candidate "next bottlenecks" as CoWoS capacity
catches up. The new Ono plant (Gifu) opened October 2025 and is ramping:
reported ~25% utilization in late 2025, targeting ~50% by March 2026.

Substrates flow from here into the advanced packaging step, where the
CoWoS interposer-plus-die assembly is mounted onto the substrate.

**Reviewer notes:** (1) Capacity null — Ibiden discloses percentage ramp
targets, not absolute substrate volumes. (2) An `abf-substrate-capacity`
constraint entity is deferred post-v1. (3) Ticker is the TSE listing via
Yahoo symbol 4062.T.
