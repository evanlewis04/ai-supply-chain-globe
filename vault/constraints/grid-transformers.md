---
id: grid-transformers
name: Grid equipment lead times (large power transformers)
category: capacity
description: >
  Datacenter buildouts are increasingly gated not by chips but by the
  electrical equipment that connects them to the grid. Lead times for
  large power transformers have stretched from the pre-2020 norm of
  under a year to 128+ weeks on average — with worst cases of four to
  five years — and close to half of planned US datacenter builds in
  2026 are expected to slip or be canceled waiting on transformers,
  switchgear, and breakers. Manufacturing capacity is expanding
  (~$1.8B of announced North American investment), but new plants
  don't come online until 2027-2028.
metrics:
  - value: 128
    unit: weeks_avg_lead_time_power_transformer
    as_of: 2025-Q2
    note: "Wood Mackenzie Q2 2025 survey via POWER Magazine; generator step-up units average 144 weeks, worst cases ~4 years"
  - value: 119
    unit: pct_demand_growth_power_transformers_since_2019
    as_of: 2025
    note: "Wood Mackenzie: US power transformer demand up 119% vs 2019; GSU demand up 274%"
severity: high
tags: [transformers, grid, datacenter-buildout, lead-times]
sources:
  - url: https://www.powermag.com/transformers-in-2026-shortage-scramble-or-self-inflicted-crisis/
    title: "Transformers in 2026: Shortage, Scramble, or Self-Inflicted Crisis? (POWER Magazine)"
    date: 2026-01-02
    quote: "Power transformer lead times averaging 128 weeks; generator step-up transformer lead times 144 weeks."
    supports: lead-time and demand-growth metrics (Wood Mackenzie Q2 2025 survey); ~$1.8B announced manufacturing expansion coming online 2027-2028
  - url: https://dig.watch/updates/power-hardware-shortages-are-delaying-ai-data-centre-expansion-despite-record-investment
    title: "Power hardware shortages are delaying AI data centre expansion (Digital Watch, citing Bloomberg)"
    date: 2026-04-06
    quote: "Close to half of the planned US data-centre builds this year are expected to be delayed or cancelled."
    supports: constraint currently binding on datacenter buildouts; lead times stretching to five years
  - url: https://www.hitachienergy.com/us/en/news-and-events/press-releases/2025/09/hitachi-announces-historic-1-billion-usd-manufacturing-investment-to-power-america-s-energy-future-through-production-of-critical-grid-infrastructure
    title: "Hitachi announces historic $1 billion USD manufacturing investment (Hitachi Energy press release)"
    date: 2025-09-04
    supports: supply response — $457M new large-power-transformer factory in Virginia driven by AI datacenter demand
---

# Grid equipment lead times (large power transformers)

The bottleneck at the bottom of the stack. A GPU cluster is useless
until a utility can energize it, and the long pole in energization is
the large power transformer: a bespoke, hundred-ton machine wound from
grain-oriented electrical steel, mostly imported, ordered years in
advance. Wood Mackenzie's Q2 2025 survey put average lead times at 128
weeks (144 for generator step-up units), versus under a year before
2020; demand is up 119% since 2019. By spring 2026, Bloomberg-reported
estimates had close to half of planned US datacenter builds slipping
or dying while they wait for transformers, switchgear, and breakers.

The supply response is real but slow: Hitachi Energy alone committed
$1B to US grid-equipment manufacturing (including a $457M Virginia
transformer plant aimed explicitly at AI datacenter demand), part of
~$1.8B in announced North American expansions — none of which produces
a transformer before 2027-2028.

Selecting this constraint highlights the energy-side path: transformer
supply into MidAmerican's Iowa grid, grid power into the Azure West Des
Moines campus, and everything downstream of the compute that campus
hosts.

**Reviewer notes:** (1) Lead-time figures are Wood Mackenzie survey
data via trade press, not manufacturer disclosures — same standing as
the TrendForce CoWoS numbers. (2) The "close to half of builds
delayed" claim originates in Bloomberg reporting; cited here through a
public secondary (Digital Watch) because Bloomberg is paywalled. If
that feels too indirect, drop the claim to the body only. (3) Turbines
(GE Vernova sold out through 2028) are a related but separate story,
deliberately left out of this constraint's metrics — could become a
second energy constraint later.
