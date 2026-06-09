---
id: kebab-case-id
name: Human Readable Name
layer: chips           # energy | chips | infrastructure | models | applications
type: fab              # must match layer — see schema/node.schema.json
operator: Company Name
location:
  lat: 0.0             # never guessed — must trace to a source
  lon: 0.0
  country: XX          # ISO 3166-1 alpha-2
  region: City/Region
  precision: site      # site | city | region — be honest about coordinate precision
capacity:
  value: null          # null = publicly unknown. NEVER invent a number.
  unit: null           # wpm_12in | MW | wafers_per_year | ...
  as_of: 2026-Q2
status: operational    # planned | construction | operational | ramping | decommissioned
constraints: []        # constraint ids this node is gated by, e.g. [cowos-capacity]
tags: []
sources:
  - url: https://example.com
    title: Source title
    date: 2026-01
    quote: "The specific sentence supporting the claim."
    supports: location, capacity
---

# Human Readable Name

Free-form analysis goes here. This body is included in `graph.json` and shown
in the side panel — write it for the SemiAnalysis-style reader.

Wikilinks to related vault files are fine for Obsidian's graph view
(e.g. [[tsmc-fab-18]]) but carry no meaning in the build; edges live in
`vault/edges/`.
