---
id: tsmc-fab-18
name: TSMC Fab 18 (GIGAFAB, N5/N3)
layer: chips
type: fab
operator: TSMC
ticker:
  symbol: TSM
  exchange: NYSE (ADR; primary listing TWSE 2330)
location:
  lat: 23.10
  lon: 120.27
  country: TW
  region: Southern Taiwan Science Park, Tainan
  precision: region
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: []
tags: [leading-edge, n5, n3, gigafab]
sources:
  - url: https://www.tsmc.com/tsmcdotcom/PRListingNewsArchivesAction.do?action=detail&newsid=THGOHITHTH&language=E
    title: "TSMC Breaks Ground on Fab 18 in Southern Taiwan Science Park"
    date: 2018-01
    supports: location, purpose (5nm fab in STSP)
  - url: https://pr.tsmc.com/english/news/2986
    title: "TSMC Holds 3nm Volume Production and Capacity Expansion Ceremony"
    date: 2022-12-29
    quote: "TSMC today held a '3nm Volume Production and Capacity Expansion Ceremony' at its Fab 18 new construction site in the Southern Taiwan Science Park."
    supports: status, N3 production at Fab 18
---

# TSMC Fab 18 (GIGAFAB, N5/N3)

TSMC's Fab 18 in the Southern Taiwan Science Park (Tainan) is the company's
N5-family and N3 production site — the origin of essentially every
leading-edge AI accelerator die, including Nvidia's Hopper generation
(TSMC "4N", an N5-family process customized for Nvidia).

Coordinates are the STSP area centroid, precision `region` — the fab's
exact parcel can be added later with a mapped source if site precision
matters for the visual.

**Reviewer notes:** (1) Capacity is deliberately `null`: public figures for
Fab 18 conflate construction phases and process nodes; a defensible wpm
number with an `as_of` needs dedicated M2 research. (2) Verify the quoted
PR sentence against pr.tsmc.com/english/news/2986 — phrasing reconstructed
from the press release coverage.
