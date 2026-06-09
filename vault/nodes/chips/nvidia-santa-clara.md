---
id: nvidia-santa-clara
name: Nvidia HQ (Santa Clara)
layer: chips
type: designer
operator: NVIDIA Corporation
ticker:
  symbol: NVDA
  exchange: NASDAQ
location:
  lat: 37.3705
  lon: -121.967
  country: US
  region: Santa Clara, California
  precision: site
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: [cowos-capacity]
tags: [fabless, gpu, ai-accelerators]
sources:
  - url: https://www.sec.gov/Archives/edgar/data/0001045810/000104581024000029/Financial_Report.xlsx
    title: "NVIDIA Corp Form 10-K FY2024 (SEC EDGAR)"
    date: 2024-02
    supports: location (2788 San Tomas Expressway, Santa Clara, CA — principal executive offices per 10-K)
---

# Nvidia HQ (Santa Clara)

Nvidia is the fabless designer at the center of the AI accelerator market.
The Santa Clara HQ (2788 San Tomas Expressway) is where the architecture,
allocation, and customer relationships live; manufacturing is entirely
outsourced — wafers from TSMC, HBM from SK Hynix/Micron/Samsung, advanced
packaging via TSMC CoWoS. In graph terms this node is where wafer supply
turns into allocated, packaged product flowing to cloud providers.

Coordinates geocoded from the published HQ address; precision `site`.

**Reviewer notes:** The 10-K source link is the financial-report artifact
from EDGAR; consider swapping for the main 10-K HTML filing URL for
readability when this enters canon.
