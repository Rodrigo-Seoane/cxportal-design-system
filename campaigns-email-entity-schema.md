# Email Campaigns — Entity Schema

Cardinalities between every entity in the Email Campaigns feature, sourced from the Jira Epic [PRDENG-2618](https://pronetx.atlassian.net/browse/PRDENG-2618) and its child stories. Every row cites the ticket it comes from.

---

## Entities

| Entity | Lives at | What it is | Defined in |
|---|---|---|---|
| **Account** (a.k.a. Component) | Top of hierarchy | The agency-level scope above Campaign Group | [PRDENG-2794](https://pronetx.atlassian.net/browse/PRDENG-2794) |
| **Campaign Group** (a.k.a. Agency) | Under Account | The existing tenant unit; both email and voice/SMS live here | [PRDENG-2794](https://pronetx.atlassian.net/browse/PRDENG-2794) |
| **Topic** | Under Campaign Group | Direct parent of email campaigns; also the subscription unit. Email-only. | [PRDENG-2796](https://pronetx.atlassian.net/browse/PRDENG-2796) |
| **Email Campaign** | Under Topic | A single email send. Captures Template ARN + version at creation. | [PRDENG-2799](https://pronetx.atlassian.net/browse/PRDENG-2799) |
| **Voice/SMS Campaign** | Under Campaign Group (no Topic) | The existing non-email campaign types. Unchanged by this work. | [PRDENG-2799](https://pronetx.atlassian.net/browse/PRDENG-2799) |
| **Contact List** | Under Campaign Group | Single-column CSV (email, phone, or both). Up to 100M rows. Materialized as a Customer Profiles segment. | [PRDENG-2795](https://pronetx.atlassian.net/browse/PRDENG-2795) |
| **Template** | Under Campaign Group | HTML template stored in **Connect Wisdom**. Versioned via Wisdom. | [PRDENG-2797](https://pronetx.atlassian.net/browse/PRDENG-2797) |
| **Sender Identity** | Under Account | Verified `From:` address (SES-verified via inbox link). Referenced by ID, not re-verified per campaign. | [PRDENG-2793](https://pronetx.atlassian.net/browse/PRDENG-2793) |
| **Subscription** | Under Topic | Per `(componentId, topicId, subscriberId)`. Explicit storage, not derived. | [PRDENG-2796](https://pronetx.atlassian.net/browse/PRDENG-2796) |
| **Domain** | Under Account | SES-verified sending domain. DKIM/SPF/DMARC records. | [PRDENG-2792](https://pronetx.atlassian.net/browse/PRDENG-2792), [PRDENG-2868](https://pronetx.atlassian.net/browse/PRDENG-2868) |
| **Unsubscribe Record** | Under Account | Keyed by `(componentId, emailAddress)` — Component-scoped, **not** per-Topic. Record-only; not enforced server-side. | [PRDENG-2800](https://pronetx.atlassian.net/browse/PRDENG-2800) |

---

## Cardinality table

### Hierarchical ownership (1 : N)

| Parent | | Child | Source |
|---|---|---|---|
| Account | 1 : N | Campaign Group | PRDENG-2794 |
| Account | 1 : N | Sender Identity | PRDENG-2793 |
| Account | 1 : N | Domain | PRDENG-2792 |
| Account | 1 : N | Unsubscribe Record | PRDENG-2800 |
| Campaign Group | 1 : N | Contact List | PRDENG-2795 |
| Campaign Group | 1 : N | Template | PRDENG-2797 |
| Campaign Group | 1 : N | Topic | PRDENG-2796 |
| Campaign Group | 1 : N | Voice/SMS Campaign | PRDENG-2799 |
| Topic | 1 : N | Email Campaign | PRDENG-2799 |
| Topic | 1 : N | Subscription | PRDENG-2796 |

### Cross-references (associations, not ownership)

| From | | To | Type | Source |
|---|---|---|---|---|
| Topic | M : N | Contact List | associated with (Topic publishes to ≥1 List; a List can feed ≥1 Topic) | PRDENG-2796 |
| Topic | N : 1 | Template | declares as default | PRDENG-2796, PRDENG-2797 |
| Email Campaign | N : 1 | Template (specific version) | snapshot captured at creation, immutable | PRDENG-2799 |
| Email Campaign | N : 1 | Sender Identity | uses | PRDENG-2799 |
| Voice/SMS Campaign | M : N | Contact List | uses directly (no Topic in path) | PRDENG-2799 |

---

## Plain-English version (the way you asked)

- **1 Account → N Campaign Groups** (Account is the new top level, sits above the existing Campaign Group / Agency)
- **1 Account → N Sender Identities** (verified sender emails are Account-scoped, reusable across all Groups under that Account)
- **1 Account → N Domains** (SES-verified domains for sending)
- **1 Account → N Unsubscribe Records** (one row per email per Account — unsubscribing from one Topic effectively removes you from all Topics under that Account, since the suppression key is email + Account)

- **1 Campaign Group → N Contact Lists** (Lists are scoped to a Group; one Group has many Lists)
- **1 Campaign Group → N Templates** (Templates are Group-scoped Wisdom message templates)
- **1 Campaign Group → N Topics** (a Group has many Topics)
- **1 Campaign Group → N Voice/SMS Campaigns** (voice and SMS campaigns parent directly to a Group — no Topic in the middle)

- **1 Topic → N Email Campaigns** (a Topic is the parent of many email sends — each Campaign is one send under that Topic)
- **1 Topic → N Subscriptions** (per-subscriber rows in the explicit `Subscriptions` table)
- **N Topics ↔ M Contact Lists** (a Topic associates with ≥1 List; the same List can be reused across multiple Topics)
- **N Topics → 1 Template** (each Topic declares a single default Template — but many Topics can point at the same Template)

- **N Email Campaigns → 1 Template-at-version** (the Campaign captures a specific Wisdom version at creation; later publishes of that Template don't change what this Campaign sends)
- **N Email Campaigns → 1 Sender Identity** (one verified sender per Campaign)
- **N Voice/SMS Campaigns ↔ M Contact Lists** (voice/SMS targets one or more Lists directly)

---

## Audience derivation for an Email Campaign

This is the part Jira describes but doesn't fully diagram. Quoting [PRDENG-2796](https://pronetx.atlassian.net/browse/PRDENG-2796) verbatim:

> Subscribers subscribe to a Topic, and every email campaign sent under that Topic addresses those subscribers.

And [PRDENG-2800](https://pronetx.atlassian.net/browse/PRDENG-2800) verbatim:

> We do **not** enforce suppression on our send side; the customer pulls the unsubscribes export and applies it externally when they upload their next CSV.

So at run time, an Email Campaign's audience is:

```
audience = subscribers_of(topic) 
           ∩ members_of(any Contact List associated with topic)
         − unsubscribes_at_account_level
```

Implementation: the Lists are materialized as Customer Profiles segments (per PRDENG-2795), which Connect Outbound Campaigns consumes as the audience source. The `Subscriptions` table (per PRDENG-2796) drives who's actually opted in. The customer-side post-processing applies the unsubscribe export to the next CSV upload — the platform records but does not filter.

---

## Notable consequences worth flagging

1. **Unsubscribes are Account-scoped, not Topic-scoped.** The `Unsubscribes` table is keyed by `(componentId, emailAddress)` — one row per email per Account. This means unsubscribing from "Monthly Statements" effectively unsubscribes you from every Topic in that Account. If a subscriber wants per-Topic granularity, the design doesn't support it. Worth confirming this is intentional with J.C. Paz.

2. **Templates are not in our database.** They live in Connect Wisdom (per PRDENG-2797). The `EmailTemplateIndex` table is a local metadata index pointing at Wisdom ARNs. Don't model Templates as if they're owned data — the version dropdown is reading Wisdom versions.

3. **Email Campaigns are immutable at the template level.** A Campaign captures the Template ARN at a specific version at creation. Later edits to that Template don't retroactively change the Campaign. This is per PRDENG-2799 — explicit design choice.

4. **Voice/SMS Campaigns bypass Topic.** The hierarchy is conditional by channel:
   - Email: `Account → Group → Topic → Email Campaign`
   - Voice/SMS: `Account → Group → Voice/SMS Campaign` (no Topic)
   This is per PRDENG-2799. The Topic level only exists for email.

5. **Contact List + Topic is many-to-many.** A Contact List can serve multiple Topics (e.g., "All Retirees" feeds "Monthly Statements" and "COLA Updates" and "Important Notices"). A Topic can pull from multiple Lists (e.g., "Important Notices" might combine "Active Subscribers" and "Beneficiaries"). The join lives in a Topic↔List association table not yet documented in Jira but implied.

6. **Mid-campaign Contact List updates are rejected at the API edge.** PRDENG-2795 explicit. The UI must hard-block any attempt to modify a List that's currently bound to an in-progress campaign — not warn, block.

---

## Source ticket map

| Ticket | What this schema took from it |
|---|---|
| [PRDENG-444](https://pronetx.atlassian.net/browse/PRDENG-444) | Roles (Org Admin / Department Editor / Department Read-Only) |
| [PRDENG-2618](https://pronetx.atlassian.net/browse/PRDENG-2618) | Epic — Email Campaigns scope |
| [PRDENG-2792](https://pronetx.atlassian.net/browse/PRDENG-2792) | Domain entity, SES verification, DKIM/SPF/DMARC |
| [PRDENG-2793](https://pronetx.atlassian.net/browse/PRDENG-2793) | Sender Identity at Account scope; SES inbox-link verification |
| [PRDENG-2794](https://pronetx.atlassian.net/browse/PRDENG-2794) | Account (Component) layer above Campaign Group |
| [PRDENG-2795](https://pronetx.atlassian.net/browse/PRDENG-2795) | Contact List schema, single-column CSV, 100M rows, Customer Profiles segment materialization, mid-campaign update rejection |
| [PRDENG-2796](https://pronetx.atlassian.net/browse/PRDENG-2796) | Topic as parent of Email Campaign and subscription unit; explicit `Subscriptions` table; default template; List association |
| [PRDENG-2797](https://pronetx.atlassian.net/browse/PRDENG-2797) | Templates in Connect Wisdom; `EmailTemplateIndex` metadata table; Topic-declared default |
| [PRDENG-2799](https://pronetx.atlassian.net/browse/PRDENG-2799) | Email campaigns require Topic; voice/SMS don't; template ARN+version captured at creation |
| [PRDENG-2800](https://pronetx.atlassian.net/browse/PRDENG-2800) | Unsubscribe Record keyed by `(componentId, emailAddress)`; record-only, not send-time suppression |
| [PRDENG-2868](https://pronetx.atlassian.net/browse/PRDENG-2868) | Domain Configuration UI surface (frontend visibility of SES domains) |
