---
id: spruce-pine-to-globalwafers
from: spruce-pine-quartz-district
to: globalwafers-hsinchu
flow_type: materials
volume:
  value: null
  unit: null
  as_of: 2026-06
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: [spruce-pine-quartz]
notes: >
  High-purity quartz for the crucibles used in Czochralski silicon ingot
  growth. The link is structural, not a documented bilateral contract:
  70-90% of crucibles worldwide are made from Spruce Pine quartz, and
  ingot growth — which GlobalWafers performs as a vertically integrated
  wafer maker — cannot happen without them. Volume is null: neither
  Sibelco, The Quartz Corp, nor crucible makers publish customer-level
  shipment data, and the quartz typically passes through crucible
  fabricators rather than flowing directly.
sources:
  - url: https://finance.yahoo.com/news/north-carolina-maker-high-purity-201718462.html
    title: "North Carolina maker of high-purity quartz back operating post-Helene (AP)"
    date: 2024-10-10
    quote: "An estimated 70% to 90% of the crucibles used worldwide in which polysilicon used for the chips is melted down are made from Spruce Pine quartz."
    supports: relationship (Spruce Pine quartz → crucibles → polysilicon melt for ingot growth, industry-wide)
  - url: https://www.cnbc.com/2024/10/03/helene-quartz-mine-semiconductor-north-carolina.html
    title: "Helene quartz mine damage threatens semiconductor chip industry (CNBC)"
    date: 2024-10-03
    quote: "This is the only plant in the world right now that serves the semiconductor industry in its entirety."
    supports: low substitutability (no second source for semiconductor-grade HPQ)
---

# spruce-pine-quartz-district → globalwafers-hsinchu

The most upstream arc on the globe: ultra-pure quartz leaves one
Appalachian valley and (via crucible fabricators) ends up holding the
molten polysilicon from which GlobalWafers pulls 300mm ingots. When
Spruce Pine flooded in September 2024, the exposure ran through exactly
this link — wafer makers' crucible supply — before any fab would have
felt it.

**Reviewer notes:** This edge is an industry-structural claim
(all ingot growers depend on Spruce Pine-derived crucibles), not a
documented Sibelco→GlobalWafers contract; the intermediate crucible
fabricators (e.g. Momentive) are deliberately not modeled in this pass
— narrow-deep. If that intermediation feels like it overstates
directness, an alternative is a crucible-maker node in between; flag
for owner review.
