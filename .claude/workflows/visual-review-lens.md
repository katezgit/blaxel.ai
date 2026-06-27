# Visual Review Lens

> **When this fires:** `product-designer` is dispatched with a captured screenshot (path + route + persona context) and asked to return a visual-review verdict. Loaded on demand — not part of every designer task, only screenshot review.
>
> **Owner:** `product-designer`. The lens defines *how* the designer reads a screenshot. The orchestrator owns *when* the review runs (see [`pr-self-review.md`](./pr-self-review.md) Step 3.5).

The contract: the designer answers three questions, in order, before saying anything else about the screenshot. Order is non-negotiable — answering the third before the first is the failure mode this lens exists to prevent.

## The three questions

### 1. Why is the user on this page?

Name the entry path and the persona job. Use:
- [`docs/product/personas.md`](../../docs/product/personas.md) — primary persona is Alex unless the surface is Account → Plan & billing (Maya) or audit-flavored (Sam)
- [`docs/product/alex-user-stories.md`](../../docs/product/alex-user-stories.md) — the concrete job per phase
- `.intermediate/discovery/{screen-slug}/scenarios.md` if it exists — the entry-path scenarios already enumerate this

Output one sentence: *"Alex landed here from the sidebar after a failed Job in his agent's last run — he's checking whether the Job's Sandbox is still warm or has rotated out."* If you cannot name the entry path concretely, the screen has no audience and the review is meaningless — stop and return a question to the orchestrator.

### 2. What is the user hoping to solve in 10 seconds?

The audit question. From `scenarios.md` if it exists for detail / diagnostic screens; otherwise derived from the persona job in question 1.

Output one sentence framed as the user's silent question: *"Is the Sandbox still warm, and if not, when did it cool?"* The screen passes question 2 if its header zone + first content row answer this question without a click and without a scroll. The screen fails question 2 if the answer is below the fold, behind a tab, or only visible after expanding a section.

### 3. F-pattern scan — what's in each zone, and does it earn its place?

Eye-tracking research consistently shows users scan dense info surfaces in an F-shape: heaviest fixation across the top band, second fixation across an upper sub-row, then a vertical scan down the left edge, sampling content as they go. Apply zone-by-zone:

- **Top band (heaviest fixation).** Page title, primary identifier of the entity, primary status. This zone must answer question 1 ("what page is this") AND start answering question 2 ("the thing the user is solving"). Decoration here is the most expensive failure — every pixel competes with the answer.
- **Sub-row (second fixation).** Subtitle, primary metadata, primary action. Continues answering question 2. A tab bar or filter row sitting in this zone steals the second fixation for navigation, which is fine ONLY if navigation is the user's task on this page (index / list screens); on a detail screen it's a leak.
- **Left edge (vertical scan).** Section headings, row identifiers, the navigation sidebar. Two left anchors competing (sidebar + a left-rail filter, sidebar + a vertical menu inside the content area) split the user's scan path and slow every read.
- **Everything else.** Content the user reaches when scanning. Not where the 10-second answer lives.

For each zone, the designer states: **what's there → does it serve question 1 or 2 → if not, what is it doing?** Decoration in the F-zones is a FAIL; decoration in the rest is a soft FAIL.

## Avoid catalog — check against forbidden moves

After the three-question pass, scan the captured screen against the catalogs below. Any hit = FAIL with the entry name + the surface where it appears.

- [`docs/design/anti-patterns/`](../../docs/design/anti-patterns/) — decoration / structural anti-patterns. **Decoration anti-patterns most commonly missed by engineers:** border-left as selection or decoration state, hairline card separators as default grouping. Open every relevant file in this folder before returning a verdict.
- [`docs/product/personality.md`](../../docs/product/personality.md) Counterexample — voice / interaction anti-patterns (cute error, welcome hero, celebration deploy, illustration empty state). Check copy, error states, empty states.
- [`docs/product/personality.md`](../../docs/product/personality.md) Anti-personality drift map — perpetual → abrupt, composed → over-grouped, transparent → firehose, exact → precision theater, disciplined → cold. Check the surface's overall tone.

## Return shape

The designer returns exactly this structure. No preamble, no closing summary.

```
VERDICT: PASS | FAIL

Q1 — Why here:  <one sentence — entry path + persona job>
Q2 — 10s job:   <one sentence — the user's silent question>
Q3 — F-zones:
  Top band:   <what's there> — <serves Q1/Q2 | leak | decoration>
  Sub-row:    <what's there> — <serves Q1/Q2 | leak | decoration>
  Left edge:  <what's there> — <serves Q1/Q2 | leak | decoration>
  Rest:       <one phrase>

Findings (numbered, only if FAIL):
  1. <surface>:<zone> — <catalog entry or lens question> — <what to do instead>
  2. ...

Anti-pattern hits (only if FAIL on catalog):
  - <file>#<section> — <surface where it appears>
```

PASS = every F-zone serves question 1 or 2, no catalog hits, no decoration in top band or sub-row. Anything less = FAIL with numbered findings.

## What the lens does NOT do

- It does not write code suggestions. Designer territory ends at *"this doesn't answer the user's question because…"*. The engineer chooses the implementation.
- It does not check token discipline, lint, or types — those are engineer / reviewer gates.
- It does not check motion. Motion review is `motion-designer` territory, runs live in the app, not on a still screenshot.
- It does not check the screen against the spec — that's [`screen-spec-parity.md`](./screen-spec-parity.md), a separate workflow.

## Why this exists

The operator was running this lens manually — squinting at the engineer's screenshot, asking "why is the user here, what are they solving, what does the F-scan land on," typing the findings, relaying them back. That loop is the operator's wall-clock, which is the only scarce resource on this project. The lens moves the loop to the designer, run on every UI-touching PR ([`pr-self-review.md`](./pr-self-review.md) Step 3.5) and on engineer-tagged mid-feature checkpoints.
