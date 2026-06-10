---
id: spruce-pine-quartz
name: Spruce Pine ultra-pure quartz concentration
category: geographic
description: >
  Essentially all of the world's semiconductor-grade high-purity quartz
  (HPQ) is mined in one small town: Spruce Pine, North Carolina, by two
  operators (Sibelco and The Quartz Corp). HPQ is what the crucibles used
  to melt polysilicon and pull monocrystalline silicon ingots are made of
  — the very first step of every wafer, every chip, every GPU. Hurricane
  Helene shut both operations in September 2024 and briefly exposed the
  entire industry's dependence on a single Appalachian valley.
metrics:
  - value: 80
    unit: pct_of_world_semiconductor_crucibles
    as_of: 2024-10
    note: "AP: an estimated 70-90% of crucibles used worldwide to melt polysilicon are made from Spruce Pine quartz (midpoint recorded)"
severity: medium
tags: [raw-materials, concentration-risk, quartz, single-point-of-failure]
sources:
  - url: https://www.npr.org/2024/09/30/nx-s1-5133462/hurricane-helene-quartz-microchips-solar-panels-spruce-pine
    title: "Spruce Pine just got hit by Helene. The fallout on the tech industry could be huge (NPR)"
    date: 2024-09-30
    supports: global dependence on Spruce Pine HPQ; production halt after Helene
  - url: https://www.cnbc.com/2024/10/03/helene-quartz-mine-semiconductor-north-carolina.html
    title: "Helene quartz mine damage threatens semiconductor chip industry (CNBC)"
    date: 2024-10-03
    quote: "This is the only plant in the world right now that serves the semiconductor industry in its entirety. If something were to happen to these mines, it can put the entire industry on its ear, period. There's no other capability."
    supports: single-source concentration (TECHCET CEO Lita Shon-Roy); both operators halted Sept 26, 2024
  - url: https://finance.yahoo.com/news/north-carolina-maker-high-purity-201718462.html
    title: "North Carolina maker of high-purity quartz back operating post-Helene (AP)"
    date: 2024-10-10
    quote: "An estimated 70% to 90% of the crucibles used worldwide in which polysilicon used for the chips is melted down are made from Spruce Pine quartz."
    supports: crucible market share metric; Sibelco production restart 2024-10-10
  - url: https://www.sibelco.com/en/news/sibelco-announces-a-major-expansion-of-its-spruce-pine-usa-high-purity-quartz-operations
    title: "Sibelco announces a major expansion of its Spruce Pine (USA) high purity quartz operations"
    date: 2023-04
    supports: $200M Expansion 1 to double HPQ capacity 2023-2025; ~$500M Expansion 2 planned 2024-2027; 100+ year mine life
---

# Spruce Pine ultra-pure quartz concentration

The most upstream chokepoint in the entire AI supply chain, and the least
known. The Czochralski process that grows monocrystalline silicon ingots
requires crucibles of ultra-pure quartz that does not contaminate the melt
— and the only commercially viable deposit of that quartz is in Spruce
Pine, North Carolina (pop. ~2,200). An estimated 70-90% of crucibles used
worldwide are made from Spruce Pine quartz; TECHCET's CEO calls it "the
only plant in the world right now that serves the semiconductor industry
in its entirety."

The risk stopped being theoretical in September 2024: Hurricane Helene
flooded the valley and halted both operators (Sibelco and The Quartz
Corp) on September 26. Sibelco restarted production two weeks later
(October 10) and the feared shortage never materialized — but the episode
is the cleanest demonstration anywhere in the chain that a single zip
code gates global silicon output. Sibelco is meanwhile doubling capacity
($200M Expansion 1, 2023-2025) with a further ~$500M Expansion 2 planned
through 2027.

**Reviewer notes:** (1) Severity recorded as `medium`, not `high`:
the concentration is extreme, but supply is currently not binding —
operations recovered quickly post-Helene and capacity is expanding.
The category is `geographic` (concentration risk), not `capacity`.
(2) The 70-90% figure is the crucible share, not the share of all HPQ
end-uses; metric unit named accordingly, midpoint recorded. (3) Synthetic
quartz and recycled crucibles exist but are not yet commercial-scale
substitutes per the cited reporting; if a source quantifying substitutes
appears, revisit substitutability on the gated edge.
