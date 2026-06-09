# AI Supply Chain Globe — Project Context

> A handoff document for picking this project up in Claude Code. Contains the concept, design decisions made so far, the data model, the update pipeline, and the open questions that still need answers before implementation begins.

---

## The Concept

An interactive 3D globe that visualizes the global AI supply chain as a directed, layered graph. Every meaningful node in the stack — from power plants and fabs through data centers, model labs, and end-user applications — is placed at its real geographic location and connected by typed, weighted edges showing what flows where.

The "five-layer cake" follows Nvidia's framing:

1. **Energy** — power generation, grid regions, substations
2. **Chips** — fabs, packaging facilities, memory fabs, equipment makers, fabless designers
3. **Infrastructure** — data centers, AI factories, networking
4. **Models** — training clusters, model artifacts, labs
5. **Applications** — chatbots, robotics, science, enterprise agents, etc.

Each layer has its own color. Flows are directional and animated. Constraints (CoWoS capacity, EUV export controls, ERCOT grid limits, etc.) are first-class entities that can be highlighted to show downstream impact.

## Audience and Goals

- **Primary audience:** firms doing serious semiconductor / AI infrastructure research and analysis (SemiAnalysis is the canonical example), plus investors / hedge funds operating in this space.
- **Use as a portfolio / resume project.** The goal is to demonstrate (a) deep understanding of the AI stack, (b) ability to model complex systems, and (c) practical engineering chops including agent-assisted data pipelines.
- **Depth beats polish.** This audience cares about whether you understand CoWoS-L vs CoWoS-S, HBM allocation dynamics, packaging bottlenecks, grid constraints — not whether the UI is gorgeous.

## What Makes This Different From Existing Maps

Most AI/semi supply chain visualizations are static slides or 2D diagrams. The value adds here are:

- **Geography + topology together.** Click TSMC Fab 18, traverse to every downstream node, while seeing it sit in Tainan.
- **Typed, weighted edges.** Wafers, packaged modules, power (MW), bandwidth, tokens/sec, dollars — each rendered differently.
- **Constraints as first-class entities.** "Show me everything downstream of CoWoS-L capacity" lights up half the model and application layers.
- **Time as a dimension.** Scrub from 2020 → present and watch Arizona fabs appear, CoWoS triple, Stargate sites light up.
- **The pull dynamic.** Application demand → model scale → infra buildout → chip supply → grid capacity. The interesting story runs backwards through the stack.

## Design Decisions Made So Far

### Five-layer taxonomy: locked
Using Nvidia's Energy → Chips → Infrastructure → Models → Applications. Defensible, well-known, and exactly the stack the target audience analyzes daily.

### Obsidian: authoring layer only, not the backend
Obsidian is great for human authoring (backlinks, free-form notes, graph view), but the frontend needs structured, queryable data. The split:

- **Author** in an Obsidian vault — one markdown file per node, structured frontmatter, edges referenced via wikilinks and/or separate edge files.
- **Build** a script that parses the vault and emits a single `graph.json` (or SQLite) for the frontend.
- **Render** from that structured artifact.

This preserves Obsidian's UX for thinking and writing while giving the frontend the typed schema it needs.

### Scope philosophy: narrow-deep over broad-shallow
A v1 that fully models one end-to-end slice ("ASML Veldhoven → TSMC Tainan → Nvidia HQ → Azure data center → OpenAI → ChatGPT") with real edge weights, constraints, and time data signals more competence than 200 nodes at low fidelity.

### Update pipeline: agent-assisted, human-in-the-loop
Never let an agent write directly to canonical data. Agent drops proposals into a `_pending/` folder or opens a PR; human reviews and merges. The user must stay deep enough in the material to discuss it in an interview.

---

## Data Model (Draft)

### Node

```yaml
id: tsmc-fab-18
name: TSMC Fab 18
layer: chips  # energy | chips | infrastructure | models | applications
type: fab     # see node types below
operator: TSMC
location:
  lat: 23.0
  lon: 120.2
  country: TW
  region: Tainan
capacity:
  value: 120000
  unit: wpm_12in
  as_of: 2025-Q4
status: operational  # planned | construction | operational | ramping | decommissioned
constraints: [water-tainan, power-taiwan, euv-tools]
tags: [leading-edge, n3, n2-planned]
sources:
  - url: https://...
    date: 2025-10-15
```

**Node types by layer:**

- **Energy:** `power_plant`, `substation`, `grid_region`, `gas_pipeline`
- **Chips:** `fab`, `packaging_facility`, `memory_fab`, `equipment_maker`, `designer` (fabless)
- **Infrastructure:** `data_center`, `ai_factory`, `network_hub`, `cooling_supplier`
- **Models:** `training_cluster`, `model_artifact`, `lab`
- **Applications:** `product`, `deployment`

### Edge

```yaml
id: tsmc18-to-nvidia-hq
from: tsmc-fab-18
to: nvidia-hq
flow_type: wafers  # wafers | chips | packaged_modules | power | bandwidth | tokens | dollars
volume:
  value: 50000
  unit: wafers_per_year
  as_of: 2025
lead_time_weeks: 16
constraint_level: high      # informational; flags known bottlenecks
substitutability: low       # how replaceable is this link
notes: "N3 wafers, allocation contested with Apple"
```

### Constraint (first-class entity)

Constraints are referenced by nodes and edges. Examples:

- `cowos-l-capacity`
- `hbm3e-supply`
- `euv-export-control`
- `power-ercot`
- `water-tainan`

Selecting a constraint highlights every downstream node and edge that depends on it. This is the killer demo.

### Time dimension

Every `value` field carries an `as_of` stamp. Historical snapshots are kept so a UI slider can scrub through time.

---

## Repository / Pipeline Sketch

```
project/
├── vault/                    # Obsidian vault — canonical data
│   ├── nodes/
│   │   ├── energy/
│   │   ├── chips/
│   │   ├── infrastructure/
│   │   ├── models/
│   │   └── applications/
│   ├── edges/
│   ├── constraints/
│   └── _pending/             # agent drops proposals here
├── sources/
│   └── sources.yaml          # RSS feeds, IR pages, gov sites to monitor
├── scripts/
│   ├── fetch.py              # pull new content from sources
│   ├── propose.py            # Claude API drafts node/edge updates
│   └── build.py              # vault → graph.json
├── frontend/                 # globe renderer
└── .github/workflows/
    └── daily-scan.yml        # scheduled agent run
```

### Update modes

1. **Manual curation.** User reads a SemiAnalysis post / earnings call / news, asks Claude Code to add or update nodes. Highest quality, slowest.
2. **Scheduled scraping.** Cron job pulls from a defined source list, Claude drafts proposed changes as a PR or `_pending/` files, user reviews and merges.
3. **Event-driven.** Webhooks on high-signal sources (SEC EDGAR RSS, specific GitHub repos for model releases).

### Source list to consider

- **RSS / news:** Reuters tech, Bloomberg tech, Tom's Hardware, AnandTech (archive), TechCrunch semi
- **Company IR:** TSMC, ASML, Nvidia, AMD, Intel, SK Hynix, Samsung, Micron
- **Government:** BIS export-control announcements, CHIPS Act funding, EU Chips Act, EU export controls
- **Earnings transcripts** (quarterly — perfect for scheduled jobs)
- **arXiv** for model releases
- **Specific accounts** on X via Nitter or paid API (Dylan Patel, Ian Cutress, etc.)

### The hard part is the prompt, not the scraper

`propose.py` needs to turn raw news into structured proposals. The prompt should:

- Always include the current schema and a few example nodes as context
- Output structured proposals (new node / edit existing / new edge) with confidence levels
- Flag ambiguity rather than hallucinate (no guessing at lat/lon)
- Always cite the source URL and quote the specific sentence

---

## Frontend Notes (Tentative)

- **Likely stack:** deck.gl on a globe projection (built for typed layers, arcs, GeoJSON). Three.js if more custom 3D is needed. Cesium is another option but heavier.
- **Side panel:** React, shows node details on click, plus traversal controls.
- **Edge rendering:** thickness = volume, color = flow type, pulse animation = active flow, red glow = high-constraint + low-substitutability.
- **Time slider** for the historical scrub.
- **Live events overlay** (v2+): a separate `events.json` pins time-stamped markers to relevant nodes.

---

## Suggested Build Order

**Pass 1 — Weekend prototype.** ~30 hand-curated nodes covering one end-to-end path. Static globe, click-to-detail. No update pipeline yet. Already better than 95% of existing AI supply chain visualizations.

**Pass 2 — Analytical layer.** Add the constraint entity, typed edges with weights, the "downstream of X" highlight. This is where it starts to feel like analysis instead of a map.

**Pass 3 — Time + live updates.** Time scrubbing, then the agent-assisted update pipeline. This is the "wow" pass that makes a recruiter screenshot it.

---

## Open Questions (must answer before writing the implementation plan)

These are blocking. The first four especially:

1. **What's the v1 deliverable in ~6–8 weeks?** Working demo URL? GitHub repo with screenshots? Video walkthrough? This anchors scope.

2. **Narrow-deep or broad-shallow for v1?** Recommendation is narrow-deep, but confirm.

3. **What's the single "aha" moment in the first 30 seconds?** Every good demo has one. Candidates: "CoWoS is the bottleneck," "look how much routes through Taiwan," "power constraints are reshaping where models train." This drives the default view of the globe.

4. **Technical comfort zone?** JS/frontend strength vs. Python/data strength determines whether we lean deck.gl/Three.js, a Python-rendered approach, or something else.

## Open Questions (resolvable as we go)

5. How much time per week is realistic?
6. Open-source the repo, or private with a demo link?
7. Willing to pay for anything (domain, Mapbox token, Claude API for the update pipeline)?
8. How to handle citations / sources? Per-node footnotes, bibliography page, tooltips? Credibility signal for the target audience.

## Open Questions (worth thinking about but not blocking)

9. Is Obsidian load-bearing emotionally, or is it just a familiar tool? Plain markdown + frontmatter in any editor would also work.
10. Honest assessment of current domain knowledge? (Affects whether the project doubles as a learning vehicle.)
11. Companies beyond SemiAnalysis being targeted? (Anthropic infra, hedge funds, etc. — slight shape changes.)

---

## Things to Avoid

- **Letting an agent populate everything autonomously.** The whole point is that the author knows this material deeply enough to defend it in an interview. Agent = grunt work and candidate surfacing, not analytical thinking.
- **Trying to map everything in v1.** A narrow, deep slice beats a wide, shallow one.
- **Fighting Obsidian's free-form nature with too much schema in frontmatter.** If the structure gets unwieldy, move to plain markdown + YAML files in a regular repo. Obsidian isn't load-bearing.
- **Scraping paywalled sources** (e.g., SemiAnalysis itself). Use public IR pages, government announcements, earnings transcripts, news.

---

## Conversation Summary (what's been discussed)

Concept evolved from "Obsidian graph on a 3D globe with 5 colors for the 5-layer cake" to a more structured plan with these key shifts:

- Confirmed the Nvidia 5-layer framing (Energy / Chips / Infrastructure / Models / Applications) as the spine.
- Audience clarified as research/investor-facing (SemiAnalysis-style), which prioritizes depth and sourcing over polish.
- Obsidian demoted from "backend" to "authoring layer" — structured artifacts feed the frontend.
- Data model drafted with typed nodes, typed/weighted edges, and constraints as first-class entities.
- Update pipeline sketched: manual + scheduled agent proposals + optional event-driven, always with human review.
- Build phased into three passes (prototype → analytical layer → time + live updates).
- Critical warning surfaced about not letting the agent populate everything — the author must stay deep in the material.

Next step after open questions are resolved: write the actual implementation plan, starting with the Obsidian template (frontmatter spec + folder structure) and the `propose.py` prompt.
