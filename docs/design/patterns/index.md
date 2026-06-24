# Design Patterns

Entry point for all portal-level UX patterns. Each file below is a decision record and spec — read the file, not just the summary.

---

## Tables

Tables are the primary navigation surface in the portal. Two docs define the complete standard; read them in order.

1. [Row Interaction](row-interaction.md) — archetype assignment (Catalog / Navigate / Select) and the interaction spec that follows from each archetype. Start here: the archetype determines everything downstream.
2. [Table Typography](table-typography.md) — three-tier reading hierarchy (primary / secondary / metadata), token mapping, and sizing rules per archetype. Apply after archetype is assigned.

### Upstream context

These are not pattern files, but the table standards derive from them:

- [`docs/design/foundations/typography.md`](../foundations/typography.md) — canonical typography scale; origin of the role-not-size principle the table tiers encode.
- [`docs/conventions/typography-utility-usage.md`](../../conventions/typography-utility-usage.md) — DS-layer vs app-layer composition rule; governs where token overrides are permitted.

### DS implementation

- [`packages/ui/src/components/table.tsx`](../../../packages/ui/src/components/table.tsx) — canonical Table primitive; encodes the standards above. Read-only ground truth for what the component exposes.

---

## Notifications

[Notifications](notifications.md) — in-app notification surface pattern: bell + popover, event taxonomy, MVP scope, and deferred v2 work.
