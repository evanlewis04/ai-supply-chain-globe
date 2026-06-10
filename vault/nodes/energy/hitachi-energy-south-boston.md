---
id: hitachi-energy-south-boston
name: Hitachi Energy South Boston (power transformers)
layer: energy
type: equipment_maker
operator: Hitachi Energy (Hitachi, Ltd.)
ticker:
  symbol: 6501.T
  exchange: TSE (parent Hitachi, Ltd.; Hitachi Energy is a wholly-owned subsidiary)
location:
  lat: 36.6987
  lon: -78.9014
  country: US
  region: South Boston, Virginia
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-06
status: operational
constraints: [grid-transformers]
tags: [transformers, grid-equipment, manufacturing]
sources:
  - url: https://www.hitachienergy.com/us/en/news-and-events/press-releases/2022/10/hitachi-energy-invests-us-37-million-to-expand-transformer-manufacturing-facility-in-south-boston-virginia
    title: "Hitachi Energy invests US$37 million to expand transformer manufacturing facility in South Boston, Virginia"
    date: 2022-10
    supports: existing transformer plant at South Boston (location, operational status)
  - url: https://www.hitachienergy.com/us/en/news-and-events/press-releases/2025/09/hitachi-announces-historic-1-billion-usd-manufacturing-investment-to-power-america-s-energy-future-through-production-of-critical-grid-infrastructure
    title: "Hitachi announces historic $1 billion USD manufacturing investment (Hitachi Energy press release)"
    date: 2025-09-04
    quote: "$457 million USD is dedicated to a new power transformer factory in Virginia... will be the largest manufacturing site for large power transformers in the United States."
    supports: $457M expansion; large power transformers for AI data centers; 825 new jobs
  - url: https://en.wikipedia.org/wiki/South_Boston,_Virginia
    title: "South Boston, Virginia (Wikipedia — pointer for town centroid coordinates)"
    date: 2026-06
    supports: location (town centroid; precision city)
---

# Hitachi Energy South Boston (power transformers)

Hitachi Energy's South Boston, Virginia campus builds the large power
transformers that connect generation and big loads to the US grid. The
site has operated and expanded for years ($37M expansion announced
2022); in September 2025 Hitachi committed $457M more — the anchor of
a $1B US grid-equipment investment — to make South Boston "the largest
manufacturing site for large power transformers in the United States,"
explicitly citing AI datacenter demand. The new factory targets
operation by 2028, which is the supply-side answer to, and a measure
of, the lead-time chokepoint.

Coordinates are the town centroid (precision `city`).

Capacity is `null`: Hitachi does not publish per-site transformer
output (units/year).

**Reviewer notes:** (1) Ticker points at parent Hitachi, Ltd. (6501,
TSE) since Hitachi Energy is unlisted — same pattern as ASML's ADR
note; flagged in the exchange field. (2) The plant stands in for the
transformer manufacturing stage generally; Siemens Energy, GE Prolec,
and others also supply US utilities — see edge substitutability.
