---
id: midamerican-to-azure-wdm
from: midamerican-iowa
to: azure-west-des-moines
flow_type: power
volume:
  value: null
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: medium
substitutability: low
constraints: [grid-transformers]
notes: >
  Utility power to Microsoft's West Des Moines campus. Iowa's wind
  build-out (MidAmerican the dominant builder) is a primary reason
  hyperscale capacity clustered there — cheap, contracted carbon-free
  energy. Campus-level MW is not published; null over guess. Gated by
  grid-transformers: energizing new datacenter load requires
  transformers and switchgear that are industry-wide backlogged.
sources:
  - url: https://insideclimatenews.org/news/28072025/big-beautiful-bill-iowa-data-centers/
    title: "Clean Energy Brought Data Centers to Iowa (Inside Climate News)"
    date: 2025-07-28
    supports: relationship (Iowa wind energy underpinning the data center cluster)
  - url: https://dig.watch/updates/power-hardware-shortages-are-delaying-ai-data-centre-expansion-despite-record-investment
    title: "Power hardware shortages are delaying AI data centre expansion (Digital Watch, citing Bloomberg)"
    date: 2026-04-06
    quote: "Close to half of the planned US data-centre builds this year are expected to be delayed or cancelled."
    supports: grid-transformers gating (electrical equipment shortages delaying US datacenter energization)
---

# midamerican-iowa → azure-west-des-moines

Energy availability deciding AI geography: GPT-4's training site sits
where the wind blows and the power is cheap.

**Reviewer notes:** grid-transformers gating added 2026-06 — the claim
is industry-level (datacenter builds delayed on electrical equipment),
not a documented delay at this specific campus.
