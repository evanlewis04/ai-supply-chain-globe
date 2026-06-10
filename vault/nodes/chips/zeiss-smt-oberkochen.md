---
id: zeiss-smt-oberkochen
name: Zeiss SMT Oberkochen (EUV optics)
layer: chips
type: equipment_maker
operator: Carl Zeiss SMT GmbH (Zeiss Group; ASML holds 24.9%)
location:
  lat: 48.7854
  lon: 10.0986
  country: DE
  region: Oberkochen, Baden-Württemberg
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-06
status: operational
constraints: [euv-optics]
tags: [euv, optics, mirrors, single-source]
sources:
  - url: https://www.zeiss.com/semiconductor-manufacturing-technology/news-and-events/smt-press-releases/2025/euv-30-years.html
    title: "30 years of EUV lithography optics at ZEISS SMT (Zeiss press release)"
    date: 2025-04-01
    quote: "These optical systems... are a crucial part of the EUV systems built by ASML. The systems are unique to ASML, ZEISS' strategic partner."
    supports: location (headquartered in Oberkochen); role as EUV optics maker for ASML
  - url: https://www.sec.gov/Archives/edgar/data/0000937966/000162828026011378/asml-20251231.htm
    title: "ASML Holding N.V. Form 20-F (FY2025), SEC EDGAR"
    date: 2026-02-25
    quote: "Carl Zeiss SMT GmbH is ASML's sole supplier of lenses, mirrors, illuminators, collectors and other critical optical components."
    supports: sole-supplier status
  - url: https://optics.org/news/7/11/11
    title: "ASML buys billion-euro stake in Zeiss subsidiary (optics.org)"
    date: 2016-11
    supports: ASML's 24.9% equity stake in Carl Zeiss SMT (capacity lock-in)
  - url: https://en.wikipedia.org/wiki/Oberkochen
    title: "Oberkochen (Wikipedia — pointer for town centroid coordinates)"
    date: 2026-06
    supports: location (town centroid; precision city)
---

# Zeiss SMT Oberkochen (EUV optics)

Carl Zeiss SMT's Oberkochen campus develops and builds the projection
optics inside every EUV lithography system on Earth — mirror trains
polished to sub-atomic flatness ("able to hit a ping pong ball on the
Moon"). It is, per ASML's own SEC filings, ASML's sole supplier of
lenses, mirrors, illuminators and collectors, which makes this small
Swabian town the second German chokepoint nobody prices in: ASML's
EUV output is explicitly capped by Zeiss SMT's production capacity.
ASML took a 24.9% stake in 2016 to co-fund expansion and lock in
supply.

Coordinates are the town centroid (precision `city`); Zeiss is by far
the town's dominant employer and site.

Capacity is `null`: Zeiss does not publish optics output per year.

**Reviewer notes:** Carl Zeiss AG is foundation-owned (Carl-Zeiss-
Stiftung) — no ticker anywhere on this chain's German leg. The
"unique to ASML" quote also establishes the reverse dependency (Zeiss
SMT's EUV optics have exactly one customer), worth a mention if a
mutual-dependency view is ever added.
