---
id: euv-optics
name: EUV optics & light source (single-source behind ASML)
category: capacity
description: >
  ASML's EUV monopoly rests on an even narrower base than ASML itself.
  Carl Zeiss SMT in Oberkochen is ASML's sole supplier of the mirrors,
  lenses, illuminators and collectors inside every EUV system, and
  TRUMPF in Ditzingen builds the one-of-a-kind 30kW CO2 drive laser
  that generates the EUV light. ASML's own SEC risk language is blunt:
  if Zeiss SMT stopped supplying optics for a prolonged period, ASML
  "would effectively cease to be able to conduct its business" — and
  the number of lithography systems ASML can build is limited by Zeiss
  SMT's production capacity.
severity: medium
tags: [euv, optics, single-source, germany, asml]
sources:
  - url: https://www.sec.gov/Archives/edgar/data/0000937966/000162828026011378/asml-20251231.htm
    title: "ASML Holding N.V. Form 20-F (FY2025), SEC EDGAR"
    date: 2026-02-25
    quote: "Carl Zeiss SMT GmbH is ASML's sole supplier of lenses, mirrors, illuminators, collectors and other critical optical components... the number of lithography systems we are able to produce may be limited by the production capacity of this key supplier."
    supports: sole-supplier relationship; optics capacity limiting ASML output (risk-factor language recurring since at least FY2020)
  - url: https://www.zeiss.com/semiconductor-manufacturing-technology/news-and-events/smt-press-releases/2025/euv-30-years.html
    title: "30 years of EUV lithography optics at ZEISS SMT (Zeiss press release)"
    date: 2025-04-01
    supports: Oberkochen as the EUV optics development/production center; systems unique to strategic partner ASML
  - url: https://www.deutscher-zukunftspreis.de/en/team-1-2020
    title: "Deutscher Zukunftspreis 2020, Team 1: EUV lithography (TRUMPF, ZEISS, Fraunhofer IOF) — accessed 2026-06"
    date: 2026-06
    quote: "The key component in these machines is the high-power laser for the EUV light source and the optical system. And this is exactly where the semiconductor segments of laser manufacturer TRUMPF and the optics specialist ZEISS come into play."
    supports: TRUMPF as developer of the EUV drive laser (30kW CO2, Ditzingen); Zeiss SMT as builder of the EUV mirror system
---

# EUV optics & light source (single-source behind ASML)

Everyone now knows ASML is the only company that can make an EUV
machine. Almost nobody asks what ASML can't make: the optics and the
light source. Every EUV system contains a mirror train from Carl Zeiss
SMT in Oberkochen — mirrors so precise that, scaled to Germany, their
largest unevenness would be a tenth of a millimeter — and a 30kW
pulsed CO2 laser from TRUMPF in Ditzingen that fires at tin droplets
to make the 13.5nm light. Neither has a second source. ASML's 20-F
says the quiet part in plain risk-factor prose: lose Zeiss SMT and
ASML "would effectively cease to be able to conduct its business";
even in the good case, ASML's output is capped by Zeiss SMT's
production capacity. ASML bought 24.9% of Zeiss SMT in 2016 precisely
to fund and lock in that capacity.

Selecting this constraint highlights the equipment path: German optics
and lasers into Veldhoven, EUV systems into Fab 18, and the whole
wafer-to-GPU-to-model chain downstream.

**Reviewer notes:** (1) Severity `medium`: the dependency is absolute
but there is no public reporting of optics supply currently binding
ASML shipments — the 20-F frames it as structural risk, and EUV
shipments grew to 48 systems in 2025. If reporting emerges that Zeiss
capacity is pacing EUV output in practice, raise to `high`. (2) No
public metrics exist for optics output; metrics omitted rather than
invented. (3) The 20-F quote is condensed from risk-factor language
that recurs across FY2020-FY2025 filings; FY2025 cited as most recent.
