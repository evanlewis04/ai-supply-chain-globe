---
id: jsr-yokkaichi
name: JSR Yokkaichi (EUV photoresists)
layer: chips
type: material_supplier
operator: JSR Corporation (owned by Japan Investment Corp)
location:
  lat: 34.965
  lon: 136.6244
  country: JP
  region: Yokkaichi, Mie Prefecture
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-06
status: operational
constraints: [euv-photoresist]
tags: [photoresist, euv, materials, japan]
sources:
  - url: https://www.jsr.co.jp/jsr_e/news/2024/20240830.html
    title: "JSR Expands Global Development and Production Functions for Leading-Edge Photoresists (JSR press release)"
    date: 2024-08-30
    quote: "In Japan, in addition to the Fine Electronic Materials Development Center located in the Yokkaichi Plant, JSR has recently decided to establish a new R&D center for MOR in the Kanto area."
    supports: Yokkaichi as JSR's main leading-edge photoresist development/production site; MOR (metal oxide resist) commercialization since the 2021 Inpria acquisition
  - url: https://www.digitimes.com/news/a20240419PD204/jsr-japan-ic-manufacturing-delisting.html
    title: "Japan's JIC successfully acquires JSR with delisting expected by summer (DigiTimes)"
    date: 2024-04-19
    supports: ownership (state-backed JIC; delisted from TSE June 2024 — hence no ticker)
  - url: https://en.wikipedia.org/wiki/Yokkaichi
    title: "Yokkaichi (Wikipedia — pointer for city centroid coordinates)"
    date: 2026-06
    supports: location (city centroid; precision city)
---

# JSR Yokkaichi (EUV photoresists)

JSR's Yokkaichi plant in Mie Prefecture is the company's main site for
leading-edge lithography materials — home to its Fine Electronic
Materials Development Center and the expansion announced for EUV
resist production. JSR is one of the three Japanese firms that
together make ~85% of the world's EUV photoresist, and since
acquiring Inpria (2021) it leads the next-generation metal oxide
resist (MOR) chemistry that High-NA EUV will lean on.

The ownership story is the tell: in 2024 Japan's government-backed
JIC fund bought JSR for ~$6B and delisted it — a national-strategic
acquisition of a chemicals company most people have never heard of.
No ticker for the finance overlay, by design of the Japanese state.

Coordinates are the Yokkaichi city centroid (precision `city`).

Capacity is `null`: resist output (liters/year) is not disclosed.

**Reviewer notes:** JSR also announced a Yunlin County, Taiwan plant
(2026) to co-develop resists with TSMC from ~2028 — when it breaks
ground it deserves its own node; for now the Taiwan story lives on
the edge to Fab 18.
