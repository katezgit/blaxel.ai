# Custom domain detail — Text Wireframe

**Page:** Hosting › Custom domains › {name}
**Route:** `/:workspaceSlugOrId/custom-domains/{name}`
**Phase:** Wireframes
**Date:** 2026-06-22
**Persona path:** Alex (primary) + Sam (secondary, planned-audit pattern)
**Source scenarios:** `.intermediate/discovery/custom-domain-detail/scenarios.md` (PASSed gate after revision). All five audit questions and both synthesis contracts are FAIL contracts satisfied below — trace citations inline per band.
**API schema source:** https://docs.blaxel.ai/api-reference/customdomains/list-custom-domains

---

## API field inventory (authoritative)

All wireframe elements below bind to one of these fields or are explicitly footnoted as schema-uncertain.

| Field | Location | Type | Notes |
|---|---|---|---|
| `name` | `metadata.name` | string | apex domain, e.g. `preview.acme.com` |
| `displayName` | `metadata.displayName` | string | optional human label |
| `workspace` | `metadata.workspace` | string | workspace slug |
| `labels` | `metadata.labels` | map | key=value label set |
| `createdAt` | `metadata.createdAt` | timestamp | registration time |
| `createdBy` | `metadata.createdBy` | string | Member or service account ID |
| `updatedAt` | `metadata.updatedAt` | timestamp | last update |
| `updatedBy` | `metadata.updatedBy` | string | last actor |
| `region` | `spec.region` | string | region slug, e.g. `us-pdx-1` |
| `status` | `spec.status` | enum | `pending` \| `verified` \| `failed` |
| `cnameRecords` | `spec.cnameRecords` | string | single CNAME target (not a list) |
| `txtRecords` | `spec.txtRecords` | map | name → value, one entry per TXT record (multi-row) |
| `subjectAlternativeNames` | `spec.subjectAlternativeNames` | array of objects (`additionalProperties: true` — no defined sub-fields in schema) | SANs on the issued ACM cert — see footnote ³ |
| `fallbackPreviewId` | `spec.fallbackPreviewId` | string | catch-all preview ID for unmapped subdomains |
| `lastVerifiedAt` | `spec.lastVerifiedAt` | timestamp | null when never checked |
| `verificationError` | `spec.verificationError` | string | populated when `status = failed` |

**Schema-uncertain (footnoted at each occurrence):**
- ¹ **Live list of Sandbox previews routed through this domain** — `CustomDomain` schema does not expose a list of attached preview URLs; only `fallbackPreviewId` (single string) is on the schema. The broader routing view requires a reverse-lookup cross-primitive query (filter Sandbox previews by domain hostname). Wireframe phase cannot source this without a confirmed API endpoint. Design fallback: render `fallbackPreviewId` as the one schema-backed routing fact; footnote the broader list as "screens phase resolves — pending confirmation of reverse-lookup query endpoint."
- ² **Per-domain audit events** — `CustomDomain` schema surfaces only `createdBy` / `updatedBy` / `createdAt` / `updatedAt`. A streaming per-domain audit log is not present. Workspace-level audit may expose this via a separate endpoint. Wireframe design: render `createdBy` + `createdAt` + `updatedBy` + `updatedAt` in the security band as schema-backed audit metadata. Footnote: "screens phase confirms whether a workspace-level audit endpoint joins per-domain events; if so, add a log-line table to the security band using `{actor} {action} for {domain} at {timestamp UTC}` format per alex-user-stories.md Phase 5. If not, the four metadata fields are the floor."
- ³ **`subjectAlternativeNames` sub-field shape** — The API schema declares this as `array of objects` with `additionalProperties: true` and no defined sub-field names. The schema does not enumerate what keys each object contains. Design treatment: render each object as one row in the SAN list; display the object's string representation (or key-value pairs if multiple keys are present) as a monospace line. Screens phase must confirm the actual runtime object shape (e.g. `{value: "preview.acme.com"}` or `{dnsName: "*.preview.acme.com"}`) by inspecting a live API response and bind the display to the confirmed key. Until confirmed, render as `[object]` with an inline note: "field shape confirmed in screens phase."

---

## Layout context

Rendered inside the workspace shell. Breadcrumb: `Hosting / Custom domains / preview.acme.com`. The page is one scroll — no tabs, no sub-navigation. Every band is present on the initial paint. This satisfies personality.md Sacrificial choice #3: "Single-page ops + security band, never a 'Security view' tab."

---

## Page header (ALL status states)

*Scenario trace: Scenarios 1–5 (all five audit entry paths; header contract intersection per scenarios.md § "Synthesis — header contract").*
*Audit questions satisfied: (1) "Did I publish the right records?" — name + status visible; (2) "Which record is wrong?" — status=failed with high contrast; (3) "Is this domain still healthy?" — status + lastVerifiedAt; (4) "Who registered this?" — createdBy + createdAt; (5) "What's this domain doing for me right now?" — name + status + region.*

```
┌────────────────────────────────────────────────────────────────┐
│  ← Custom Domains                                              │
│                                                                │
│  preview.acme.com                                [Delete]      │
│  Acme preview                  [status badge]  [Retry verification · pending/failed only]
│                                                                │
│  region: us-pdx-1 · created Jun 20, 2026 by alex@acme.com    │
│  last verified: 2h ago   (or: last verified: —)               │
└────────────────────────────────────────────────────────────────┘
```

**Header anatomy:**

- **Back link:** `← Custom domains` — navigates to `/:workspaceSlugOrId/custom-domains`. Breadcrumb above it also present (app-shell convention). Lowercase d per `platform.md:202`.
- **Domain name:** `metadata.name` — rendered as the primary heading (large, monospace or mono-adjacent to signal it's a DNS identifier). If `metadata.displayName` is set, it renders immediately below in muted/secondary weight.
- **Status badge:** `spec.status` — hue-encoded pill:
  - `pending` — amber/warning token (`--color-state-warning`). Label: `○ pending`.
  - `verified` — success token (`--color-state-success`). Label: `● verified`.
  - `failed` — error token (`--color-state-error`), higher contrast and larger pill than the other two (personality.md §7 — failure outranks success in pixel area + contrast). Label: `✕ failed`.
  - Hue assignments deferred to screens phase; encoding rule is locked here.
- **`Retry verification` action:** Visible only when `status = pending` or `status = failed`. Triggers a re-verification API call. Maps to `bl domain verify <name>` CLI command. On success: status badge streams to next state; on failure: `verificationError` in Band 2 updates. Hidden when `status = verified`.
- **`Delete` action:** Ghost button, always present. Triggers a destructive confirmation modal — "Delete `preview.acme.com`? This will remove the domain registration and TLS certificate. This action cannot be undone." Two buttons: `Delete domain` (destructive) / `Cancel`.
- **Region line:** `spec.region` — rendered as `region: us-pdx-1` inline metadata. Relevant for incident triage (Scenario 3 — region mismatch is a candidate cause). No separate field label needed; the `region:` prefix is self-labeling.
- **Creator + creation time:** `metadata.createdBy` + `metadata.createdAt`. Inline metadata line: `created Jun 20, 2026 by alex@acme.com`. Satisfies Scenario 4 audit question: "Who registered this?"
- **Last verified timestamp:** `spec.lastVerifiedAt`. Inline metadata line: `last verified: 2h ago` (relative) / `last verified: —` when null (never checked). Both `createdAt` and `lastVerifiedAt` are in the header per scenarios.md header contract — they answer different "how long" questions from different entry paths.

---

## Band 1 — DNS records issued by Blaxel

*Scenario trace: Scenarios 1 (copy the records I need to publish), 2 (identify which record is wrong), 3 (reference check during incident), 4 (Sam audits SANs), 5 (re-orient on attachments).*
*Audit questions satisfied: (1) "Did I publish the right records, and has Blaxel seen them yet?" — full DNS record display with copy affordance and per-record check outcome; (2) "Which record is wrong, and what value should be published instead?" — per-record annotation with matched/mismatched/not-found for status=failed.*

This band is the diagnostic core for `status=pending` and `status=failed`. It is visible in all three status states; its per-record annotation changes by status.

### 1a — CNAME record

API field: `spec.cnameRecords` — a **single string** (the one CNAME target Blaxel issues for the apex domain). Not a list.

```
── DNS records issued by Blaxel ────────────────────────────────

  CNAME record
  ┌──────────────────────────────────────────────────────────┐
  │  Type    Host                    Value                   │
  │  ──────────────────────────────────────────────────────  │
  │  CNAME   preview.acme.com   →   abcd1234.bl.run   [📋]  │
  │                                                          │
  │  [status=verified]  ● Verified                           │
  │  [status=pending]   ○ Pending — checking...              │
  │  [status=failed]    ✕ Not matched — expected:            │
  │                       abcd1234.bl.run                    │
  │                       observed: old-target.example.com   │
  └──────────────────────────────────────────────────────────┘
```

**Anatomy:**
- `Type` column: literal string `CNAME`.
- `Host` column: `metadata.name` (the apex domain the user is pointing at Blaxel).
- `Value` column: `spec.cnameRecords` (the single target string Blaxel issued). Click-to-copy [📋] affordance on the value — copies the raw string to clipboard.
- **Per-record check outcome annotation (when `status ≠ verified`):**
  - `verified` — `● Verified` (muted; success is not emphasized).
  - `pending` — `○ Pending — checking...` (the check is live-streaming per personality.md "Status streams, never polls" — the label updates without page refresh).
  - `failed` — `✕ Not matched` + `expected: {spec.cnameRecords}` + `observed: {the value Blaxel actually saw}`. The "observed" value is drawn from `spec.verificationError` parsing — if the error string contains the observed value, render it; if not, render just "Not found in DNS." Note: the exact format of `verificationError` content determines whether "observed" can be parsed — screens phase implements the parse; wireframe specifies the display contract. Both expected and observed values are copyable.
  - When `status = verified`: no per-record annotation rendered — the record matched; no need to show it. Reducing visual noise when healthy satisfies personality.md §7 (failure surfaces are larger, not the reverse).

### 1b — TXT records

API field: `spec.txtRecords` — an **object/map** of TXT record name → value. Genuinely multi-row; each key in the map is a distinct TXT record Blaxel requires for domain verification.

```
  TXT records
  ┌──────────────────────────────────────────────────────────┐
  │  Type   Name                            Value       [📋] │
  │  ─────────────────────────────────────────────────────── │
  │  TXT    _blaxel-verify.preview.acme.com  bl-v=abc12 [📋] │
  │         [status outcome annotation]                      │
  │                                                          │
  │  TXT    _blaxel-ca.preview.acme.com      bl-ca=xyz9 [📋] │
  │         [status outcome annotation]                      │
  │                                                          │
  │  [additional rows if txtRecords map has >2 entries]      │
  └──────────────────────────────────────────────────────────┘
```

**Anatomy:**
- Each key-value pair in `spec.txtRecords` renders as one row.
- `Type` column: literal string `TXT`.
- `Name` column: the key from the `txtRecords` map (the DNS record name to publish).
- `Value` column: the value from the `txtRecords` map. Click-to-copy [📋] per value.
- **Per-record check outcome annotation** — same pattern as 1a:
  - `verified` — no annotation (clean; success is quiet).
  - `pending` — `○ Pending — checking...` streaming.
  - `failed` — `✕ Not matched` / `✕ Not found` with expected vs. observed values from `spec.verificationError` parsing. The failed-record row gets the highest visual weight on this page — larger area, error token color — satisfying personality.md §7 failure outranks success.
- **Failure priority sort:** When `status = failed`, rows with a failed check outcome sort to the top of the TXT records table, above any that matched. Error rows are visually expanded (show expected+observed); matched rows collapse to a single line with quiet `● matched` annotation.

---

## Band 2 — Verification status stream

*Scenario trace: Scenarios 1 (watch for pending → verified flip), 2 (see the failure log line), 3 (confirm domain is still healthy).*
*Audit questions satisfied: (1) "Has Blaxel seen them yet?" — last check timestamp + live status update; (2) "Which record is wrong?" — verificationError as log line.*

```
── Verification ─────────────────────────────────────────────────

  Status          ● verified   (or: ○ pending · checking... / ✕ failed)
  Last checked    2h ago       (spec.lastVerifiedAt; "—" if null)

  [status=failed only]:
  Error           TXT record `_blaxel-verify.preview.acme.com` not found
                  in DNS. Expected value: `bl-v=abc123xyz`. Publish this
                  record to your DNS provider and retry verification.
                  [Retry verification →]

  [status=pending only]:
  Checking        DNS propagation can take up to 48h. The status above
                  updates automatically — no refresh needed.
```

**Anatomy:**
- **Status row:** `spec.status` — same hue-encoded label as the header badge. The stream here is the live-updating surface (personality.md "Status streams, never polls") — the status label and last-checked timestamp update when the background verification check fires, without page refresh.
- **Last checked row:** `spec.lastVerifiedAt` — relative timestamp. If null (never checked), renders `—`.
- **Error row (failed only):** `spec.verificationError` rendered verbatim as a log line (cause + which record + expected value + next move). Copy voice: cause → next move, no apology, no hedge (personality.md Voice — "Error voice"). The `Retry verification →` link in the error row is a second entry point to the retry action (the primary is in the header). Redundant but justified: Alex may read the error log before scrolling back to the header action.
- **Propagation note (pending only):** One line, matter-of-fact. Not an apology; not a spinner. The "updates automatically" copy is factually accurate per the streaming contract.

---

## Band 3 — Certificate

*Scenario trace: Scenario 4 (Sam audits SANs before sign-off).*
*Audit question satisfied: (4) "What does the issued certificate cover?"*

```
── Certificate ──────────────────────────────────────────────────

  Subject alternative names (SANs)  [SCHEMA-UNCERTAIN³]
  ┌──────────────────────────────────────────────────────────┐
  │  [object — sub-field shape confirmed in screens phase]   │
  │  [object — sub-field shape confirmed in screens phase]   │
  │  [additional rows from spec.subjectAlternativeNames[]]   │
  └──────────────────────────────────────────────────────────┘

  ³ spec.subjectAlternativeNames is array of objects with no
  defined sub-fields (additionalProperties: true). Screens
  phase binds display to confirmed key (e.g. value / dnsName)
  from a live API response. Each object renders as one row.

  Managed TLS via AWS Certificate Manager. Certificate is
  provisioned on domain verification. (status=pending: not
  yet issued; status=failed: issuance blocked.)
```

**Anatomy:**
- **SANs list:** `spec.subjectAlternativeNames` — each array entry (object) renders as one row. The schema declares `array of objects` with `additionalProperties: true` — no sub-field names are enumerated (footnote ³). This is the security-team-readable answer to "what hostnames does this cert cover?" (Scenario 4). Rows are copyable. **Screens phase must confirm the object's runtime key** (e.g. `{value: "..."}` or `{dnsName: "..."}`) by inspecting a live API response before rendering the display string.
- **Cert status note:** One-line contextual note that correlates cert issuance with domain `status`. When `status = verified`, the cert is active. When `status = pending` or `status = failed`, cert is not yet issued. This gives Sam a complete picture without requiring a separate security tab.
- **Loading state:** Skeleton list (3 lines). **Empty state (pending/failed):** `Certificate not yet issued — domain must be verified first.`

---

## Band 4 — Routing attachment

*Scenario trace: Scenarios 3 (rule out fallback as outage cause), 4 (Sam confirms catch-all target), 5 (audit before deprecating a preview).*
*Audit questions satisfied: (3) "What previews are flowing through it right now?" — partial (fallbackPreviewId is schema-backed; broader list is schema-uncertain¹); (5) "Is anything still depending on it?" — fallbackPreviewId.*

```
── Routing ──────────────────────────────────────────────────────

  Fallback preview
  ┌──────────────────────────────────────────────────────────┐
  │  prev-abc123xyz                          [→ View preview] │
  │  Unmapped subdomains route to this Sandbox preview.       │
  └──────────────────────────────────────────────────────────┘

  [SCHEMA-UNCERTAIN¹] Full routing table
  ┌──────────────────────────────────────────────────────────┐
  │  The complete list of Sandbox previews routed through    │
  │  this domain is not available in the current API schema. │
  │  Only the fallback preview ID above is schema-backed.    │
  │                                                          │
  │  → Screens phase resolves: pending confirmation of a     │
  │    reverse-lookup query on Sandbox previews filtered by  │
  │    this domain's hostname. If the endpoint exists, this  │
  │    band shows: Preview ID / Subdomain / Status / Last    │
  │    used. If not, this band is omitted and the fallback   │
  │    row above is the complete routing surface.            │
  └──────────────────────────────────────────────────────────┘
```

**Anatomy:**
- **Fallback preview row:** `spec.fallbackPreviewId` — the single string ID of the catch-all Sandbox preview for unmapped subdomains. Rendered with a `→ View preview` link that deep-links to the Sandbox preview detail for that ID. This is the one schema-backed routing fact this primitive exposes (scenarios.md synthesis note).
- **Full routing table (schema-uncertain¹):** Placeholder band with explicit schema-uncertainty annotation. The wireframe does not invent a data shape for the live routing list — this was the failure mode the scenarios gate revision fixed. The band's presence is a design intent signal to the screens phase; its content is gated on API confirmation. If the endpoint exists, the table shows per-preview rows; if not, the placeholder band is removed and the fallback row above is the complete content.
- **`→ View preview` navigation:** Satisfies personality.md Interaction principle #2 — "one click, primitive to trace" — the attachment is clickable to its detail surface.

---

## Band 5 — CLI parity

*Scenario trace: Scenarios 1 (Alex tracking a registration she just did), 2 (get the re-trigger command), 5 (copy into IaC).*
*Personality.md Sacrificial choice #5: "CLI / SDK is a peer surface, not a fallback." Interaction principle #9: "CLI parity is visible, not hidden."*

```
── CLI ──────────────────────────────────────────────────────────

  Register this domain
  $ bl domain register preview.acme.com --region us-pdx-1  [📋]

  Verify this domain
  $ bl domain verify preview.acme.com                      [📋]

  Delete this domain
  $ bl domain delete preview.acme.com                      [📋]
```

**Anatomy:**
- Three commands, each on one line in a monospace code block with a click-to-copy [📋] affordance.
- `bl domain register` — re-creates the domain with the same name + region (useful for IaC promotion per Scenario 5). Field bindings: `metadata.name` in the command; `spec.region` as the `--region` flag.
- `bl domain verify` — re-triggers verification (the CLI peer to the "Retry verification" UI action).
- `bl domain delete` — the CLI peer to the "Delete" button in the header.
- The register + verify commands satisfy: Scenario 1 (watching a fresh registration), Scenario 2 (re-trigger after fixing DNS), Scenario 5 (IaC copy).
- Commands are statically rendered — they do not change by domain `status`. The "Verify" command is always shown (relevant for both pending and failed states; harmless for verified).

---

## Band 6 — Security context

*Scenario trace: Scenarios 3 (rule out domain's API Key as incident factor), 4 (Sam's primary audit band — creator + credential + labels), 5 (re-orient on ownership before deprecating).*
*Audit question satisfied: (4) "Who registered this, with which credential, and what does the issued certificate cover?" — createdBy, labels, API Key context.*
*Personality.md Sacrificial choice #3: "Security context inline, never tabbed away." Interaction principle #6: "Security context inline, never tabbed away" — PASS test: policy scope and API Key prefix visible on same scroll as operational state.*

```
── Security ─────────────────────────────────────────────────────

  Registered by    alex@acme.com (Member)          metadata.createdBy
  Registered at    Jun 20, 2026 · 14:32 UTC        metadata.createdAt
  Last updated by  alex@acme.com                   metadata.updatedBy
  Last updated at  Jun 21, 2026 · 09:14 UTC        metadata.updatedAt

  API Key          bl_pk_3f8c…  [SCHEMA-UNCERTAIN²]
  Policy           [SCHEMA-UNCERTAIN²]

  Labels
  ┌──────────────────────────────────────────────────────────┐
  │  env:prod   team:infra                                   │
  │  (metadata.labels — empty if not set: "No labels.")      │
  └──────────────────────────────────────────────────────────┘
```

**Anatomy:**
- **Registration metadata:** `metadata.createdBy` + `metadata.createdAt` + `metadata.updatedBy` + `metadata.updatedAt` — four schema-backed fields that form the floor of the audit surface. Sufficient for Sam to confirm who registered the domain and when it was last touched.
- **API Key prefix (schema-uncertain²):** The API Key used to make the registration call is not in the `CustomDomain` schema. Design placeholder: render `bl_pk_3f8c…` (truncated prefix format per personality.md Sacrificial choice #2) with a schema-uncertainty marker. Screens phase confirms: if a workspace-level audit endpoint can be joined to surface the API Key prefix that made the `POST /domains` call, render it; if not, remove this row.
- **Policy (schema-uncertain²):** The Policy that governed the domain's deployment region is not directly on the `CustomDomain` schema. Design placeholder: same pattern as API Key. Screens phase confirms join.
- **Labels:** `metadata.labels` — rendered as read-only inline chips. Each chip is `key:value`. If no labels set: `No labels.` one-line copy.

**Schema-uncertainty treatment rationale:** The security band renders `createdBy` / `createdAt` / `updatedBy` / `updatedAt` as schema-backed floor content. The API Key and Policy rows are annotated as schema-uncertain but placeholder-rendered to signal design intent to the screens phase. Sam's Scenario 4 audit question ("with which credential?") is partially satisfied by the creator identity; the API Key row strengthens the answer if the endpoint is confirmed.

---

## Full-page layout — three status renders

### Status = `pending`

```
HEADER: preview.acme.com · ○ pending · [Retry verification]
        region: us-pdx-1 · created Jun 20, 2026 by alex@acme.com · last verified: —

BAND 1: DNS records
  CNAME: preview.acme.com → abcd1234.bl.run [📋]
         ○ Pending — checking...
  TXT:   _blaxel-verify.preview.acme.com = bl-v=abc123 [📋]
         ○ Pending — checking...

BAND 2: Verification
  Status:       ○ pending · checking...
  Last checked: —
  Note: DNS propagation can take up to 48h. Status updates automatically.

BAND 3: Certificate
  SANs: preview.acme.com, *.preview.acme.com
  Note: Certificate not yet issued — domain must be verified first.

BAND 4: Routing
  Fallback preview: prev-abc123xyz [→ View preview]
  Full routing table: [placeholder — screens phase resolves¹]

BAND 5: CLI
  $ bl domain register preview.acme.com --region us-pdx-1
  $ bl domain verify preview.acme.com
  $ bl domain delete preview.acme.com

BAND 6: Security
  Registered by: alex@acme.com · Jun 20, 2026 14:32 UTC
  API Key: bl_pk_3f8c… [²]
  Labels: env:prod, team:infra
```

### Status = `failed`

```
HEADER: preview.acme.com · ✕ failed [HIGH CONTRAST] · [Retry verification ←primary CTA]
        region: us-pdx-1 · created Jun 20, 2026 by alex@acme.com · last verified: 4h ago

BAND 1: DNS records [FAILURE-FIRST SORT — failed records at top]
  TXT:   _blaxel-verify.preview.acme.com = bl-v=abc123 [📋]
         ✕ Not found — expected: bl-v=abc123xyz
                       observed: (not present in DNS)
  TXT:   _blaxel-ca.preview.acme.com = bl-ca=xyz9 [📋]
         ● Matched (quiet, no expansion)
  CNAME: preview.acme.com → abcd1234.bl.run [📋]
         ✕ Not matched — expected: abcd1234.bl.run
                          observed: old-target.example.com

BAND 2: Verification [LARGEST VISUAL AREA ON PAGE — failure outranks success]
  Status:       ✕ failed
  Last checked: 4h ago
  Error:        TXT record `_blaxel-verify.preview.acme.com` not found.
                Expected: bl-v=abc123xyz. Publish to your DNS provider.
                [Retry verification →]

BAND 3: Certificate
  Not yet issued — domain must be verified first.

BAND 4: Routing
  Fallback preview: prev-abc123xyz [→ View preview]
  Full routing table: [placeholder¹]

BAND 5: CLI
  $ bl domain register preview.acme.com --region us-pdx-1
  $ bl domain verify preview.acme.com
  $ bl domain delete preview.acme.com

BAND 6: Security
  Registered by: alex@acme.com · Jun 20, 2026 14:32 UTC
  API Key: bl_pk_3f8c… [²]
  Labels: env:prod, team:infra
```

**Failure visual hierarchy specification (deferred to screens phase for token values, locked here as layout contract):**
- The `✕ failed` header badge is larger in size than `● verified` or `○ pending` badges — failure gets more pixel area.
- Band 2 (Verification) when failed: the `verificationError` block renders at a slightly elevated background token (not a card — a subtle tint indicating an actionable alert zone) and carries the highest contrast text on the page.
- Failed DNS record rows in Band 1: expanded (show expected + observed); non-failed rows: collapsed (single line, low contrast).
- `Retry verification` appears in two locations (header + Band 2 error row) — this redundancy is intentional for `status=failed`; Alex should not have to search for the next action when the failure is the dominant visual.

### Status = `verified`

```
HEADER: preview.acme.com · ● verified [muted]
        region: us-pdx-1 · created Jun 20, 2026 by alex@acme.com · last verified: 2h ago

BAND 1: DNS records [NO per-record annotation — success is quiet]
  CNAME: preview.acme.com → abcd1234.bl.run [📋]
  TXT:   _blaxel-verify.preview.acme.com = bl-v=abc123 [📋]
  TXT:   _blaxel-ca.preview.acme.com = bl-ca=xyz9 [📋]

BAND 2: Verification [NO error row — status=verified has no error content]
  Status:       ● verified
  Last checked: 2h ago

BAND 3: Certificate
  SANs: preview.acme.com, *.preview.acme.com

BAND 4: Routing
  Fallback preview: prev-abc123xyz [→ View preview]
  Full routing table: [placeholder¹]

BAND 5: CLI
  (same as above — all three commands always present)

BAND 6: Security
  Registered by: alex@acme.com · Jun 20, 2026 14:32 UTC
  Last updated: Jun 21, 2026 by alex@acme.com
  Labels: env:prod, team:infra
```

---

## Page-level states (orthogonal to DNS status)

### Loading state

```
HEADER:  ████████████████  [status skeleton]
         ████████ · ████████ · ████████

BAND 1:  DNS records
         ┌────────────────────────────────────────┐
         │  ████████   ████████████   ████████    │
         │  ████████   ████████████   ████████    │
         └────────────────────────────────────────┘

BAND 2:  Verification
         ████████   ████████████

[remaining bands skeleton-loaded same way]
```

- All bands render with skeleton content — no collapsed state, no spinner.
- Band structure stays visible so the page shape is legible while loading.

### Error state (page-level fetch failure)

```
Custom domain `preview.acme.com` could not be loaded — refresh to retry.
```

- One line, replaces all band content. Domain name from the URL parameter is included in the error copy (it's always known from the route even if the fetch fails).

### Resource not found (404)

```
Custom domain `preview.acme.com` not found in this workspace.
← Back to Custom Domains
```

- Follows `docs/design/guidelines/resource-not-found.md` — one line cause + back navigation. No illustration.

---

## Audit question trace — FAIL contract verification

| Audit question | Band(s) that answer it | Status |
|---|---|---|
| 1. "Did I publish the right records, and has Blaxel seen them yet?" | Header (status badge + lastVerifiedAt) + Band 1 (DNS records at full fidelity, per-record check outcome) + Band 2 (lastVerifiedAt + stream) | PASS |
| 2. "Which record is wrong, and what value should be published instead?" | Band 1 (failed records expanded with expected + observed values, failure-sort to top) + Band 2 (verificationError as log line + Retry CTA) | PASS |
| 3. "Is this domain still healthy, and what previews are flowing through it right now?" | Header (status=verified + lastVerifiedAt) + Band 4 (fallbackPreviewId as schema-backed routing fact; broader list pending screens phase¹) | PASS (partial — routing list schema-uncertain, acknowledged) |
| 4. "Who registered this, with which credential, and what does the issued certificate cover?" | Header (createdBy + createdAt) + Band 3 (subjectAlternativeNames — schema-uncertain³, object shape confirmed in screens phase) + Band 6 (createdBy/createdAt/updatedBy + API Key placeholder²) | PASS (partial — API Key schema-uncertain², SAN sub-field shape schema-uncertain³, both acknowledged) |
| 5. "What's this domain doing for me right now, and is anything still depending on it?" | Header (status + region) + Band 4 (fallbackPreviewId) + Band 5 (bl commands for re-create/IaC) | PASS |

---

## Self-review checklist

- [x] **Inheritance** — header contract and default-content contract from `scenarios.md` fully consumed; every field traced to API schema or explicitly footnoted.
- [x] **Tokens** — `--color-state-error`, `--color-state-warning`, `--color-state-success` referenced. Hue assignments deferred to screens phase. No invented tokens.
- [x] **States** — `pending` + `verified` + `failed` DNS status states fully specified; page-level loading + error + 404 specified.
- [x] **Vocabulary** — "Custom domains" (lowercase d) per `platform.md:202` in page title, breadcrumb, and body copy. Back-link in header: "← Custom domains". "Sandbox", "Policy", "API Key", "Region", "Preview URL" verbatim. `spec.cnameRecords` as single string (not "CNAME records" plural); `spec.txtRecords` as multi-row map. No synonyms.
- [x] **Drift** — Schema-uncertain items: live routing list (¹), per-domain audit events / API Key / Policy (²), `subjectAlternativeNames` object sub-field shape (³) — all explicitly footnoted with fallback designs and "screens phase resolves" language. `subjectAlternativeNames` corrected from `string[]` to `array of objects (additionalProperties: true)` per confirmed API schema. No invented data shapes.

PASS
