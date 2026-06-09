# Sourcing Standard

Every claim in this vault must trace to a real, public source. This is the
credibility contract with the target audience (semiconductor/AI-infrastructure
researchers and investors), and it is enforced mechanically: `build.py` fails
on any node, edge, or constraint without at least one source.

## Rules

1. **No invented numbers.** If a capacity, volume, or coordinate has no
   defensible public source, the field is `null` with a note explaining why.
   An honest unknown beats a plausible guess.
2. **No guessed coordinates.** `location.lat/lon` must trace to a source
   (company address, government filing, mapped facility). Declare honesty via
   `location.precision`: `site` (exact facility), `city` (city centroid), or
   `region` (regional centroid).
3. **Quote the evidence.** Each source entry should carry the specific
   sentence(s) supporting the claim in `quote`, and name what it backs in
   `supports`.
4. **Date everything.** Sources carry publication dates; quantitative values
   carry `as_of` stamps. This is what makes the future time dimension possible.
5. **Acceptable sources:** company IR pages and press releases, SEC/EDGAR and
   equivalent filings, government announcements (BIS, CHIPS Act, EU),
   earnings call transcripts, reputable trade press (Reuters, Bloomberg,
   Nikkei Asia, Tom's Hardware), arXiv for model releases.
6. **Not acceptable:** paywalled content scraping (including SemiAnalysis),
   anonymous forum posts, LLM output as a source, Wikipedia as a *sole*
   source (fine as a pointer to primary sources).
7. **Proposals before canon.** New or edited entries land in `vault/_pending/`
   for human review. Nothing enters `vault/nodes|edges|constraints/` without
   explicit approval by the project owner.

## Review checklist (for the human approving a proposal)

- [ ] Does every quantitative field trace to a quoted source?
- [ ] Are the coordinates real and the `precision` value honest?
- [ ] Is the `as_of` date correct (data vintage, not publication date)?
- [ ] Does the body text say anything the sources don't support?
- [ ] Is this node/edge actually on the v1 slice? (If not: reject — narrow-deep.)
