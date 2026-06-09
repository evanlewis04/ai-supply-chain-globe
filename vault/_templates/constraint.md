---
id: kebab-case-id
name: Human Readable Name
category: capacity       # capacity | regulatory | resource | geographic
description: >
  One-paragraph plain-language explanation of the bottleneck and why it
  matters. Shown in the UI when the constraint is selected.
metrics:                 # time-stamped estimates; multiple as_of entries build history
  - value: null
    unit: null
    as_of: 2026-Q2
    note: ""
severity: high           # low | medium | high — current judgment
tags: []
sources:
  - url: https://example.com
    title: Source title
    date: 2026-01
    quote: "The sentence supporting the metric or characterization."
    supports: metrics
---

# Human Readable Name

Deep analysis of the constraint: who is exposed, what relieves it, what the
capacity expansion timeline looks like, how it has shifted over time.
