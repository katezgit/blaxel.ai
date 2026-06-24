# Notifications

Pattern decision on whether the Blaxel dashboard needs an in-app notification surface, what events feed it, and what UX pattern to ship.

## Verdict

**Ship a notification surface, scoped as an async-state inbox.** Strong case, but narrower than a Slack-style feed. The MVP is a bell + popover paired with email, modeled on Vercel. The load-bearing reason isn't team collaboration — it's that Blaxel's surface map is dense with **async outcomes Alex can't watch live** (job results, agent health flips, build outcomes, expiry warnings). Workspace invitations and account management are the floor of the use case, not the ceiling.

## Why it's needed (Blaxel-specific)

Each event below fires while Alex is on a different surface. The canonical detail page already shows the state — the notification solves *discovery latency across surfaces*, not state display.

### Async outcomes
- Batch Job completion / failure summary
- Agent health transition (healthy → degraded / errored)
- MCP Server / Model API deploy failure
- Image build success / fail
- Sandbox state transition failure post-spawn

### Threshold + expiry warnings (gate next action)
- Sandbox TTL expiry (24h, 1h)
- API Key expiry (7d, 24h) — caps the silent-expiry → requests-fail loop
- Warm-pool concurrent-sandbox cap nearing
- Tier upgrade eligible (spend threshold met)
- Credit balance low

### Collaboration + security
- Workspace invitation received (recipient)
- Invitation accepted / declined (inviter)
- Service account created / rotated / revoked by another admin
- Suspicious API key activity *(only if anomaly detection exists)*

### Explicitly out of the inbox
- **Synchronous policy denials at deploy-time** — log line, user is already watching.
- **Invoices** — email + Settings → Invoices is enough.
- **Comment threads / async collaboration on primitives** — out of scope per [`personality.md`](../../product/personality.md).

## Pattern: bell + popover, email-paired

Modeled on Vercel. Evidence from comparable platforms:

| Platform | In-app surface | Notes |
|---|---|---|
| Vercel | Bell + popover | Read/archive triage, paired email, web-read suppresses email |
| GitHub | Bell → full `/notifications` inbox | Filters, grouping, triage actions |
| Railway | In-app + email + webhooks | Threshold alerts on dashboard widgets |
| Modal | None (Slack only) | Closest peer on compute model — deliberately *not* in-product |
| Render | Email + Slack only | No in-dashboard inbox |
| Fly.io | None (personalized status page) | BYO alerting via Prometheus |
| E2B | Unknown / none advertised | — |

Sources: [vercel.com/docs/notifications](https://vercel.com/docs/notifications), [docs.github.com — notifications](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications), [docs.railway.com/observability/webhooks](https://docs.railway.com/observability/webhooks), [modal.com/docs/guide/slack-notifications](https://modal.com/docs/guide/slack-notifications), [render.com/docs/notifications](https://render.com/docs/notifications), [fly.io/docs/monitoring](https://fly.io/docs/monitoring/).

The split tracks user archetype: polished consumer-grade dashboards (Vercel, GitHub, Railway) treat the bell as first-class chrome; infra-leaning platforms (Fly, Render, Modal) treat notifications as routing config. Alex lives in Vercel + GitHub all day and expects the affordance — so the Modal precedent of no in-app surface is a constraint to consciously break, not a default to inherit.

## MVP scope

- Bell icon in app-shell chrome with unread counter.
- Popover (not a full page) showing the last ~15 events, newest first.
- Each row: category icon, one-line summary, relative timestamp, link to canonical detail page.
- Triage: mark-read, archive. No bulk select, no filters in MVP.
- Email pairing: same events go to email. Web read state suppresses the email (Vercel-style dedup) to prevent double-tap fatigue erodes trust in either channel.
- Categories shipped in MVP: async outcomes + threshold/expiry warnings + invitations + service account changes.

## Deferred to v2

- Dedicated `/notifications` page with filters + grouping (GitHub-style inbox).
- Per-rule channel routing (mute by category, route to Slack/email/webhook independently).
- Webhooks for downstream alerting integrations.
- SMS / push.
- Anomaly-detection-driven security notifications (depends on whether platform ships anomaly detection at all).

## Open questions

- **Critical-vs-configurable split.** Vercel and Render force-on certain categories (billing, deploy fail) and let users mute the rest. Which Blaxel categories are non-mutable? Likely: API key expiry, credit balance low, suspicious activity.
- **Workspace scope.** Notifications per workspace, or per account across workspaces? Tied to the tenancy model — Alex switching workspaces shouldn't lose visibility into job outcomes in another workspace if both are in the same account.
- **Retention.** How far back does the popover go? Probably 30 days, archive everything older.
