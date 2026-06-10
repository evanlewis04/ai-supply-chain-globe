---
id: spruce-pine-quartz-district
name: Spruce Pine quartz district (Sibelco & The Quartz Corp)
layer: chips
type: material_supplier
operator: Sibelco NV / The Quartz Corp
location:
  lat: 35.9154
  lon: -82.0646
  country: US
  region: Spruce Pine, North Carolina
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-06
status: operational
constraints: [spruce-pine-quartz]
tags: [quartz, raw-materials, crucibles, single-point-of-failure]
sources:
  - url: https://en.wikipedia.org/wiki/Spruce_Pine,_North_Carolina
    title: "Spruce Pine, North Carolina (Wikipedia — pointer for town centroid coordinates)"
    date: 2026-06
    supports: location (town centroid; precision city)
  - url: https://www.npr.org/2024/09/30/nx-s1-5133462/hurricane-helene-quartz-microchips-solar-panels-spruce-pine
    title: "Spruce Pine just got hit by Helene. The fallout on the tech industry could be huge (NPR)"
    date: 2024-09-30
    supports: both operators (Sibelco, The Quartz Corp) mine HPQ at Spruce Pine
  - url: https://finance.yahoo.com/news/north-carolina-maker-high-purity-201718462.html
    title: "North Carolina maker of high-purity quartz back operating post-Helene (AP)"
    date: 2024-10-10
    quote: "An estimated 70% to 90% of the crucibles used worldwide in which polysilicon used for the chips is melted down are made from Spruce Pine quartz."
    supports: role in semiconductor supply chain; operational status (production restarted 2024-10-10)
  - url: https://www.sibelco.com/en/news/sibelco-restarts-production-and-customer-shipments-at-spruce-pine-following-hurricane-helene
    title: "Sibelco Restarts Production and Customer Shipments at Spruce Pine Following Hurricane Helene"
    date: 2024-10
    quote: "Sibelco today announced the restart of production at its Spruce Pine high purity quartz mining and processing operations following the disruption caused by Hurricane Helene."
    supports: status operational after the September 2024 halt
---

# Spruce Pine quartz district (Sibelco & The Quartz Corp)

Two adjacent mining and processing operations in Spruce Pine, Mitchell
County, North Carolina — Sibelco's and The Quartz Corp's — produce
essentially the entire world supply of semiconductor-grade high-purity
quartz. The quartz becomes the crucibles in which polysilicon is melted
for Czochralski ingot growth: the first physical step on the road to
every wafer TSMC starts, and therefore upstream of every GPU.

Modeled as a single district node rather than two operator nodes:
both operations sit in the same small valley, share the same
concentration risk, and were shut by the same storm (Hurricane Helene,
September 26 - October 10+, 2024). Coordinates are the town centroid
(precision `city`); the mine sites are within a few km.

Capacity is `null`: neither operator publishes HPQ output tonnage.
Sibelco discloses only relative figures (production up >70% from 2019
to 2023; Expansion 1 doubling installed capacity by 2025).

**Reviewer notes:** (1) Private companies — no ticker, no IR-grade
capacity data; all quantitative claims live on the constraint entity
where they are sourced to AP/CNBC/Sibelco. (2) If the district-node
modeling feels wrong once more material suppliers exist, split into
two operator nodes; ids are stable so edges would need re-pointing.
