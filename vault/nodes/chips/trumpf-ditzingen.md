---
id: trumpf-ditzingen
name: TRUMPF Ditzingen (EUV drive lasers)
layer: chips
type: equipment_maker
operator: TRUMPF SE + Co. KG
location:
  lat: 48.8264
  lon: 9.0664
  country: DE
  region: Ditzingen, Baden-Württemberg
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-06
status: operational
constraints: [euv-optics]
tags: [euv, laser, light-source, single-source]
sources:
  - url: https://www.deutscher-zukunftspreis.de/en/team-1-2020
    title: "Deutscher Zukunftspreis 2020, Team 1: EUV lithography (TRUMPF, ZEISS, Fraunhofer IOF) — accessed 2026-06"
    date: 2026-06
    quote: "Michael Kösters, group lead at TRUMPF Lasersystems for Semiconductor Manufacturing in Ditzingen, is co-developer of the high-performance laser that generates the EUV light."
    supports: location (TRUMPF Lasersystems for Semiconductor Manufacturing, Ditzingen); role as EUV drive-laser developer; 30kW CO2 laser
  - url: https://www.zeiss.com/semiconductor-manufacturing-technology/news-and-events/smt-press-releases/deutscher-zukunftspreis-2020-euv.html
    title: "Deutscher Zukunftspreis 2020: EUV developers from TRUMPF, ZEISS and Fraunhofer nominated (Zeiss press release)"
    date: 2020-09
    supports: TRUMPF/Zeiss/Fraunhofer as the EUV component development trio behind ASML
  - url: https://en.wikipedia.org/wiki/Ditzingen
    title: "Ditzingen (Wikipedia — pointer for town centroid coordinates)"
    date: 2026-06
    supports: location (town centroid; precision city)
---

# TRUMPF Ditzingen (EUV drive lasers)

EUV light does not come from a bulb. Inside every ASML EUV system, a
TRUMPF-built pulsed CO2 laser — ~30kW average power, the most powerful
industrial laser of its kind — fires tens of thousands of times per
second at falling tin droplets, vaporizing them into plasma that emits
13.5nm light. TRUMPF Lasersystems for Semiconductor Manufacturing
developed and builds it in Ditzingen, outside Stuttgart. Like Zeiss
SMT's optics, it has no second source; unlike Zeiss, TRUMPF is a
family-owned company most people have never heard of.

Coordinates are the town centroid (precision `city`); TRUMPF's HQ
campus is in Ditzingen.

Capacity is `null`: TRUMPF does not publish EUV laser unit output.

**Reviewer notes:** The "no economical alternative" framing appears in
award/press materials rather than an arms-length filing; the
load-bearing single-source claim for the constraint rests on ASML's
20-F optics language, with TRUMPF's laser as the parallel story. If a
stronger arms-length source for laser single-sourcing surfaces (e.g.
ASML supplier-risk language naming TRUMPF), add it here.
