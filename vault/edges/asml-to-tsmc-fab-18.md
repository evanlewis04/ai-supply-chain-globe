---
id: asml-to-tsmc-fab-18
from: asml-veldhoven
to: tsmc-fab-18
flow_type: equipment
volume:
  value: null
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: []
notes: >
  EUV lithography systems. N5/N3 production at Fab 18 is impossible without
  ASML EUV tools, and there is no second source — the canonical
  low-substitutability link in the entire supply chain. Volume is null:
  ASML reports EUV shipments company-wide, not per customer site.
sources:
  - url: https://www.digitimes.com/news/a20241112PD204/euv-tsmc-adoption-2023-technology.html
    title: "TSMC now reportedly operates over half of global EUVs, weighs high-NA adoption"
    date: 2024-11
    supports: relationship (TSMC operates the majority of installed ASML EUV systems)
---

# asml-veldhoven → tsmc-fab-18

TSMC is ASML's largest EUV customer, reportedly operating over half of all
installed EUV systems globally as of 2023. Fab 18's N5/N3 output — the
wafers under every Nvidia AI accelerator — depends on these tools.

**Reviewer notes:** A per-fab tool count is not public; if M2 research
finds a defensible installed-base figure (analyst estimates with
methodology), it can become a volume with `as_of`. ASML annual report
total EUV shipment counts are a good supplementary source.
