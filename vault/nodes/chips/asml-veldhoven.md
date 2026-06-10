---
id: asml-veldhoven
name: ASML Veldhoven (HQ & EUV production)
layer: chips
type: equipment_maker
operator: ASML Holding N.V.
ticker:
  symbol: ASML
  exchange: NASDAQ (ADR; primary listing Euronext Amsterdam)
location:
  lat: 51.403
  lon: 5.457
  country: NL
  region: Veldhoven, North Brabant
  precision: site
capacity:
  value: 48
  unit: euv_systems_shipped_in_year
  as_of: 2025
status: operational
constraints: []
tags: [euv, lithography, monopoly-supplier]
sources:
  - url: https://www.dnb.com/business-directory/company-profiles.asml_holding_nv.b5ed2b6201b6ff7d0f05fdfcdbbaa474.html
    title: "D&B company profile — ASML Holding N.V. (accessed 2026-06)"
    date: 2026-06
    supports: location (De Run 6501, Veldhoven)
  - url: https://www.digitimes.com/news/a20241112PD204/euv-tsmc-adoption-2023-technology.html
    title: "TSMC now reportedly operates over half of global EUVs, weighs high-NA adoption"
    date: 2024-11
    supports: role as the EUV supplier to leading-edge fabs
  - url: https://www.asianometry.com/p/whats-next-for-asml
    title: "What's Next For ASML? (Asianometry, Jon Y)"
    date: 2024-06-16
    quote: "The first EUV machine took 23 hours to pattern a single wafer. Today's best EUV machines can do 180 wafers per hour."
    supports: EUV technology maturity and throughput context
  - url: https://www.asml.com/en/news/press-releases/2026/q4-2025-financial-results
    title: "ASML reports EUR 32.7 billion total net sales and EUR 9.6 billion net income in 2025"
    date: 2026-01-28
    supports: capacity (48 EUV systems shipped in 2025, up from 44 in 2024; EUV sales +39% to EUR 11.6B)
---

# ASML Veldhoven (HQ & EUV production)

ASML's Veldhoven campus (De Run 6501) is corporate HQ and the final-assembly
site for its lithography systems, including EUV — the machines without which
no leading-edge (N5/N3-class) logic can be manufactured. ASML is widely
documented as the only company supplying production EUV lithography systems,
which makes this single campus one of the most concentrated points of
failure in the entire AI supply chain.

Coordinates geocoded from the published street address (De Run 6501,
Veldhoven); precision `site`.

Annual EUV output: 48 systems shipped in 2025 (44 in 2024), per ASML's
Q4 2025 results — the entire world's supply of leading-edge lithography,
about four machines a month, from one campus. ASML guides 2026 as another
growth year "largely driven by a significant increase in EUV sales" on AI
demand.

**Reviewer notes:** The "sole supplier of EUV" claim is universally
reported but the sources attached here support it only indirectly —
consider adding ASML's own 20-F annual report language. (Capacity field
resolved 2026-06 with the official 2025 shipment count.)
