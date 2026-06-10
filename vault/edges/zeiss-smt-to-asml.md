---
id: zeiss-smt-to-asml
from: zeiss-smt-oberkochen
to: asml-veldhoven
flow_type: equipment
volume:
  value: null
  unit: null
  as_of: 2026-06
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: [euv-optics]
notes: >
  EUV projection optics (mirror trains), illuminators and collectors
  from Oberkochen into ASML's Veldhoven final assembly. ASML's 20-F
  names Carl Zeiss SMT as its sole supplier of these components and
  states ASML's system output may be limited by Zeiss SMT's capacity —
  the textbook high-constraint, zero-substitutability link. Volume
  null: per-year optics module counts are not published.
sources:
  - url: https://www.sec.gov/Archives/edgar/data/0000937966/000162828026011378/asml-20251231.htm
    title: "ASML Holding N.V. Form 20-F (FY2025), SEC EDGAR"
    date: 2026-02-25
    quote: "Carl Zeiss SMT GmbH is ASML's sole supplier of lenses, mirrors, illuminators, collectors and other critical optical components."
    supports: relationship and sole-supplier status
  - url: https://www.zeiss.com/semiconductor-manufacturing-technology/news-and-events/smt-press-releases/2025/euv-30-years.html
    title: "30 years of EUV lithography optics at ZEISS SMT (Zeiss press release)"
    date: 2025-04-01
    supports: flow (EUV optical systems built by Zeiss SMT, unique to ASML)
---

# zeiss-smt-oberkochen → asml-veldhoven

The machine behind the machine: before ASML can ship an EUV system,
Oberkochen has to ship the mirrors. ASML's own risk language is the
starkest sentence in any filing on this globe — without Zeiss SMT,
ASML "would effectively cease to be able to conduct its business."

**Reviewer notes:** None — both relationship and severity language come
directly from the primary filing.
