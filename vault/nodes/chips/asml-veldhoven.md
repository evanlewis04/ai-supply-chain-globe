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
  value: null
  unit: null
  as_of: 2026-Q2
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

**Reviewer notes:** (1) The "sole supplier of EUV" claim is universally
reported but the sources attached here support it only indirectly — consider
adding ASML's own 20-F annual report language before this enters canon.
(2) EUV annual shipment counts are published in ASML annual reports and
would make a good `capacity` entry (unit: euv_systems_per_year) in M2.
