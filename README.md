# AI Supply Chain Globe

An interactive 3D globe that maps the global AI supply chain as a directed,
layered graph — from power plants and fabs through data centers, model labs,
and end-user applications. Every node sits at its real geographic location;
every edge is typed and weighted; every claim traces to a public source.

> **Status: early development.** The data pipeline is live; the first
> end-to-end slice (ASML → TSMC → CoWoS packaging → Nvidia → Azure →
> OpenAI → ChatGPT) is being populated under human review.

## The five-layer cake

| Layer | Examples |
|---|---|
| **Energy** | power plants, grid regions, water supply |
| **Chips** | fabs, advanced packaging, HBM, substrates, EUV equipment |
| **Infrastructure** | data centers, AI factories, server assembly |
| **Models** | labs, training clusters, model artifacts |
| **Applications** | chatbots, APIs, deployments |

Constraints — CoWoS capacity, export controls, grid limits — are first-class
entities: select one and everything downstream of it lights up.

## Architecture

```
vault/  (Obsidian-compatible markdown + YAML frontmatter — canonical data)
   │
   ▼  scripts/build.py  (schema validation: unsourced claims fail the build)
graph.json
   │
   ▼  frontend/  (Vite + React + TypeScript + globe.gl)
interactive globe
```

- **Authoring** happens in plain markdown with structured frontmatter
  (Obsidian-friendly, but nothing Obsidian-specific is load-bearing).
- **Validation** is mechanical: every node/edge/constraint must carry at
  least one dated source with a supporting quote; coordinates must declare
  their precision; unknown values are `null`, never invented.
  See [`vault/SOURCING.md`](vault/SOURCING.md).
- **AI-assisted updates are human-gated:** proposals land in
  `vault/_pending/` and nothing enters canonical data without review.

## Running locally

```sh
pip install -r scripts/requirements.txt
python scripts/build.py            # vault -> frontend/public/graph.json
cd frontend && npm install && npm run dev
```

## Data methodology

See [`vault/SOURCING.md`](vault/SOURCING.md) for the sourcing standard and
[`schema/`](schema/) for the data model. The build fails on any entry
missing sources, on dangling references, and on layer/type mismatches —
enforced in CI on every push.
