# Table Typography

Three-tier reading hierarchy for all portal tables. Every cell, sub-line, badge, and column header maps to one of these tiers. The tiers are implemented with tokens from `packages/ui/src/styles/primitive.css`.

## Token reference

| Token | Size | Line height | Variant |
|---|---|---|---|
| `typography-body` (inherited) | 14px / 0.875rem | 1.375 | default prose |
| `typography-caption` | 12px / 0.75rem | 1.0 | metadata |
| `typography-code` | 12px / 0.75rem | — | monospace, tabular figures |

---

## Tier 1 — 14px (typography-body, inherited)

**What:** Primary cell content. The thing the operator's eye lands on first.

**Applies to:** name, value, status, count, any date that is a scan column.

**How to apply:** nothing. The `body` element is already 14px via `typography-body`. No class needed on primary cell content. Adding an explicit `text-body` or `text-sm` class is a counter-pattern — it recapitulates what is already inherited.

**Portal examples:**
- Workspaces table: workspace name `astra-eval`
- Custom Domains table: domain name `agents.acme.com`
- Sandboxes table: sandbox name, status badge text

---

## Mono-role cells (typography-code)

> Role ≠ size — see [`docs/conventions/typography-utility-usage.md` §Role ≠ size](../../conventions/typography-utility-usage.md) for the principle this section applies.

**What:** Any table cell whose role is monospace content — regardless of whether that cell is the primary scan target or a secondary/metric column. The role drives the token, not the pixel size.

**Applies to:**
- Mono identifier as the primary cell value (slugs, runtime names, IDs rendered in mono — e.g. `eval-runner`)
- Secondary mono identifiers (tags, refs, key previews — e.g. `sk-••••SDV3KQ`)
- Numeric scan columns where tabular, lining figures are required (Memory, Last run, Cost, size, latency — any column the operator sweeps top-to-bottom comparing magnitudes)

**How to apply:** `typography-code` on the cell or its innermost text node.

- Primary identifier cell (foreground): `typography-code text-foreground`
- Right-aligned metric cell: `text-right typography-code text-muted-foreground tabular-nums`
- Secondary identifier: `typography-code text-muted-foreground`

The DS `Table` component's `mono` variant (`tableCellVariants`) is the canonical implementation — `font-mono typography-code [font-feature-settings:'tnum'_1,'lnum'_1]`. Tables built with the DS `Table` component inherit mono-role behavior from that variant; tables built with tanstack or raw `<td>` apply `typography-code` directly in `cellClassName`.

**Why not `font-mono` + inherit 14px body:** that composition treats font-family and size as independent utilities. The design system's intent for mono-role cells is the full composite: mono family + 12px + tabular figures + 0em tracking. Splitting it loses tabular figures, breaks role-not-size composition, and drifts silently when the system's mono cell size evolves.

**Why not `typography-label`:** `typography-label` is the form-field and nav-label role. Applying it to table cells is off-label use that produces the wrong token semantics and silent density drift.

**Pixel size:** 12px — identical to `typography-caption` (Tier 2). The parity is coincidental, not architectural. The token is chosen by role (monospace cell content), not by size. Mono cell content that resolves to 12px is NOT interchangeable with caption sub-lines; they are different roles that currently share a size.

**Portal examples:**
- Sandboxes table — Name column (mono slug `eval-runner`): `typography-code text-foreground`
- Sandboxes table — Last active timestamp column: `text-right typography-code text-muted-foreground tabular-nums`
- Volumes table — size column with tabular figures: `text-right typography-code text-muted-foreground tabular-nums`
- API Keys table — key preview / Tag column: `typography-code text-muted-foreground`

---

## Column headers — 14px (typography-body, inherited)

**What:** Table column label row.

**Applies to:** every `<th>` / column header cell in portal tables.

**How to apply:** `font-medium text-meta-foreground`. No size class — headers inherit 14px from the body element alongside cell content.

At 14px with medium weight and meta color, column headers carry visual mass that defines column edges in dense tables. Operators rely on column boundaries to scan across rows quickly; the header is the anchor for each column's identity. Stepping headers down to a smaller size weakens that anchor. The distinction from body-weight cell content comes entirely from `font-medium` + `text-meta-foreground`, which is sufficient — size parity with cells is intentional.

**Counter-pattern:** applying `typography-caption` (12px) to column headers. Smaller headers compete with sub-line metadata and erode the column edge. The header loses its anchoring function.

---

## Tier 2 — 12px (typography-caption)

Used for sub-line metadata that supports the primary identifier in two-line cells.

### Sub-line metadata

**What:** Secondary information directly below the primary identifier in a two-line cell.

**Applies to:** id under name, email under person, description under domain, slug, tag pills, badges.

**How to apply:** `typography-caption text-muted-foreground` on the sub-line element.

**Portal examples:**
- Custom Domains table: description `Customer-facing demo previews` beneath `agents.acme.com`
- Custom Domains table: tag pills `env:prod`, `team:platform`

**Counter-pattern:** rendering sub-line metadata at 14px. It competes visually with the primary identifier and erases the reading hierarchy. Both lines read as equally important; the operator's eye has no anchor.

For identifier slugs and hashes that need monospace rendering, use Tier 3 (typography-code) instead of typography-caption, while keeping `text-muted-foreground`.

---

## Tier 3 — 12px (typography-code) — monospace sub-lines only

Tier 3 covers monospace identifiers and hashes that appear as sub-lines inside two-line cells. For monospace content that IS the primary cell value (slugs, IDs, metric columns), see [Mono-role cells](#mono-role-cells-typography-code) above.

**What:** Monospace identifiers and hashes where character alignment or copy-fidelity matters, rendered as the sub-line beneath a primary identifier in a two-line cell.

**Applies to:** standalone ID values (e.g. `pol-7a3f`, `SDV3KQ`, API key previews, job IDs) when the identifier appears as the sub-line in a two-line cell.

**How to apply:** `typography-code text-muted-foreground`.

Tabular figures are included in `typography-code` — character widths align across rows without extra configuration.

**Portal examples:**
- Workspaces table: workspace code `SDV3KQ` (monospace sub-line beneath workspace name)
- API Keys table: key preview `sk-••••••SDV3KQ`
- Policies table: policy slug `pol-7a3f`

**Counter-pattern:** rendering a hash or slug in `typography-caption` (proportional). Proportional rendering is fine for prose sub-lines (descriptions, emails); it is wrong for identifiers that operators scan, compare, or copy. Use `typography-code` for anything that reads as a token, key, or hash.

---

## Hierarchy summary

| Role | Token | Color class |
|---|---|---|
| Primary cell content (sans) | inherited (typography-body) | inherited |
| Mono cell content (identifier, metric) | typography-code | foreground (primary id) / muted-foreground (secondary/metric) |
| Column headers | inherited (typography-body) + font-medium | text-meta-foreground |
| Sub-line metadata (prose) | typography-caption | text-muted-foreground |
| Sub-line identifier / hash | typography-code | text-muted-foreground |
| Tag pills, badges | typography-caption | varies by badge type |

---

## Industry framing

14px / 12px cell hierarchy is universal across developer-tools dashboards: Stripe, Linear, Vercel, GitHub, Notion, and Cloudflare all apply it. The only common exception is shadcn's data-table starter, which is designed for rapid prototyping, not production density.

---

## Cross-reference

The identifier-hover affordance in resource rows (underline on row hover, no color shift) is specified in [Row Interaction → Archetype B](./row-interaction.md). The sub-line of a two-line resource-row cell uses Tier 2 or Tier 3 from this doc depending on whether the content is prose or a hash.
