---
id: openai-hq
name: OpenAI (San Francisco)
layer: models
type: lab
operator: OpenAI
location:
  lat: 37.7749
  lon: -122.4194
  country: US
  region: San Francisco, California (Mission Bay)
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: []
tags: [frontier-lab, gpt]
sources:
  - url: https://therealdeal.com/san-francisco/2026/03/16/openai-inks-another-mission-bay-lease/
    title: "OpenAI surges past 1M sf of offices in SF with latest Mission Bay lease"
    date: 2026-03-16
    supports: location (Mission Bay, San Francisco campus)
  - url: https://semianalysis.com/2023/07/10/gpt-4-architecture-infrastructure/
    title: "GPT-4 Architecture, Infrastructure, Training Dataset, Costs, Vision, MoE (SemiAnalysis)"
    date: 2023-07-10
    supports: GPT-4 scale and architecture analysis (independent estimates)
  - url: https://openai.com/index/introducing-gpt-5-5/
    title: "Introducing GPT-5.5 (OpenAI)"
    date: 2026-04-23
    supports: current frontier model generation (GPT-5.5, April 2026)
  - url: https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/
    title: "The next chapter of the Microsoft-OpenAI partnership (Microsoft)"
    date: 2025-10-28
    supports: restructured compute relationship (27% Microsoft stake, $250B incremental Azure commitment, end of right of first refusal)
---

# OpenAI (San Francisco)

OpenAI is the frontier lab in the v1 slice: it consumes Azure compute
(training run in the West Des Moines campus for GPT-4) and produces the
model artifacts behind ChatGPT and the API. Its physical footprint is a
Mission Bay, San Francisco campus exceeding 1M sq ft across multiple
buildings (1455/1515 Third Street, 550 Terry Francois Blvd, 1800 Owens St).

Coordinates are the San Francisco city centroid, precision `city` — the
multi-building campus makes a single site coordinate misleading anyway.

Scale context (SemiAnalysis estimates, not OpenAI disclosures): GPT-4 as a
~1.8T-parameter mixture-of-experts model trained on ~13T tokens — the
demand signal that, multiplied across every frontier lab, is what pulls on
every upstream node in this graph.

**Current era (2025-2026):** the model line has advanced GPT-4 (Mar 2023)
→ GPT-5 (2025) → GPT-5.5 (Apr 2026), and the compute relationship has been
restructured: under the October 2025 agreement Microsoft holds ~27% of
OpenAI, OpenAI committed to an incremental $250B of Azure purchases, and
Microsoft's right of first refusal on OpenAI compute ended — training now
also flows through non-Azure infrastructure (Stargate sites with Oracle
and others). The Iowa edge in this graph is the *sourced historical
anchor* (GPT-4); mapping current multi-site training geography
(Abilene TX, etc.) is the highest-value post-v1 data expansion.

**Reviewer notes:** The *training cluster* should eventually become its
own node (sited at the Azure campus) and the *model artifact* (GPT-4) a
third, per the data model. This single lab node is the walking-skeleton
stand-in.
