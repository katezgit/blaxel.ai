# Wireframe Spec — Topbar Tier + Balance Chip Pair

**Component type:** Chrome-level component (topbar right rail)
**Scope:** `WorkspaceTopbar` and `AccountTopbar` — both topbar variants carry the chip pair.
**Upstream anchors:** `ia-proposal.md` § "Tier / balance in chrome — placement decision"; `scenarios.md` A1, A4; `personality.md` interaction principle #3 (streams), #11 (free surfaces visible); `personas.md` Alex wizard-creep anti-pattern.

---

## 1. Topbar position

**Current right rail contents** (derived from `identity-cluster.tsx`):

```
[right zone]  Bell (notifications)  ·  CircleHelp (help)  ·  AvatarMenu
```

**New right rail — with chip pair inserted:**

```
[right zone]  TierChip  BalanceChip  ·  Bell  ·  CircleHelp  ·  AvatarMenu
```

The chip pair occupies the leftmost position in the right zone, separated from the icon buttons by the existing `gap-0.5` rhythm. The chips sit to the left of the Bell icon. They are always present — not conditional on route or page state.

**Both topbar variants (`WorkspaceTopbar`, `AccountTopbar`) carry the chip pair.** The pair is chrome, not workspace-specific; it reflects the account-level tier and balance, which are constant across all workspace pages and account pages.

**Rationale for left-of-Bell position:** Bell and Help are transient action triggers; AvatarMenu is identity. Chips are persistent ambient state — different semantics. Placing them leftmost in the right zone keeps state read before interaction affordances, matching the left-to-right scan order (identity state → actions → identity object).

---

## 2. Chip pair anatomy

The two chips are rendered as an adjacent pair with a small gap between them (`gap-1`). They do not share a container badge or combined label. Each chip is a discrete interactive element with its own click target.

### 2a. Tier chip

```
┌──────────────┐
│  Tier 0      │
└──────────────┘
```

| Attribute     | Spec |
|---|---|
| **Label**     | `Tier 0`, `Tier 1`, `Tier 2`, `Tier 3` — exact vocabulary from `platform.md`. No synonym ("Free", "Pro", "Growth"). |
| **Value source** | Account-level tier. Static for the session; updates only when tier changes (rare event). No live-streaming required. |
| **Icon**      | None. Label is the full identity signal. Adding an icon would be decorative. |
| **Size**      | Compact badge — same height as the icon buttons (`h-7` / 28px). Horizontal padding `px-2.5`. |
| **Typography**| `text-label` (12px / mono or sans per DS badge convention), `font-medium`. |
| **Click target** | The entire chip. Navigates to `/account/plan-quotas` (Plan & Quotas page). No secondary affordance inside the chip. |
| **Cursor**    | `cursor-pointer`. |

### 2b. Balance chip

```
┌─────────────────┐
│  $10.00  ●      │
└─────────────────┘
```

| Attribute     | Spec |
|---|---|
| **Label**     | Dollar amount with two decimal places: `$10.00`, `$0.47`, `$142.31`. Format: `Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })`. |
| **Live indicator** | A small streaming dot (`●`, 6px circle, `text-state-success` / green) placed immediately after the amount, inline. This encodes "this value is live-streaming" per personality.md interaction principle #3 (status streams, never polls). The dot is always visible when the stream is connected, not just on update. It is NOT a notification dot or a pulse animation — it is a static presence indicator for the live connection. |
| **Value source** | Live-streamed credit balance from the account billing API. No refresh button. No polling interval. The chip subscribes to the stream on mount and tears down on unmount. |
| **Icon**      | None. The amount is the signal; the streaming dot is the connection indicator. |
| **Size**      | Same compact badge dimensions as Tier chip (`h-7`, `px-2.5`). |
| **Typography**| `text-label`, `font-medium`, tabular numerals (`tabular-nums`) so the amount doesn't jump layout on digit changes. |
| **Click target** | The entire chip. Navigates to `/account/billing` (Billing page, scrolling to or anchoring at Section A — balance tile). No inline action (`+ Top up` is NOT in the chip). |
| **Cursor**    | `cursor-pointer`. |

---

## 3. Visual treatment — Tier 0 vs paid tiers

Per `personality.md` sacrificial choice #8: "Free surfaces visible, paid surfaces inline-gated." The chip pair must not make Tier 0 feel second-class.

**Tier 0:**
- Tier chip: neutral/secondary surface styling — `bg-secondary-surface`, `text-foreground`, `border border-border`. No muted color, no strikethrough, no gray-out. Reads as a peer to the paid-tier chip.
- Balance chip: identical neutral styling.

**Tier 1 / Tier 2 / Tier 3:**
- Tier chip: same neutral styling as Tier 0. No special "premium" color. The tier label itself is the identity signal — no branding accent needed. Adding a brand color to paid tiers would implicitly gray-out Tier 0, which is the anti-pattern.
- Balance chip: identical neutral styling across tiers.

**Summary:** Both chips use the same visual treatment at all tiers. Differentiation is lexical (the label), not chromatic. This is correct: the tier IS the signal, not a colored badge.

---

## 4. Hover and focus states

### Tier chip — hover

On hover, show a tooltip anchored below the chip:

```
┌─────────────────────────────┐
│  Plan & Quotas              │
└─────────────────────────────┘
```

Tooltip content: `"Plan & Quotas"` — names the destination, not re-states the tier. Follows `personality.md` Exact principle: the tooltip tells the user where the click goes, not what they already see in the chip. Tooltip appears after standard hover delay (300ms). Tooltip role: `tooltip` on the element, `aria-describedby` on the chip trigger.

### Balance chip — hover

On hover, show a tooltip anchored below the chip:

```
┌─────────────────────────────────────────┐
│  Credit balance — live                  │
│  Updated just now                       │
└─────────────────────────────────────────┘
```

Two-line tooltip: first line is the label (`Credit balance — live`), second line is last-updated timestamp relative to now (`Updated just now`, `Updated 2m ago`, etc.). This lets Alex verify stream freshness without navigating. The timestamp updates on stream tick — not on hover open. Tooltip role: `tooltip`; `aria-describedby` on the chip trigger.

### Both chips — focus state

On keyboard focus (`:focus-visible`): standard `shadow-focus-ring` — same as all interactive elements in the DS. No custom focus style.

### Both chips — active / pressed state

On `:active`: slight `scale-95` transform (motion-designer owns the exact value — flag as motion territory). Visual feedback that the click registered before navigation.

---

## 5. Loading states

### Day-1 user — balance not yet loaded

Balance chip shows a skeleton placeholder instead of the amount while the stream handshake is pending:

```
┌─────────────────┐
│  ░░░░░░  ○      │
└─────────────────┘
```

- Skeleton: a rounded rect at the same dimensions as the typical amount string (`~48px` wide, `12px` high), `bg-muted-surface` with no animation (motion-designer territory).
- Streaming dot: hollow / disconnected state (`○`, same size, `text-muted-foreground`) to signal stream not yet attached.
- This state resolves once the stream emits the first value. No timeout fallback is specced here — a connection error state (below) handles the fault path.

### Balance chip — stream connection error

If the stream errors or disconnects and cannot reconnect:

```
┌────────────────┐
│  $10.00  —     │
└────────────────┘
```

- The last known value is shown (stale, but better than blank).
- Streaming dot is replaced with an em dash (`—`, `text-muted-foreground`) to signal "live data unavailable, showing last known."
- No error toast. No inline error text. This is ambient chrome — the error presentation must not interrupt the page Alex is on. The stale indicator is the sufficient signal.
- On reconnect: streaming dot restores, value updates.

### Tier chip — loading

Tier chip never shows a skeleton. Tier is fetched once at session/hydration time (not streamed) and is part of the auth session context. If tier is truly unavailable (auth error), the chip is absent — an absent chip is less disruptive than a broken one. This case is an edge; do not spec a visible fallback label.

---

## 6. Earn-credits modal trigger placement

**Decision: the earn-credits modal trigger STAYS in its current position (sidebar or wherever it currently lives in chrome) and is NOT relocated to be adjacent to the Balance chip.**

**Rationale:**

The earn-credits modal is a dismissible onboarding aid, not a persistent billing state indicator. The Balance chip is persistent state. Collocating them would conflate two different things: "what is my current balance" (state read) and "how do I earn more credits" (action/onboarding). The chip's constraint ("no action affordance in the chip itself") would be immediately violated by an adjacent earn-credits trigger.

The IA proposal's A5 path already provides the correct secondary entry point: a link from the Billing page's balance tile reads `"Earn free credits — N tasks available →"`, which opens the earn-credits modal. Alex discovers the earn mechanic at the Billing page, not at the topbar chip.

**What this means for the chip spec:** The Balance chip has exactly one affordance — click → Billing page. No secondary earn-credits trigger adjacent to, inside, or overlaid on the chip.

**Flag for operator confirmation:** If the current earn-credits modal trigger is a chrome element in the sidebar rail (versus a button hidden in a page), its exact location should be confirmed before the engineer implements. This spec does not move it; it only clarifies that it stays separate from the Balance chip.

---

## 7. Chip pair interaction rail — full annotated layout

```
Topbar right zone (left to right):
┌──────────────┐ ┌─────────────────┐   [28px gap]   🔔   ❓   [Avatar]
│  Tier 0      │ │  $10.00  ●      │
└──────────────┘ └─────────────────┘
      │                  │
      │                  └── click → /account/billing (Section A)
      │                       hover → tooltip: "Credit balance — live / Updated just now"
      │
      └── click → /account/plan-quotas
           hover → tooltip: "Plan & Quotas"
```

Gap between TierChip and BalanceChip: `gap-1` (4px).
Gap between BalanceChip and Bell: existing `gap-0.5` of the `IdentityCluster` (2px) — chips are inserted left of `IdentityCluster` in the right zone's flex row, not inside it. This keeps the chip pair structurally separate from the icon cluster.

---

## 8. Scenarios satisfied

| Scenario | How this wireframe answers it |
|---|---|
| A1 (ambient, no navigation) | Both chips persistent in topbar right rail on every page. Alex reads tier + balance from any page at a glance, zero clicks. |
| A4 (one click to Billing) | Balance chip click → `/account/billing`. Direct. No intermediate modal. |
| Alex wizard-creep (no badges/nags) | No pulsing badge, no "Upgrade now" copy, no tier-progress meter. Chips are read-only state surfaces. |

---

## 9. States coverage summary

| State | Tier chip | Balance chip |
|---|---|---|
| Default | `Tier N` label, neutral badge | `$XX.XX ●` streaming, neutral badge |
| Loading | Absent (tier from session context) | Skeleton + hollow dot |
| Stream connected | N/A | `●` filled, `text-state-success` |
| Stream error / stale | N/A | Last known value + `—` |
| Hover | Tooltip: "Plan & Quotas" | Tooltip: "Credit balance — live / Updated N ago" |
| Focus | `shadow-focus-ring` | `shadow-focus-ring` |
| Active/pressed | `scale-95` (motion-designer) | `scale-95` (motion-designer) |

---

## 10. Out of scope for this spec (implementation clarifications)

- Exact motion duration on `scale-95` → motion-designer.
- Skeleton animation (pulse vs static) → motion-designer.
- Stream WebSocket/SSE protocol and reconnect logic → `staff-frontend-engineer` / backend.
- `AvatarMenu` already shows `user.tier` as a `Badge` inside the dropdown header — that badge can stay or be removed once the Tier chip is live in the topbar. The two surfaces are not in conflict (one is ambient, one is in a closed menu) but the duplication is worth noting for the engineer.
- Tooltip component: uses existing DS tooltip primitive. No new component needed.

---

## Self-review

- [x] **Inheritance** — component spec derives from existing `WorkspaceTopbar` / `AccountTopbar` / `IdentityCluster` structure (read directly from code); inserts into right zone left of `IdentityCluster`.
- [x] **Tokens** — references `bg-secondary-surface`, `text-foreground`, `border-border`, `text-muted-foreground`, `text-state-success`, `shadow-focus-ring`, `text-label`, `tabular-nums` — all from existing DS theme usage in codebase. No invented tokens.
- [x] **States** — default, loading, stream-connected, stream-error, hover, focus, active covered for both chips.
- [x] **Vocabulary** — `Tier 0 / 1 / 2 / 3`, `Plan & Quotas`, `Billing` — canonical terms from `platform.md` and `ia-proposal.md`. No synonyms.
- [x] **Drift** — none. Spec is additive to existing topbar; no upstream structure removed or reordered.

PASS
