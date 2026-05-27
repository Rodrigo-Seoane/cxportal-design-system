# Email Campaigns — Entity Cardinalities Matrix

**Source:** TypeScript interfaces in `app/sandbox/campaigns-email/_mock/` as implemented in the final design.

This document captures the relationships between the core entities in the Email Campaigns module. Cardinalities are stated as observed in the implemented data model, with notes where the model permits something the UI hides or where an open product question is still pending.

---

## Entities

| Entity | Interface | Identity |
|---|---|---|
| **Account** | `Account` | `id` (e.g., `ssa-rsc`, `ssa-foc`) |
| **Component** | `SSAComponent` | `id` (e.g., `rsc`, `dsc`, `mcc`) — SSA's ~12 internal subdivisions |
| **Campaign Group** | `CampaignGroup` | `id` (e.g., `rsc-g1`) — carries both `accountId` and `componentId` |
| **Topic** | `Topic` | `id` — recurring subscription stream under a Campaign Group |
| **Campaign** | `Campaign` | `id` — a single send (email, SMS, or voice) |
| **Email Template** | `EmailTemplate` | `id` — HTML body + subject + versions |
| **Template Version** | `TemplateVersion` (embedded) | composite `(templateId, version)` |
| **Contact List** | `ContactList` | `id` — CSV-imported recipient set, channel-typed (email / phone / both) |
| **Sender Identity** | `SenderIdentity` | `id` — verified "from" address (the "Channel" surface) |
| **Contact** | `Contact` | `id` — individual recipient row inside a list |
| **Member** | _(not modeled — see RBAC notes)_ | — |

---

## Containment hierarchy (strict parent-child)

```
Account
  └── Campaign Group  (each group carries accountId + componentId)
        ├── Topic
        │     └── Campaign (email channel only — Topic is the natural parent)
        ├── Campaign Group → Campaign (SMS / Voice channels — topic is null)
        ├── Contact List
        ├── Sender Identity
        └── Email Template
              └── Template Version
```

**One asymmetry worth flagging:** the data model includes `Component` as a separate entity (12 SSA subdivisions like Retirement Services, Disability Services), and every Campaign Group carries both `accountId` and `componentId`. The Account Management UI **does not** surface Component as a hierarchy level — it renders three drill-down levels (Account → Group → Topic), and Component is effectively a category tag on Campaign Groups. Treat Component as metadata, not a navigation node.

---

## Cardinality matrix

Rows are the **source** entity; columns are the **target**. Each cell shows how many `target` instances a single `source` instance can have, and (where applicable) the inverse relationship as a parenthetical.

| ↓ Source · Target → | Account | Component | Campaign Group | Topic | Campaign | Template | Tmpl Version | Contact List | Sender | Contact |
|---|---|---|---|---|---|---|---|---|---|---|
| **Account** | — | 1..N _(via groups)_ | **1..N** | 0..N _(via groups)_ | 0..N _(via groups)_ | 0..N _(via groups)_ | 0..N | 0..N | 0..N | 0..N |
| **Component** | _N:1 (implicit, via groups)_ | — | **1..N** | 0..N _(via groups)_ | 0..N | 0..N | 0..N | 0..N | 0..N | — |
| **Campaign Group** | _N:1_ | _N:1_ | — | **0..N** | **0..N** | **0..N** | 0..N | **0..N** | **0..N** | 0..N _(via lists)_ |
| **Topic** | _N:1 (via group)_ | _N:1 (via group)_ | _N:1_ | — | **0..N** | 0..1 _(default template)_ | — | **0..N** _(M:N — see below)_ | 0..N _(via default sender — TBD)_ | — |
| **Campaign** | _N:1 (via group)_ | _N:1 (via group)_ | _N:1_ | **0..1** _(email: required; SMS/voice: null)_ | — | **1** | — | **1..N** _(M:N — listIds array)_ | **1** | 0..N _(via lists)_ |
| **Email Template** | _N:1 (via group)_ | _N:1 (via group)_ | _N:1_ | **0..1** _(topicId nullable)_ | 0..N _(used by campaigns)_ | — | **1..N** | — | — | — |
| **Template Version** | — | — | — | — | — | _N:1_ | — | — | — | — |
| **Contact List** | _N:1 (via group)_ | _N:1 (via group)_ | _N:1_ | **0..N** _(M:N — topicIds array)_ | 0..N _(via campaigns)_ | — | — | — | — | **0..N** |
| **Sender Identity** | _N:1 (via group)_ | _N:1 (via group)_ | _N:1_ | 0..N _(via topic default — TBD)_ | 0..N _(via campaigns)_ | — | — | — | — | — |
| **Contact** | — | — | — | — | — | — | — | _N:1_ | — | — |

**Reading guide:** bolded cells are the direct, modeled relationship. Italicized cells are derived (the relationship exists only by transitivity through another entity). Cells reading "0..N _(via X)_" indicate the relationship is not directly stored — you read it by joining through entity X.

---

## Key relationships in plain language

### Strict 1:N containment

- **1 Account → N Campaign Groups** — `Account.campaignGroupIds: string[]`, and each `CampaignGroup` also carries an `accountId` back-pointer.
- **1 Campaign Group → N Topics** — every Topic has a `groupId`.
- **1 Campaign Group → N Contact Lists / Senders / Templates** — same pattern: each child carries `groupId`.
- **1 Topic → N Campaigns** (for email channel) — `Campaign.topicId` points back. For SMS / voice campaigns, `topicId` is `null` and the Campaign Group is the direct parent.
- **1 Email Template → N Template Versions** — versions are an embedded array on the template.

### N:1 lookups

- **1 Campaign → 1 Sender** — `Campaign.senderId`. Each campaign sends from exactly one identity.
- **1 Campaign → 1 Template** — `Campaign.templateId`. Each campaign uses exactly one template (at one version implicitly, though version is not yet pinned).
- **1 Topic → 0..1 default Template** — `Topic.defaultTemplateId: string | null`. Each topic has at most one default; null is allowed (one of the 8 mock topics has `null`).

### N:N associations (modeled as arrays)

- **Contact List ↔ Topic** — `ContactList.topicIds: string[]`. A list can be associated with multiple topics (e.g., a Medicare list serving both the "Annual Notice" and "IEP" topics), and a topic can use multiple lists. **True many-to-many** in the data.
- **Campaign ↔ Contact List** — `Campaign.listIds: string[]`. A campaign can target multiple lists in one send. **True many-to-many** in the data.

### The Template ↔ Topic question (still open per the Jira update)

This is the trickiest relationship and the one explicitly flagged as open:

- **Template.topicId → Topic**: nullable `string`. A template can have at most one topic association (`0..1`). Effectively, the *current* schema treats this as **N:1** (many templates can each name one topic).
- **Topic.defaultTemplateId → Template**: nullable `string`. A topic can have at most one default template (`0..1`). Effectively **N:1** in the other direction.

What the schema **permits but the product hasn't decided**: the same template could be set as `defaultTemplateId` for multiple topics simultaneously (nothing in the data model prevents this). Whether that's desirable — i.e., whether a single "Welcome" template should be reusable as the default across, say, all Medicare topics — is the cardinality question the team still owes an answer on.

**Practical states observable in the mock data:**
- Each of the 8 topics points to a distinct `defaultTemplateId`, so today's seed treats it as effectively 1:1 by convention.
- Each of the 7 templates carries exactly one `topicId`, also effectively 1:1.
- But the types don't enforce this.

If the product decision lands on "a template can be reused across topics," only the seed data changes — the schema already supports it. If the decision is "strict 1:1," add a uniqueness constraint to either `topicId` on Template or `defaultTemplateId` on Topic.

---

## RBAC cardinalities (not yet modeled as data)

The RBAC layer is currently surfaced via `_context/RoleContext.tsx` (4 roles: `super-admin`, `account-admin`, `editor`, `viewer`) and gated per-screen. There is **no Member or User entity** in the mock data — `CampaignGroup.memberCount: number` is a display count only.

The intended user ↔ scope cardinalities (per the meeting decisions):

| Role | Account scope | Campaign Group scope |
|---|---|---|
| `super-admin` | **N** (all accounts) | **N** (all groups) |
| `account-admin` | **1..N** (one or more — meeting confirmed multi-account is supported) | **N** (within their assigned accounts) |
| `editor` | **1..N** | **1..N** (assigned subset of groups) |
| `viewer` | **1..N** (confirmed multi-account at the meeting — Rodrigo's prior single-scope assumption was overturned) | **1..N** |

Effectively the User ↔ Account and User ↔ Campaign Group relationships are both **N:N** in the design, even though no Member entity is in the data layer yet. When a real Member table is introduced, expect a `MemberAccountAssignment` and `MemberGroupAssignment` join shape.

---

## Modeling notes & inconsistencies

1. **Component vs. Account**: every Campaign Group carries both `accountId` and `componentId`. The data is internally consistent (each component's groups all share one `accountId`), but the model could collapse `Component` into a `tag` field on `CampaignGroup` without losing information. Keep it separate only if Components will eventually be admin-managed as first-class entities.

2. **Campaign.channel vs. Campaign.type**: the schema has both `channel: 'email' | 'sms' | 'voice'` (required) and `type?: CampaignType` (optional, more granular: `voice-survey`, `sms-notification`, etc.). The two are redundant — `type` always implies `channel`. Pick one before the model goes to backend.

3. **Contact List → Channel scope**: `ListChannel = 'email' | 'phone' | 'both'`. A `both` list can feed either an email or an SMS/voice campaign. The campaign creation flow needs to filter lists by the selected channel — current data supports this but the relationship is implicit, not enforced.

4. **`CampaignGroup.memberCount`** is a denormalized display value with no underlying Member entity. When the Member table is introduced, this becomes computed.

5. **Template version pinning on Campaign**: `Campaign.templateId` points to a template but does not pin a version. The current mock implies "always use the latest published version." If campaigns ever need to lock against a snapshot, add `templateVersion: number` to `Campaign`.

6. **Topic → Sender (default)**: not currently in the schema. The meeting decision was "topics can have a default sender" but `Topic` only carries `defaultTemplateId`. To honor the decision, add `defaultSenderId: string | null` to `Topic`.

7. **Topic → Contact List (default)**: same gap. The meeting decision included "default recipient list per topic" but `Topic` doesn't carry that field. To honor it, add `defaultListId: string | null` to `Topic`.

---

## TL;DR summary

```
Account ──1:N──> Campaign Group ──1:N──> Topic ──1:N──> Campaign
                       │                    │             │
                       ├──1:N──> Sender ────┴── N:1 ──────┤
                       ├──1:N──> Template ──N:1──> Topic  │  (default; see open question)
                       │              │                   │
                       │              └── N:1 ────────────┘  (campaign uses one template)
                       │
                       └──1:N──> Contact List ──N:N──> Topic
                                       │                │
                                       └── N:N ─────────┘  (campaign targets many lists)
                                       │
                                       └──1:N──> Contact
```

Direct N:N relationships: **List ↔ Topic** and **Campaign ↔ List**.

Open cardinality question: **Template ↔ Topic** — schema allows N:N via `defaultTemplateId`, seed convention is 1:1, product decision pending.
