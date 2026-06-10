---
id: hitachi-south-boston-to-midamerican
from: hitachi-energy-south-boston
to: midamerican-iowa
flow_type: equipment
volume:
  value: null
  unit: null
  as_of: 2026-06
lead_time_weeks: 128
constraint_level: high
substitutability: medium
constraints: [grid-transformers]
notes: >
  Large power transformers and grid equipment from manufacturer to
  utility. The link is structural, not a documented bilateral contract:
  Hitachi Energy is one of the largest US large-power-transformer
  suppliers and stands in for the manufacturing stage; MidAmerican,
  like every US utility, procures LPTs from this supplier pool at
  128-week average lead times. Substitutability is medium — Siemens
  Energy, GE Prolec and others also build LPTs — but the whole pool is
  backlogged, which is what the constraint entity captures. Volume
  null: utility procurement contracts are not public.
sources:
  - url: https://www.hitachienergy.com/us/en/news-and-events/press-releases/2025/09/hitachi-announces-historic-1-billion-usd-manufacturing-investment-to-power-america-s-energy-future-through-production-of-critical-grid-infrastructure
    title: "Hitachi announces historic $1 billion USD manufacturing investment (Hitachi Energy press release)"
    date: 2025-09-04
    supports: relationship (South Boston builds large power transformers for high-voltage transmission, power generation, and AI data centers)
  - url: https://www.powermag.com/transformers-in-2026-shortage-scramble-or-self-inflicted-crisis/
    title: "Transformers in 2026: Shortage, Scramble, or Self-Inflicted Crisis? (POWER Magazine)"
    date: 2026-01-02
    supports: lead_time_weeks (128-week average for power transformers, Wood Mackenzie Q2 2025)
---

# hitachi-energy-south-boston → midamerican-iowa

The arc that explains why "just build more datacenters" takes half a
decade: before MidAmerican can serve another hyperscale campus, the
transformers have to exist, and the queue at every manufacturer —
Hitachi's South Boston plant included — is over two years long.

**Reviewer notes:** Structural edge — no public source documents
MidAmerican specifically buying from South Boston; Hitachi is the
representative LPT manufacturer the same way GlobalWafers represents
wafer supply. lead_time_weeks records the industry-average 128 weeks
(Wood Mackenzie via POWER), not a contract-specific figure. If that
reads as overclaiming, null it and leave the figure on the constraint.
