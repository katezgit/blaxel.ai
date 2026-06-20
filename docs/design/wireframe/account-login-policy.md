# Wireframe — Login policy

**Surface**: Account > Login policy
**Route**: `/account/login-policy`
**Phase**: Account IA redesign (replaces Authentication & SSO)
**Audience**: Sam (S2 — enforce company domain login); Day-1 Alex (non-failure path)
**Source scenarios**: S2 (scenarios.md), Day-1 Alex friction point #1 (audit.md § 2)

---

## Page shell

```
┌─────────────────────────────────────────────────────────────────┐
│  [App chrome — topbar: tier badge · credit balance · avatar]    │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│  Account     │   Login policy                                    │
│  ──────────  │   Control how users authenticate to this account. │
│  Plan &      │                                                   │
│  Quotas      │   ─────────────────────────────────────────────  │
│              │                                                   │
│  Billing     │   [SECTION 1]                                     │
│              │   [SECTION 2]                                     │
│  Addons      │                                                   │
│              │                                                   │
│  Account     │                                                   │
│  admin       │                                                   │
│              │                                                   │
│  Login       │                                                   │
│  policy  ←   │                                                   │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

**Page title**: `Login policy`
**Page subtitle**: `Control how users authenticate to this account.`

Notes:
- No tier gate on this page. Available on all tiers (no paywall gate observed in live product for Auth/SSO). Flag: verify this against platform.md tier table before implementation — if a gate exists, apply inline per personality.md §8, not a blocking modal.
- No page-level primary CTA in the header. Actions are scoped to each section.

---

## Empty state — Day-1 Alex (no domain, no SAML configured)

Rendered when: zero domains configured AND SAML not configured.

```
┌─────────────────────────────────────────────────────────────────┐
│  Login policy                                                   │
│  Control how users authenticate to this account.               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  No login policy configured. Add a domain when you want to     │
│  enforce login methods for users on your company email.         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Empty state copy**: "No login policy configured. Add a domain when you want to enforce login methods for users on your company email."

Copy rationale:
- Names what's absent without implying something is broken. Alex reads: "ok, this is for something I don't have yet."
- "Company email" signals whose concern this is (an employer with a domain), not a general user concept.
- No enterprise jargon (no "IdP", no "SAML", no "SSO enforcement", no "domain verification protocol").
- No "get started" CTA, no illustration, no "you're missing something" energy. Consistent with personality.md → Disciplined / counterexample: "The illustration empty state."
- Alex's 10-second read: "login policy, no config, this is for company email enforcement — not for me yet." She leaves without confusion. Operator friction point #1 addressed.

The two sections (Enforce login method by email domain, Enterprise SSO) are NOT rendered in the empty state. The full page layout below appears once at least one domain has been added OR the user has interacted with the SAML section expand.

---

## Partially configured state — domain added, SAML not configured

Rendered when: ≥1 domain exists, SAML not configured.

Both sections render. SAML section remains collapsed (default). Domain section shows the configured domain + verification status.

---

## Full page layout (default — no config yet, sections always visible)

Design note: the empty state above is the Day-1 no-action-taken view. After the user dismisses it or as a second visit, sections render inline so Sam can act without extra clicks. The empty-state and section-layout are complementary: empty state = first visit with zero config; section layout = any visit where the user has opened the page intending to act (or has already configured something).

Implementation note: render both sections always (no two-step "start configuring" interstitial). The empty state copy at the top replaces the section-level empty messages when nothing is configured. Once the user adds a domain, the page transitions to the section layout with the domain listed.

```
┌─────────────────────────────────────────────────────────────────┐
│  Login policy                                                   │
│  Control how users authenticate to this account.               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Enforce login method by email domain                    │   │
│  │ Require users who sign in with a company email address  │   │
│  │ to use a specific login method.                         │   │
│  │                                                         │   │
│  │ ┌──────────────────────────────────────┐  [Add domain] │   │
│  │ │ acme.com                             │               │   │
│  │ └──────────────────────────────────────┘               │   │
│  │                                                         │   │
│  │ [Domain list — empty or populated — see below]         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Enterprise SSO (SAML)                          [›]      │   │
│  │ Connect a SAML identity provider.                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Section 1 — Enforce login method by email domain

**Section header**: `Enforce login method by email domain`
**Section description**: `Require users who sign in with a company email address to use a specific login method.`

### Sub-state A — no domains configured

```
  Enforce login method by email domain
  Require users who sign in with a company email address to use a
  specific login method.

  ┌──────────────────────────────────┐  [Add domain]
  │ acme.com                         │
  └──────────────────────────────────┘

  No domains configured.
```

"No domains configured." — minimal, no jargon, no implication of a problem.

### Sub-state B — domain added, pending DNS verification

```
  Enforce login method by email domain
  Require users who sign in with a company email address to use a
  specific login method.

  ┌──────────────────────────────────┐  [Add domain]
  │ acme.com                         │
  └──────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────┐
  │  acme.com                           [Pending verification]   │
  │  ─────────────────────────────────────────────────────────   │
  │  Verify domain ownership via DNS TXT record.                 │
  │                                                              │
  │  Add a TXT record to your DNS provider:                      │
  │                                                              │
  │  Type    TXT                                                  │
  │  Name    @                                                    │
  │  Value   blaxel-verify=a1b2c3d4e5f6...          [Copy]       │
  │                                                              │
  │  DNS changes can take up to 48 hours to propagate.          │
  │  [Verify now]                          [Remove domain]       │
  └──────────────────────────────────────────────────────────────┘
```

Notes:
- DNS TXT copy stays compact. Sam (S2) knows what a TXT record is; no tutorial language.
- "DNS changes can take up to 48 hours to propagate." — factual, not a hedge.
- `[Copy]` on the TXT value — Sam pastes it directly into the DNS provider.
- `[Verify now]` — triggers re-check of DNS.
- `[Remove domain]` — destructive, secondary weight.

### Sub-state C — domain verified, login method enforced

```
  ┌──────────────────────────────────────────────────────────────┐
  │  acme.com                                  [Verified ✓]      │
  │  ─────────────────────────────────────────────────────────   │
  │  Enforce login method:  [Google ▼]                           │
  │                                                              │
  │  Users on this domain must sign in with Google.             │
  │                                                              │
  │  [Save]                                [Remove domain]       │
  └──────────────────────────────────────────────────────────────┘
```

Login method options (dropdown): Google / GitHub / Email / Any (default — no enforcement)

Notes:
- "Users on this domain must sign in with Google." — plain restatement of the selected enforcement. Confirms the effect in one line without jargon.
- `[Save]` visible when method selection has changed. Follows form-actions.md: Save always visible/enabled when field is dirty.
- Multiple domains: each domain appears as its own row in the list, collapsible per domain. No tabs, no accordion — flat list of domain rows.

---

## Section 2 — Enterprise SSO (SAML)

**Section header**: `Enterprise SSO (SAML)`
**Default state**: Collapsed. The section renders as a single header row with an expand affordance `[›]`.
**Tier gate (locked 2026-06-19)**: SAML is **Tier 1+**. Tier 0 users see the section (visible per personality.md sacrificial choice #8 "Free surfaces visible, paid surfaces inline-gated") but expanded form is replaced with inline gate copy + payment link. No surprise modal.

Rationale for collapse-by-default:
- SAML config is a heavier, narrower-audience task than domain auth. A Sam who needs domain enforcement (S2 most common path) does not need to navigate around SAML config every time she visits. Collapsing SAML keeps the domain section dominant for the common case.
- When Sam or an enterprise admin needs SAML, the header is labeled and findable — one click to expand.
- Collapse-by-default is not a hide; the section is always visible as a header. Consistent with personality.md § Composed (primitives adjacent and named, not tucked away).

### Collapsed state (any tier)

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Enterprise SSO (SAML)                  [Tier 1+]  [›]        │
  │ Connect a SAML identity provider.                            │
  └─────────────────────────────────────────────────────────────┘
```

`[›]` = expand affordance. `[Tier 1+]` chip appears only when current tier is below 1; on Tier 1+ accounts the chip is omitted. Label: `Configure SAML` as the CTA text on the row or inside a button within the row.

### Expanded state — Tier 0 (gated)

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Enterprise SSO (SAML)                  [Tier 1+]  [∨]        │
  │ Connect a SAML identity provider.                            │
  │ ─────────────────────────────────────────────────────────── │
  │                                                              │
  │  Tier 1 required — add payment method to configure           │
  │  enterprise SSO.  [Add payment method →]                     │
  │                                                              │
  └─────────────────────────────────────────────────────────────┘
```

Inline-gate copy follows the locked stem `Tier 1 required — add payment method to [verb]` (see `account-plan-quotas.md`, `account-admin.md` for sibling instances). `[Add payment method →]` is a text link to Stripe payment setup. No SAML form fields render on Tier 0 — the user sees the gate, not the configuration shape they cannot use.

### Expanded state — Tier 1+, SAML not configured

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Enterprise SSO (SAML)                             [∨]        │
  │ Connect a SAML identity provider.                            │
  │ ─────────────────────────────────────────────────────────── │
  │                                                              │
  │ Service Provider details                                     │
  │                                                              │
  │ SSO URL                                                      │
  │ https://app.blaxel.ai/sso/saml/callback        [Copy]       │
  │                                                              │
  │ Entity ID (Audience URI)                                     │
  │ https://app.blaxel.ai/sso/saml/metadata        [Copy]       │
  │                                                              │
  │ ─────────────────────────────────────────────────────────── │
  │ Identity Provider details                                    │
  │                                                              │
  │ IdP SSO URL                                                  │
  │ ┌──────────────────────────────────────────────────────┐    │
  │ │ https://your-idp.com/sso/saml                        │    │
  │ └──────────────────────────────────────────────────────┘    │
  │                                                              │
  │ IdP Certificate (X.509)                                      │
  │ ┌──────────────────────────────────────────────────────┐    │
  │ │ Paste certificate here...                            │    │
  │ │                                                      │    │
  │ └──────────────────────────────────────────────────────┘    │
  │                                                              │
  │ [Save SAML configuration]                                    │
  └─────────────────────────────────────────────────────────────┘
```

Notes:
- SP details (SSO URL, Entity ID) are read-only with `[Copy]`. Sam copies these into the IdP admin console first.
- IdP details (IdP SSO URL, IdP Certificate) are the inputs Sam receives from the IdP admin console.
- No SAML tutorial copy. Sam configuring SAML knows what an X.509 certificate is.
- `[Save SAML configuration]` — primary CTA, always visible within the expanded form per form-actions.md.

### Expanded state — SAML configured

```
  ┌─────────────────────────────────────────────────────────────┐
  │ Enterprise SSO (SAML)                             [∨]        │
  │ Connect a SAML identity provider.                            │
  │ ─────────────────────────────────────────────────────────── │
  │                                                              │
  │ SAML configured                       [Active ●]            │
  │ IdP SSO URL: https://your-idp.com/sso/saml                  │
  │ Certificate: expires 2027-01-01                             │
  │                                                              │
  │ [Edit configuration]           [Remove SAML configuration]  │
  └─────────────────────────────────────────────────────────────┘
```

Notes:
- `[Active ●]` — state badge using color-as-state rule (personality.md interaction principle #4). Green dot = SAML active. Not a label; a state.
- Certificate expiry surfaced inline. Alex-grade transparency for an ops concern Sam should track.
- `[Remove SAML configuration]` — destructive, secondary weight. Confirm pattern required at implementation (modal or inline confirm).

---

## Scenario traces

### S2 — Sam: enforce Google Workspace for company domain (primary scenario)

1. Sam navigates to Account > Login policy.
2. Page title "Login policy" + subtitle "Control how users authenticate to this account" confirm she's in the right place. Section 1 header "Enforce login method by email domain" names Sam's job.
3. Sam types `acme.com` in the domain input, clicks `[Add domain]`.
4. Domain appears as "acme.com — Pending verification." DNS TXT record shown with `[Copy]` on the value.
5. Sam adds the TXT record to the DNS provider, clicks `[Verify now]`.
6. Domain shows "Verified ✓." Login method dropdown appears. Sam selects "Google."
7. `[Save]` CTA is active. Sam saves. Confirmation: "Login method for acme.com set to Google."
8. All future users signing in with an `@acme.com` address must use Google.

S2 passes: Sam found the right section by job name (step 2), completed DNS verification with compact technical copy (step 4–5), and set the enforcement method (step 6–7) without navigating away from the page.

### Day-1 Alex — non-failure path

1. Alex clicks "Login policy" in the Account sidebar out of curiosity.
2. Page shows: "Login policy / Control how users authenticate to this account." followed by the empty state: "No login policy configured. Add a domain when you want to enforce login methods for users on your company email."
3. Alex reads: "ok, this is for company email enforcement. I don't have that. Not for me."
4. Alex closes the page or navigates away. No confusion. No enterprise jargon encountered. No broken-state impression.

Day-1 Alex passes: she sees a page that names its job, reads an empty state that explains the context without jargon, concludes "not for me yet," and leaves without friction. Operator friction point #1 addressed.

---

## Verification gate self-check

**(1) Page title and section headers name jobs, not mechanisms.**
- "Login policy" → names the job (setting a policy for login), not the mechanism (authentication protocol, SSO).
- "Enforce login method by email domain" → names Sam's job (S2: "lock our company domain to a specific login method").
- "Enterprise SSO (SAML)" → hybrid: names the mechanism AND the enterprise-scale job. SAML is retained in parens as a technical identifier for Sam who will search/scan for it; the section label leads with "Enterprise SSO" not "SAML 2.0 Configuration." Acceptable: Sam needs to recognize "SAML" here because that's what she'll look for.
- PASS.

**(2) Empty state passes the Day-1 Alex test.**
- "No login policy configured. Add a domain when you want to enforce login methods for users on your company email."
- No enterprise jargon (no SAML, no IdP, no SSO, no domain verification protocol).
- Does not read as "you're missing something." Reads as "this exists for a specific need you don't have yet."
- Alex concludes "not for me" and moves on.
- PASS.

**(3) Scenario trace on every region.**
- S2 trace complete (steps 1–8 above). Every region (input, DNS TXT block, verify, login method dropdown, save) has a step.
- Day-1 Alex trace complete. Empty state is the only region she needs.
- PASS.

---

## Self-review (phase-exit checklist)

- [x] **Inheritance** — inherits from ia-proposal.md § 1.5 (Login policy) and scenarios.md S2. All locked constraints applied verbatim.
- [x] **Tokens** — wireframe is structural/copy-level; no token references made. Token phase is downstream; no invented tokens introduced.
- [x] **States** — default (no config), empty (Day-1 Alex), partially configured (domain pending, domain verified), fully configured (SAML active), error states (DNS verify failure) noted at implementation boundary.
- [x] **Vocabulary** — "Account" verbatim throughout. No "org," "tenant," "workspace" used for account-level scope. Canonical product terms (Login policy, domain) used; SAML retained as a technical identifier inside section 2.
- [x] **Drift** — SAML section header retains "(SAML)" in parens: deviation from pure job-naming rule, justified because Sam recognizes "SAML" as the search term and the parens-qualifier pattern keeps the job label ("Enterprise SSO") primary. No other drift from upstream constraints.

**PASS.**

---

## Flags for operator / implementation

1. **Tier gate**: no tier gate applied. Verify against current live product before implementation — if SAML is gated to a paid tier, apply inline gate per personality.md §8 ("Requires Tier N — add payment method to unlock") on the Enterprise SSO section header, not a page-level block.
2. **DNS propagation window**: "up to 48 hours" is the copy placeholder. Verify with engineering the actual propagation timeout Blaxel uses before shipping.
3. **Login method options**: Google / GitHub / Email / Any (no enforcement) assumed from current product. Verify the actual enforced-method options with engineering.
4. **SAML SP metadata**: SSO URL and Entity ID values are illustrative. Engineering supplies real values.
5. **Error state — DNS verify failed**: not fully wireframed. Inline error under `[Verify now]` with cause ("TXT record not found — check that the record has propagated") follows personality.md error voice. Error copy finalized at screens phase.
6. **Multiple domains**: wireframe shows single-domain flow. Multi-domain list (domain-per-row, collapsible) is described but not fully expanded. Screens phase to finalize the list pattern.
