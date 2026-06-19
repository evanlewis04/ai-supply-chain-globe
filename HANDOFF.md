# Handoff: Loop-Engineering Scaffold for the AI Supply Chain Globe

This document is the spec. Paste it into your first Claude Code session in the
Globe repo. The goal is for Claude Code to EXECUTE this, not re-derive it.

## Context Claude Code needs first
Point it at these before anything else:
- `about-me-for-claude.md` (your investing thesis, background, the recruiting goal)
- The Globe handoff document you already wrote (architecture, the typed Node/Edge
  model, the Obsidian → build-script → JSON/SQLite pipeline)
- Your actual build script and data schema — so verifier conditions reference REAL
  commands, not guesses.

## The overarching goal (keep this in front of every loop)
An impressive project for a finance recruiter at a hedge fund, quant shop,
SemiAnalysis, or similar — for someone leveraging a CS/AI background to break into
finance. The audience values RIGOR and a DEFENSIBLE PROCESS over a flashy globe or a
model's stock picks. The CS/AI background is the *how*, not the *what*.

## What this is
Four sub-loops, split by how verifiable their output is, plus a memory spine.
Do NOT merge them into one "make it better" loop — that has no halt condition and
burns tokens. Split by verifiability is the whole design.

| Loop | What it does | Cadence | Verifiability | Gate |
|------|--------------|---------|---------------|------|
| A | Globe / UI polish | daily | HIGH (build + a11y + regression) | none — safe to automate |
| B | Thesis refinement, adversarial | every 2-3 days | MEDIUM (maker/checker split) | Evan must read adversary case |
| C | Research surfacing of underfollowed names | weekly | LOW | HUMAN-GATED, never acts |
| D | Recruiter-lens audit (meta) | weekly | n/a | feeds A and B's open lists |

## Build Loop A FIRST
It's the lowest-risk one and teaches you the mechanics. Don't wire B/C/D until A
runs clean a few times.

### Loop A starter prompt
```
/goal Polish the AI Supply Chain Globe UI for one improvement cycle.

Read loop-state/recruiter-audit.md and loop-state/progress.md first.
Pick ONE UI/UX improvement from the audit's open list (legibility of the
layered graph, edge-routing clarity, hover/detail interactions, load
performance, or color semantics for the five Nvidia layers).

Implement it in an isolated worktree.

Then spawn a verifier sub-agent (different instructions) that checks:
  - the vault still builds: `python scripts/build.py` exits 0 (and
    `python scripts/build.py --validate --include-pending` for the CI check)
  - the frontend builds clean: `cd frontend && npm run build`
    (this is `tsc -b && vite build` — type errors fail it) exits 0
  - tests pass: `cd frontend && npm run test` (vitest) exits 0
  - the globe renders without regressions and the console is clean — run
    `cd frontend && npm run dev` (or `npm run preview`) and use the preview
    tools (console logs + snapshot + screenshot), or the headless Edge
    screenshot flow in CLAUDE.md against `npm run preview`, driving demo
    states with `?constraint=` / `?node=`
  - the change actually matches the audit item it claims to fix

NOTE: there is no Lighthouse/axe tooling wired up in this repo yet, so an
automated a11y-score gate does not exist. Either (a) do a manual a11y pass
on the touched UI via the preview tools, or (b) treat "wire up a Lighthouse
or axe check" as its own Loop A item before relying on a score. Do not
assert a Lighthouse number the repo cannot produce.

Done when: both builds + tests green AND verifier confirms the audit item is
addressed AND no regression. Write the result to loop-state/progress.md.
Halt after 1 shipped improvement, or after 6 iterations with no passing
verification, whichever comes first.
```

## The hard stops — wire these from run #1, not later
This is where the budget surprises live (Uber burned its annual AI budget in four
months). Every loop gets:
1. **Max iteration count** — per the per-loop stop conditions above.
2. **No-progress detection** — if the two most recent progress.md entries for a loop
   show no meaningful diff, HALT and flag it. Don't grind.
3. **Usage budget** — Claude Code runs on Evan's Claude subscription (Pro/Max), not
   metered API billing, so there's no per-run dollar cost. The real ceiling is the
   subscription's rolling usage / rate limits; the iteration cap and no-progress halt
   keep a loop from burning a usage window unattended. (If this ever switches to an
   API key, reinstate a low daily dollar ceiling, ~$5/day, until you know a day's cost.)

## Loop B — the maker/checker split (the part that impresses)
Two agents, already defined in `.claude/agents/`:
- `thesis-developer.md` — deepens one thesis, adds sourced evidence, traces the
  dependency one layer deeper. Capable model, high effort.
- `thesis-adversary.md` — attacks it, finds the bear case / why it's priced in,
  updates confidence honestly. Ideally a DIFFERENT model.

Loop B "succeeds" not when the thesis gets stronger, but when both sides are
documented and confidence is honestly updated.

**The comprehension gate (do not skip):** a thesis is NOT done until you've read the
adversary's case and can argue both sides yourself. If Loop B refines theses faster
than you internalize them, you'll walk into an interview unable to defend your own
project — the worst possible outcome. The loop does the legwork that deepens your
understanding; it does not replace it.

## Loop C — human-gated, no exceptions
Surfaces UNDERFOLLOWED nodes in the chain and assembles an evidence trail into
`candidates/`, then STOPS. It never decides, never recommends, never acts. Every
candidate is flagged NOT REVIEWED until you clear it. This is surfacing research for
you to evaluate — it is not financial advice and the loop is not a financial advisor.
The rigor of the process is the impressive part, not a ticker the model spat out.

## Loop D — the meta-loop that prevents drift
Weekly, a sub-agent reads the whole project as a recruiter/analyst would and writes
into `recruiter-audit.md`: what's impressive, what's thin, what a sharp interviewer
pokes first. Loops A and B pull their open-item lists from this file, which is what
keeps daily polish from becoming busywork.

## Files in this scaffold
```
loop-state/
  progress.md            <- the memory spine; every run reads + appends
  recruiter-audit.md     <- Loop D writes; A and B read open items from here
  theses/_TEMPLATE.md    <- copy per thesis; 4 required sections + Evan's defense
  candidates/_TEMPLATE.md<- copy per surfaced company; NOT REVIEWED by default
.claude/agents/
  thesis-developer.md    <- Markdown + YAML frontmatter (NOT .toml)
  thesis-adversary.md    <- model/effort in frontmatter; prompt in the body
```

## Two things to carry over that are easy to lose
- You lose this chat's memory in the handoff. Claude Code won't know your thesis,
  the Globe's architecture, or the recruiting goal unless you point it at
  about-me-for-claude.md and the Globe handoff doc at the start.
- Verification stays on YOU. A loop running unattended is also a loop making mistakes
  unattended. Read what the loop made. Build the loop like someone who intends to
  stay the engineer — not just the person who presses go.
```
