---
id: globalwafers-to-tsmc-fab-18
from: globalwafers-hsinchu
to: tsmc-fab-18
flow_type: wafers
volume:
  value: null
  unit: null
  as_of: 2026-06
lead_time_weeks: null
constraint_level: medium
substitutability: medium
constraints: []
notes: >
  Blank (polished/epitaxial) 300mm wafers into TSMC's leading-edge fab.
  Substitutability is medium, not low: TSMC qualifies six main wafer
  suppliers (Shin-Etsu, SUMCO, GlobalWafers, Formosa SUMCO, Siltronic,
  Soitec), so losing one vendor is painful but survivable — unlike the
  quartz that all of them depend on upstream. Volume is null: TSMC does
  not disclose per-supplier wafer purchases.
sources:
  - url: https://www.opportimes.com/en/tsmcs-6-semiconductor-wafer-vendors/
    title: "TSMC's 6 semiconductor wafer vendors (Opportimes)"
    date: 2021-11-04
    quote: "The main wafer suppliers for TSMC semiconductor company are Taiwan's Formosa SUMCO Technology Corporation, Taiwan's GlobalWafers, Japan's Shin-Etsu Handotai, Germany's Siltronic AG, Singapore's Soitec Microelectronics, and Japan's SUMCO Corporation."
    supports: relationship (GlobalWafers among TSMC's main blank-wafer suppliers)
  - url: https://www.gw-semi.com/overview-locations/
    title: "GlobalWafers locations (company site, accessed 2026-06)"
    date: 2026-06
    supports: flow type (Hsinchu plant produces 300mm polished and epitaxial wafers for the Taiwanese semiconductor market)
---

# globalwafers-hsinchu → tsmc-fab-18

Blank 300mm wafers from Hsinchu Science Park down the coast to Fab 18
in Tainan. This edge closes the path from raw quartz to finished GPU:
quartz crucible → ingot → blank wafer → N5/N3 wafer → CoWoS package →
accelerator. Deliberately not gated by the quartz constraint — the
constraint gates the upstream quartz edge, and traversal carries the
highlight downstream from there.

**Reviewer notes:** The supplier list is 2021 trade press; TSMC's
supplier roster is stable but if a newer authoritative list (TSMC annual
report names suppliers in some years) is found during the research pass,
update the source. Per-supplier volume is genuinely non-public.
