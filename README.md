# AI Supply Chain Globe

An interactive 3D globe that maps the global AI supply chain as a directed,
layered graph — from power grids and fabs through advanced packaging, data
centers, model labs, and end-user applications. Every node sits at its real
geographic location; every edge is typed and directional; **every claim
traces to a public, dated source**.

![Default view — the v1 slice across the Pacific](docs/screenshots/globe-default.png)

## The 30-second demo

Select the **CoWoS advanced packaging capacity** constraint. Everything
downstream of the bottleneck lights up — packaged accelerators to Nvidia,
GPUs into Azure, training compute to OpenAI, ChatGPT itself — and everything
else dims. The binding constraint on the entire AI buildout, visible as a
graph property, not a slide bullet.

![CoWoS constraint selected — downstream highlight](docs/screenshots/constraint-cowos.png)

Constraints are first-class, data-driven entities. The flagship is CoWoS
(TrendForce capacity timeline: ~37.5k wafers/month in 2024 → 75k in 2025 →
~125k projected end-2026), joined by four chokepoints most coverage misses:

- **Spruce Pine ultra-pure quartz** — one NC town supplies the quartz in
  70-90% of the world's polysilicon crucibles; Hurricane Helene shut it
  for two weeks in 2024.
- **Grid equipment lead times** — 128-week average waits for large power
  transformers are now delaying close to half of planned US datacenter
  builds.
- **EUV optics & light source** — Zeiss SMT and TRUMPF single-source the
  mirrors and drive laser inside every ASML EUV machine.
- **EUV photoresist** — three Japanese firms make ~85% of the chemistry
  that records every EUV pattern; Japan has already weaponized it once
  (2019) and nationalized JSR (2024).

## The five-layer cake

| Layer | Nodes |
|---|---|
| **Energy** | Taipower island grid, MidAmerican Iowa (wind → data centers), Hitachi Energy South Boston (power transformers) |
| **Chips** | Spruce Pine quartz district, GlobalWafers Hsinchu (300mm wafers), Zeiss SMT Oberkochen (EUV optics), TRUMPF Ditzingen (EUV lasers), JSR Yokkaichi (EUV resists), ASML Veldhoven (EUV), TSMC Fab 18 (N5/N3), TSMC AP6 Zhunan (CoWoS), SK hynix Icheon (HBM), Ibiden Ono (ABF substrates), Nvidia |
| **Infrastructure** | Microsoft Azure West Des Moines — the campus built exclusively to train GPT-4 |
| **Models** | OpenAI |
| **Applications** | ChatGPT |

The scope is deliberately **narrow-deep**: one end-to-end slice, fully
sourced, rather than hundreds of shallow nodes — with each chokepoint
adding only the nodes needed to tell its story.

## Ask the Globe (LLM-driven)

Type a question — *"why can't Nvidia just make more GPUs?"* — and Claude
answers it **by driving the visualization**: the model returns a structured
`{answer, node_ids, edge_ids, constraint_id}` response, every id is
validated against the real graph (a hallucinated node simply can't render),
and the relevant supply-chain path lights up using the same highlight
machinery as the constraint chips. Grounding comes free: the model can only
reference entities that exist in the vault, all of which are source-backed.

Bring your own Anthropic API key (entered once, stored only in your
browser's localStorage, sent only to `api.anthropic.com`). Default model is
Haiku 4.5 — with the graph context prompt-cached, a question costs about a
cent — with a Sonnet 4.6 toggle for harder questions.

## Finance overlay

Public-company nodes carry their ticker and 2-year stock performance —
hover for the badge, click for the sparkline. The supply chain's chokepoints
and the market's verdict on them, on the same map. As of June 2026 the
2-year tape reads like a bottleneck index: SK hynix +918%, Ibiden +482%,
TSMC +154%, ASML +75%, Nvidia +57%, Microsoft −7%.

![Node detail — TSMC AP6 with sources](docs/screenshots/node-detail.png)

## Architecture

```
vault/  (Obsidian-compatible markdown + YAML frontmatter — canonical data)
   │
   ▼  scripts/build.py        schema validation: unsourced claims FAIL the build
graph.json
   │                          scripts/fetch_prices.py → prices.json (yfinance)
   ▼  frontend/  (Vite + React + TypeScript + globe.gl)
interactive globe
```

- **Authoring** is plain markdown with structured frontmatter — pleasant in
  Obsidian, but nothing Obsidian-specific is load-bearing.
- **Validation is mechanical:** every node/edge/constraint needs at least
  one dated source; coordinates declare their precision (`site`/`city`/
  `region`); unknown values are `null`, never invented; dangling references
  and layer/type mismatches fail CI on every push.
- **AI-assisted, human-gated:** proposals land in `vault/_pending/` with
  quoted evidence; contested values go through review. Every file carries
  "Reviewer notes" flagging what to double-check.
- **Market data stays out of the vault** — mechanically fetched, provenance
  in `prices.json` meta, never hand-edited.

## Running locally

```sh
pip install -r scripts/requirements.txt
python scripts/build.py            # vault -> frontend/public/graph.json
python scripts/fetch_prices.py     # optional: refresh stock data (committed copy works offline)
cd frontend && npm install && npm run dev
```

Shareable demo states: `?constraint=cowos-capacity`, `?node=tsmc-fab-18`.

## Data methodology

See [`vault/SOURCING.md`](vault/SOURCING.md) for the sourcing standard and
[`schema/`](schema/) for the data model. Capacity figures carry `as_of`
stamps (the future time-slider needs no migration). Where no defensible
public number exists — per-customer CoWoS allocation, campus-level MW —
the field is `null` with a note explaining why. An honest unknown beats a
plausible guess.

One rendering note: nodes that share or nearly share coordinates (e.g.
OpenAI and ChatGPT, both anchored to San Francisco) are slightly displaced
on the globe for legibility and clickability — a standard cartographic
technique. True coordinates are untouched in the data and shown in the
side panel.

Globe textures: NASA-derived imagery via the
[three-globe](https://github.com/vasturiano/three-globe) example assets.
Stock data: Yahoo Finance via yfinance — display only, not investment advice.

## Roadmap

- **More constraints (data-only additions):** HBM supply, ABF substrate
  capacity, EUV export controls, Taiwan water/power, US interconnect queues,
  gas turbines.
- **Time dimension:** every value already carries `as_of`; a slider scrubs
  the buildout (Arizona fabs appearing, CoWoS tripling).
- **Update pipeline:** scheduled source monitoring drafting proposals into
  `_pending/` — always human-reviewed, never auto-merged.
