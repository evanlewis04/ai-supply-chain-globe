# AI Supply Chain Globe — project conventions

Interactive 3D globe of the AI supply chain. Vault (markdown + frontmatter)
→ `scripts/build.py` → `frontend/public/graph.json` → React/globe.gl app.

## Commands

```sh
python scripts/build.py                        # validate vault + emit graph.json
python scripts/build.py --validate --include-pending   # CI check (also validates _pending/)
python scripts/fetch_prices.py                 # refresh prices.json from tickers in vault
cd frontend && npm run build                   # tsc + vite build
cd frontend && npm run dev                     # dev server
```

## Non-negotiable data rules

- Every node/edge/constraint needs ≥1 dated source; the build fails otherwise.
- Never invent numbers or coordinates. Unknown → `null` + note. Coordinates
  declare `precision: site|city|region` honestly.
- `as_of` stamps on all quantitative values (future time slider depends on this).
- No paywalled scraping (SemiAnalysis included). Public IR, gov filings,
  transcripts, reputable trade press only. See `vault/SOURCING.md`.
- Prices (`prices.json`) are display data, fetched mechanically — never
  hand-edit, never store in vault.

## Working model

Claude owns technical decisions and merges well-verified factual entries
directly (keep a "Reviewer notes" section in each vault file as the audit
trail). Contested/analytical values go to `vault/_pending/` for the owner's
review. The owner (Evan) steers features and scope; push back on scope
creep — narrow-deep beats broad-shallow. One slice, five constraints
(cowos-capacity, spruce-pine-quartz, grid-transformers, euv-optics,
euv-photoresist); see `implementation-plan.md` § Amendments.

## Gotchas

- YAML parses bare dates/years as objects/ints; `build.py normalize()`
  converts them — don't force quoting in frontmatter.
- Edge filenames must equal their `id` (build-enforced), e.g.
  `vault/edges/tsmc-ap6-to-nvidia.md`.
- PowerShell: pass multi-line git commit messages via `git commit -F <file>`
  (here-strings with quotes break native arg passing on PS 5.1).
- Headless screenshots: Edge `--headless=new --user-data-dir=<temp>`
  against `npm run preview`; demo states via `?constraint=` / `?node=`.
- Frontend types in `frontend/src/types.ts` mirror `schema/*.schema.json` —
  keep them in sync when the schema changes.
