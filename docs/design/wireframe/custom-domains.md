# Custom domains — Text Wireframe (index / list page)

**Page:** Hosting › Custom domains
**Route:** `/:workspaceSlugOrId/custom-domains`
**Phase:** Wireframes
**Date:** 2026-06-22
**Persona path:** Alex (primary) + Sam (secondary, planned-audit pattern)
**Source scenarios:** Scenarios applicability — index/list screens: scenarios phase intentionally skipped per `design-phases.md`. Production reference: operator screenshot of current Tier-3-locked state; API reference: `spec.{name, displayName, region, status, cnameRecords, txtRecords, subjectAlternativeNames, fallbackPreviewId, lastVerifiedAt, verificationError, createdAt, createdBy, labels}`.

---

## Layout context

Rendered inside the workspace shell: left sidebar shows Hosting group with `Custom Domains` active. Topbar carries the workspace switcher (top-left) and identity utility (search ⌘K / bell / ? / avatar, top-right). Page content fills the main content area. The shell chrome is specified in `docs/design/wireframe/app-shell.md` — not re-specified here.

---

## Register domain — flow placement decision

**Decision: CLI is the primary path. The dashboard surfaces a minimal single-input affordance, not a multi-field wizard.**

Rationale: `personas.md:14` (Alex — out of scope): "hand-holding wizards for primitives Alex already knows how to compose in code." `personality.md` Sacrificial choice #5: "CLI / SDK is a peer surface, not a fallback. Empty states lead with the `bl …` command, not a `Create` button." Alex has already run `bl domain register preview.acme.com --region us-pdx-1` in her terminal before opening the dashboard — the dashboard is where she watches state, not where she initiates setup.

The "Add domain" button in the page header opens a **single-input step** — one text field (the domain name), no region selector, no display name field, no wizard. The minimal affordance exists for the case where Alex pastes a domain name into the dashboard (e.g. copying from a Slack message) rather than switching to terminal. Sam may also use this path.

**Single-input affordance (inside a right-side sheet or modal):**
- `Domain name` — text input, required. Placeholder: `preview.acme.com`. API field: `spec.name`.
- Submit: `Register domain` button (primary). Cancel: ghost, shown only when the field is dirty (form-actions guideline).
- Post-submit → redirect to `/custom-domains/{name}` with `status=pending`. On error → error line inline below the input (API error message verbatim), input stays open.

**No region selector, no display name field in this affordance.** These fields exist on the API but introducing them at registration time adds wizard friction that conflicts with Alex's primary path (CLI already handles both). Region defaults to the workspace's default region. Display name can be set from the detail page after registration. This keeps the dashboard affordance to "paste a domain name → submit" — one step, no decisions.

**Persona scope note:** This affordance is lightly weighted — not a primary CTA. The CLI-first guidance band (see STATE 4 — Empty) is the primary affordance Alex sees. The "Add domain" button is a secondary convenience path for dashboard-first entry.

---

## State machine

```
list page
  ├── STATE 1: Tier-3 locked (paywall)          workspace Tier < 3
  ├── STATE 2: loading                           Tier ≥ 3 + data fetching
  ├── STATE 3: error                             Tier ≥ 3 + fetch failed
  ├── STATE 4: empty                             Tier ≥ 3 + zero domains
  └── STATE 5: populated                         Tier ≥ 3 + ≥1 domains
        └── rows: pending | verified | failed
```

---

## Page header (all states share this shape; paywall state disables primary action)

```
┌────────────────────────────────────────────────────────────────┐
│  Custom domains                                                │
│  Customer-owned DNS mapped to Sandbox preview URLs,           │
│  with managed TLS. Region-locked per domain.                   │
│                                              [Add domain]      │
└────────────────────────────────────────────────────────────────┘
```

- **Heading:** `Custom domains` — lowercase d per `platform.md:202` vocabulary table. (Sidebar IA label "Custom Domains" retains capital D as the live-product nav label; page heading uses canonical lowercase form.)
- **Subtitle:** States the primitive's purpose in one sentence. No marketing phrasing.
- **Primary action:** `Add domain` — disabled in Tier-3-locked state (greyed, cursor default, tooltip: "Upgrade to Tier 3 to register custom domains"). Enabled in all other states. Triggers the single-input sheet.

---

## STATE 1 — Tier-3 locked (paywall)

Triggered when the workspace account is below Tier 3. The custom domains route is reachable and visible in the sidebar (personality.md Sacrificial choice #8 — "Free surfaces visible, paid surfaces inline-gated"); the feature is gated at the point of use, not hidden.

**Note — operator override:** The production dashboard shows a Tier-3 paywall for this surface (operator-supplied screenshot, 2026-06-22). This wireframe binds to the operator's stated system state. The live pricing page at blaxel.ai/pricing may describe usage-based pricing on top of tier gating — both can be true simultaneously. Tier 3 is the unlock mechanism; usage-based billing applies after the tier is active. The right-rail CTA routes to the account Billing top-up surface, which is the Tier-3 unlock mechanism per `account-billing.md` § B4 "Top-up" (the "$200+ top-up in past 30 days" threshold sustains Tier-3 access).

```
┌────────────────────────────────────────────────────────────────┐
│  Custom domains                                                │
│  Customer-owned DNS mapped to Sandbox preview URLs,           │
│  with managed TLS. Region-locked per domain.                   │
│                                        [Add domain · locked]   │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┬──────────────────────────────┐
│                                 │  Ready to ship?              │
│  🌐                             │                              │
│                                 │  Upgrade to Tier 3 to        │
│  Bring your own identity        │  register custom domains and  │
│  to Blaxel                      │  map them to your Sandbox    │
│                                 │  preview URLs.               │
│  Route Sandbox previews through │                              │
│  your own domain names,         │  ┌──────────────────────┐   │
│  with automatic TLS via ACM.    │  │  💳  Upgrade tier →  │   │
│                                 │  └──────────────────────┘   │
│  ── Features ──                 │                              │
│                                 │  Takes you to account        │
│  Wildcard support               │  Billing — top up $200+      │
│  One domain covers all          │  to activate Tier 3.         │
│  subdomains — no per-           │                              │
│  subdomain registration.        │                              │
│                                 │                              │
│  Branded sandbox previews       │                              │
│  Your users see your domain,    │                              │
│  not *.preview.bl.run.          │                              │
│                                 │                              │
│  Region-locked assignment       │                              │
│  Each domain pins to one        │                              │
│  region for latency control.    │                              │
│                                 │                              │
└─────────────────────────────────┴──────────────────────────────┘
```

**Anatomy:**

- **Left panel — feature description:** Globe icon + headline "Bring your own identity to Blaxel" + one-sentence description. Below: three feature rows (Wildcard support / Branded sandbox previews / Region-locked assignment), each with a bolded feature label and one-sentence explanation. Copy mirrors production framing but uses Blaxel personality voice — no marketing superlatives.
- **Right rail — upgrade CTA:** Section label "Ready to ship?" (matches production wording). Explanation sentence names the primitive (custom domains) and the action it unlocks. `Upgrade tier →` button (primary, orange per Blaxel brand — token: `--color-primary` / orange). Subdued text below button describes the destination so Alex knows where she's going before clicking.
- **"Upgrade tier →" links to:** account Billing top-up surface — route `/account/billing` (the monthly top-up section activates Tier 3 at the $200+ threshold, per `account-billing.md` § B4). This is the correct mechanism: Tier 3 is sustained by a qualifying monthly top-up, not a separate "plan upgrade" flow.
- **Layout:** Two-column. Left: ~60% width, feature description. Right: ~40% width, upgrade CTA rail. On narrow breakpoint: stacks, upgrade CTA above feature list.

**Interaction principle #11 compliance:** Feature is visible in the IA with tier requirement noted at the point of use. "Add domain" button is greyed with tooltip — not hidden.

---

## STATE 2 — Loading

Triggered when the workspace is Tier ≥ 3 and the list fetch is in flight.

```
┌────────────────────────────────────────────────────────────────┐
│  Custom domains                                                │
│  Customer-owned DNS mapped to Sandbox preview URLs, …         │
│                                              [Add domain]      │
└────────────────────────────────────────────────────────────────┘

  Domain            Region       Status     Last verified
  ─────────────────────────────────────────────────────────────
  ████████████████  ████████     ████████   ████████
  ████████████████  ████████     ████████   ████████
  ████████████████  ████████     ████████   ████████
```

- Three skeleton rows, same column structure as populated state.
- No spinner, no "Loading…" text — skeleton rows communicate progress without stopping the read.
- Columns: `Domain` / `Region` / `Status` / `Last verified` (matches populated state column set).

---

## STATE 3 — Error

Triggered when the list fetch fails.

```
┌────────────────────────────────────────────────────────────────┐
│  Custom domains                                                │
│  …                                                             │
│                                              [Add domain]      │
└────────────────────────────────────────────────────────────────┘

  Domain            Region       Status     Last verified
  ─────────────────────────────────────────────────────────────
  Custom domains unavailable — refresh to retry.
```

- Error message replaces row content. No illustration. Cause + next move.
- Column header row stays rendered so the layout doesn't collapse.

---

## STATE 4 — Empty (Tier ≥ 3, zero domains)

Triggered when the workspace is Tier ≥ 3 and the API returns an empty list.

```
┌────────────────────────────────────────────────────────────────┐
│  Custom domains                                                │
│  Customer-owned DNS mapped to Sandbox preview URLs, …         │
│                                              [Add domain]      │
└────────────────────────────────────────────────────────────────┘

  Domain            Region       Status     Last verified
  ─────────────────────────────────────────────────────────────

  No custom domains registered yet.

  ┌──────────────────────────────────────────────────────────┐
  │  Register your first domain                              │
  │                                                          │
  │  $ bl domain register <apex-domain> --region us-pdx-1   │
  │                                                 [📋]     │
  │                                                          │
  │  Then add the DNS records Blaxel returns to your         │
  │  provider and run:                                       │
  │                                                          │
  │  $ bl domain verify <apex-domain>                        │
  │                                                 [📋]     │
  └──────────────────────────────────────────────────────────┘

  Or paste a domain name →  [Add domain]

```

- **CLI guidance band leads the empty state** (personality.md Sacrificial choice #5 — "Empty states lead with the `bl …` command, not a `Create` button"). The band shows both the register and verify commands — the two-step process Alex needs.
- Commands are copyable (click-to-copy [📋] affordance on each mono code block).
- The `Add domain` button appears as a secondary affordance after the CLI band — labelled "Or paste a domain name →" to frame it as a convenience path, not the primary one. This is for Alex who pastes a domain from Slack, or Sam who prefers the dashboard form.
- No illustration, no guidance wizard, no multi-step onboarding.

---

## STATE 5 — Populated

Triggered when the workspace is Tier ≥ 3 and the API returns ≥1 domain. The table renders one row per custom domain resource.

### Table header

```
  Domain            Region       Status      Last verified
  ─────────────────────────────────────────────────────────────
```

**Column mapping to API fields:**
- `Domain` — `metadata.name` (the apex domain string). `metadata.displayName` rendered below it in muted text if set.
- `Region` — `spec.region` (e.g. `us-pdx-1`).
- `Status` — `spec.status` enum: `pending` | `verified` | `failed`.
- `Last verified` — `spec.lastVerifiedAt` (relative timestamp, e.g. "3h ago" / "—" if null).

### Row types

**`verified` row:**
```
  preview.acme.com         us-pdx-1     ● verified    2h ago
  Acme preview                                                   →
```

**`pending` row:**
```
  staging.acme.com         eu-lon-1     ○ pending     —
  (no displayName)                                               →
```

**`failed` row — visual weight HIGHER than verified/pending (personality.md §7 "Failure outranks success"):**
```
╔══════════════════════════════════════════════════════════════╗
║  agents.acme.com          us-was-1    ✕ failed    4h ago    ║
║                                                              ║
║  TXT record `_blaxel-verify.agents.acme.com` not found.    ║
║  Check your DNS provider and retry verification →           ║
╚══════════════════════════════════════════════════════════════╝
```

**Row anatomy — failure outranks success specification:**
- `failed` rows render with a heavier visual container (the double-border box above illustrates elevated weight; token-level implementation — border color, background tint — deferred to screens phase). In contrast to `verified` / `pending` rows which render as standard table rows with no container.
- `failed` rows expand inline to show `spec.verificationError` as a one-line cause + a one-verb next move ("retry verification →" navigates to the domain detail with the DNS records visible).
- `failed` rows appear first in list order regardless of creation date — failure sorts to the top (personality.md Sacrificial choice #7).
- Color encoding: `failed` — high-contrast state color (token: `--color-state-error`); `pending` — muted amber (token: `--color-state-warning`); `verified` — muted/neutral (token: `--color-state-success`). Hue assignments deferred to screens phase per personality.md out-of-scope note; tokens are referenced here as placeholders.

**Sort order:** `failed` first → `pending` second → `verified` last. Within each group, sort by `metadata.createdAt` descending (newest first).

### Row click / navigation

Every row is clickable. Click navigates to `/custom-domains/{name}` — the Custom Domain detail page. The `→` chevron at the row end is a visual affordance for navigation (not a standalone action).

### `labels` display

If `metadata.labels` are set, they render as inline chips after the domain name on the row. Chips are read-only in the list view. API field: `metadata.labels` (key=value map). Example: `env:prod`, `team:infra`. If no labels, chips are omitted.

---

## Self-review checklist

- [x] **Inheritance** — no upstream wireframe for this screen (new surface); structure inherits shell from `app-shell.md`.
- [x] **Tokens** — `--color-state-error`, `--color-state-warning`, `--color-state-success`, `--color-primary` referenced. Screens phase assigns exact hue values.
- [x] **States** — Tier-3-locked (paywall) + loading + error + empty + populated + row-level `pending`/`verified`/`failed` all specified.
- [x] **Vocabulary** — "Custom domains" (lowercase d) per `platform.md:202` canonical vocabulary table throughout body copy and page headings. Sidebar IA label "Custom Domains" (capital D) stays as live-product nav label. "Sandbox previews", "API Key", "Policy", "Region" all verbatim. No synonyms.
- [x] **Drift** — (a) Create-domain drawer replaced with CLI-first guidance band + single-input minimal affordance per Sacrificial choice #5 and `personas.md:14`. (b) Tier-3 paywall preserved per operator-supplied production screenshot override; top-up route corrected to `account-billing.md` § B4 mechanism (not the invented "§ B2 Tier upgrade / top-up" anchor). (c) Persona path added to frontmatter per domain-review warning.

PASS
