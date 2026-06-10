---
id: jsr-to-tsmc-fab-18
from: jsr-yokkaichi
to: tsmc-fab-18
flow_type: materials
volume:
  value: null
  unit: null
  as_of: 2026-06
lead_time_weeks: null
constraint_level: high
substitutability: low
constraints: [euv-photoresist]
notes: >
  EUV photoresists from Japan into TSMC's leading-edge patterning.
  JSR is building its first Taiwan plant (Yunlin County, online ~2028)
  explicitly to co-develop advanced resists with TSMC and shorten the
  Japan-Taiwan development loop — the clearest public evidence of the
  supply relationship. Substitutability low: the EUV-qualified resist
  suppliers are JSR, TOK and Shin-Etsu (~85% of volume, all Japanese);
  qualifying a new resist on a production node takes years. Volume
  null: resist purchase quantities are not public.
sources:
  - url: https://www.tomshardware.com/tech-industry/jsr-builds-first-taiwan-photoresist-plant-as-japanese-materials-makers-race-to-embed-next-to-tsmc
    title: "Japanese chemical giant JSR expands to Taiwan for EUV photoresist production near TSMC (Tom's Hardware)"
    date: 2026-05-13
    quote: "The plant, located in Yunlin County, is expected to come online as early as 2028 and will co-develop advanced photoresists with TSMC."
    supports: relationship (JSR supplying/co-developing EUV photoresists with TSMC)
  - url: https://www.jsr.co.jp/jsr_e/news/2024/20240830.html
    title: "JSR Expands Global Development and Production Functions for Leading-Edge Photoresists (JSR press release)"
    date: 2024-08-30
    supports: flow (leading-edge photoresist production at Yokkaichi for global customers)
---

# jsr-yokkaichi → tsmc-fab-18

The chemistry leg of the EUV triangle: machines from Veldhoven, optics
from Oberkochen, and the resist that actually records the pattern from
Yokkaichi. TSMC considers the loop important enough that JSR is
putting a plant next door in Yunlin — chip-making's equivalent of a
just-in-time supplier moving onto the customer's campus.

**Reviewer notes:** TSMC does not publish its resist vendor list; the
relationship is evidenced by the announced co-development plant
(Tom's Hardware 2026) rather than a named supply contract. The
Fab 18 endpoint is the modeling choice (it is the leading-edge EUV
fab on this graph); resists flow to TSMC's EUV fabs generally.
