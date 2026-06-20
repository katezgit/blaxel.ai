# Account Admin — Text Wireframe

**Surface:** Account > Account admin  
**Replaces:** two separate pages — Workspaces + Admins  
**Phase:** wireframes  
**Date:** 2026-06-19

---

## Page anatomy (top-to-bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  TOPBAR CHROME  [Tier 0]  [$10.00]  ...  [avatar]              │
├──────────────┬──────────────────────────────────────────────────┤
│              │  Account admin                                   │
│  SIDEBAR     ├──────────────────────────────────────────────────┤
│  Account     │  ① ACCOUNT IDENTITY                             │
│  ─────────   │  ② ADMINS                                       │
│  Plan &      │  ③ WORKSPACES                                   │
│   Quotas     │                                                  │
│  Billing     │                                                  │
│  Addons      │                                                  │
│ ▶ Account    │                                                  │
│    admin     │                                                  │
│  Login       │                                                  │
│   policy     │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

---

## Region ① — Account identity

**Scenario trace:** S1 (stakeholder read — account identifier), S3 (who administers this account)

```
Account identity
────────────────────────────────────────────────────────────────

  Owner email        katexuzy@gmail.com
  Tier               Tier 0

  This account holds 1 workspace. Workspaces are where your
  sandboxes, agents, and policies live.
```

**Notes:**
- Section header: "Account identity" — no edit affordance on this section.
- "Owner email" label + value: monospace-weight email, no edit field (account has no editable name per operator lock — identified by owner email + tier only).
- "Tier" value: plain text, same Tier label as topbar chip. Links to Plan & Quotas page. Not an edit target.
- Explanation line: one sentence, canonical nouns verbatim (`sandboxes`, `agents`, `policies`). Lowercase plural per platform.md conventions in body copy.
- No "org", "tenant", or "team" anywhere in this section.

---

## Region ② — Admins

**Scenario trace:** S3 (primary — "who has admin access to this account and how do I change that?"), S1 (secondary — account structure for stakeholder)

```
Admins                                              [+ Add admin]
────────────────────────────────────────────────────────────────
  Search admins…

  Full name     Email                    Role         Action
  ─────────────────────────────────────────────────────────────
  xu zy         katexuzy@gmail.com       [Owner ◆]    —
                                         ↑ tooltip: "Account
                                           creator. Cannot
                                           be removed."

  (empty below Owner row at Day-1 — no additional admins yet)
  ─────────────────────────────────────────────────────────────
  No other admins. [+ Add admin] to grant account-level access.
```

**Empty state (Day-1, only Owner present):**
```
  No other admins.
  Use [+ Add admin] to grant another person account-level access.
```

**With a second admin present:**
```
  Full name     Email                    Role         Action
  ─────────────────────────────────────────────────────────────
  xu zy         katexuzy@gmail.com       [Owner ◆]    —

  Jane Smith    jane@cubic.dev           [Admin]      [Remove]
  ─────────────────────────────────────────────────────────────
```

**Notes:**
- Owner row is **pinned at top** — always first, regardless of add date.
- Owner badge carries a distinct visual marker (◆ symbol, distinct from Admin badge) and no `Remove` action. The `—` dash in the Action column makes the absence of action explicit and intentional (not a bug).
- Tooltip on Owner badge: "Account creator. Cannot be removed." — triggered on hover of [Owner ◆] badge.
- Admin badge: plain filled chip, no symbol suffix. `[Remove]` action is a text button, no icon.
- `[+ Add admin]` CTA: in section header right rail. Pressing opens an inline form (email input + role set to Admin) below the table — no modal.
- Search: filters the Admin rows only. Does not filter Owner (Owner is always visible and pinned).
- Role vocabulary: "Owner" and "Admin" — no other labels. "Member" and "Role" do not appear here (those are workspace-scoped per platform.md).
- Removing an Admin: `[Remove]` inline on the row. No confirmation modal — show an undo toast ("Admin jane@cubic.dev removed — Undo") per personality.md §Disciplined.

---

## Region ③ — Workspaces

**Scenario trace:** S1 (account structure), S3 (cross-over), A2 (Tier 0 Alex who wants a second workspace — inline gate path)

### State A — Tier 0, 1/1 (Day-1 default)

```
Workspaces                                     1/1  [+ Create workspace ⊘]
────────────────────────────────────────────────────────────────────────────
  Tier 1 required — add payment method to create up to 5 workspaces.
  [Add payment method →]

  Search workspaces…

  Workspace          Created by     Created
  ──────────────────────────────────────────────────────────────────────────
  katezbuilds        xu zy          Jun 17, 2026
  ──────────────────────────────────────────────────────────────────────────
```

**Notes for State A:**
- Section header right rail: `1/1` chip (visually matches Plan & Quotas quota chip — same token, same language). The `1/1` is at-limit but does not show an error state; it is informative.
- `[+ Create workspace ⊘]` button: rendered disabled (⊘ suffix signals disabled state at a glance, but the button is visible and intentionally not hidden). Disabled button is NOT hidden per sacrificial choice #8 — it stays visible so Alex sees the action exists.
- Inline gate copy: sits directly below the section header / above the search field. One line + one CTA link. "Tier 1 required — add payment method to create up to 5 workspaces." — verbatim per operator lock. "[Add payment method →]" navigates to Billing > Config > Payment method section. **No modal. No paywall overlay. This is the entire gate.**
- `[Add payment method →]` is a text link, not a button. The primary CTA is the page the user navigates to; this is a pointer, not an action surface.

### State B — Tier 1+, under limit (e.g. 2/5)

```
Workspaces                                     2/5  [+ Create workspace]
────────────────────────────────────────────────────────────────────────────
  Search workspaces…

  Workspace          Created by     Created
  ──────────────────────────────────────────────────────────────────────────
  katezbuilds        xu zy          Jun 17, 2026
  prod-env           xu zy          Jun 18, 2026
  ──────────────────────────────────────────────────────────────────────────
```

**Notes for State B:**
- `[+ Create workspace]` is fully enabled. No inline gate copy visible.
- `2/5` chip: same visual language as Plan & Quotas. No at-limit indicator (not at limit).

### State C — Tier 1+, at limit (e.g. 5/5)

```
Workspaces                                     5/5 ▲  [+ Create workspace ⊘]
────────────────────────────────────────────────────────────────────────────
  Upgrade to Tier 2 to create up to 20 workspaces. [View plan →]

  Search workspaces…

  Workspace          Created by     Created
  ──────────────────────────────────────────────────────────────────────────
  katezbuilds        xu zy          ...
  ...5 rows...
  ──────────────────────────────────────────────────────────────────────────
```

**Notes for State C:**
- `5/5 ▲` chip: at-limit indicator (▲ triangle, same state-warning token as Plan & Quotas at-quota rows). The chip is still informative, not blocking.
- Inline gate copy: tier-specific messaging ("Upgrade to Tier 2"). Same structural pattern as State A.

### Workspace row — overflow menu

Each workspace row has a `…` overflow menu with: `Open workspace`, `Copy workspace slug`.  
No `Delete` action at this surface — workspace deletion, if it exists, belongs on the workspace's own settings surface, not on the account-level list.

---

## Inline form: Add admin (expands below section header on click of `[+ Add admin]`)

```
Admins                                              [+ Add admin]
────────────────────────────────────────────────────────────────
  ┌───────────────────────────────────────────────────────────┐
  │  Email address                                            │
  │  [email@example.com                                     ] │
  │                                                           │
  │  Role: Admin  (only assignable role; Owner is immutable)  │
  │                                                           │
  │  [Cancel]                          [Send invitation]      │
  └───────────────────────────────────────────────────────────┘

  Full name     Email                    Role         Action
  ...table rows...
```

**Notes:**
- Role field: read-only display ("Admin") — no dropdown, because the only role you can assign is Admin. Owner is immutable and cannot be assigned. Explaining this once in the form removes confusion without a tooltip.
- "Send invitation" sends an email invite. The invited person is not yet in the list until they accept; the row should show a "Pending" state badge once invited:

```
  Jane Smith    jane@cubic.dev           [Admin · Pending]    [Revoke]
```

- "Pending" badge: muted style (not the full Admin badge weight). `[Revoke]` instead of `[Remove]` for pending rows — semantically distinct action.

---

## Page states

### Loading state
All three sections render skeleton rows (1 row per section) while data resolves. Section headers visible immediately (static labels from the page shell).

### Error state (data fetch failed)
Per section, inline:
```
  Could not load [admins / workspaces]. Retry
```
No full-page error. Other sections render normally if their fetch succeeded.

### Empty state — Workspaces (edge case: account exists but workspace was deleted)
```
  No workspaces in this account.
  [+ Create workspace] to provision a new one.
```
This is an edge case; Day-1 Alex always has 1 workspace.

---

## Scenario traces (verification gate)

| Scenario | Where in wireframe | Answer in ≤10s? |
|---|---|---|
| S3 — "Who has admin access?" | Region ② Admins — first table below the fold break | PASS — Owner pinned at top with distinct badge, Admin rows below with email visible |
| S1 — "Show account structure to stakeholder" | Top-to-bottom read: ① email + tier → ② admins → ③ workspaces | PASS — coherent narrative in one scroll |
| A2 — Tier 0 wants a second workspace | Region ③ State A — inline gate copy + [Add payment method →] link visible adjacent to disabled button | PASS — no modal, inline path to payment method |

---

## Verification gate self-check

1. **Owner vs Admin distinction visually clear without reading text?**  
   PASS — Owner badge has ◆ suffix and no Remove action (explicit dash); Admin badge has no suffix and has Remove action. The visual asymmetry is structural, not copy-dependent.

2. **Tier 0 1/1 workspace state: inline gate visible, no modal?**  
   PASS — Region ③ State A shows `+ Create workspace ⊘` disabled, `1/1` chip at-limit, inline copy "Tier 1 required — add payment method to create up to 5 workspaces." and text link to Billing. No modal referenced anywhere in this wireframe.

3. **Account/workspace distinction explained in one line, not three paragraphs?**  
   PASS — Region ① contains exactly: "This account holds 1 workspace. Workspaces are where your sandboxes, agents, and policies live." Two sentences, no expansion.

4. **Every region has a scenario trace?**  
   PASS — ① traces S1, S3; ② traces S3, S1; ③ traces S1, S3, A2.

---

## Self-review (phase gate)

- [x] **Inheritance** — page structure derives from ia-proposal.md §1.4 (three sections in locked order); content derives from audit.md §1 + §3; scenarios.md S3, S1, A2 cross-over.
- [x] **Tokens** — no invented tokens; visual markers (chip, badge, disabled state, ▲ at-limit) reference the same token language as Plan & Quotas per ia-proposal.md cross-reference. Hue assignments deferred to design-token phase.
- [x] **States** — covered: default (Day-1), loading, error (per-section), empty (admin list, workspace edge case), Tier 0 at-limit (State A), Tier 1+ under-limit (State B), Tier 1+ at-limit (State C), pending invite.
- [x] **Vocabulary** — Account, Workspace, Owner, Admin, Member (not on this surface — correctly absent), Tier, Role: all per platform.md. "Tenant", "org", "project", "team" absent.
- [x] **Drift** — none. Page order (identity → admins → workspaces) matches operator-locked constraint verbatim.

PASS
