# Email Campaigns — Meeting Follow-Ups (2026-05-12)

**Attendees:** Rodrigo, Max English, Matt Danzig, Mebin Robin
**Source:** Read AI transcript + Figma slides used to walk through open questions
**Related:** [Prompt plan](./campaigns-email-prototype-plan.md) · [PRDENG-2867](https://pronetx.atlassian.net/browse/PRDENG-2867)

---

## TL;DR — what changed

- **Topic is now the work unit for email**, not the campaign. Email campaigns live inside topics. SMS/Voice stay at campaign-group level for now.
- **New IA:** Account → Campaign Group → Topic → Campaign (email) / Account → Campaign Group → Campaign (SMS, Voice).
- **The campaign wizard collapses** when launched from a topic: only Name + Schedule needed (topic pre-populates sender, template, list, group).
- **CSV upload is a single scrollable form**, not a stepper — mirror the Amazon Connect import pattern.
- **Two of the four open questions are now resolved.** Two new ones surfaced (account switching, RBAC matrix corrections).

---

## A. Decisions captured (no action — just record)

- [x] Topics are first-class objects (not "labeled lists"). The toggle proposed in prompt 7 is **killed**.
- [x] Hierarchy labels are locked: **Account / Campaign Group / Topic / Campaign**. The toggle in prompt 4 is **killed**.
- [x] Contact lists live at **Campaign Group level**, not topic level.
- [x] Templates live at **top-level**, usable across orgs. Topics can have a **default template** pre-selected.
- [x] Topic creation is **admin-only**. Editors create campaigns inside existing topics.
- [x] Topic has an **enable/disable** state — disabled topics block new campaigns under them (archival behavior). Campaigns have **pause/resume/delete** separately (native outbound primitive).
- [x] CSV upload uses a **single required column** (email or phone). Everything else is optional — first/last name, address, DOB, custom attributes. System auto-infers headers.
- [x] List **replace/update** is in scope. **Single-record add is not** in phase 1 or 2.
- [x] Customer profile is capped at **100 attributes** — keep this in mind when mocking the mapping UI.
- [x] **Viewers** can be associated with multiple campaign groups AND multiple accounts (Rodrigo had assumed single-scope — wrong).
- [x] **Admin tiers exist**: super admin (all accounts) and account-level admin (limited reach).
- [x] Account-level user management UI **mirrors** the campaign-group user management UI.
- [x] Metrics scoping for phase 1 is **account-level** (per SSA's component-level ask).

---

## B. Plan edits — required before sending each prompt

Each item references the prompt number in `campaigns-email-prototype-plan.md`.

### Prompt 1 — Module shell, mock data spine

- [ ] Add **Accounts** as the top-level entity in `_mock/groups.ts`. Rename file to `_mock/hierarchy.ts` to reflect that it now holds Account → Campaign Group → Topic.
- [ ] Add `_mock/accounts.ts` with at least 2 accounts (e.g., "SSA — Field Operations" and "SSA — Retirement Services") so the multi-account switcher has something to render.
- [ ] Update the sub-nav in the layout to reflect new IA: **Topics** (primary for editors), **Campaigns**, **Templates**, **Lists**, **Senders**, **Campaign Groups**, **Accounts** (admin only), **Metrics**.
- [ ] Topics should be the **default landing** for the editor role — not a generic dashboard. Make the prototype's root page redirect to `/topics` when role = editor.

### Prompt 2 — Shared primitives

- [ ] No changes — `SenderIdentityStatus`, `MetricTile`, `ChannelBadge` all still apply.
- [ ] Add a 4th small primitive: **`AccountSwitcher.tsx`** — top-bar dropdown that only renders when the current mock user has access to >1 account. Hidden otherwise. Persists active account in React context.

### Prompt 3 — Sender Identity Verification Settings

- [ ] Senders are scoped to **campaign group** (so the column rename is fine; the Group column = Campaign Group).
- [ ] Topics reference a **default sender** — the topic config screen will pick from senders within the topic's campaign group. Make sure the senders mock exposes which group each belongs to.

### Prompt 4 — Campaign Groups & Hierarchy → split into TWO surfaces

This prompt was originally written as one page. With Account-level admin and the multi-account switcher, it's cleaner to split.

- [ ] **Prompt 4a — Accounts page** (`app/sandbox/campaigns-email/accounts/page.tsx`). Admin-only. Lists accounts, click into an account = sets it as active in the AccountSwitcher context. Account detail shows users with access, list of campaign groups under it.
- [ ] **Prompt 4b — Campaign Groups page** (`app/sandbox/campaigns-email/groups/page.tsx`). Lists campaign groups under the *active* account. Group detail shows: members, topics under this group, lists under this group, senders under this group.
- [ ] **Kill the hierarchy-label toggle** — the labels are locked.
- [ ] Both pages should respect the role: editor doesn't see Accounts at all; editor with single-group access doesn't see Campaign Groups list either, lands directly on Topics.

### Prompt 5 — Contact List Management

- [ ] Lists are scoped to **Campaign Group**, not topic. Make sure that's reflected in `_mock/lists.ts` and in the page filters.
- [ ] Add an "Associated topics" column (topics that reference this list) — read-only count, click drills into the topics that use it.
- [ ] Remove any UI suggesting a list can be tied to a single topic exclusively.

### Prompt 6 — Recipient List Upload — **major rewrite, no longer a stepper**

Replace the wizard concept entirely with a single-page form modeled on Amazon Connect's profile import.

- [ ] One scrollable modal (or full-page form — Rodrigo's call). No stepper.
- [ ] Sections, top to bottom: (1) **Name** field, (2) **Drag-and-drop upload zone** that activates the next section on a valid file, (3) **Auto-detected mapping table** — one row per CSV column showing: CSV header (read-only), inferred profile attribute (editable Select with native Connect attributes), or "Custom attribute" (free-text input), or "Ignore" option, (4) **Preview** — first 5 rows of the CSV with the mapped attributes applied, (5) **Action row** — Cancel / Import.
- [ ] **Critical UX details:**
  - Show visually which columns are mapped to **system attributes** vs **custom attributes** vs **ignored** (three distinct chip styles).
  - If the user uploads a CSV with 12 columns and we only need 3, surface that as "9 columns will be ignored — click to map".
  - Hard-block the Import button if no email/phone column is mapped.
  - Show "X of 100 attributes" warning if approaching the profile-attribute cap.
- [ ] Wire this same component into "Update list" — when invoked from an existing list, pre-fill the name and warn if the new file's columns don't match the existing profile schema.
- [ ] **Remove** the "single-column vs GovDelivery vs rich format" source picker — there's only one format.

### Prompt 7 — Topics → now the **central editor screen**, not a side feature

This is the biggest rewrite. Topics moves from a secondary surface to the editor's primary workspace.

- [ ] Topics index page becomes the **editor's default landing**. It needs to feel like a dashboard, not a CRUD table.
- [ ] Each topic card / row should show: name, group, subscriber count, default sender, default template, last campaign sent, last 4 weeks of open-rate as a sparkline (use `MetricTile` or a slim chart), enabled/disabled state.
- [ ] **Topic detail page** (`topics/[id]/page.tsx`) is the work hub: topic metadata at top, big "Start campaign" CTA, metrics tiles for the topic itself, list of campaigns under this topic (this is where most of the user's time will be spent).
- [ ] **Kill the topic-objects-vs-labeled-lists toggle** — topics are first-class.
- [ ] **Topic create flow** — admin-only. Configure name, group, default sender, default template, default contact list, enabled state. **Confirmed:** keep default sender and default template on the topic.
- [ ] Add an "Enable / Disable" control on the topic detail — disabled blocks new campaigns under that topic.
- [ ] **Inside Campaign Group → settings**, also expose topic management as a tab (Mebin's suggestion — topics get configured rarely, mostly during group setup). The topics list and topics-tab-in-group are two views of the same data.

### Prompt 8 — Email Template Editor & Versioning

- [ ] Templates are **top-level**, not nested under topics. Confirm the index page is at `/templates`, not `/topics/[id]/templates`.
- [ ] On the topic config screen, the "default template" field is a dropdown of all top-level templates (filtered to those in the topic's account/group scope).
- [ ] **RBAC fix:** the matrix said "Department Read-Only can view and use templates". "Use" doesn't make sense for read-only — they can't create campaigns. Change to **"View only"** for read-only role across templates.
- [ ] Max still owes the canonical variable list — keep the footnote.

### Prompt 9 — Campaign Stepper → now **two flows**, one drastically simpler

This is the second-biggest rewrite. The wizard collapses dramatically for email-from-topic.

- [ ] **Flow A — Start from topic (email, primary flow).** Entry point: "Start campaign" button on a topic detail page. The campaign comes pre-populated with topic, sender, template, list, campaign group. **The only fields the user needs are: Name + Schedule.** Use a simple 2-step stepper OR a single form — Rodrigo's call. Allow override of sender/template/list if needed, but don't make those primary steps.
- [ ] **Flow B — Start from campaign group (SMS/Voice, secondary flow).** Keeps the longer stepper because there's no topic to inherit from. This is essentially the existing wizard for SMS/Voice channels — don't refactor it, just make sure email is no longer in its channel picker.
- [ ] **Entry points to clean up:**
  - "New campaign" from the global nav → route to topic picker first (if email) or to Flow B (if SMS/Voice).
  - "Start campaign" from a topic → Flow A.
  - "New campaign" from a campaign group page → Flow B (channel picker excludes email).
- [ ] Don't build a separate "select topic" step inside the wizard — the topic is the entry point, not a step.
- [ ] Cancel / save-as-draft / confirm-discard behavior stays the same.

### Prompt 10 — Metrics Dashboard + Unsubscribes

- [ ] Metrics scoping for phase 1 is **account-level**. Make the metrics page filter by account first, then campaign group, then topic — not by campaign group as the top filter.
- [ ] **Unsubscribes — DEFER detailed design.** Build a placeholder page with the table and CSV export, but don't invest in the grace-period nuance or the topic-level breakdown yet. Add a banner: "Detailed unsubscribe handling pending follow-up meeting." This was explicitly flagged in the transcript as "needs more time."
- [ ] Topic detail page already shows topic-level metrics (built in prompt 7), so the campaign-detail metrics page focuses on *single campaign* drill-down.

### Prompt 11 — Cross-flow wiring + RBAC

- [ ] **Rewrite the RBAC matrix** before this prompt fires. The old chart used Org/Department labels; replace with Account/Campaign Group/Topic and add columns for: super admin, account admin, campaign-group admin, editor, viewer. Fix the "Department Read-Only → view and use templates" inconsistency.
- [ ] Role-switcher logic update:
  - Viewer with **single account, single group**: no Account or Campaign Groups nav entries, lands on Topics.
  - Viewer with **multiple groups, single account**: no Accounts nav, sees Campaign Groups switcher.
  - Viewer with **multiple accounts**: AccountSwitcher visible in top bar.
  - Editor: same view rules, plus campaign create/edit affordances.
  - Account admin: Accounts page visible; user management at account level mirrors group-level UI.
  - Super admin: all accounts visible.

### Prompt 12 — Empty / error / loading / a11y

- [ ] No structural changes — but make sure the AccountSwitcher's empty state (single-account user) is handled, and the topic disable/enable state is visually obvious in lists.

---

## C. New open questions — surface in the next meeting

- [ ] **Templates and topic association.** Mebin said templates live at top-level, but topics have a default template. Question for next meeting: can a single template be the default for multiple topics? Or is the default relationship 1:1? This affects how the template list shows "used by" counts.
- [ ] **SMS/Voice under topics?** Mebin floated putting everything under a default hidden topic for consistency. Currently deferred. Worth a brief decision before the design system reflects two parallel hierarchies long-term.
- [ ] **Account-switching UX.** Top-bar dropdown vs. dedicated accounts page. Max raised it but didn't resolve. Need a quick decision — the AccountSwitcher primitive needs to know.
- [ ] **Campaign-group-level user management — still needed once accounts exist?** Mebin wants to meet with Nick to decide. Until then, build it as if both levels can manage users (no regression on current behavior).
- [ ] **Subscriber self-service portal placement.** Not discussed in this meeting. Still open from the original plan.
- [ ] **Unsubscribe handling — full design.** Explicitly deferred. Schedule a dedicated follow-up: grace period, opt-out flow, suppression list mechanics, CSV export cadence.
- [ ] **Metrics granularity beyond account level.** Phase 1 is account-only. What's phase 2? Group-level rollup? Per-topic? Will inform whether we design the metrics page to be extensible now.

---

## D. Prep for next meeting

- [ ] Bring the **updated RBAC matrix** (Account / Campaign Group / Topic / Campaign labels, super admin + account admin + group admin + editor + viewer rows, with the "use templates" inconsistency fixed).
- [ ] Bring **two screen mocks for account-switching** so the team can pick: (option A) top-bar dropdown, (option B) account-page-as-switcher.
- [ ] Bring a **side-by-side of Flow A vs Flow B campaign creation** so the asymmetry between email-from-topic and SMS-from-group is on the table explicitly.
- [ ] Bring an **upload form mock** modeled on the Amazon Connect import pattern Mebin demoed.
- [ ] Bring the **template-default-topic relationship question** with two illustrated options (1:1 vs many-to-many).
- [ ] Bring the **unsubscribes follow-up** as a topic placeholder so it's scheduled, not lost.

---

## E. Plan integrity check

Before sending prompt 1, also update:

- [ ] **The "Open product questions" section** of `campaigns-email-prototype-plan.md` to reflect: hierarchy labels = RESOLVED, topic objects = RESOLVED, mid-campaign updates = PARTIALLY RESOLVED (replace yes, single-add no), subscriber portal = STILL OPEN.
- [ ] **The "Critical reuse map"** to add `AccountSwitcher` as a new module-scoped primitive built in prompt 2.
- [ ] **Prompt 11's "audit"** to include the new role × access combinations.
