# Custom Domains — Text Wireframe (index / list page)

**Page:** Hosting › Custom Domains
**Route:** `/:workspaceSlugOrId/custom-domains`
**Phase:** Wireframes
**Date:** 2026-06-22
**Source scenarios:** Scenarios applicability — index/list screens: scenarios phase intentionally skipped per `design-phases.md`. Production reference: operator screenshot of current Tier-3-locked state; API reference: `spec.{name, displayName, region, status, cnameRecords, txtRecords, subjectAlternativeNames, fallbackPreviewId, lastVerifiedAt, verificationError, createdAt, createdBy, labels}`.

---

## Layout context

Rendered inside the workspace shell: left sidebar shows Hosting group with `Custom Domains` active. Topbar carries the workspace switcher (top-left) and identity utility (search ⌘K / bell / ? / avatar, top-right). Page content fills the main content area. The shell chrome is specified in `docs/design/wireframe/app-shell.md` — not re-specified here.

---

## Create-domain flow placement decision

**Decision: inline drawer on the list page, not a standalone `/create` route.**

Rationale: Custom domain registration is a short (3-field) operation — `name` (apex domain), `region`, and optional `displayName`. Alex reaches here from the CLI or from a team link; she enters the domain she already knows. A dedicated route (a) breaks the "one URL per primitive" URL contract before the domain exists, (b) adds a navigation hop, (c) forces a back-navigation to return to the list she was watching. The correct container is a right-side sheet or modal anchored to the list page. The sheet closes on successful submit and redirects to the new domain's detail page; on failure, it stays open and renders the API error verbatim (cause + next move, no apology). The "Add domain" primary action button in the page header triggers the sheet. This matches the `bl domain register <name> --region <region>` CLI command — one call, no wizard.

**Create form fields (inside sheet):**
- `Domain` — text input, required. Placeholder: `preview.acme.com`. API field: `spec.name`.
- `Region` — select. Options: `us-pdx-1 (Oregon)` / `us-was-1 (N. Virginia)` / `eu-lon-1 (London)` / `eu-fra-1 (Frankfurt)`. Required. API field: `spec.region`.
- `Display name` — text input, optional. API field: `metadata.displayName`.
- Submit: `Register domain` button (primary). Cancel: ghost, shown only when any field is dirty (form-actions guideline).
- Post-submit success → redirect to `/custom-domains/{name}` with `status=pending`.
- Post-submit error → error line inline below the form (API `verificationError` or HTTP error message), form stays open.

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
│  Custom Domains                                                │
│  Customer-owned DNS mapped to Sandbox preview URLs,           │
│  with managed TLS. Region-locked per domain.                   │
│                                              [Add domain]      │
└────────────────────────────────────────────────────────────────┘
```

- **Heading:** `Custom Domains` — canonical name from `platform.md`. Plural, capital D.
- **Subtitle:** States the primitive's purpose in one sentence. No marketing phrasing.
- **Primary action:** `Add domain` — disabled in Tier-3-locked state (greyed, cursor default, tooltip: "Upgrade to Tier 3 to register custom domains"). Enabled in all other states. Triggers the create sheet.

---

## STATE 1 — Tier-3 locked (paywall)

Triggered when the workspace account is below Tier 3. The Custom Domains route is reachable and visible in the sidebar (personality.md Sacrificial choice #8 — "Free surfaces visible, paid surfaces inline-gated"); the feature is gated at the point of use, not hidden.

```
┌────────────────────────────────────────────────────────────────┐
│  Custom Domains                                                │
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
│                                 │  Routes to account Billing   │
│  Wildcard support               │  top-up flow.               │
│  One domain covers all          │                              │
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
- **Right rail — upgrade CTA:** Section label "Ready to ship?" (matches production wording). Explanation sentence names the primitive (custom domains) and the action it unlocks. `Upgrade tier →` button (primary, orange per Blaxel brand — token: `--color-primary` / orange). Subdued text below button: "Routes to account Billing top-up flow." — so Alex knows where she's going before clicking.
- **"Upgrade tier →" links to:** `account-billing.md` § B2 "Tier upgrade / top-up" — the dedicated top-up / tier upgrade section of the Billing page. Route: `/account/billing#tier-upgrade`.
- **Layout:** Two-column. Left: ~60% width, feature description. Right: ~40% width, upgrade CTA rail. On narrow breakpoint: stacks, upgrade CTA above feature list.

**Interaction principle #11 compliance:** Feature is visible in the IA with tier requirement noted at the point of use. "Add domain" button is greyed with tooltip — not hidden.

---

## STATE 2 — Loading

Triggered when the workspace is Tier ≥ 3 and the list fetch is in flight.

```
┌────────────────────────────────────────────────────────────────┐
│  Custom Domains                                                │
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
│  Custom Domains                                                │
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
│  Custom Domains                                                │
│  Customer-owned DNS mapped to Sandbox preview URLs, …         │
│                                              [Add domain]      │
└────────────────────────────────────────────────────────────────┘

  Domain            Region       Status     Last verified
  ─────────────────────────────────────────────────────────────

  No custom domains in this workspace.
  bl domain register <apex-domain> --region us-pdx-1

```

- Empty state leads with the `bl …` command (personality.md Sacrificial choice #5 — CLI is the primary empty-state affordance).
- No illustration, no "Get started" CTA, no guidance wizard.
- Command is copyable (click-to-copy affordance on the mono code block).
- The `Add domain` button in the header remains enabled — it is the dashboard path for those who prefer the form.

---

## STATE 5 — Populated

Triggered when the workspace is Tier ≥ 3 and the API returns ≥1 domain. The table renders one row per Custom Domain resource.

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
- [x] **Vocabulary** — "Custom Domains" (capital D, plural) per `platform.md`. "Sandbox previews", "API Key", "Policy", "Region" all verbatim. No synonyms.
- [x] **Drift** — None from platform.md or personality.md. Production paywall framing (globe icon, feature list, right-rail CTA) preserved and noted.

PASS
