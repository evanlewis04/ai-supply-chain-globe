---
id: trumpf-to-asml
from: trumpf-ditzingen
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
  EUV light-source drive lasers (30kW pulsed CO2) from Ditzingen into
  ASML's EUV light source (the former Cymer business). No second
  supplier builds this laser class for EUV. Volume null: unit counts
  not published, though each EUV system requires one drive laser, so
  shipments track ASML's EUV output (~48 systems in 2025).
sources:
  - url: https://www.deutscher-zukunftspreis.de/en/team-1-2020
    title: "Deutscher Zukunftspreis 2020, Team 1: EUV lithography (TRUMPF, ZEISS, Fraunhofer IOF) — accessed 2026-06"
    date: 2026-06
    quote: "The key component in these machines is the high-power laser for the EUV light source and the optical system. And this is exactly where the semiconductor segments of laser manufacturer TRUMPF and the optics specialist ZEISS come into play."
    supports: relationship (TRUMPF EUV drive laser into ASML EUV systems)
  - url: https://www.zeiss.com/semiconductor-manufacturing-technology/news-and-events/smt-press-releases/deutscher-zukunftspreis-2020-euv.html
    title: "Deutscher Zukunftspreis 2020: EUV developers nominated (Zeiss press release)"
    date: 2020-09
    supports: TRUMPF as the laser partner in the EUV development alliance
---

# trumpf-ditzingen → asml-veldhoven

Every EUV exposure starts with a TRUMPF laser pulse hitting a tin
droplet. The laser ships from Ditzingen; the plasma it makes is the
only manufacturable source of 13.5nm light at production power.

**Reviewer notes:** The "one drive laser per system" inference in the
notes is engineering-structural, not separately sourced; volume stays
null accordingly.
