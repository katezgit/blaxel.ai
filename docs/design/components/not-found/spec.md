# Not-Found Page — Component Spec

**Scope decision: hybrid (c) — universal default + per-segment carve-outs for Job and Run only.**

Justification is in §5. Read it before changing the approach.

**Semantic refs:** `docs/design/foundations/color.md`, `typography.md`, `spacing.md`, `radius.md`, `elevation.md`.

**Phase carve-out:** `components` spec authored during `wireframes` phase — foundational engineering need. No domain-review gate required for this carve-out; operator-approved scope.

---

## 1. Scope Boundary

This spec covers the Next.js App Router `not-found.tsx` surface — the page rendered when:

1. A URL does not match any route segment in `app/` (typo, bookmark rot, dead link)
2. A Server Component calls `notFound()` explicitly (entity ID looked up in the database, came back null or 404)

**Distinct from:**

| Surface | Why excluded |
|---|---|
| `error.tsx` (runtime crash) | Route segment threw — different failure mode. Error-page spec at `docs/design/components/error-page/spec.md`. Same chrome language; different content. |
| Inline empty states | "No jobs yet" — the route exists, the data is empty. Zero-state, not missing-route. |
| Toast / form errors | Transient, non-blocking, in-context. Not a route boundary. |

**What this surface says:** "The thing at this URL does not exist." It does not say "something crashed." That distinction governs every copy and action decision below.

---

## 2. Composition

### 2.1 Layout

Mounts inside the app shell. Header and sidebar persist. This surface occupies the **main content area** — the scrollable region that normally shows route content. Identical shell behavior to `error.tsx`.

```
┌──────────────────────────────────────────────┐
│  [Header — persists]                         │
├─────────────┬────────────────────────────────┤
│             │                                │
│  [Sidebar   │                                │
│  persists]  │      ┌────────────────────┐    │
│             │      │                    │    │
│             │      │   [badge]          │    │
│             │      │   [headline]       │    │
│             │      │   [diagnostic]     │    │
│             │      │                    │    │
│             │      │   [primary action] │    │
│             │      │   [secondary]      │    │
│             │      │                    │    │
│             │      └────────────────────┘    │
│             │                                │
└─────────────┴────────────────────────────────┘
```

The content block is vertically centered in the main content area, horizontally centered within it. `max-w-[480px]` — same cap as error-page, consistent feel at widescreen.

Layout classes: `flex items-center justify-center w-full min-h-full py-12` on the boundary container; `flex flex-col items-center gap-4 max-w-[480px] px-6 text-center` on the content block.

### 2.2 Badge Treatment

**Decision: monospaced badge showing `404` — matching the `exit 1` language family from error-page.**

The error-page spec established the terminal/CLI motif for this product's error-class surfaces. `404` is the exact vocabulary of the failure — it is what Aman sees in server logs, curl output, and HTTP traces. `not_found` (the POSIX-ish variant) reads natural in a per-segment context, and is used for entity-specific variants (see §3).

**Rendering spec:**

```
┌──────────┐
│  404     │   ← font-mono, text-label (12px), font-medium
└──────────┘
```

Token references:
- Background: `bg-muted` (`--color-muted`)
- Border: `border border-border` (`--color-border`)
- Text: `text-muted-foreground font-mono` (`--color-muted-foreground`)
- Radius: `rounded-md` (`--radius-md`, 6px)
- Padding: `px-3 py-1.5`
- Size: self-sized (inline-flex)

For per-segment variants, the badge shows `not_found` — the distinction signals "this specific entity does not exist" vs. "this URL does not match any route." Both read as the same motif family; the text shifts the register slightly toward the data layer.

### 2.3 Headline Copy Pattern

Copy rules (same register as error-page):
- Present-tense statement of fact
- No "Oops", "Sorry", "Uh oh", "We can't find", "It looks like"
- HUD vocabulary: entity names match the product noun (Job, Taskset, Run, Environment, Agent, Model)
- Neutral tone — not accusatory ("you typed a bad URL"), not apologetic ("we lost it")

**Universal (unknown URL):**
```
Page not found
```

This is the fallback for URLs that match no route — a typo, a stale link, a nav bug. "Page" is acceptable here because the specific entity type is unknowable from an unmatched route.

**Per-segment variants** (entity-specific — see §3 for when these fire):

```
Job not found
```
```
Run not found
```

Token references: `typography-subtitle font-semibold text-foreground tracking-(--typography-subtitle--letter-spacing)` (`--typography-subtitle` line-height + size pair, `--font-weight-semibold` 600, `--color-foreground`)

### 2.4 Diagnostic Line

**Decision: show the bad URL path for the universal case; show the entity ID for per-segment variants.**

Rationale: The diagnostic line is the first triage signal. For an unmatched URL, the path itself is the signal — Aman can immediately see if he copy-pasted a wrong slug. For a per-segment 404 on a Job or Run, the ID is the relevant signal — the URL is already in the browser bar, but the ID is what he needs to cross-reference against Slack notifications, CI logs, or a teammate's message.

**Universal variant:**
```
/tasksets/checkout-flow/jobs/4822x          ← truncated at 80 chars, mono
```

**Per-segment Job/Run variant:**
```
Job 4821 · deleted or superseded by a re-run
```

The secondary hint ("deleted or superseded by a re-run") is static copy — it is the most common reason an Aman-triggered 404 occurs (Slack notification → click → job gone). It is a hypothesis, not a fact, but it is the right hypothesis to surface for triage.

**Rendering spec:**
- `text-body text-muted-foreground font-mono` for the path/ID portion — `--text-body` (13px), `--color-muted-foreground`
- For the hint text on per-segment: `text-body text-muted-foreground` (sans-serif) — `--text-body` (13px)
- `max-w-[440px]`
- `line-clamp-2`

**Do not show:** "Error 404" as a sentence, stack traces, internal route resolution details.

### 2.5 Primary Action

**Universal:** `Go to Jobs`

`/jobs` is the anchor surface — the root redirect, the "wake-up triage" view. It is guaranteed to render for any authenticated user and covers Aman's recovery path (all jobs surface, filter to find what he was looking for).

**Per-segment Job/Run variant:** `Go to Jobs`

Same anchor. After a deleted-job 404, returning to the Jobs list is the correct recovery — it shows the current fleet state and the user can determine if the job was superseded, renamed, or genuinely gone.

Button spec:
- `variant="primary"` (near-black fill, `--color-primary`)
- `size="default"`
- Rendered as a Next.js `<Link>` inside `<Button asChild>`

### 2.6 Secondary Action

**Universal:** `Go back`

Uses `router.back()`. Justification: for an unmatched URL (typo, dead link), the most likely recovery is returning to wherever they came from. Unlike an error-page crash, there is no broken segment to reset — the user simply navigated to a nonexistent destination. `router.back()` covers bookmark-rot (Priya's case), mistyped URLs, and stale doc links. It does not loop (the previous route was a valid, rendered page).

**Per-segment Job/Run variant:** `Go to Taskset`

When a specific Job or Run 404s, the parent Taskset is the recovery surface — Aman can see the full job list for that taskset, confirm whether the job was superseded, and open the replacement. This is more useful than `Go back` (which might be the same 404 page if they arrived via a Slack deep link) and more specific than `Go to Jobs` (which loses the taskset context).

The Taskset link is derived from the URL: `/tasksets/[id]/jobs/[jid]` → secondary action links to `/tasksets/[id]`. The per-segment `not-found.tsx` receives the dynamic params from the segment context.

Button spec:
- `variant="ghost"` (transparent, `text-foreground`)
- `size="default"`
- Rendered as `<Button asChild>` wrapping `<Link>`

**Why not "Browse Tasksets" or Search?** Browse is a low-value recovery action for Aman — he knows which taskset he wants. Search does not exist yet in the portal; spec it when it ships.

---

## 3. Variant Matrix

Three variants. Same layout, same badge-motif family, copy and badge text changes.

| Variant | Fires when | Badge | Headline | Diagnostic | Primary | Secondary |
|---|---|---|---|---|---|---|
| Universal | URL matches no route (any `app/not-found.tsx`) | `404` | `Page not found` | URL path (mono, truncated) | `Go to Jobs` | `Go back` |
| Job | `/tasksets/[id]/jobs/[jid]/not-found.tsx` — job ID not found in DB | `not_found` | `Job not found` | `Job [jid] · deleted or superseded by a re-run` | `Go to Jobs` | `Go to Taskset` |
| Run | `/tasksets/[id]/jobs/[jid]/runs/[rid]/not-found.tsx` — run ID not found | `not_found` | `Run not found` | `Run [rid] · deleted or no longer available` | `Go to Jobs` | `Go to Taskset` |

---

## 4. Token References

All tokens are confirmed present in `packages/ui/src/styles/`. No new tokens introduced.

### Badge

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Badge surface | `--color-muted` | `bg-muted` | `#f0f0f3` |
| Badge border | `--color-border` | `border-border` | `#d9d9e0` |
| Badge text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |
| Badge font | `--font-mono` | `font-mono` | JetBrains Mono / Geist Mono |
| Badge text size | `--text-label` | `text-label` | 12px |
| Badge radius | `--radius-md` | `rounded-md` | 6px |

### Headline

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Headline text | `--color-foreground` | `text-foreground` | `#1c2024` |
| Headline size + line-height | `--typography-subtitle` | `typography-subtitle` | resolved via theme |
| Headline weight | `--font-weight-semibold` | `font-semibold` | 600 |
| Letter spacing | `--typography-subtitle--letter-spacing` | `tracking-(--typography-subtitle--letter-spacing)` | resolved via theme |

### Diagnostic

| Role | Token | Utility | Resolved value |
|---|---|---|---|
| Path/ID text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |
| Path font | `--font-mono` | `font-mono` | JetBrains Mono / Geist Mono |
| Path size | `--text-body` | `text-body` | 13px |
| Hint text | `--color-muted-foreground` | `text-muted-foreground` | `#60646c` |

### Actions

| Role | Token | Notes |
|---|---|---|
| Primary button | `--color-primary` / `--color-primary-foreground` | `Button variant="primary"` — inherits all button tokens |
| Ghost button | `--color-foreground` on transparent | `Button variant="ghost"` — inherits all button tokens |
| Action gap | spacing ramp | `gap-2` (8px) between primary and secondary — spacing-2, inline sibling gap for action-row Button + Button per spacing.md |

---

## 5. Scope Decision — Hybrid Justified

**Pick: (c) Hybrid — universal default + per-segment carve-outs for Job and Run only.**

### The analysis

**Aman's frequency driver is concrete.** The spec input names it: Slack notification → click → job deleted / moved / superseded by re-run. Continuous quality pipelines generate high job churn. A Job 404 for Aman is not a navigation mistake — it is a meaningful data signal: "this job existed, now it doesn't, why?" The copy "Job 4821 · deleted or superseded by a re-run" answers his triage question *on the page* before he has to open the Taskset list. "Page not found" gives him nothing.

A Run 404 is the same pattern one level deeper — runs within a job come and go; Aman or a CI system may be deep-linking to a specific run that has since been garbage-collected or overwritten.

**Priya's frequency driver is low.** Broken doc links and stale screenshot URLs are occasional, not continuous. The universal `404` + "Page not found" + URL diagnostic is sufficient for her case. She does not need entity-specific copy to recover from a dead link — she needs to navigate somewhere valid.

**Why not (b) — per-segment for every entity route?**

Entity routes today: `tasksets/[id]`, `tasksets/[id]/jobs/[jid]`, `tasksets/[id]/jobs/[jid]/runs/[rid]`, `environments/[id]`, `models/[id]`, `agents/[id]`, `library/[id]`.

Applying (b) fully:
- `tasksets/[id]/not-found.tsx` — Taskset not found. When does this fire for Aman? Tasksets are durable; they are not deleted by CI. Low frequency. Copy: "Taskset not found." Recovery: `Go to Tasksets`. Marginally better than universal, but not high-leverage.
- `environments/[id]/not-found.tsx` — same argument. Environments are stable infrastructure; they are not deleted at high frequency. Low leverage.
- `models/[id]/not-found.tsx`, `agents/[id]/not-found.tsx`, `library/[id]/not-found.tsx` — very low frequency. An agent or model 404 is almost always a bad URL, not a deletion event.

The marginal copy improvement for Taskset / Environment / Model / Agent / Library does not justify 5 additional files, 5 additional Storybook stories, and the maintenance surface of keeping them in sync as the product evolves. The rule is: if the entity type is high-churn and deep-link-delivered (Slack/CI → URL), give it a per-segment. If it is a durable resource rarely deep-linked in hot workflows, universal covers it.

**Why not (a) — universal only?**

Because "Page not found" for a deleted Job is a lie of omission. Aman knows the job *existed* — he has the ID from Slack. "Page not found" reads as a broken URL. "Job 4821 · deleted or superseded by a re-run" reads as honest telemetry. The copy difference is the difference between "your navigation broke" and "the entity lifecycle moved on." At Aman's usage frequency, that distinction is daily friction.

**The hybrid produces:**
- `app/not-found.tsx` — universal fallback (typos, stale links, any unmatched URL)
- `app/(app)/tasksets/[id]/jobs/[jid]/not-found.tsx` — Job variant
- `app/(app)/tasksets/[id]/jobs/[jid]/runs/[rid]/not-found.tsx` — Run variant

Three files. Manageable. Incrementally extensible if Taskset churn increases over time.

---

## 6. Engineering Handoff Notes

### `not-found.tsx` is a Server Component

Unlike `error.tsx`, `not-found.tsx` does not require `"use client"`. It is a standard Server Component (or can be). No `reset()` prop, no error boundary. The component can be async and read params from `useParams()` (client) or receive them from the calling Server Component via `notFound()` context.

**Note:** Next.js does not currently pass the missing ID to `not-found.tsx` directly via props. The per-segment variants need to read the ID from `params` (which ARE available in `not-found.tsx` when it's inside a dynamic segment). The segment `not-found.tsx` file lives inside `[jid]/` so `params.jid` is available via the standard Next.js params mechanism.

### Props surface

The shared `NotFoundPage` component (in `packages/ui` or `apps/web/components`) receives:

```tsx
type NotFoundVariant =
  | { kind: "universal"; path: string }
  | { kind: "job"; tasksetId: string; jobId: string }
  | { kind: "run"; tasksetId: string; jobId: string; runId: string }
```

- `kind: "universal"` — renders `404` badge, "Page not found", URL path diagnostic, "Go to Jobs" + "Go back"
- `kind: "job"` — renders `not_found` badge, "Job not found", job-ID diagnostic, "Go to Jobs" + "Go to Taskset"
- `kind: "run"` — renders `not_found` badge, "Run not found", run-ID diagnostic, "Go to Jobs" + "Go to Taskset"

The `path` for the universal variant: server-side read of the incoming URL from `headers()` (`x-invoke-path` or `x-url` depending on deployment target), or passed down from the root layout. Implementation detail is the engineer's; the component accepts a string.

### `router.back()` for secondary action on universal variant

The universal `not-found.tsx` is a Server Component, so `router.back()` must be wrapped in a small `"use client"` button subcomponent. Pattern:

```tsx
"use client"
export function GoBackButton() {
  const router = useRouter()
  return <Button variant="ghost" onClick={() => router.back()}>Go back</Button>
}
```

The engineer should not make the entire `not-found.tsx` a Client Component just to use `router.back()`. Extract the button only.

### `notFound()` call location

The per-segment 404 fires when a Server Component in that segment calls `notFound()`. Example for Job detail:

```tsx
// app/(app)/tasksets/[id]/jobs/[jid]/page.tsx
const job = await fetchJob(params.jid)
if (!job) notFound()
```

Next.js then renders `not-found.tsx` in the nearest ancestor that has one — which is the per-segment file at the same route level.

### 6.5 Group-level chrome on typo'd URLs

Group-level `not-found.tsx` files (e.g. `(manage)/not-found.tsx`) render with the group's layout (sidebar, header) wrapped around them when `notFound()` is called inside the group's segment chain. For deep URL misses inside a sub-shell, the default cascade can escape past the sub-shell layout — losing the sub-shell sidebar. To pin the not-found render to the sub-shell, add a catch-all under that group:

```tsx
// app/(group)/<root>/[...catchAll]/page.tsx
import { notFound } from "next/navigation";
export default function CatchAll() { notFound(); }
```

See `docs/conventions/app-conventions.loading-and-errors.md` § "Pinning typo'd URLs to a sub-shell's `not-found.tsx`" for the engineering rule.

---

## 7. Wireframes

### Universal

```
┌──────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  [Sidebar    │                                               │
│   persists]  │           ┌──────────────────┐               │
│              │           │  404             │  ← badge      │
│              │           └──────────────────┘               │
│              │                                               │
│              │          Page not found                       │
│              │                                               │
│              │   /tasksets/checkout-flow/jobs/4822x          │
│              │                                               │
│              │        [  Go to Jobs  ]  [Go back]            │
│              │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

### Job variant

```
┌──────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  [Sidebar    │                                               │
│   persists]  │           ┌──────────────────┐               │
│              │           │  not_found       │  ← badge      │
│              │           └──────────────────┘               │
│              │                                               │
│              │           Job not found                       │
│              │                                               │
│              │  Job 4821 · deleted or superseded by a re-run │
│              │                                               │
│              │     [  Go to Jobs  ]  [Go to Taskset]         │
│              │                                               │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Elements stack vertically with `gap-4` (16px) between badge, headline, diagnostic, and action row — spacing-4, block-to-block per spacing.md. Action row: `flex-row gap-2` — primary left, ghost right (reading order matches action priority). Identical layout rhythm to error-page.

---

## 8. Anti-Patterns

**Copy:**
- "We couldn't find that page" — passive, apology register
- "Oops! That page doesn't exist" — consumer product
- "404 Error — Page Not Found" — redundant, bureaucratic
- "Please check the URL and try again" — condescending; Aman knows how URLs work
- "Don't worry, you can always go back!" — encouragement is noise

**Visual:**
- Lost astronaut / ghost illustration — personality doc rules this out explicitly
- Colored wash (red/orange 404 treatment) — decorative color anti-pattern per personality
- Giant `404` typographic display — this is not a consumer marketing page
- Empty state treatment (dashed border, "No results") — this is a missing-route, not an empty data set

**Interaction:**
- Auto-redirect countdown ("Redirecting to /jobs in 5…") — removes user control, disorienting
- Showing the full stack trace of the notFound() call — security risk, noise
- Broken link checker embedded in the page — scope creep; not a portal concern

---

## 10. In-Shell Variant — Sub-Shell Section 404s

**Covers:** `/profile/*`, `/account/*`, `/account/billing/*`, `/{workspaceSlugOrId}/settings/*` — URLs that fall inside an authenticated sub-shell (the shell chrome including sidebar + topbar is preserved) but resolve to a nonexistent page within that sub-shell.

**Distinct from §§1–9 above** (which cover the runtime app — `/[workspaceSlugOrId]/tasksets/…`, `/[workspaceSlugOrId]/settings/…` — with a focus on the workspace runtime persona, Alex). The sub-shell surfaces in this section serve Alex (Settings), Alex/Sam (Account), and Maya (Billing). The 404 pattern is the same structural shape but the section context, headline copy, and primary CTA destination differ by sub-shell.

---

### 10.1 Design anchor — the Blaxel-side question

*"When a developer typos a URL inside a sub-shell, what content fills the empty area that helps them recover fast without breaking the sub-nav context they were just in?"*

The answer grounded in Blaxel's surface shape and persona:

- The sidebar IS the navigation recovery surface. Zero authenticated app-shell peers add a contextual suggestion list to the 404 block. The suggestion list is a docs-site pattern, not an app-shell pattern. Blaxel's sidebar already enumerates every section — adding links inside the 404 block duplicates the sidebar, creates a maintenance surface, and adds navigation noise at a moment that calls for a clean halt.
- The "raw void" problem is a content-density problem, not a positioning problem. A vertically-centered block anchored at the optical center of the content area is the universal authenticated-app-shell pattern (Linear, Stripe, Vercel project pages). Top-aligning the block was tried and rejected — the block reads as "a page that started loading and stopped" rather than "a deliberate halt." Centered + slightly denser content (a one-line supporting sentence beneath the diagnostic path) makes the block read as a complete, intentional message rather than an unfinished render.
- Section-specific headlines are correct. "Profile page not found" names the section context from the route group — the user knows which sub-shell they are in.

---

### 10.2 Layout

Identical shell behavior to the runtime not-found (§2.1): header and sidebar persist; the main content area renders the 404 block vertically centered.

```
┌──────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                     │
├──────────────────┬───────────────────────────────────────────┤
│                  │                                           │
│  [Sub-shell      │                                           │
│   sidebar        │                                           │
│   persists]      │       ┌──────────────────┐               │
│                  │       │  404             │  ← badge      │
│   Profile        │       └──────────────────┘               │
│   ─────────      │                                           │
│   Account        │      {Section} page not found             │
│   ─────────      │                                           │
│   Billing        │   /account/billing/nonexistent-xyz        │
│   ─────────      │   This section doesn't have a page at    │
│   Settings       │   this URL.                               │
│                  │                                           │
│                  │     [Go to {Section}]  [Go back]          │
│                  │                                           │
└──────────────────┴───────────────────────────────────────────┘
```

Layout classes: same as §2.1 — `flex items-center justify-center w-full min-h-full py-12` on the boundary container; `flex max-w-[480px] flex-col items-center gap-4 px-6 text-center` on the content block.

---

### 10.3 Content block

**Four elements, stacked with `gap-4`, center-aligned:**

1. **Badge** — `404`, monospaced, same token rendering as §2.2. Identical across all sub-shell variants.

2. **Headline** — section-specific. See §10.4 copy table. Token: `typography-subtitle font-semibold text-foreground tracking-(--typography-subtitle--letter-spacing)`.

3. **Diagnostic** — the bad URL path, truncated at 80 chars, mono. Same spec as §2.4 universal variant. Below the path: one short supporting sentence in prose register (not mono). This fills the block's vertical weight without adding navigation noise.

   **Supporting line (static, applies to all sub-shell variants):**
   ```
   This section doesn't have a page at this URL.
   ```

   Token: `typography-body text-muted-foreground` — sans-serif, same size as the diagnostic, visually reads as a soft elaboration of the path line.

4. **Actions** — primary button + ghost button, `flex-row gap-2`. See §10.4 for per-section CTA targets.

**Rendering spec for the diagnostic + supporting line block:**

```
┌─ diagnostic block ──────────────────────────────────────────┐
│  /account/billing/nonexistent-xyz          ← mono, muted-fg │
│  This section doesn't have a page at       ← prose, muted-fg│
│  this URL.                                                   │
└─────────────────────────────────────────────────────────────┘
```

The path line and supporting line share `max-w-[440px]` and `line-clamp-2` / `line-clamp-3` respectively. They are adjacent siblings — no gap token between them (they read as one paragraph unit). The `gap-4` rhythm lives between the four top-level block elements (badge ↔ headline ↔ diagnostic-unit ↔ actions), not inside the diagnostic unit.

---

### 10.4 Per-section variant table

| Sub-shell | Headline | Primary CTA label | Primary CTA href | Secondary |
|---|---|---|---|---|
| `/profile/*` | `Profile page not found` | `Go to Profile` | `/profile` | `Go back` |
| `/account/*` | `Account page not found` | `Go to Account` | `/account` | `Go back` |
| `/account/billing/*` | `Billing page not found` | `Go to Plan & billing` | `/account/billing` | `Go back` |
| `/{ws}/settings/*` | `Settings page not found` | `Go to Settings` | `/{workspaceSlugOrId}/settings/general` | `Go back` |

**Billing surface persona note:** `/account/billing/*` is Maya's primary surface. The 404 block uses billing-accessible copy — "Billing page not found" is clear to Maya without runtime vocabulary. No change to the pattern is needed for Maya specifically; her session mode (document retrieval) means she is even less likely than Alex to be on a 404 surface, and the "Go to Plan & billing" CTA returns her to the correct section root.

**Workspace settings dynamic param:** `/{workspaceSlugOrId}/settings/*` requires reading `params.workspaceSlugOrId` from the segment context (already implemented in the current `WorkspaceSettingsNotFound` component).

---

### 10.5 What changes from the current draft

**Primary fix — supporting line:** Add `This section doesn't have a page at this URL.` as a `<p>` element beneath the mono diagnostic path, same token as the diagnostic but sans-serif. This tightens the block's internal density and clarifies that the section exists (the sidebar confirms it); the URL alone is a sparse single-line diagnostic. The "raw void" feel was content density, not vertical positioning — adding mass to the block resolves it without changing the peer-product centering pattern.

**Layout stays centered:** Vertically + horizontally centered with `max-w-[480px]`, matching the runtime not-found and authenticated app-shell peers. Top-align was tried and rejected — without page-header content above, the block read as an unfinished render rather than a deliberate halt.

**What does not change:**
- Badge (`404`, mono)
- Headline (section-specific, already correct)
- Diagnostic path (mono, truncated at 80 chars)
- Primary and secondary actions (already section-specific, already correct)
- Token set (no new tokens)

**No addition of:**
- Contextual suggestion list / "you might be looking for:" section — docs-site pattern, wrong for an authenticated app shell
- Illustration or icon — personality doc rules these out
- Search affordance — command palette (`Cmd+K`) is already the search surface

---

### 10.6 Consolidation — shared component

**Position: YES — consolidate into a shared `<InShellNotFound />` component.**

The four existing files (`profile/not-found.tsx`, `account/not-found.tsx`, `account/billing/not-found.tsx`, `[workspaceSlugOrId]/settings/not-found.tsx`) are identical JSX structures differing only in headline copy and primary CTA href + label. Identical structure is the correct signal that a shared component is warranted — this is a configuration difference (what section is this), not a structural difference (what does the block look like).

**Proposed component signature:**

```tsx
type InShellNotFoundSection =
  | { kind: "profile" }
  | { kind: "account" }
  | { kind: "billing" }
  | { kind: "settings"; workspaceSlugOrId: string }

type InShellNotFoundProps = InShellNotFoundSection
```

Each `not-found.tsx` file becomes a thin wrapper that reads the applicable params and passes them into `<InShellNotFound />`. The `settings` variant is the only one that needs a dynamic param (`workspaceSlugOrId` from `useParams()`).

**Placement:** The component lives in the portal app (`apps/portal/src/components/in-shell-not-found.tsx`), not in `packages/ui`, because it:
- Contains portal-specific routing (`useRouter`, `useParams`, Next.js `Link`)
- Has portal-specific section vocabulary ("Plan & billing", "/account/billing", "/profile")
- Is a single-caller pattern (four callers in the same app, not cross-app)

This is consistent with the DS boundary rule in the global CLAUDE.md: business vocabulary (section names, specific hrefs) disqualifies the component from being a shared DS primitive.

**The `"use client"` boundary:** The current files are all `"use client"` (required for `useRouter().back()` and `usePathname()`). The shared component preserves this — no change to the rendering model.

---

### 10.7 Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│  [App Header — persists]                                     │
├──────────────┬───────────────────────────────────────────────┤
│              │                                               │
│  [Sub-shell  │                                               │
│   sidebar    │           ┌──────────────────┐               │
│   persists]  │           │  404             │  ← badge      │
│              │           └──────────────────┘               │
│   Profile    │                                               │
│   ─────────  │          {Section} page not found             │
│   Account    │                                               │
│   ─────────  │       /account/billing/nonexistent-xyz        │
│   Billing    │       This section doesn't have a page at    │
│   ─────────  │       this URL.                               │
│   Settings   │                                               │
│              │         [Go to {Section}]  [Go back]          │
│              │                                               │
└──────────────┴───────────────────────────────────────────────┘
```

Gap rhythm: `gap-4` (16px) between badge, headline, diagnostic-unit (path + supporting line as one block), and action row. `gap-2` (8px) between primary and ghost button. No gap between path line and supporting line — they read as one paragraph. Content block is `items-center text-center` — badge, headline, diagnostic, actions all anchor to the optical center.

---

### 10.8 Anti-patterns (in-shell specific)

- **Contextual suggestion list** ("You might be looking for: Account settings / Billing / Profile"): docs-site pattern, wrong for an authenticated app shell. The sidebar already provides this. Adding it duplicates nav, creates a maintenance surface (which pages go in the list?), and adds cognitive load to a surface that should be a clean halt.
- **Section-agnostic headline** ("Page not found" for all sub-shell variants): loses the section context the user needs to orient. Section-specific headlines ("Billing page not found") are the correct peer-product pattern.
- **Illustration or decorative icon**: personality doc rules out "Lost astronaut / ghost illustration" explicitly. Low visual weight is the correct register for a developer infra tool.
- **Suggestion to check the URL** ("Please check the URL and try again"): anti-pattern already listed in §8 — condescending; Alex and Maya both know what a URL is.
- **Runtime vocabulary on the billing variant** ("Sandbox page not found", "Hosting page not found"): wrong for Maya's surface — the billing sub-shell uses billing-legible copy only.

---

## 9. Component Token Summary

No new component-level tokens. Composes existing semantic tokens identical to the error-page:

| Token | From spec |
|---|---|
| `bg-muted`, `border-border`, `text-muted-foreground` | color.css |
| `text-foreground`, `text-title`, `font-semibold` | color.css, typography.css |
| `font-mono`, `text-code`, `text-label`, `text-body` | typography.css |
| `rounded-md` | radius.css |
| `Button variant="primary"`, `Button variant="ghost"` | button/spec.md |
