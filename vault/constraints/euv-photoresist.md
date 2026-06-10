---
id: euv-photoresist
name: EUV photoresist concentration (Japan)
category: geographic
description: >
  The light-sensitive chemicals that turn EUV exposure into actual
  circuit patterns are a near-Japanese monopoly: JSR, Tokyo Ohka Kogyo
  and Shin-Etsu together account for roughly 85% of EUV resist
  production volume, and Japanese firms hold ~80% of the photoresist
  market overall. The chokepoint has been exercised: in July 2019
  Japan put photoresists under export licensing against South Korea,
  and in 2024 Japan's state-backed JIC fund took JSR private —
  a country treating resist chemistry as strategic infrastructure.
  No EUV resist, no patterned wafer, regardless of how many EUV
  machines exist.
metrics:
  - value: 85
    unit: pct_of_world_euv_resist_volume_top3_japan
    as_of: 2026-05
    note: "JSR + TOK + Shin-Etsu combined share of EUV resist production volume (Tom's Hardware); Japanese firms ~80% of photoresist overall"
severity: medium
tags: [photoresist, japan, materials, concentration-risk, export-controls]
sources:
  - url: https://www.tomshardware.com/tech-industry/jsr-builds-first-taiwan-photoresist-plant-as-japanese-materials-makers-race-to-embed-next-to-tsmc
    title: "Japanese chemical giant JSR expands to Taiwan for EUV photoresist production near TSMC (Tom's Hardware)"
    date: 2026-05-13
    quote: "Japanese companies collectively control roughly 80% of the global photoresist market, and dominance at the EUV level is even more concentrated: JSR, TOK, and Shin-Etsu account for nearly 85% of EUV resist production volume."
    supports: market-share metric; ongoing concentration as of 2026
  - url: https://www.rieti.go.jp/en/columns/v01_0201.html
    title: "The impact of export controls on international trade: Evidence from the Japan-Korea trade dispute (RIETI/VoxEU column)"
    date: 2023-05-08
    quote: "In July 2019, the Japanese government announced potential export controls on South Korea for three chemical inputs, namely hydrogen fluoride, photoresist, and fluorinated polyimide."
    supports: the 2019 demonstration that resist supply can be weaponized; Japan supplying >90% of Korean imports of two of the three materials
  - url: https://www.digitimes.com/news/a20240419PD204/jsr-japan-ic-manufacturing-delisting.html
    title: "Japan's JIC successfully acquires JSR with delisting expected by summer (DigiTimes)"
    date: 2024-04-19
    supports: state-backed Japan Investment Corp taking the leading EUV resist maker private (strategic-asset signal)
---

# EUV photoresist concentration (Japan)

A $30+ billion EUV scanner is inert without a few liters of the right
chemistry. EUV photoresists — the films that record the 13.5nm image
onto the wafer — are dominated by three Japanese suppliers (JSR, TOK,
Shin-Etsu, ~85% of volume), with the science resting on decades of
accumulated polymer know-how that has proven nearly impossible to
replicate elsewhere.

Two events show this is a real lever, not a trivia fact. In July 2019
Japan moved photoresists to individual export licensing against South
Korea — a trade-dispute shot that rattled Samsung's and SK Hynix's
fabs and remains the cleanest precedent of a materials chokepoint
being exercised between allies. And in 2024 Japan's government-backed
JIC fund bought JSR outright and delisted it; JSR is meanwhile
embedding production next to TSMC (a Yunlin County, Taiwan plant
co-developing resists with TSMC, online ~2028) — both moves treating
resist chemistry as sovereign strategic infrastructure.

Selecting this constraint highlights the materials path into Fab 18
and everything downstream of patterned wafers.

**Reviewer notes:** (1) Market-share figures are trade-press estimates
(Tom's Hardware 2026; consistent with 2019-era reporting of ~90% for
the top three) — no audited share data exists; treat precision
accordingly. (2) Severity `medium`: concentration is extreme but no
current supply shortage is reported; the binding scenario is
geopolitical disruption, same logic as Spruce Pine. (3) Shin-Etsu
appears here and implicitly in the wafer story (it is also the #1
silicon wafer maker) — a future Shin-Etsu node could serve both.
