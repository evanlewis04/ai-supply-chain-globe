---
id: sk-hynix-icheon
name: SK hynix Icheon (HBM)
layer: chips
type: memory_fab
operator: SK hynix
ticker:
  symbol: 000660.KS
  exchange: KRX
location:
  lat: 37.27
  lon: 127.44
  country: KR
  region: Icheon, Gyeonggi-do
  precision: city
capacity:
  value: null
  unit: null
  as_of: 2026-Q2
status: operational
constraints: []
tags: [hbm, hbm3, hbm3e, dram]
sources:
  - url: https://news.skhynix.com/sk-hynix-to-supply-industrys-first-hbm3-dram-to-nvidia/
    title: "SK hynix to Supply Industry's First HBM3 DRAM to NVIDIA"
    date: 2022-06
    supports: HBM3 supply relationship with Nvidia
  - url: https://www.trendforce.com/presscenter/news/20240313-12075.html
    title: "HBM3 Initially Exclusively Supplied by SK Hynix, Samsung Rallies Fast After AMD Validation"
    date: 2024-03-13
    supports: initial exclusivity of HBM3 supply
  - url: https://www.trendforce.com/news/2026/01/28/news-sk-hynix-reportedly-to-supply-about-two-thirds-of-nvidia-hbm4-samsung-targets-early-delivery/
    title: "SK hynix Reportedly to Supply About Two-Thirds of NVIDIA HBM4; Samsung Targets Early Delivery (TrendForce)"
    date: 2026-01-28
    supports: continued HBM leadership into the HBM4 generation (2026)
  - url: https://www.kedglobal.com/korean-chipmakers/newsView/ked202603100011
    title: "SK Hynix to deliver final HBM4 samples to Nvidia to cement AI memory leadership (KED Global)"
    date: 2026-03-10
    supports: HBM4 qualification timeline with Nvidia
---

# SK hynix Icheon (HBM)

SK hynix's Icheon campus (HQ plus DRAM fabs) anchors its HBM production.
SK hynix was the first to mass-produce HBM3 and was initially its exclusive
supplier to Nvidia for the H100 generation — when CoWoS wasn't the binding
constraint, HBM was, and the two alternate as the chokepoint of the moment.
That alternation is exactly what this map is built to show.

The dominance has held across generations: as of early 2026, SK hynix is
reportedly supplying about two-thirds of Nvidia's HBM4, with 2026 HBM4
capacity industry-wide reported as effectively pre-sold. The 2-year stock
chart on this node (+900%+ over 2024-2026) is the market pricing exactly
this position.

HBM stacks ship from here to TSMC's advanced packaging sites, where they
are co-packaged with GPU dies on CoWoS interposers.

**Reviewer notes:** (1) Per-site HBM capacity is not public — null. An
`hbm-supply` constraint entity is deferred post-v1 per the plan. (2) HBM
production also spans Cheongju; Icheon stands in for SK hynix HBM
operations in v1. (3) Ticker is the KRX listing via Yahoo symbol 000660.KS.
