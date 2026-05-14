# Email Campaigns Prototype — Concept ↔ Code Alignment Plan

The product concept and the existing prototype have drifted since the original 12-prompt plan. This document maps the analysis decisions (Topics as primary parent, audience-unit clarification, Templates governance, role taxonomy) onto the current code, identifies what needs to change, and sequences the prompts to do it.

**Read order:**
1. Decisions to ratify (Section 1) — these are product calls, not engineering ones
2. Code state vs concept (Section 2) — where we are vs where we need to be
3. Prompt sequence (Section 3) — paste-ready prompts in dependency order
4. Documentation updates (Section 4) — keeping `_OPEN_QUESTIONS.md` and the concept doc honest

---

## Section 1 — Decisions to ratify before coding

These are interlocking — answer them in order. Each affects what comes after. My recommendation is in **bold**; rationale beneath.

### D1. Audience-unit vocabulary

**Pick one. The current code uses "Segments" (renamed from "Lists" last week). The Epic uses "Recipient Lists" — simple single-column CSVs at Campaign Group level. The concept screenshot uses "User List" (org-wide DB) + "Segments" (attribute filters), neither of which exists in the Epic's data model.**

| Option | What it means | Trade-off |
|---|---|---|
| **A — Recipient Lists only** (recommended) | Rename `/segments/` → `/recipient-lists/`. Drop the Segment-as-filter concept entirely. | Cleanest. Matches Epic. Drops a feature that can't work with single-column CSVs. |
| B — Lists + behavioral Segments | Keep `/segments/` as a separate concept for behavioral filters (engaged in 30d, on List A not B, etc.) | More work. Net-new feature beyond Epic. Useful long-term but adds scope. |
| C — Status quo | Keep "Segments" as the name for what are really Recipient Lists | Lazy. Vocabulary stays misleading. |

**Recommend: A.** The current `/segments/` code IS Recipient Lists in everything but name. The rename undoes recent labor but corrects a misnomer the team would otherwise live with for years.

### D2. Top-level naming: Groups / Preferences / Components

The org-hierarchy entity has been called three things across artifacts. The SOW uses "components" for the ~12 SSA divisions, which is the customer's vocabulary.

| Option | Where it lands |
|---|---|
| **A — Components** (recommended) | Matches SOW. Clearest to the SSA stakeholder. |
| B — Groups | What the concept calls it. Generic; collides with user groups, security groups. |
| C — Preferences | What the code currently calls it. Confusingly implies *subscriber* preferences. |

**Recommend: A.** Rename `/preferences/` → `/components/`. Update the layout sub-nav heading.

### D3. Role taxonomy

The concept uses **Admin / Supervisor / Agent**. The code's `RoleContext` uses **Org Admin / Dept Editor / Dept Read-Only**. These do *not* map cleanly:

| Concept role | Code role (current) | Issue |
|---|---|---|
| Admin | Org Admin | ✓ match |
| Supervisor | Dept Editor | Semantically different — "Supervisor" implies oversight; "Editor" implies authoring |
| Agent | Dept Read-Only | **Major mismatch** — concept's Agent has full CRUD on Campaigns; Dept Read-Only has none |

The concept's "Agent" is doing marketing work (full CRUD on Campaigns, creates Templates). The code's "Dept Read-Only" is a viewer. These are different people.

| Option | Action |
|---|---|
| **A — Adopt the concept's three roles** (recommended) | Rename `RoleContext` to `Admin / Supervisor / Agent`. Add a fourth "Viewer" role if read-only access is still needed for some use cases (audit, compliance). |
| B — Keep current code roles, update concept | Rename concept's roles to `Org Admin / Dept Editor / Dept Read-Only`. Re-tune the role panels. |
| C — Hybrid | Map Agent → Editor (they're the same person), drop Read-Only entirely. Three roles total: Admin, Supervisor, Agent. |

**Recommend: C.** The concept's Agent and the code's Dept Editor are doing the same job. Calling them "Agent" matches CxPortal's contact-center vocabulary across modules. Drop the Read-Only tier until a real use case appears — the SOW mentions it but doesn't specify what a read-only user needs to *do*.

**But Template CRUD moves to Supervisor**, not Agent (per the analysis — Templates are Group-scoped reusable assets with versioning semantics, not per-Campaign content). The concept's role panel showing "Agent creates Templates" is wrong.

### D4. Topic defaults

Epic confirms **default Template** binds to Topic. The analysis surfaced three other candidates:

- **Default Sender** — strongly recommended. "Monthly Statements" should always come from the same address.
- **Default schedule cadence** — useful for recurring Topics (weekly digest), less so for one-off Topics. Optional.
- **Compliance flags** (mandatory unsubscribe footer, plain-text fallback, etc.) — probably yes, but more of a Group-level setting that Topics inherit.

**Recommend:** Topic carries default Template AND default Sender. Add `defaultSenderId` to the Topic data model. Defer schedule and compliance to a later iteration unless product pushes.

### D5. Top-level nav: is Campaigns a primary destination?

If Topic is the parent of Campaign, the daily-work flow is "open Topic → New send" — not "go to Campaigns → New campaign." But Campaigns as a flat "all sends across all Topics" list is still useful.

| Option | Result |
|---|---|
| **A — Both** (recommended) | Topics as the primary creation entrypoint. Campaigns as a flat "all sends" listing for cross-Topic visibility. |
| B — Hide Campaigns | Only reachable through Topics. Cleaner IA but loses the at-a-glance "what went out this week" view. |

**Recommend: A.** Adds a Topics nav item; Campaigns becomes a flat listing (no "+ New" button on the campaigns list — creation always starts from a Topic).

### D6. Subscription state — derived or explicit

The Epic says subscribers subscribe to Topics. Lists are single-column CSVs with no per-Topic state. So:

- **Derived:** Subscribed = on a List associated with the Topic AND not on the unsubscribers list. No separate storage. Matches GovDelivery.
- **Explicit:** Separate `(subscriber, topic, state)` table. Heavier but supports nuanced opt-in flows.

This is a backend decision (Mebin owns it), but it affects UI. **The prototype should show topic.subscriberCount as a "derived" number for now** with a note in `_OPEN_QUESTIONS.md` that the source of truth is pending Mebin's data-model call.

---

## Section 2 — Code state vs concept

Snapshot of where each surface stands. ✓ = aligned, ⚠️ = needs rework, ✗ = missing.

| Surface | Current state | Needs |
|---|---|---|
| Module shell (layout + nav) | ✓ Built | Rename Preferences → Components (D2); rename Segments → Recipient Lists (D1); add Topics nav item (D5) |
| Mock data spine | ✓ Built (8 files) | Add `defaultSenderId` to topics (D4); rename `lists.ts` if D1 = A (low value — internal only); add Topic-Campaign parent reference if not present |
| Shared primitives | ✓ Built | None |
| RoleContext | ⚠️ Wrong taxonomy | Rename roles to Admin / Supervisor / Agent (D3); drop Read-Only |
| `/campaigns/` index | ✓ Built | Remove "+ New campaign" CTA — creation now starts from Topic |
| `/campaigns/[id]/` detail | ✓ Built | Add breadcrumb back to parent Topic |
| `/campaigns/new` stepper | ⚠️ Standalone flow | Either: keep as advanced/one-off path, or fold into Topic-context flow. Either way, no longer the primary entrypoint |
| `/templates/` index | ✓ Built | Gate CRUD to Supervisor per D3 (not Agent) |
| `/templates/[id]/` editor | ✓ Built | Gate CRUD to Supervisor |
| `/senders/` | ✓ Built | Gate Add/Verify/Delete to Admin (per the RBAC matrix in followup Prompt C) |
| `/segments/` (currently named) | ⚠️ Misnamed | Rename to `/recipient-lists/` (D1) |
| `/segments/[id]/` | ⚠️ Misnamed | Rename. Update internal links |
| `/preferences/` | ⚠️ Misnamed + missing Topic level | Rename to `/components/` (D2); add Topic as 5th tree level |
| `/topics/[id]/` detail | ⚠️ Incomplete | Add: list of Campaigns under this Topic, default Template + Sender controls, associated Lists, subscriber count |
| `/topics/` index | ✗ Missing | Build it. Primary Topics nav target |
| `/unsubscribers/` | ✓ Built | None |
| `/metrics/` | ✓ Built | None |
| Dashboard | ⚠️ Stale links (per earlier review) | Already covered by followup Prompt A |
| `_OPEN_QUESTIONS.md` | ⚠️ Stale Q4 | Already covered by followup Prompt B. Add new entries (Section 4) |

---

## Section 3 — Prompt sequence

Run in order. Each is sized for a single Claude Code session and only depends on what came before.

**Prerequisite:** Confirm decisions D1–D6 in Section 1 before sending Prompt 1. The prompts below assume the **recommended** option for each. If you pick differently, edit the prompt body before sending.

**Also:** if followup Prompts A / B / C are still in flight, let them finish first. Prompt C (the RBAC audit) needs the role taxonomy from D3 to be locked, so don't run C until D3 is decided.

---

### Prompt 1 — Role taxonomy reconciliation

**Goal:** Replace `Org Admin / Dept Editor / Dept Read-Only` in `RoleContext` with `Admin / Supervisor / Agent`. Update all consumers.

**Paste:**
- File: `app/sandbox/campaigns-email/_context/RoleContext.tsx`
- Any file that imports `useRole`, `ROLES`, or role IDs (grep before starting)

**Ask:**
> Update `_context/RoleContext.tsx` to use three roles: `Admin`, `Supervisor`, `Agent` (in that order — Admin = most permissive). Match the IDs in `ROLES`:
>
> ```typescript
> export const ROLES = [
>   { id: 'admin',      label: 'Admin'      },
>   { id: 'supervisor', label: 'Supervisor' },
>   { id: 'agent',      label: 'Agent'      },
> ] as const
> ```
>
> Update the `Role` type and `RoleProvider` default to `'admin'`. Grep the entire `app/sandbox/campaigns-email/` directory for the old role IDs (`org-admin`, `dept-editor`, `dept-read-only` or their variants) and update every reference. Verify the role switcher in `layout.tsx` still renders correctly. Run `pnpm typecheck` and fix any errors.
>
> Do **not** wire role-based affordances in this prompt — that's Prompt C in the followup file (RBAC audit). This prompt is purely the rename + type-safety pass.

**Acceptance:** typecheck clean; switcher shows three roles; no orphan references to the old IDs.

---

### Prompt 2 — Rename Segments → Recipient Lists

**Goal:** Bring the audience-unit vocabulary in line with the Epic.

**Paste:**
- All files under `app/sandbox/campaigns-email/segments/`
- `_mock/lists.ts` (keep the internal filename)
- Any file that imports from `segments/` or references the `/segments` route (grep)

**Ask:**
> Rename the `segments/` route and all user-facing references to `recipient-lists/`:
>
> 1. Rename directory `app/sandbox/campaigns-email/segments/` → `app/sandbox/campaigns-email/recipient-lists/`
> 2. Rename internal component path `segments/_components/UploadWizard.tsx` → `recipient-lists/_components/UploadWizard.tsx`
> 3. In `layout.tsx`, update the `NAV_SECTIONS` entry: label `'Segments'` → `'Recipient Lists'`, href `/sandbox/campaigns-email/segments` → `/sandbox/campaigns-email/recipient-lists`. Update the icon if `UsersThreeIcon` doesn't fit (try `EnvelopeSimpleIcon` or keep `UsersThreeIcon`).
> 4. In every page under `recipient-lists/`, change heading text `Segments` → `Recipient Lists`, subtitle text `segments` → `recipient lists`, and any other user-facing "segment" → "recipient list" / "list".
> 5. Grep for `'segments'`, `'Segments'`, `'segment'`, `'Segment'` across `app/sandbox/campaigns-email/` and update every reference. This includes campaign stepper labels, page-title strings, dashboard cards, and `_OPEN_QUESTIONS.md` if it mentions Segments.
> 6. Keep `_mock/lists.ts` as the filename — that's internal. But update the user-facing string `Segment` in any mock data values to `Recipient List` if applicable.
> 7. Update `campaigns/new/page.tsx` (the stepper): the audience step tab should say "Direct lists" (was "Direct segments"). The step description should say "Topic or lists". The stepper tag should say `N list(s)`.
>
> Run `pnpm typecheck` and walk the app — every link to `/segments/*` should redirect or 404 cleanly. Hitting `/sandbox/campaigns-email/recipient-lists` should land on the renamed page.

**Acceptance:** no `/segments` route exists; every user-facing surface uses "Recipient Lists" or "Lists" consistently; mock data filename unchanged.

---

### Prompt 3 — Rename Preferences → Components

**Goal:** Use the customer's vocabulary (per SOW).

**Paste:**
- All files under `app/sandbox/campaigns-email/preferences/`
- `layout.tsx`

**Ask:**
> Rename the `preferences/` route to `components/`:
>
> 1. Rename directory `app/sandbox/campaigns-email/preferences/` → `app/sandbox/campaigns-email/components/`. **Warning:** there is already a top-level `components/` directory in the design system project (`/components/ui/...`). The new route directory will be `app/sandbox/campaigns-email/components/` which is scoped under `app/sandbox/campaigns-email/` so there's no actual conflict, but be careful with imports — they're rooted differently.
> 2. In `layout.tsx`, update the `NAV_SECTIONS` entry: label `'Preferences'` → `'Components'`, href `/sandbox/campaigns-email/preferences` → `/sandbox/campaigns-email/components`. Icon stays `SlidersIcon` or change to `BuildingsIcon` / `TreeStructureIcon` from `@phosphor-icons/react`.
> 3. Update page heading and subtitle: `Preferences` → `Components`, "Browse your organization's component structure" stays as-is.
> 4. Update `DetailPane.tsx` references: change root node label and any internal "Preferences" strings.
> 5. Grep for `'preferences'`, `'Preferences'` across the campaigns-email module and update every reference.
> 6. Update the dashboard `page.tsx` SECTIONS array entry (if followup Prompt A hasn't run yet, do this here): `Preferences` → `Components`.
>
> Run `pnpm typecheck`. Verify the route loads and the tree renders.

**Acceptance:** no `/preferences` route; nav reads "Components"; tree page renders identically under the new path.

---

### Prompt 4 — Build the Topics index page

**Goal:** Topics is the primary work entrypoint per the analysis. Currently only `/topics/[id]/` exists; no index.

**Paste:**
- `_mock/topics.ts`
- `_mock/campaigns.ts` (to count campaigns per Topic)
- `_mock/templates.ts` (to resolve default Template names)
- `_mock/senders.ts` (to resolve default Sender names — see Prompt 5 first)
- `components/ui/table.tsx`, `components/ui/chip.tsx`

**Ask:**
> Build `app/sandbox/campaigns-email/topics/page.tsx` — the Topics index. This is the primary work entrypoint; treat it as the busiest page in the prototype.
>
> Layout:
> - Header: "Topics" + subtitle "Communication streams that subscribers opt into. Each Topic is the parent of one or more email campaigns."
> - Right of header: "+ New Topic" CTA (gate to Supervisor and Admin per the RBAC matrix from followup Prompt C — if Prompt C hasn't run, leave it ungated for now and add a `// TODO: RBAC` comment).
> - Filters at top: by Campaign Group (Component), by status (`active` / `paused` / `archived`).
> - Table with columns: Name, Component (Group), Default Template, Subscribers, Active Campaigns (count of campaigns where `campaign.status !== 'archived'`), Last Sent, Status.
> - Each row links to `/sandbox/campaigns-email/topics/[id]`.
> - Empty state: "No Topics yet. Create your first Topic to start scheduling campaigns."
>
> Update the layout `NAV_SECTIONS`: add Topics as a new item under the CAMPAIGNS section, placed *first* (before Campaigns). Icon: `TagIcon` or `BroadcastIcon`. The nav order should be: **Topics, Campaigns, Email Templates, Senders**.
>
> Update the dashboard `page.tsx` SECTIONS array: add a Topics card; reorder so Topics appears first under campaigns.
>
> Run `pnpm typecheck`. Walking from dashboard → Topics → Topic detail should work end-to-end.

**Acceptance:** index renders with at least 6 mock Topics; filters work; nav reflects Topics-first ordering; clicking through to detail loads.

---

### Prompt 5 — Topic detail page: defaults, campaigns under topic, audience

**Goal:** Make Topic detail the primary work surface — show defaults, scheduled/sent campaigns, audience info.

**Paste:**
- `app/sandbox/campaigns-email/topics/[id]/page.tsx` (current state)
- `_mock/topics.ts` — needs `defaultSenderId` field (add it)
- `_mock/campaigns.ts` (to filter campaigns by `topicId`)
- `_mock/senders.ts`, `_mock/templates.ts`, `_mock/lists.ts`
- `components/ui/tabs.tsx`, `components/ui/stats-cards.tsx`

**Ask:**
> First, update `_mock/topics.ts`:
> 1. Add `defaultSenderId: string | null` to the `Topic` interface and to every mock entry. Reference IDs from `_mock/senders.ts`.
> 2. Add `listIds: string[]` if not already present — these are the Recipient Lists this Topic publishes to. (Match against `_mock/lists.ts`.)
>
> Then rebuild `app/sandbox/campaigns-email/topics/[id]/page.tsx`:
>
> Layout: full-width page with header + tabs.
>
> **Header:** Topic name + Component breadcrumb. Right-side actions: "+ New campaign in this Topic" (primary CTA — replaces the standalone `/campaigns/new` flow for the common case), "Edit Topic" (Supervisor+).
>
> **Stats row** (use `MetricTile` from `_components/`): Subscribers, Active Campaigns, Last Sent, Avg Open Rate.
>
> **Tabs:**
>
> 1. **Overview** (default):
>    - Defaults panel: default Template (link to template detail) + default Sender (link to senders page) + associated Recipient Lists (chips). Each is editable inline (Supervisor+).
>    - Recent campaigns: 5 most recent campaigns under this Topic, each linking to `/campaigns/[id]`.
>
> 2. **Campaigns** (full list):
>    - All campaigns where `campaign.topicId === topicId`. Same column shape as the main `/campaigns/` page.
>    - "+ New campaign in this Topic" button at top — pre-fills the stepper with this Topic's defaults.
>
> 3. **Audience:**
>    - Recipient Lists associated with this Topic (table of Lists). Each row shows: name, recipient count, last updated. Link to `/recipient-lists/[id]`.
>    - "Subscribers: N derived from List membership minus unsubscribers" — call this out clearly so reviewers know the count isn't independently stored. Use `components/ui/message-box.tsx` variant=info: "Subscriber count is derived from list membership. Source of truth pending data-model finalization."
>
> 4. **Settings:**
>    - Status (active / paused / archived) toggle.
>    - Default Template picker (dropdown from Templates filtered by this Topic's Component).
>    - Default Sender picker (dropdown from verified Senders filtered by this Topic's Component).
>    - Associated Lists multi-select.
>    - Delete Topic button (Admin only — show with `disabled` + tooltip for Supervisor).
>
> The "+ New campaign in this Topic" CTA should route to `/campaigns/new?topicId=[id]` — the campaign stepper should read this param and pre-fill Topic, Sender, Template, and Lists from the Topic. If the stepper doesn't currently support a pre-fill query param, add it.
>
> Run `pnpm typecheck` and click through.

**Acceptance:** Topic detail shows all 4 tabs; defaults editable; "New campaign in this Topic" pre-fills the stepper.

---

### Prompt 6 — Components tree: add Topic as a 5th level

**Goal:** The org-hierarchy tree should now reflect Org → Component → Campaign Group → Topic → Campaign depth.

**Paste:**
- `app/sandbox/campaigns-email/components/page.tsx` (renamed in Prompt 3)
- `app/sandbox/campaigns-email/components/DetailPane.tsx`
- `_mock/groups.ts`, `_mock/topics.ts`

**Ask:**
> Update the Components tree to include Topics as a 5th level beneath each Campaign Group.
>
> 1. In `components/page.tsx`, extend the `TreeNode` to render Topics as children of Campaign Groups. Add a new depth (depth 3) for Topic nodes. Topic nodes are leaves (no children). Show subscriber count badge inline.
> 2. Topic nodes should be selectable. Clicking a Topic in the tree should update the detail pane to show Topic detail (mini version — name, default Template, default Sender, list of recent campaigns, "Go to full Topic page" link).
> 3. Update `DetailPane.tsx`: add a `TopicDetail` component for when selection.type === 'topic'. Show:
>    - Topic name + status pill
>    - Subscriber count (with "derived" caveat)
>    - Default Template + Sender
>    - Associated Lists (chips)
>    - "Open full Topic page →" link to `/topics/[id]`
>    - List of recent campaigns under this Topic
> 4. Update the existing `GroupDetail` component's "Communication Topics" section: each Topic now shows subscriber count + active campaign count, and clicking it selects the Topic in the tree (new prop callback `onSelectTopic`).
> 5. Keep within the 300-line limit per file — extract `TopicDetail` as a named component in the same file if needed.
>
> Run `pnpm typecheck`.

**Acceptance:** tree shows Topics under each Group; clicking a Topic shows Topic detail in the pane; "Open full Topic page" navigates to `/topics/[id]`.

---

### Prompt 7 — Reframe the campaign creation flow as Topic-first

**Goal:** The standalone `/campaigns/new` flow becomes the advanced/edge-case path. Topic-context creation becomes the dominant pattern.

**Paste:**
- `app/sandbox/campaigns-email/campaigns/new/page.tsx`
- `app/sandbox/campaigns-email/campaigns/page.tsx`
- Dashboard `page.tsx`

**Ask:**
> Update the campaign creation flow to be Topic-first.
>
> 1. **Campaigns list page** (`campaigns/page.tsx`):
>    - Remove the "+ New campaign" CTA from the page header.
>    - Replace with a small message: "Campaigns are created from a Topic. [Open Topics →]" (link to `/topics`).
>    - Add a `Topic` column to the campaigns table, between Name and Component. Show the Topic name as a link to `/topics/[id]`.
>    - Keep this page as a flat "all sends across all Topics" view — that's its purpose now.
>
> 2. **Dashboard** (`page.tsx`):
>    - Update the "+ New campaign" CTA in the dashboard header. Two options — pick one:
>      - **A (recommended):** Replace with "+ New Topic" if user is Admin/Supervisor, else hide. Drives traffic to Topic creation, which is where work starts.
>      - **B:** Keep "+ New campaign" but route to `/topics` (with a UX hint that they need to pick a Topic first).
>    - Update the dashboard SECTIONS array: Topics card should be first (already done in Prompt 4).
>
> 3. **Campaign stepper** (`campaigns/new/page.tsx`):
>    - Read `?topicId=` query param on mount. If present, pre-fill step 1 (Topic), step 2 (Sender — from Topic default), step 4 (Template — from Topic default), step 3 (Audience — from Topic's `listIds`). User can override any of these in-stepper.
>    - If no `topicId` param is present, the stepper starts at step 1 with Topic selection as the first user action. Add a banner at the top: "💡 Most campaigns are created from a Topic. [Open Topics →]" to nudge users into the better flow.
>    - Update step labels: step 1 is now "Topic" (was "Basics"). Move "Basics" (name, schedule) to the end as step 5 ("Details") before Review.
>    - Stepper order: Topic → Audience → Template → Sender → Details → Review.
>
> 4. **Topic detail page** "+ New campaign in this Topic" already routes to `/campaigns/new?topicId=[id]` (built in Prompt 5).
>
> Run `pnpm typecheck`. Walk through: dashboard → Topic → New campaign in Topic → stepper pre-filled.

**Acceptance:** campaigns list has no "+ New" button; stepper pre-fills from `?topicId=`; dashboard nudges toward Topic-first.

---

### Prompt 8 — Topic creation modal

**Goal:** "New Topic" needs to actually create something. Build the creation modal.

**Paste:**
- `_mock/topics.ts`, `_mock/groups.ts`, `_mock/templates.ts`, `_mock/senders.ts`, `_mock/lists.ts`
- `components/ui/modal.tsx`

**Ask:**
> Build a "Create Topic" modal triggered from:
> 1. The "+ New Topic" CTA on `/topics/page.tsx`
> 2. The Components tree's Campaign Group detail pane ("+ Add Topic" action — add this to `components/DetailPane.tsx`)
>
> Modal contents (single screen, no stepper — Topic creation is light):
> - Name (required)
> - Description (optional, helper text: "Visible to subscribers when managing preferences")
> - Component / Campaign Group (required — dropdown, filtered to user's accessible Groups)
> - Default Template (required — dropdown filtered by selected Group)
> - Default Sender (required — dropdown filtered by selected Group, only verified Senders)
> - Associated Recipient Lists (multi-select — filtered by selected Group)
> - Status (radio: active / paused — default active)
>
> Validation:
> - Name unique within Component
> - At least one List must be selected
> - Default Template must belong to selected Group
> - Default Sender must be `verified` (not pending/expired)
>
> On submit: add to mock state via the existing `_store/campaigns-store.ts` pattern (if there's no addTopic action, add one). Close modal. Toast: "Topic '<name>' created." Route to `/topics/[new-id]`.
>
> Gate the trigger CTAs to Supervisor and Admin only (per RBAC matrix in followup Prompt C).
>
> Run `pnpm typecheck`.

**Acceptance:** modal opens from both entry points; validation works; submitting creates a Topic and routes to its detail page.

---

### Prompt 9 — Templates governance: Supervisor CRUD, Agent read-only

**Goal:** Per the analysis, Templates are Group-scoped reusable assets. Only Supervisor and Admin should create/edit; Agent uses but doesn't author.

**Paste:**
- `app/sandbox/campaigns-email/templates/page.tsx`
- `app/sandbox/campaigns-email/templates/[id]/page.tsx`
- `_context/RoleContext.tsx`

**Ask:**
> Update Templates pages to gate CRUD to Supervisor and Admin only:
>
> 1. **Index** (`templates/page.tsx`): the "+ New Template" CTA — show only for `role === 'admin' || role === 'supervisor'`. For Agent, replace with a small note: "Templates are managed by Supervisors. [Browse available templates below]".
> 2. **Detail** (`templates/[id]/page.tsx`): the Save / Publish-as-new-version actions — show only for Admin/Supervisor. For Agent, show the editor in read-only mode (textarea `readOnly`, no Save buttons). Add a banner: "Read-only view. Contact your Supervisor to request changes."
> 3. The "Set as default for topic" action — Supervisor+ only.
> 4. Variable insertion drawer — visible to all roles (helpful reference even when read-only).
> 5. Template selection in the campaign stepper — all roles can pick from existing Templates; only Supervisor+ sees an "Edit template" link inline.
>
> This is the Template slice of the broader RBAC audit in followup Prompt C. If Prompt C has already run, reconcile any duplicate gating logic.
>
> Run `pnpm typecheck`. Walk through as each role — Agent should see Templates but not edit them.

**Acceptance:** Agent sees Templates read-only; Supervisor and Admin can CRUD; clear messaging on why Agent is gated.

---

### Prompt 10 — Open Questions doc reconciliation

**Goal:** Bring `_OPEN_QUESTIONS.md` in sync with the analysis decisions and the renamed concepts.

**Paste:**
- `app/sandbox/campaigns-email/_OPEN_QUESTIONS.md`

**Ask:**
> Update `_OPEN_QUESTIONS.md` to reflect the new alignment plan:
>
> 1. **Add a "Resolved (pending product ratification)" section** at the top if it doesn't exist (followup Prompt B may have added it for Q4). Add these resolutions:
>    - **Topics as primary parent of Campaigns** — decided. Topics are the structural and subscription unit. The data model treats Topic as Campaign's parent. UI reflects this with Topic-first navigation and Topic-context campaign creation.
>    - **Audience-unit vocabulary** — decided. "Recipient Lists" replaces the previous "Segments" naming. The Segment-as-attribute-filter concept is dropped (incompatible with single-column CSV data model).
>    - **Role taxonomy** — decided. Admin / Supervisor / Agent (3 tiers). Dept Read-Only deferred until a concrete use case emerges.
>    - **Templates scope** — decided. Group-scoped, Supervisor-authored, Agent read-only. Topics declare a default Template.
>    - **Topic defaults** — decided. Topic carries default Template and default Sender. Schedule and compliance flags deferred.
>    - **Org-hierarchy naming** — decided. "Components" replaces "Preferences" / "Groups" in the user-facing nav.
>
> 2. **Add new open questions** to the appropriate sections:
>    - **Q (Audience): Subscription state — derived or explicit?** Body: "The data model implies subscribers subscribe to Topics, but Recipient Lists are single-column CSVs with no per-Topic state. Two interpretations: derived (subscribed = on a List associated with Topic, minus unsubscribers — matches GovDelivery) or explicit (separate subscription table). The UI shows derived counts; backend source of truth is pending Mebin's data-model finalization."
>    - **Q (Topics): Cross-component subscriber experience.** Body: "Topics are scoped per-Component. A subscriber interested in updates from both Retirement Services and Disability Services must subscribe to topics in each Component separately. If SSA's subscriber-facing preference portal should unify these, that's net-new scope. Needs alignment with J.C. Paz."
>    - **Q (Senders): Per-Topic default Sender override semantics.** Body: "Topics carry a default Sender. When the Sender expires or fails verification, what happens to in-flight Campaigns under that Topic? Block sends? Continue with the last-known-good Sender? Currently not modeled."
>    - **Q (Roles): Read-only / Viewer tier deferred.** Body: "The SOW references three role tiers including a Read-Only / Department Read-Only role. The prototype currently models three roles (Admin / Supervisor / Agent) and defers Read-Only until a concrete workflow needs it. Confirm with SSA stakeholders that no audit / compliance / observer use case requires this in MVP."
>
> 3. **Renumber as needed.** Update the "last reconciled with code" date at the top.
>
> 4. **Sanity check:** grep `app/sandbox/campaigns-email/` for any references to dropped concepts (`Dept Read-Only`, `org-admin`, `User List`, `Segment` as a filter) and list them in the PR description. Most should be in archived PRD/SPEC/PLAN markdown files — those are historical artifacts and don't need updating.

**Acceptance:** doc reflects current code state; new open questions are surfaced with enough context that J.C. Paz / Mebin can act on them.

---

## Section 4 — Documentation updates outside the code

Things that should change but aren't in the codebase:

1. **Concept Figma board** — update to reflect:
   - Drop User List as a separate entity
   - Drop Segment as attribute filter
   - Add Topic as 5th hierarchy level: Org → Component → Campaign Group → Topic → Campaign
   - Rename Groups → Components throughout
   - Update role panels: Topic creation = Supervisor (not Admin); Template CRUD = Supervisor (not Agent)
   - Add Senders as a first-class node, with default-Sender-per-Topic association
2. **Jira PRDENG-2867** (UI Design story) — add a comment summarizing the decisions ratified in D1–D6, link to this plan file.
3. **Sub-task descriptions** — at minimum, update:
   - **PRDENG-2870 (Topic & Subscription Management UI)** — close the open question about topic objects vs labeled lists (resolved: first-class objects).
   - **PRDENG-2876 (Contact List Management UI)** — rename to "Recipient List Management" for consistency with the Epic vocabulary.
4. **Backend story alignment** — flag to Max English that the data model assumes:
   - Topic is the parent of Campaign (foreign key on Campaign)
   - Topic has `defaultTemplateId`, `defaultSenderId`, `listIds`
   - Subscription state is **derived** in the API (not stored explicitly) — confirm Mebin agrees

---

## Sequencing summary

| Step | Prompt | Depends on | Effort |
|---|---|---|---|
| 1 | Role taxonomy rename | D3 decision | Small |
| 2 | Segments → Recipient Lists | D1 decision | Medium |
| 3 | Preferences → Components | D2 decision | Small |
| 4 | Topics index page | D5 decision; Prompts 1–3 | Medium |
| 5 | Topic detail upgrade | D4 decision; Prompts 1, 4 | Large |
| 6 | Components tree adds Topic level | Prompts 3, 4, 5 | Medium |
| 7 | Campaign creation goes Topic-first | Prompts 4, 5 | Medium |
| 8 | Topic creation modal | Prompts 4, 5 | Medium |
| 9 | Templates governance | Prompt 1 | Small |
| 10 | Open Questions doc reconciliation | All previous prompts | Small |

Rough order-of-magnitude estimate if run sequentially: 8–12 Claude Code sessions of 30–90 minutes each.

**Critical path:** Prompts 1, 4, 5, 7 unlock the new IA. Prompts 2, 3, 6 are renames/realignments that can happen in parallel with the IA work but should not block it. Prompts 8, 9, 10 polish.

---

## What this plan does *not* change

- The 8 sub-task design surfaces (PRDENG-2867 scope) — still all present, just reorganized
- The mock data spine — same files, additive changes only
- Shared `components/ui/*` primitives — untouched
- The existing campaign stepper logic — repositioned, not rewritten
- The Senders, Unsubscribers, Metrics pages — work as-is
