# Product

**Blaxel** (blaxel.ai) is the **perpetual sandbox platform** — secure, infinite sandboxes kept on automatic standby to run AI code, with agents and context co-hosted on the same infrastructure plane for near-instant latency. Customers are AI builders at high-growth companies who need a production-grade runtime for agents that execute code, browse, and call tools without rebuilding sandbox infrastructure themselves. End-to-end workflow: declare a sandbox image (or volume / drive), wire an agent (or MCP server / hosted model) against it, define API keys + policies for security, then run jobs against the warm pool — paying for the agent loop, not for cold starts.

**Marketing positioning.**
- Landing page slogan: *"The perpetual sandbox platform."*
- Subhead: *"Blaxel lets you keep infinite, secure sandboxes on automatic standby, while co-hosting your agents and context for near instant latency."*
- LinkedIn company about: *"Blaxel keeps infinite, secure sandboxes on automatic standby to run AI code, while co-hosting your agents for near instant latency."*

**Customers — "Trusted by AI builders from high-growth companies."** Cubic, Mendral, Shortwave, Polsia, Vybe, Casco, Bloom, Cartage, hirethomas.ai, Sapiom, Webflow, Strapi, Ploy, Human Behavior.

---

This file is the raw product brief — the input the product-designer reads to derive the downstream artifacts.

- **Personas:** [`personas.md`](./personas.md) — primary + secondary + anti-patterns.
- **Primary persona workflow:** [`alex-workflow.md`](./alex-workflow.md) — phased journey through the product.
- **Primary persona user stories:** [`alex-user-stories.md`](./alex-user-stories.md) — concrete jobs per phase.
- **Personality:** [`personality.md`](./personality.md) — derived from this brief + the four files above.

---

**Out of scope (deliberately not in this brief):** model training / RLHF tooling (Blaxel runs inference + agent code, not training jobs), data labeling pipelines, end-user-facing UIs for the customer's *own* product (Blaxel is the runtime under the customer's agent, not the chat surface their users see), and CI/CD for arbitrary code (the sandboxes are scoped to agent / AI workloads, not general-purpose build infra).
