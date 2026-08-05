# 60-Second Demo Script

A pre-written click-path for recording a walkthrough of the AI Supply Chain Globe.
Follow it top to bottom — one or two takes, no fumbling. Timings are a guide, not
a stopwatch.

**Before you hit record**
- `cd frontend && npm run build && npm run preview` (or `npm run dev`), open the local URL.
- The app opens on the full globe, no selection. That's your starting frame.
- **Reliable state loading:** every beat below has a `?…` URL you can paste to jump
  straight to that state — use these if a live click ever misbehaves on camera.
  You can also just click through; the URLs are a safety net.

---

## Beat 1 — What this is (0:00–0:08)
**Screen:** default globe, slowly rotating. Nodes across fabs, materials, packaging,
cloud, models.

**Say:**
> "This is a live map of the AI supply chain — every node, edge, and number traces
> to a dated public source. It answers one question: if one link breaks, what
> downstream of it is exposed?"

**Do:** one slow drag to rotate the globe so it reads as 3D and real.

---

## Beat 2 — Select the CoWoS constraint → downstream lights up (0:08–0:22)
**Screen:** left rail, **Constraints**. Click the chip **"CoWoS advanced packaging
capacity"** (the high-severity one).
*Deep link: `?constraint=cowos-capacity`*

**Say:**
> "CoWoS is TSMC's advanced-packaging step — the real bottleneck on AI accelerators.
> Every H100 passes through it. Select it, and the globe highlights *everything*
> downstream: packaged modules to Nvidia, GPUs into Azure, OpenAI's training compute,
> ChatGPT itself."

**Do:** let the highlight cascade settle. Point at the card line:
*"Highlighted: everything downstream of this bottleneck."*

---

## Beat 3 — Point-in-time slider, no lookahead (0:22–0:45) — *the marquee beat*
**Screen:** the **Point in time** slider under the constraint card. It opens on the
latest date. Drag the handle **fully left** to the earliest stop, then step right
through each stop.

**Sequence (watch the "As of …" line update each step):**
| Slider stop | Reads |
|---|---|
| **2024** | **37,500 wafers/month** |
| **2025** | **75,000 wafers/month** |
| **2026-Q4** | **127,500 wafers/month** |
*Deep link to open at the earliest stop: `?constraint=cowos-capacity&asof=2024`*

**Say:**
> "This is point-in-time correct. Scrub back to 2024 — capacity reads 37,500 wafers a
> month. Step forward: 75,000 in 2025, 127,500 by end of 2026 — roughly a doubling
> every year. And critically: at any past date, later numbers are greyed out. No
> lookahead, no backfill — you only ever see what was known *as of* that date."

**Do:** at the **2024** stop, point at the greyed-out future rows and the
`point-in-time · no lookahead` label. That greying-out *is* the correctness claim —
hold on it for a beat.

---

## Beat 4 — Exposure matrix → who's single-source (0:45–0:58)
**Screen:** click **"Exposure matrix ▸"** in the left rail.
*Deep link: `?matrix=1`*

**Say:**
> "The exposure matrix asks the portfolio question: which public companies sit
> *single-source* under each chokepoint — meaning every sourced supply route crosses
> a link they can't re-source around. It's a structural verdict, not a made-up score."

**Do:** click one **single-source** cell to expand the traced, cited path behind the
verdict — showing the claim is backed, not asserted.

---

## Beat 5 — Punchline (0:58–1:00)
**Say:**
> "One bottleneck, traced end to end, correct as of any date, every claim sourced.
> That's the whole tool."

**Do:** close the matrix, let the highlighted globe rotate one more beat, cut.

---

## Notes & recovery
- **If a click misfires on camera:** paste the beat's deep-link URL and keep going.
  Combine params, e.g. `?constraint=cowos-capacity&asof=2024&matrix=1`.
- **Full reset:** reload the plain URL (no `?…`) for a clean default globe.
- **Optional cold-open shortcut:** start the recording already at
  `?constraint=cowos-capacity` so the downstream highlight is on screen from frame one,
  then narrate Beat 1 over it.
- Keep the browser window sized so the left rail (constraints + slider) and the globe
  are both fully visible — that's the frame that tells the story.
