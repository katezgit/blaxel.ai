# Empty state

When a surface has nothing to show, the rendering decision is **not just "what message to write"** — it's **whether the surface's bounded identity persists** or dissolves. Pick the wrong one and the empty state reads as broken layout instead of intentional state.

---

## Canon

| Surface type | Empty pattern | Examples |
|---|---|---|
| **Management / data / settings** | Keep the bounded container; render empty composition INSIDE it (with an icon) | Connections list, API keys, members, billing invoices, deployment list |
| **Content / social / feed** | Floating, no container | Empty channel, empty repo, blank canvas |

The DS `EmptyState` primitive is intentionally floating (no border, no bg, no rounded). The wrap — when needed — is a **consumer-side decision** for the specific surface, not a DS variant.

**Hard rule for bordered empty states: include an icon.** Border + plain text + CTA reads as "framed nothing". The icon gives the bounded area a visual anchor and the composition reads as intentional state. Without the icon, drop the border.

---

## Decision rule

Ask: **does the surface have a persistent identity that survives "no data"?**

- **YES** → bordered container stays. The container IS what the user came here to find. Empty content goes inside the same container the table/list would occupy. Reads as "this region exists, it just doesn't have rows yet".
- **NO** → floating. The page WAS the data; with no data the page has nothing else to be. A border around emptiness creates the "boxed nothing" feel.

### Examples

**Bordered (surface identity persists):**
- Per-provider connections page → page title + bounded "connections region" exists whether populated or not. The container marks "this is the slot".
- API keys settings → ditto. The keys table is the surface; bounded card stays.
- Billing invoice list → ditto.
- Members list → ditto.

**Floating (surface has no other identity):**
- Empty workspace (no resources at all) → page chrome IS empty; nothing else to contain.
- Empty search results in a popover/command palette → the popover itself is the container.
- Dashboard zero-state ("welcome to Blaxel") → the page is the welcome, not a data slot.

When unsure: a surface that contains a table/list when loaded → bordered. A surface that contains free-form content when loaded → floating.

---

## Industry grounding (verified 2026-06-22)

**Bordered (management/dev tools):**
- Stripe — empty customers, payments, invoices, products: bordered card with empty content inside.
- Vercel — empty deployments, env vars, domains: bordered card empty.
- AWS Console — empty resource lists: bordered card.
- Airtable — empty view: table chrome stays.
- Anthropic Console — billing invoice history empty: table chrome stays.

**Floating (consumer/content/social):**
- GitHub — empty repo issues: floating centered text + button.
- Linear — empty project: floating.
- Notion — empty database: floating illustration + text.
- Slack — empty channel: floating.
- Discord — empty server: floating.

The split is **domain-driven**, not aesthetic. Don't pick by personal taste — pick by what kind of surface you're on.

---

## Implementation

The DS primitive (`packages/ui/src/components/empty-state.tsx`) ships as floating:

```tsx
<div className="flex flex-col items-center justify-center text-center py-12 px-6 gap-4">
  …icon, title, subtitle, cta
</div>
```

No border, no bg, no rounded — intentionally. Floating consumers use it directly.

Bordered consumers wrap it with the same container the loaded state uses:

```tsx
{connections.length === 0 ? (
  <div className="rounded-md border border-border bg-card overflow-hidden">
    <EmptyState
      variant="zero-state"
      title="No connections yet"
      subtitle="Connect this workspace with an API key to start using it from agents and the CLI."
      cta={<Button variant="primary">Create integration</Button>}
    />
  </div>
) : (
  <ConnectionsTable />
)}
```

The wrap className **mirrors exactly** the table's outer container so empty vs loaded look like the same region with different content.

---

## Anti-patterns

1. **Adding a border to the DS EmptyState primitive.** Forces every consumer to override; breaks the floating default.
2. **Bordered empty state WITHOUT an icon.** A border around plain text + CTA reads as "framed nothing" — the border looks ugly because the empty area has no visual anchor. Carbon's rule: if you keep the chrome (bordered), the empty state inside MUST include an icon to give the area a focal point. Border + icon + title + subtitle + CTA is the canonical first-use composition. Border + no icon is broken.
3. **Mixing patterns within a feature.** If the per-provider page is bordered-empty, every sibling settings page should follow the same. Inconsistency reads as bugs.
4. **Dashed borders on empty states** ("drop your data here"). Reads as a file-upload affordance, not a state.
5. **Illustration-only empty states without copy.** Cute on consumer apps, useless on management tools where the user needs to know what to DO next.
6. **Centering the CTA but not the text.** Visual jitter.

---

## Carbon alignment

[Carbon's empty state pattern](https://carbondesignsystem.com/patterns/empty-states-pattern/) is the strongest reference for management/data surfaces. Key takeaways relevant here:

- Carbon doesn't prescribe adding a border *for* the empty state. The container is just chrome continuity — if the loaded state has a Tile/table container, that container persists when empty.
- First-use empty states include a visual element (icon or illustration). Carbon calls out that "an image of the space populated with data may help trigger interest and usage" — the visual is what turns a quiet empty area into an inviting one.
- Illustrations/icons are decorative (aria-hidden). They exist for warmth, not information.

Our DS `EmptyState` exposes an `icon` prop that renders a 48px rounded-corner muted surface with the icon centered. Use it on every bordered empty state in management surfaces.

---

## CTA placement (related)

When a page header has a "+ Create" CTA AND the empty state has its own CTA, you have one CTA too many. Rule:
- **0 items**: hide the header CTA; the empty-state CTA does the work (it has explanatory copy alongside).
- **≥1 items**: show the header CTA; no empty state to compete with.

This avoids the "two identical buttons, which do I click" question on empty surfaces.

---

## Where this applies in Blaxel

- `/[ws]/settings/integrations/[provider]` (connections) — bordered ✓
- `/[ws]/settings/api-keys` — bordered ✓ (table chrome stays)
- `/[ws]/settings/team` — bordered ✓
- `/account/admins` — bordered ✓
- `/account/billing/invoices-payment` — bordered ✓
- Future: any list-resource detail page → bordered by default
