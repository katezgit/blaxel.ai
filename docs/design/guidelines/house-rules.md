# House rules

**Scope:** Where Blaxel's design guidelines deliberately diverge from a split industry — the "house rules" that aren't industry default. Read this when you encounter a rule in our guidelines and wonder why we don't follow the more common pattern seen elsewhere.

Industry consensus we follow does not need to be recorded here; only the deliberate forks. Each entry: **the question → what industry does → what we picked → why for our context**.

---

## 1. Multi-step wizards in drawers

**Question:** Can a stepper (≥ 3 sequential steps) live inside a right-side drawer / sheet?

**Industry landscape:** Split. AWS Console, Vercel project-creation, Datadog integration setup, and many SaaS admin tools routinely use drawer-based multi-step wizards. PatternFly, Carbon, and Material Design steer wizards to pages or full-screen modals.

**Our call:** No. `container-choice.md` §3 fails multi-step wizards in drawers.

**Why for our context:** The drawer container exists to let the user see the parent list / detail screen *while* working. When the drawer body swaps across steps, that justification disappears — the drawer becomes a small page with worse ergonomics. Escalate to a page instead. Two-section linear forms inside a drawer are fine.

---

## 2. Save button — always-enabled vs disable-until-valid

**Question:** Should Save be disabled when the form is empty, invalid, or unchanged?

**Industry landscape:** Both patterns are common. Disable-until-valid is the dominant default in form libraries and most SaaS dashboards.

**Our call:** Save is always visible and always enabled. `form-actions.md` §1.

**Why for our context:** Operators run long sessions and re-submit forms intentionally; pre-disabled Save hides the reason for inaction and forces a state-check before every action. Inline errors locate the problem at the field on submit — the button is not where validation status lives.

---

## 3. Discard-changes warning — always-on-dirty vs two-condition gate

**Question:** When the user dismisses a dirty form, should the discard-confirm dialog always fire, or only when stakes warrant it?

**Industry landscape:** Cloudscape (AWS) says **always** on dirty — gating on stakes is inconsistent and forces the user to guess whether friction will appear. NN/g and PatternFly leave it to product judgment, implying stakes-gating is acceptable.

**Our call:** Two-condition gate — fire only when **dirty AND high-stakes**. `form-actions.md` §7.

**Why for our context:** Over-firing on low-stakes forms (TTL edit, theme toggle, single-field rename) trains users to dismiss the prompt reflexively. By the time a genuinely high-stakes form fires the same prompt, the user clicks through without reading. Signal-preservation beats consistency here.

---

## 4. Columns toggle in tables

**Question:** Should table headers offer a per-user "Columns" dropdown for showing / hiding columns?

**Industry landscape:** Common in enterprise data tools (Datadog, Grafana, Linear). Toggleable column visibility is a standard table feature in most data products.

**Our call:** Banned with a narrow exception. `toolbar.md` § "Why 'Columns' toggles are banned."

**Why for our context:** A column toggle signals "we don't know what the user needs to see." Column relevance should be decided at design time. If it's conditional, drive visibility from page state (role, scope, density mode), not a per-user toggle every operator has to discover. Exception: tables with 8+ columns AND a screen-reader / printing / export need.

---

## 5. Cards as default container for dashboard sections

**Question:** Wrap dashboard sections (forms, lists, single stats, headings) in `<Card>` for visual grouping?

**Industry landscape:** Bento-grid card landscapes are common in modern SaaS dashboards (Stripe, Linear status dashboard, many shadcn templates). Card-as-default-container is the de-facto pattern in marketing-flavored SaaS UI.

**Our call:** Strict three-criteria test (discrete object + actionable as unit + sits alongside peers). `card-usage.md` §1.

**Why for our context:** Blaxel targets technical operators who scan fast and value density. Card chrome around non-object content (sections, single stats, lists) eats vertical real estate that should be data and dilutes the meaning of cards that *do* represent objects. Whitespace + heading is the default grouping primitive; cards are reserved for actual objects.

---

## 6. 404/403 collapse on resource-not-found

**Question:** When a resource exists but the user lacks permission, show "you don't have access" or collapse with "isn't available" (the 404/403 collapse)?

**Industry landscape:** Vercel distinguishes ("this project belongs to a different team"). GitHub collapses at org boundaries. Linear collapses everywhere. Sentry names deletion explicitly. No single industry default.

**Our call:** Collapse by default; wrong-workspace is the only exception. `resource-not-found.md` §3.

**Why for our context:** Multi-org B2B product with workspace-scoped resources. Confirming "exists but inaccessible" lets an outsider enumerate org assets — incorrect at our security posture. Wrong-workspace is the deliberate exception: recovery value (switch workspace) justifies the mild existence confirmation.

---

## 7. Resource-row click affordance — whole-row vs identifier-only

**Question:** When a table row IS the entity (Archetype B in `tables.md` §1), what's the click affordance — whole-row click, identifier-only link, or a trailing action button?

**Industry landscape:** Stripe Customers and GitHub repo lists use identifier-only link. shadcn/ui's data-table example uses kebab-only with no row navigation. Cloudflare DNS uses per-row Edit buttons. None of these widely-cited B2B references make the full row clickable.

**Our call:** Whole-row click + identifier underline-on-hover. `tables.md` §1 Archetype B.

**Why for our context:** Operator dashboards run dense rows (40px default density), and the primary task on a Resource row is open-the-entity. Whole-row click gives the largest hit target — tapping anywhere on a wide row is faster than hunting for a link-text target. Identifier-only link costs scan time and misclicks at speed; trailing action buttons consume a column we'd rather give to data. The cost is one weak signal (hover underline) instead of one strong signal (link color); we accept it because operators learn the pattern after one session.

---

## How to use this file

1. **"I saw X at \[other SaaS\] — why don't we do that?"** — find it here. If it's not listed, our rule is the industry consensus, not a deliberate fork.
2. **Onboarding designers and engineers** — the unusual rules become explicable as deliberate calls, not arbitrary opinions.
3. **Re-evaluation** — each entry is a decision frozen in a context. If our context shifts (e.g. we add non-technical personas, or we ship single-org tooling), re-open the entries that depended on the prior context.

When adding a new entry, keep the structure: **question → industry landscape → our call (with file/section reference) → why for our context**. If you cannot name the industry split, the entry is not yet a house rule — it is either industry consensus we adopted, or our own untested opinion that needs more grounding before it earns a row here.
