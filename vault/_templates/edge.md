---
id: from-id-to-to-id
from: kebab-case-id      # must exist in vault/nodes/
to: kebab-case-id        # must exist in vault/nodes/
flow_type: wafers        # wafers | chips | packaged_modules | memory | substrates | equipment | servers | power | water | bandwidth | compute | tokens | dollars | model_weights
volume:
  value: null            # null = no defensible public number. Explain in notes.
  unit: null
  as_of: 2026-Q2
lead_time_weeks: null
constraint_level: medium # low | medium | high
substitutability: medium # low | medium | high
constraints: []          # constraint ids gating this flow
notes: ""
sources:
  - url: https://example.com
    title: Source title
    date: 2026-01
    quote: "The sentence establishing that this flow exists."
    supports: relationship
---

# from-id → to-id

Free-form notes on this relationship: allocation dynamics, contract structure,
history, contested capacity, etc.
