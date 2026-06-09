# AI Supply Chain Globe — v1 Implementation Plan

> Drafted 2026-06-09, after resolving the four blocking questions. Status: **awaiting approval — no code or vault structure exists yet.**

## Decisions That Anchor This Plan

| Question | Answer |
|---|---|
| v1 deliverable | **GitHub repo + screenshots.** Polished README with captured visuals/GIFs. No hosting, no deployment burden. |
| Scope shape | **Narrow-deep.** One end-to-end slice, fully modeled with real edge weights, constraints, and sources. |
| The 30-second aha | **Seeing the full path the AI economy takes — with CoWoS as v1's featured bottleneck.** The long-term aha is constraint-agnostic (bottlenecks shift: HBM, substrates, power), and the system stays data-driven so new constraints are a data task, not a code change. But v1 ships **one** deeply-modeled constraint — `cowos-capacity` — and its downstream traversal is the headline demo. More constraints come after the first iteration is complete. |
| Division of labor | **Claude does the technical lifting** (frontend, build pipeline, schema tooling). **You own the research and content** — every node and edge is proposed by Claude or sourced by you, and approved by you before it enters the vault. Frontend must look good and be interactive. |

---

## Amendments (2026-06-09, post-approval)

**Working model change.** Claude owns all technical decisions (stack, architecture, data plumbing, when to merge well-verified factual entries into the vault) and proceeds without waiting for sign-off. The project owner steers features and scope, does the domain research he wants to go deep on, and can veto or edit anything after the fact. `_pending/` remains the channel for entries with contested or analytically uncertain values (capacities, volumes, constraint judgments); straightforward, well-sourced factual entries may be merged directly. Every vault file keeps its "Reviewer notes" so the audit trail survives.

**Finance overlay (new v1 feature).** Public-company nodes carry an optional `ticker` field (`symbol` + `exchange`). `scripts/fetch_prices.py` pulls 2 years of weekly adjusted closes per ticker (Yahoo Finance via yfinance) into `frontend/public/prices.json`, which is committed so the repo renders offline. The UI shows ticker + 2-year performance on node hover and a sparkline with last close and provenance in the side panel. Market data is display-layer data, not vault content: it is fetched mechanically, never hand-edited, and is exempt from the per-claim sourcing standard (its provenance lives in `prices.json` meta). Private companies (e.g. OpenAI) simply have no ticker. Post-v1 candidates: align the price window with the time slider, event markers on price series.

---

## 1. Exact v1 Scope

### The slice

One end-to-end path through all five layers, chosen because it's the most load-bearing path in the entire AI economy and the one the target audience knows cold:

```
Energy (Taiwan grid/water) ─┐
                            ▼
ASML Veldhoven ──EUV──▶ TSMC Fab 18 (Tainan) ──wafers──▶ TSMC CoWoS packaging
                                                              ▲         │
                              SK Hynix (HBM) ──memory─────────┘         │
                              Ibiden (ABF substrate) ──substrate────────┘
                                                                        ▼
                                              packaged modules ──▶ Nvidia (design/allocation)
                                                                        │
Energy (US grid region) ─┐                                              ▼
                         └─▶ Azure data center ◀──GPUs/servers── server ODM
                                  │
                                  ▼
                            OpenAI training cluster ──▶ GPT model artifact
                                  │
                                  ▼
                              ChatGPT / API
```

### Candidate node list (~30 nodes — every one proposed individually and approved by you before it's written)

This is a *candidate* list. During Milestone 2 each node gets proposed with its sources, and you approve, edit, or reject it. Nothing below is final.

- **Energy (4–5):** Taipower grid region (Taiwan), Tainan Science Park water supply (or as constraint-only), the grid region serving the chosen Azure campus, one named power plant feeding it.
- **Chips (10–12):** ASML Veldhoven (equipment), Zeiss SMT Oberkochen (EUV optics — optional depth), TSMC Fab 18 Tainan (N5/N3/N4 logic), TSMC advanced packaging site(s) for CoWoS (e.g., Longtan/Zhunan AP), SK Hynix Icheon (HBM), Ibiden Ogaki (ABF substrate — directly serves your "bottlenecks shift" point), Nvidia Santa Clara (fabless designer), optionally TSMC Fab 21 Arizona (status: ramping — gives the map a non-Taiwan data point and future time-dimension hook).
- **Infrastructure (4–5):** One specific Azure campus tied to OpenAI training (researched and sourced, not guessed), one server ODM/assembly node (Foxconn or Quanta site), optionally a second data center for contrast.
- **Models (3):** OpenAI (lab, SF), one training cluster (sited at the Azure campus), one model artifact (e.g., GPT-4-class model as a node with training-compute metadata).
- **Applications (2):** ChatGPT (consumer), OpenAI API (enterprise/deployment).
- **Constraints (1 in v1):** `cowos-capacity`, deeply modeled — capacity figures with `as_of` dates, the nodes it gates, and every downstream edge. Deferred to post-v1 (data-only additions, no code changes): `hbm-supply`, `abf-substrate-capacity`, `euv-export-controls`, `water-tainan`, `power-taiwan`, `power-us-grid`, `n3-allocation`. Note: SK Hynix (HBM) and Ibiden (substrate) remain as *nodes* in v1 — they physically feed the packaging step — but their constraint entities wait.
- **Edges (~30–40):** Typed and weighted wherever a defensible public number exists (wafer starts, HBM stack counts, MW, dollars). Where no public number exists, the edge carries `volume: null` with a `notes` field explaining why — **an honest "unknown" beats an invented number** for this audience.

### v1 features

1. **Interactive 3D globe** — five layer colors, nodes at real (sourced) coordinates, animated directional arcs typed by flow.
2. **Click-to-detail side panel** — node metadata, capacity with `as_of` date, status, and **inline source citations with URLs** (the credibility signal this audience demands).
3. **Constraint highlighting (the killer demo)** — selecting `cowos-capacity` lights up every downstream node and edge via graph traversal. The UI renders whatever constraints exist in the data, so v1 ships with one (CoWoS) and future bottlenecks (HBM, substrate, power) are added as data, not code.
4. **Layer toggles** — show/hide each of the five layers.
5. **Edge encoding** — thickness = volume, color = flow type, red emphasis = high-constraint + low-substitutability.
6. **Vault → graph build pipeline** — `build.py` parses the Obsidian vault, validates against the schema (broken refs, missing sources, missing coordinates fail the build), emits `graph.json`.
7. **README as the deliverable surface** — architecture explanation, screenshots/GIFs of the constraint traversal, data methodology and sourcing standards section.
8. **Finance overlay** — ticker + 2-year stock performance at each public-company node (hover badge + side-panel sparkline), fed by `scripts/fetch_prices.py`. See Amendments.

---

## 2. Tech Stack

| Piece | Choice | Why |
|---|---|---|
| Globe rendering | **globe.gl** (`react-globe.gl`) — Three.js/WebGL under the hood | Best visual-quality-per-effort for exactly this use case: built-in animated arcs, points, labels, ripple/pulse effects, and smooth camera controls. deck.gl's `GlobeView` is still experimental with limited layer support; raw Three.js means hand-rolling everything; Cesium is heavyweight and tuned for geospatial imagery, not abstract graph aesthetics. globe.gl demos are the "screenshot-worthy" look we want, nearly out of the box, with full escape hatches into Three.js when we need custom visuals (constraint glow, flow pulses). |
| Frontend app | **Vite + React + TypeScript** | React for the side panel/controls (already assumed in the context doc). TypeScript so `graph.json`'s schema is enforced at the UI boundary — a typed `Node`/`Edge`/`Constraint` model end to end. Vite for zero-config fast builds; output is a static site, which fits the no-hosting deliverable (and makes optional GitHub Pages a 5-minute add later). |
| State/graph logic | Plain TypeScript + a small graph utility (BFS/DFS for downstream traversal) | The graph is ~30 nodes; no graph library needed. Traversal for constraint highlighting is ~30 lines we control and can test. |
| Authoring | **Obsidian-compatible vault** — markdown + YAML frontmatter, one file per node/edge/constraint | As decided: Obsidian for human authoring UX, but nothing Obsidian-specific is load-bearing — it's plain markdown + frontmatter that any editor handles. |
| Build pipeline | **Python 3** — `python-frontmatter` + `jsonschema` | Matches the context doc's sketch and the future agent pipeline (`fetch.py`/`propose.py` were always Python). Validation is the point: the build *fails* on a node with no source, no coordinates, or an edge pointing at a nonexistent node. That's the "no hallucinated data" constraint enforced mechanically. |
| Schema | JSON Schema files for node/edge/constraint, versioned in-repo | Single source of truth used by `build.py` validation, mirrored by the TypeScript types, and pasted into the future `propose.py` prompt. |
| CI | GitHub Actions: run `build.py --validate` on every push | Bad data can't merge. Cheap, and demonstrates pipeline rigor to anyone reading the repo. |

**Not in the stack (v1):** no database (graph.json is the artifact), no backend server, no Mapbox token (globe.gl uses free texture imagery), no paid services at all.

---

## 3. Milestones

Estimates assume part-time effort. ~6–7 weeks total, leaving buffer in an 8-week window. Research milestones are paced by *your* availability — they're the long pole, and that's by design.

### M0 — Skeleton & schema (Week 1)
- Repo init, folder structure (below), README stub.
- JSON Schemas for node/edge/constraint; Obsidian templates with the frontmatter spec.
- `build.py` v0: parse vault → validate → emit `graph.json`.
- CI validation workflow.
- **Exit:** 2–3 placeholder-quality (but still real, sourced) nodes flow from vault to a valid `graph.json`.

### M1 — Walking skeleton globe (Weeks 1–2)
- Vite/React/TS app, globe rendering nodes + arcs from `graph.json`, layer colors, click-to-detail panel with sources.
- **Exit:** a 5-node mini-path (ASML → TSMC → Nvidia → Azure → ChatGPT) is visible and clickable end to end. *Proving the full pipeline early de-risks everything after.*

### M2 — The data (Weeks 2–4, research-heavy, your milestone)
- Node-by-node: Claude proposes (with sources and quoted evidence) into `vault/_pending/`, **you review, edit, approve**; approved files move into the vault proper.
- Target: the full ~30-node slice, ~30–40 edges, the `cowos-capacity` constraint fully modeled, every claim sourced.
- Sourcing standard written into `vault/SOURCING.md`: public IR, government filings, earnings transcripts, reputable trade press; no paywalled scraping; `volume: null` over invented numbers.
- **Exit:** `build.py` passes with zero validation warnings on the full slice.

### M3 — The analytical layer (Weeks 4–5)
- Constraint entities in the UI; downstream-traversal highlighting; edge thickness/color/emphasis encoding; layer toggles; flow animations.
- **Exit:** clicking `cowos-capacity` lights up the downstream graph — the screenshot that headlines the README.

### M4 — Polish & package (Weeks 5–6)
- Visual tuning (this is where "looks good" gets its dedicated pass): camera intro animation, default view framing the whole path, dark theme, legible labels.
- Screenshots + GIF capture; README written as the deliverable: concept, architecture, data methodology, sourcing standards, what's deliberately out of scope.
- **Exit:** a stranger landing on the repo understands the project in 60 seconds and can run it locally with two commands.

### Buffer (Weeks 6–8)
Data review depth, any second pass on visuals, optional extras *only if everything above is done* (e.g., GitHub Pages deploy — trivial since output is static).

---

## 4. Folder Structure

```
ai-supply-chain-globe/
├── vault/                        # Obsidian vault — canonical data
│   ├── nodes/
│   │   ├── energy/
│   │   ├── chips/
│   │   ├── infrastructure/
│   │   ├── models/
│   │   └── applications/
│   ├── edges/
│   ├── constraints/
│   ├── _pending/                 # Claude's proposals land here; you approve/reject
│   ├── _templates/               # Obsidian templates encoding the frontmatter spec
│   └── SOURCING.md               # the sourcing standard, in writing
├── schema/
│   ├── node.schema.json
│   ├── edge.schema.json
│   └── constraint.schema.json
├── scripts/
│   └── build.py                  # vault → validate → graph.json (fetch.py / propose.py are v2)
├── frontend/
│   ├── src/
│   │   ├── components/           # Globe, SidePanel, ConstraintList, LayerToggles, Legend
│   │   ├── graph/                # types.ts (mirrors schemas), traversal.ts
│   │   └── App.tsx
│   ├── public/
│   │   └── graph.json            # build artifact (committed, so the repo runs standalone)
│   └── ...vite config etc.
├── docs/
│   └── screenshots/              # README assets
├── .github/workflows/
│   └── validate.yml              # build.py --validate on push
├── README.md
└── implementation-plan.md        # this file
```

---

## 5. Build Order

1. **First — the pipeline spine (M0+M1):** schema → templates → `build.py` → minimal globe with a 5-node path. Everything flows end to end before any depth exists. If the rendering stack has a surprise, we find out in week 1, not week 5.
2. **Second — the data (M2):** the slice gets populated through the propose/approve loop. This runs longest and is deliberately the centerpiece — it's where you go deep in the material. Frontend work pauses except for bug fixes, so data problems surface against a working renderer.
3. **Third — the analysis & the look (M3+M4):** constraint traversal, edge encoding, visual polish, README packaging. Built last because it depends on real data existing — constraint highlighting demos badly against placeholders.

---

## 6. Explicit Non-Goals for v1

Deliberately **not** doing, even if tempting:

1. **No hosted deployment.** Repo + screenshots is the deliverable. (Static output keeps GitHub Pages as a later 5-minute option, but it is not in scope.)
2. **No time slider / historical scrubbing.** Pass 3 in the original phasing; v1 covers passes 1–2. The data model keeps `as_of` stamps on every value so v2 needs no migration — but no UI for it now.
3. **No agent update pipeline.** No `fetch.py`, no `propose.py`, no scheduled scans, no webhooks. The human-in-the-loop proposal workflow happens interactively in Claude Code sessions; automation is v2.
4. **No breadth.** No second slice, no "while we're at it" nodes (no Intel, no Google/TPU path, no AMD, no Chinese supply chain). One slice, fully sourced. Any node not on the slice's path gets rejected in review — including by Claude pushing back if scope creep originates with you.
4a. **No constraints beyond CoWoS.** `cowos-capacity` is the only constraint entity in v1. HBM, substrate, export-control, water, and power constraints are post-v1 data additions.
5. **No autonomous content generation.** Claude never writes directly into `vault/nodes|edges|constraints/` — proposals only, into `_pending/`, with sources and quoted evidence. You approve every merge.
6. **No invented numbers.** No estimated lat/longs, no inferred capacities, no "probably about" edge weights. Unsourced fields ship as `null` with a note.
7. **No live events overlay, no `events.json`.** v2+.
8. **No mobile optimization.** Desktop browser only.
9. **No Obsidian plugins or Obsidian-specific machinery.** The vault stays plain markdown + frontmatter; Obsidian remains optional tooling, not a dependency.
10. **No paywalled scraping** (SemiAnalysis included). Public IR, government, transcripts, reputable press only.

---

## Open Items (non-blocking, resolve during build)

- Repo public from day one vs. flipped public at M4 (affects nothing technically).
- Citation UX detail: side-panel footnotes per claim vs. a sources section per node — decide at M3 with real data in hand.
- Which Azure campus to use for the training-cluster node — a research question for M2, answered with sources or modeled at lower geographic precision (region-level) if site-level sourcing is weak.
