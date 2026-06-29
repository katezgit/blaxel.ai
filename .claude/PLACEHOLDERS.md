# Toolkit placeholder catalog

This toolkit is a generalized extraction of one project's `.claude/` orchestration + workflow rules. Project-specific names, paths, personas, and domain terms have been replaced with placeholder tokens so the toolkit can be adopted by another project.

**Adoption:** clone or copy the toolkit into a new project, then find-replace each placeholder with the values for your product. The substitutions are mechanical — no token's meaning depends on others.

## Placeholders

| Token | Meaning | Example value |
| --- | --- | --- |
| `{PRODUCT_NAME}` | Product / brand name (capitalized) | `Linear`, `Vercel`, `Stripe` |
| `{PRODUCT_URL}` | Marketing site host | `linear.app` |
| `{PRODUCT_DOCS_URL}` | Public documentation host | `docs.linear.app` |
| `{PRODUCT_TAGLINE}` | One-line marketing description of what the product does | `"Linear is the issue tracking tool you'll actually enjoy using."` |
| `{PRODUCT_DOMAIN}` | One-phrase domain category | `issue tracking`, `payments infra`, `developer sandboxes` |
| `{PRIMARY_PERSONA}` | Primary user persona name | `Alex`, `Maya` |
| `{PRIMARY_PERSONA_LOWER}` | Primary persona slug used in filenames | `alex` (matches `{PRIMARY_PERSONA}` lowercased) |
| `{SECONDARY_PERSONA}` | Secondary user persona name | `Sam` |
| `{TERTIARY_PERSONA}` | Tertiary persona (optional, may be unused) | `Maya` |
| `{APP_NAME}` | Primary Next.js / app folder name under `apps/` | `web`, `portal`, `dashboard` |
| `{REPO_ABSOLUTE_PATH}` | Absolute filesystem path to the repo root | `/Users/you/projects/your-product` |

**External precedent examples** (Linear, Vercel, Fly.io, Modal, E2B, shadcn, etc.) appear in some docs as examples of "external prior art to borrow from but evaluate against the product anchor." Replace these with companies/products that fit your domain — they are illustrative, not load-bearing.

**Inline bracket placeholders.** Where a doc enumerates domain-specific resources as illustrative examples (e.g. "Run scenarios for: Sandbox detail, Job detail, ..."), the toolkit uses bracket form — `[resource type A]`, `[resource type B]`, `[domain event A]`, `[primitive A]` — instead of formal `{TOKEN}` placeholders. The signal is the same (fill these in for your domain), but the bracket form makes it obvious they are scaffolding examples, not load-bearing names. Replace each with your own concrete resource / event / primitive when adopting.

**Operator name.** The original docs occasionally referenced the operator by first name; these were normalized to "the operator". No `{OPERATOR_NAME}` placeholder is provided — the toolkit treats "the operator" as the canonical term (matches how every other rule in CLAUDE.md and the workflows refers to the human collaborator).

**Repo / stack conventions retained verbatim:**
- Monorepo layout: `apps/`, `packages/ui/`, `packages/libs/`
- Package aliases: `@repo/ui`, `@repo/libs`
- Stack: Next.js + React 19 + TypeScript + Tailwind v4 + TanStack Query
- Design doc layout: `docs/product/`, `docs/design/{flows,screens,components,foundations,guidelines,patterns,reviews}/`, `docs/conventions/`, `docs/testing/`
- Workspace discipline paths: `.intermediate/`, `.state/state.md`

If your project uses a different stack or layout, those references will also need editing — they were not tokenized because they shape the toolkit's assumed structure.

## Historical incidents

Several docs include short anecdotes like *"Incident (YYYY-MM-DD): operator asked X, model did Y instead — wrong."* These illustrate why a rule exists. They have been kept (with product-specific nouns scrubbed) because the lesson is portable; the dates are not significant.
