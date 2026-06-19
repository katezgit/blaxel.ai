# Workspace settings — Screen Wireframes

Routes:
- `/{slug}/settings/name`
- `/{slug}/settings/team`
- `/{slug}/settings/service-accounts`
- `/{slug}/settings/integrations`
- `/{slug}/settings/api-keys`

Default landing: `/{slug}/settings` redirects to `/{slug}/settings/name`.

Cross-links:
- [`docs/design/screens/app-shell.wireframe.md`](./app-shell.wireframe.md) — ManageShell anatomy + workspace switcher popover
- [`docs/design/screens/manage.wireframe.md`](./manage.wireframe.md) — personal + org settings screens

---

## 1. Tenancy-model anchor

`docs/product/platform.md` establishes a two-layer tenancy contract:

- **Account** holds billing-shape concerns that span all workspaces: plan / tier, credits, payment methods, invoices, SSO/SAML, account admins, workspace entitlement, usage analytics.
- **Workspace** holds operational concerns scoped to one resource boundary: members, resources, API keys, service accounts, integrations, policies, custom domains.

**Decision rule (verbatim from `platform.md`):** if a credential or identity acts on workspace resources, it belongs to the workspace.

This rule determines the IA. Name, Team, Service accounts, Integrations, and API keys are all workspace-operational concerns — each credential or identity in these sections acts on resources scoped to one workspace. They belong here, not under an Account shell. Personal API Keys (cross-workspace, user-identity-bound) are account-scoped and live separately under a future `/account/*` shell.

The live Blaxel product places Workspace API Keys under an Account section alongside Personal API Keys. That conflation violates the platform contract, creates scope ambiguity, and is the structural root of the operator-described prod-vs-staging incident. The workspace settings shell corrects it.

---

## 2. Vocabulary rule

`docs/product/platform.md` bans `org` and `organization` as synonyms for `workspace`. The terms are structurally wrong — they imply a different tenancy shape — and confuse users comparing Blaxel to tools that use "organization" to mean "account" (GitHub Orgs, Vercel Teams).

**Canonical terms:**
- Use **Workspace** / **workspace** everywhere in labels, copy, and code.
- The settings sidebar section is **Workspace settings** (not "Organization settings", not "Account settings").
- API keys are **workspace-scoped** (not "org-scoped").
- Members are **workspace members** (not "org members").

This rule applies to every string in `apps/portal/src/app/(app)/[workspaceSlugOrId]/settings/**`, the nav definition in `nav-groups.ts`, and any component that was carried over from the pre-rename shell.

---

## 3. Shell — workspace identity chrome

### 3.1 Why identity persistence is a safety affordance

The settings URL `/{slug}/settings/*` carries the workspace slug as the first path segment — that is one redundancy. The topbar workspace identity chip adds two more: workspace name (prominent) and account name (secondary). Three independent channels must agree before a user executes a destructive action. The operator's incident (cleaning prod while believing it was staging) is the failure mode of having zero visual redundancy beyond the URL.

### 3.2 Workspace settings sidebar

The sidebar is the workspace's `WorkspaceSettingsShell`. It carries exactly five nav items:

```
WORKSPACE SETTINGS
──────────────────
  [icon]  Name
  [icon]  Team
  [icon]  Service accounts
  [icon]  Integrations
  [icon]  API keys
```

Selected state follows the ManageShell convention from `app-shell.wireframe.md`: leading accent bar + full-width pill background (`bg-sidebar-accent`) + accent-colored label. The sidebar does not carry a workspace-switcher chevron — switching workspaces from within settings is blocked (switching mid-settings could produce confusing partial saves). The user exits to the app shell first, then switches.

### 3.3 Topbar workspace identity chip

The topbar `WorkspaceSettingsTopbar` renders a workspace identity chip in its left zone, immediately right of the `BrandMark`:

```
┌─ Settings topbar (left zone) ──────────────────────────────────────────────┐
│  [☰]  [Blaxel]  │  [WS]  webflow-prod                                      │
│                            katezbuilds                        ▾             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Workspace avatar** — `size="sm"` monogram circle, left of the name.
- **Workspace name** — `text-label font-medium text-foreground`. Full name, no truncation at `lg` / `md`. At `sm`: soft truncation with `max-w-[12ch]` + ellipsis (the URL remains the source of truth at that width).
- **Account name** — stacked under the workspace name: `text-caption text-meta-foreground`. Visible at `md+`; collapses into the chip's tooltip at `sm`.
- **Dropdown chevron** — opens the workspace switcher. Reuses the existing app-shell switcher dropdown; does not fork it.
- **Pathname preservation on workspace switch** — when the user selects a different workspace from the chip dropdown, the URL pathname after the slug segment stays identical; only the first segment changes. Example: `/webflow-prod/settings/team` → `/atlas-rl/settings/team`. Query string and hash are preserved. Resource-detail URLs with IDs that don't exist in the new workspace render the regular 404 — this is the honest outcome and does not require special handling.

### 3.4 Sub-shell sidebar return header

The existing `SubShellSidebarReturnHeader` renders `← Return to app` only. It stays as-is — the topbar chip is the primary identity surface; a third workspace-name render is redundant.

---

## 4. Screens

For all five screens:
- Page content column: `max-w-3xl mx-auto` (consistent with `manage.wireframe.md`).
- Page header: `<h1>` title + subhead in body text, no extra text-size class on the subhead.
- Save button: always visible, enabled only when the form is dirty and valid (per `form-actions.md`).
- Cancel: rendered only when the form is dirty.

### 4.1 Name (`/{slug}/settings/name`)

**Purpose.** The workspace's own identity record — name, slug, and the danger zone for deleting the workspace.

**Title.** "Workspace name"
**Subhead.** "How this workspace is identified. The slug is permanent."

**Form anatomy:**

```
┌─ Form ────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Display name                                                          │
│  ┌──────────────────────────────────────────┐                         │
│  │  webflow-prod                             │                         │
│  └──────────────────────────────────────────┘                         │
│  1–48 characters                                                       │
│                                                                        │
│  Slug                                                                  │
│  ┌──────────────────────────────────────┐  [Copy]                     │
│  │  webflow-prod                         │  (readonly)                 │
│  └──────────────────────────────────────┘                             │
│  Tooltip: "Slug is permanent — used in URLs and CLI."                  │
│                                                                        │
│  Account          katezbuilds   (static text, font-mono text-caption) │
│  Created          Apr 12, 2026  (static text)                         │
│                                                                        │
│                                                          [Save]        │
└────────────────────────────────────────────────────────────────────────┘
```

Save is `variant="primary"`, disabled when form is clean or display name is empty.

**Danger zone — delete workspace:**

Rendered as a separate zone below the form, bordered `border-state-danger/30`:

```
┌─ Danger zone ─────────────────────────────────────────────────────────┐
│                                                                        │
│  Delete workspace                                                      │
│  text-label font-medium text-destructive                               │
│                                                                        │
│  Permanently deletes all workspace resources. This cannot be undone.  │
│  text-body muted-fg                                                    │
│                                                                        │
│                                              [Delete workspace]        │
│                                              variant="danger"          │
└────────────────────────────────────────────────────────────────────────┘
```

Clicking "Delete workspace" opens the name-confirm modal (see §5 — Destructive-action confirmation pattern). The modal lists every resource class that will be deleted: sandboxes, volumes, agent drives, images, agents, jobs, MCP servers, model APIs, network rules, custom domains, API keys, service accounts, integrations, policies.

**States:**

| State | Behavior |
|---|---|
| Default | Form pre-filled with current name; Save disabled |
| Dirty | Save enabled; Cancel rendered |
| Saving | Save button shows spinner, disabled; form fields disabled |
| Success | Toast: "Workspace name updated" |
| Error | Inline error below the field; Save re-enabled |
| Empty name | Save disabled; inline validation: "Name is required" |

---

### 4.2 Team (`/{slug}/settings/team`)

**Purpose.** Member roster for the workspace. Primary jobs: invite teammates in batch, remove a leaver, audit who holds Admin, manage pending/expired invites, verify SSO/Directory-Sync sourcing.

**Title.** "Workspace team"
**Subhead.** "Members invited to this workspace and the role they hold."

**Top bar:**

```
[Search for a member]   [Role ▾] [Source ▾] [Status ▾]           [+ Invite users]
```

- Search filters by name and email, debounced.
- Filter dropdowns each open a checkbox popover with counts per option.
- No Columns toggle — four data columns do not need hiding.
- "Invite users" → `variant="primary"` with `Plus` icon → opens Invite users modal (§4.2.1).

**Table — columns (optimized for enterprise audit jobs):**

| Column | Sortable | Notes |
|---|---|---|
| ☐ | — | Row selection checkbox; selection surfaces bulk-action bar: Change role · Remove from workspace |
| **Member** | ✅ A→Z by name (default) | Name (`text-body font-medium`) + email (`text-caption text-meta-foreground font-mono`), stacked. Current user row shows `you` badge next to the name. |
| **Role** | ✅ Owner → Admin → Member | Icon + label. Owner (Crown icon), Admin (Shield icon), Member (User icon). |
| **Status** | ✅ Pending → Expired → Accepted | Pending (Clock icon, amber), Expired (X icon, muted), Accepted (Check icon, green). Pending sorts first — it is what needs attention. |
| **Source** | ✅ A→Z | Directory Sync · Invitation · Domain Capture · Local |
| `⋯` | — | Row menu: Change role · Remove from workspace; if Pending: Resend invite · Revoke invite; if Expired: Resend invite · Delete |

Inactive sortable column headers show a faint ↕ on hover. Active column shows ↑ (asc) or ↓ (desc). Default sort: Member A→Z.

**Workspace roles: Owner, Admin, Member** — three roles. "Organization" does not appear; `docs/product/platform.md` is authoritative for role names, and memory file `blaxel_workspace_roles.md` documents the three-role model.

**Empty states:**

- Filtered/searched with 0 results: inline above the empty table area — "No members match these filters" + Clear filters link.
- Unfiltered empty (no members at all): large illustration + "No members yet" + subhead explaining what members are + primary CTA "Invite your first teammate". (Unfiltered empty is theoretically impossible if the current user is a member, but the state is specced for resilience.)

#### 4.2.1 Invite users modal

**Title.** "Invite users"
**Subhead.** "Invite multiple emails with the same role. They'll receive a sign-up link."

```
┌─ Modal ───────────────────────────────────────────────────────────────┐
│                                                                        │
│  Emails                                                                │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  [alice@co.io ×]  [bob@co.io ×]  [invalid@ ×]     ...         │   │
│  │  (chip input — Enter / comma / paste-CSV commits a chip)       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│  Invalid emails: red underline chip + tooltip "Invalid email"          │
│                                                                        │
│  Role                                                                  │
│  ┌───────────────────┐                                                 │
│  │  Member        ▾  │  ← Admin / Member (no Owner in invite)         │
│  └───────────────────┘                                                 │
│  Applies to all invited emails.                                        │
│                                                                        │
│                                          [Cancel]  [Invite]            │
│                                                   variant="primary"    │
│                                                   disabled until ≥1    │
│                                                   valid email          │
└────────────────────────────────────────────────────────────────────────┘
```

On submit (mocked): inserts N rows into the team table with Status = Pending, Source = Invitation, Role = selected role. Toast: `"3 invited · 1 already a member · 0 failed"` (counts vary by mock logic — emails matching existing members count as "already a member"; report partial success). Modal closes on full success; stays open on full failure with errors inline. `Cmd/Ctrl + Enter` submits.

At `sm`: renders as a full-screen sheet (bottom drawer or full-screen dialog).

---

### 4.3 Service accounts (`/{slug}/settings/service-accounts`)

**Purpose.** Non-human identities scoped to this workspace — for integrations, CI/CD, and third-party services that act on workspace resources.

**Title.** "Service accounts"
**Subhead.** "Non-human identities for integrations, CI/CD, and third-party services that act on this workspace."

**Top bar:**

```
[Search for a service account]                         [+ Create service account]
```

No filters — service accounts are typically few; add filters when volume demands it.

**Table:**

| Column | Sortable | Notes |
|---|---|---|
| **Name** | ✅ | |
| **Client ID** | — | `font-mono text-caption`. Copy-on-click. |
| **Role** | ✅ | Same render as Team's Role column (Owner / Admin / Member). |
| **Created at** | ✅ | UTC-7 |
| `⋯` | — | Row menu: Rotate secret · Delete |

**No Client Secret column.** The live Blaxel screenshot shows Client Secret as a table column — that is a security defect. Secrets shown after creation must use the one-time-reveal-then-store pattern (see §4.3.1). The table never re-renders a secret value.

**Empty states:**

- First-create empty: illustration + "No service accounts yet" + one-sentence explainer (same content as the subhead, collapsed here) + "Create your first service account" CTA (primary).
- Filtered/searched empty: inline "No service accounts match" + Clear search link.

#### 4.3.1 Create service account modal

**Form.** Name (1–48 chars) · Role dropdown (default Member).

**On submit — one-time reveal screen (replaces form body inside the modal):**

```
┌─ Modal ───────────────────────────────────────────────────────────────┐
│  ✓  Service account created                                            │
│                                                                        │
│  Client ID      bxl_svc_a8d2…    [Copy]                               │
│  Client Secret  s4_xR9k…         [Copy] [Reveal]                      │
│                                                                        │
│  ⚠  Save the secret now. We'll show it once.                          │
│                                                                        │
│                                                   [I've saved it]     │
└────────────────────────────────────────────────────────────────────────┘
```

The "I've saved it" button dismisses the modal. Closing via the × button or clicking outside while the secret is still uncopied triggers a confirm: "Close without copying the secret?" — Cancel / Close anyway.

---

### 4.4 Integrations (`/{slug}/settings/integrations`)

**Purpose.** Connect model providers, MCP servers, and external tools to this workspace.

**Title.** "Integrations"
**Subhead.** "Connect model providers, MCP servers, and external tools to this workspace."

**Layout — `lg+` / `md`:**

```
┌─ lg+ / md ────────────────────────────────────────────────────────────┐
│                                                                        │
│  ┌─ Categories (~200px) ─┐   ┌─ Content header ────────────────────┐  │
│  │  All                  │   │  [Search integrations]   [Type ▾]   │  │
│  │  Enabled         (2)  │   └────────────────────────────────────  │  │
│  │  Model                │                                           │  │
│  │  MCP server           │   ┌─ Card grid (3-col lg / 2-col md) ──┐ │  │
│  │                       │   │  [card]  [card]  [card]             │ │  │
│  │                       │   │  [card]  [card]  [card]             │ │  │
│  └───────────────────────┘   └────────────────────────────────────  │  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**Layout — `<md`:**

```
┌─ <md ─────────────────────────────────────────────────────────────────┐
│  [Showing: All (24) ▾]  [Search integrations]  [Type ▾]               │
│                                                                        │
│  ┌─ Card grid (1-col) ─────────────────────────────────────────────┐  │
│  │  [card]                                                          │  │
│  │  [card]                                                          │  │
│  └──────────────────────────────────────────────────────────────── ┘  │
└────────────────────────────────────────────────────────────────────────┘
```

**Categories rail (left, `md+`):** vertical button-style nav with active state. Items: All · Enabled (with count badge `(N)`) · Model · MCP server. Rail is a vertical list, not tabs — tabs scale poorly past 5–6 items as integrations proliferate; the rail scales freely. Below `md`: the rail collapses into a top dropdown ("Showing: All (24) ▾").

**Content header:** search input + Type filter chip (`mcp server` / `model`). Search is debounced on keystroke; filters cards in place. Co-located above the grid, not in the left rail — search and grid are sibling content concerns; crossing the rail boundary to search creates unnecessary eye movement.

**Integration cards:**

```
┌─ card ──────────────────────────────────────────────────────┐
│  [logo 40px]  Name (text-body font-medium)                  │
│               Two-line description                          │
│  ──────────────────────────────────────────────────────  │
│               [mcp server]  ← type chip, text-meta          │
└─────────────────────────────────────────────────────────────┘
```

- "Coming soon" cards: dim the card, add a `Coming soon` ribbon top-right, entire card non-interactive.
- Click → routes to `/{slug}/settings/integrations/[slug]` stub (if route exists) or no-op if not yet wired.

**Empty state (search returns 0):** inline "No integrations match" + Clear search link.

---

### 4.5 API keys (`/{slug}/settings/api-keys`)

**Purpose.** Workspace-scoped credentials for the API and CLI. Credentials in this section act on workspace resources; therefore they are scoped to the workspace, not to the account. Personal API Keys (cross-workspace, user-bound) are out of scope for this shell and live in the future `/account/*` shell.

**Title.** "API keys"
**Subhead.** "Workspace-scoped credentials for the API and CLI. Issued to a Member or a Service account; the holder's Role decides what the key can do."

**Top bar:**

```
[Search for a key]                                         [+ Create API key]
```

**Table:**

| Column | Sortable | Notes |
|---|---|---|
| **Name** | ✅ | |
| **Issued to** | ✅ | Member name OR Service account name. Small icon distinguishes: User icon for member, UserCog icon for service account. |
| **Key prefix** | — | Masked body — shows `bxl_xxxx…1234`. `font-mono text-caption`. Copy-on-click copies the prefix (not a usable key — prefix is read-only display). |
| **Expires in** | ✅ | Relative (e.g. "in 87 days", "Expired 3 days ago"). |
| **Created at** | ✅ | UTC-7. |
| `⋯` | — | Row menu: Rotate · Revoke |

No "Personal API Keys" section. Any pre-existing "Personal API Keys" section is removed — it violated the workspace vs account scope boundary (audit § 2.D finding).

**Empty state:** "No API keys yet" + "Create your first API key" CTA (primary).

#### 4.5.1 Create API key modal

```
┌─ Modal ───────────────────────────────────────────────────────────────┐
│                                                                        │
│  Name                                                                  │
│  ┌────────────────────────────────────┐                               │
│  │                                     │                               │
│  └────────────────────────────────────┘                               │
│  1–48 characters                                                       │
│                                                                        │
│  Holder                                                                │
│  ○ Member   ● Service account  ← radio group; switches next field     │
│                                                                        │
│  Service account                                                       │
│  ┌────────────────────────────────────┐                               │
│  │  Select…                        ▾  │                               │
│  └────────────────────────────────────┘                               │
│                                                                        │
│  Expires in                                                            │
│  ┌────────────────────────────────────┐                               │
│  │  Never                          ▾  │  ← Never / 30 days /          │
│  └────────────────────────────────────┘     90 days / 365 days        │
│                                                                        │
│                                          [Cancel]  [Create]           │
└────────────────────────────────────────────────────────────────────────┘
```

On submit: one-time reveal of the full key (same modal-body-swap pattern as Service accounts §4.3.1). Subsequent renders in the table show prefix only.

---

## 5. Destructive-action confirmation pattern

Applies to all four destructive actions across these screens:
- Delete workspace (Name page)
- Revoke API key (API keys page)
- Delete service account (Service accounts page)
- Remove member from workspace (Team page row menu)

**Pattern — name-confirm modal:**

```
┌─ Confirm: [Action] "[Resource name]" ────────────────────────────────┐
│                                                                        │
│  [One-sentence consequence description.]                               │
│                                                                        │
│  Type the workspace name to confirm:                                   │
│  ┌──────────────────────────────────┐                                 │
│  │  webflow-prod                     │  ← placeholder = workspace name │
│  └──────────────────────────────────┘                                 │
│                                                                        │
│                                         [Cancel]  [action label]      │
│                                                    variant="danger"   │
└────────────────────────────────────────────────────────────────────────┘
```

- Modal title names the target resource and action: "Revoke API key 'ci-deploy-key'" (not just "Confirm").
- Action button is disabled until the typed input matches `workspace.name` exactly (case-sensitive).
- Action button uses `variant="danger"`.
- The wrong-workspace incident becomes structurally impossible: typing `webflow-prod` in a `webflow-staging` context will not match.

**Per-action consequence copy:**

| Action | Consequence line |
|---|---|
| Delete workspace | "Permanently deletes all workspace resources. This cannot be undone." |
| Revoke API key | "Any CLI, SDK, or integration using this key will start receiving 401 responses." |
| Delete service account | "The service account and its associated API keys will be permanently removed." |
| Remove member | "This member will lose all access to this workspace immediately." |

---

## 6. Cross-screen patterns

### 6.1 Settings-shell identity persistence

The workspace identity chip (§3.3) is present on every screen in the settings shell. Navigating between Name · Team · Service accounts · Integrations · API keys keeps the chip in the same topbar position. There is no screen in this shell where the user cannot see which workspace they are editing.

### 6.2 Secret reveal — one-time pattern

Both Service accounts and API keys use the same one-time-reveal pattern: the full secret is shown once inside a modal immediately after creation, with a prominent warning and a copy button. The table never renders a secret value post-creation. The close path requires either the user to confirm they have saved, or a dismiss-without-copying confirm.

### 6.3 Vocabulary sweep

No string in the workspace settings shell reads "org", "organization", or "org-scoped". The canonical noun is "workspace" or "workspace-scoped". This rule applies to visible copy, `aria-label` values, toast messages, error strings, and code-level labels that produce visible text.

### 6.4 Role-gating display convention

Follows the convention established in `manage.wireframe.md`: restricted fields and actions are visible but non-interactive to non-owners, with a tooltip: "Only the workspace owner can do this." Items are never hidden — hidden gating creates confusion about whether features exist. Visible-but-disabled gating educates about what the feature is and who controls it.

---

## Out of scope

- Per-integration config detail pages (`/{slug}/settings/integrations/[slug]`).
- Per-service-account detail page (keys held, last used, scopes).
- Personal API Keys — account-scoped, future `/account/*` shell.
- Workspace delete confirmation warnings beyond the name-confirm modal (e.g., "you have N running sandboxes" pre-flight check).
- Real backend wiring — all data is mocked in this phase.
- Role / Policy management screens.
- Motion and transition specs — motion-designer's layer.

---

*Derived from: `docs/product/platform.md` (tenancy model + terminology), `docs/product/personas.md`, `.intermediate/discovery/workspace-settings/audit.md` (IA decisions, per-page findings, cross-cutting decisions), `.intermediate/discovery/workspace-settings/brief.md` §1 + §4 + §5 (outcome summary, per-page specs, destructive-action pattern). Sibling wireframes: [`app-shell.wireframe.md`](./app-shell.wireframe.md), [`manage.wireframe.md`](./manage.wireframe.md).*
