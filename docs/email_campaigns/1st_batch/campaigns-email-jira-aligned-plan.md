# Email Campaigns Prototype — Jira-Aligned Plan

**Source of truth:** Epic [PRDENG-2618](https://pronetx.atlassian.net/browse/PRDENG-2618), its 14 child Stories, and parent Initiative [PRDENG-444](https://pronetx.atlassian.net/browse/PRDENG-444). The two earlier plan files in this project drew partly from a separate concept board — this plan supersedes those recommendations where they conflict with Jira.

This document is grounded entirely in ticket text quoted verbatim where it resolves ambiguity.

---

## Section 1 — What Jira actually says

### The hierarchy (PRDENG-2794, PRDENG-2796)

**Account (a.k.a. Component) → Agency / Campaign Group → Topic → Email Campaign**

- PRDENG-2794 (in dev): "Introduce an Account (a.k.a. Component) entity that sits above the existing Campaign Group… the Authorizer payload, agency records, and downstream entities all gain an Account reference."
- PRDENG-2796: "A Topic is the new direct parent of email campaigns… simultaneously the hierarchy slot below a Campaign Group and the subscription unit."
- PRDENG-2799: "Email campaigns require a Topic (their direct parent in the new hierarchy); voice/SMS campaigns continue to live under a Campaign Group with no Topic."

So: voice/SMS hierarchy is **Account → Campaign Group → Campaign**. Email hierarchy is **Account → Campaign Group → Topic → Campaign**. Topic is email-only.

"Agency" and "Campaign Group" are the same thing in Jira's wording — the existing entity, renamed/aliased.

### Roles (PRDENG-444)

Jira's Initiative explicitly defines three roles:

- **Org Admin** — can edit all departments and campaigns
- **Department Editor** — can edit department details and manage (create/delete/edit) campaigns
- **Department Read-Only** — can view campaigns for their department

The current code uses exactly these names. **My earlier recommendation to rename to Admin / Supervisor / Agent was wrong** — that came from your concept board, not Jira.

### Contact Lists (PRDENG-2795)

Verbatim: "Recipient lists are simple single-column CSVs (`email`, `phone`, or both columns) stored at the Campaign Group level so a list can be reused across multiple Topics and campaigns. The list is materialized as a **Customer Profiles segment** (the audience source Connect Outbound Campaigns consumes for voice/SMS today and will consume for email). The pipeline streams CSVs of up to 100M rows. **Mid-campaign list updates are explicitly rejected at the API edge.**"

Naming inside Jira is inconsistent: the **story title** is "Contact List Management at Scale" and the **sub-task** PRDENG-2876 is "Contact List Management UI", but the body text uses "Recipient lists." I'm treating **Contact Lists** as canonical (matches both story and sub-task titles).

### Topics & Subscriptions (PRDENG-2796)

Verbatim: "New tables `Topics` keyed by `(componentId, agencyId, topicId)` and `Subscriptions` keyed by `(componentId, topicId, subscriberId)`."

**Subscriptions are stored explicitly, not derived.** My earlier recommendation to treat subscription state as derived was wrong.

Topic carries a default template (Story 6 = PRDENG-2797) and is associated with one or more Contact Lists. The signed-token format for subscription/unsubscribe links is shared between Topics and the unsubscribe Story.

### Templates (PRDENG-2797)

Verbatim: "Templates are stored in **Connect Wisdom message templates** (the same surface today's SMS campaigns provision via the existing `provisionMessageTemplate` step). Each Topic (Story 5) can declare a default template ARN. The campaign creation stepper exposes a 'Refresh templates' action to pick up newly-published versions."

Templates are **not** in a custom DynamoDB store — they live in Connect Wisdom. A local `EmailTemplateIndex` table keys by `(componentId, agencyId, templateId, version)` and tracks Wisdom ARN, status, publishedAt.

### Campaign Sending (PRDENG-2798, PRDENG-2799)

Email campaigns flow through the same `createCampaignSfn` Step Function used today for voice/SMS, with a new branch using AWS Connect Outbound Campaign + `EmailChannelSubtypeConfig`. Connect owns lifecycle, throttling, retries, audience iteration, template rendering, and SES sending.

Wisdom template ARN is captured at a specific published version at campaign creation time — "so a later template publish doesn't change what gets sent."

### Unsubscribes (PRDENG-2800, PRDENG-2801)

Verbatim from PRDENG-2800: "We do **not** enforce suppression on our send side; the customer pulls the unsubscribes export (Story 10) and applies it externally when they upload their next CSV. The 14-day grace window mentioned in the design meeting governs how soon a recorded unsubscribe is available in the export, not any send-time filtering."

This is significant. The platform records unsubscribes but does not filter them at send time. Customer is responsible for applying the export to their next List upload. Renamed in Jira from "suppression list" to make this explicit.

Unsubscribes Tracking page (PRDENG-2801): aggregated by Account / Campaign Group / Topic / date range, CSV export honoring 14-day grace. Page path in the real frontend: `src/modules/portal/campaigns/pages/unsubscribes.tsx` — note **unsubscribes**, not unsubscribers.

### Metrics (PRDENG-2802)

Campaign + Topic level metrics: open rate, click rate, bounce rate, complaint rate, delivery rate, unsubscribe count. Separate `TopicMetrics` table because the rollup key is Topic, not Campaign.

### Domain Configuration (PRDENG-2868) — surface I missed

Verbatim: "Ability to view SES domains on the frontend and associate them to an instance once verified. On frontend, show domain name, verification status, dns records download, link to ses, button to associate to Connect instance."

**This is a sibling story under the Epic that I had not included in any prior plan.** It's a thin spec but it's a real UI surface. Not in PRDENG-2867's 8 design surfaces — it's a 9th surface, separately owned.

### Sender Identity (PRDENG-2793)

New central settings module: admins register, list, and disable sender email identities (e.g. `outreach@ssa.gov`). Each identity verified by SES via inbox link; verification status exposed through the API. Campaigns reference identities by id rather than re-verifying per campaign. Scope appears to be **Account/Component-level**, since the file path is `src/modules/portal/campaigns/pages/email-senders.tsx` (no Group qualifier).

---

## Section 2 — Corrections to my previous plans

Specific things in the earlier `campaigns-email-alignment-plan.md` that need to be revised once you measure against Jira:

| Previous recommendation | Jira says | Correction |
|---|---|---|
| Rename roles to Admin / Supervisor / Agent | PRDENG-444 defines Org Admin / Department Editor / Department Read-Only | Keep current code role names. Cancel that rename. |
| Rename Preferences → Components | PRDENG-2794 uses Account *and* Component interchangeably. PRDENG-2875 calls the surface "Campaign Groups & Organizational Hierarchy UI" | Rename to **Organization Hierarchy** (covers Account, Campaign Group, Topic). The page is the multi-level tree, not just one level. |
| Rename Segments → Recipient Lists | PRDENG-2795 title is "Contact List Management"; PRDENG-2876 is "Contact List Management UI" | Rename to **Contact Lists**, not Recipient Lists. |
| Subscription state can be derived | PRDENG-2796 has an explicit `Subscriptions` table keyed by `(componentId, topicId, subscriberId)` | UI shows real subscription counts; mock data needs a Subscriptions array. |
| Topic carries default Template + Sender | Jira confirms default Template (Wisdom ARN). Default Sender is not stated. | Default Template yes; default Sender stays a per-Campaign choice unless we get product confirmation. |
| The 8 design surfaces from PRDENG-2867 | There are 9 — Domain Configuration (PRDENG-2868) is a separate Story under the same Epic | Add a Domain Configuration page. |
| Templates have a custom DynamoDB store | Templates live in Connect Wisdom; local index table is metadata only | UI copy should reflect Wisdom-backed templates (no implication of a parallel store). Version dropdown should show Wisdom versions; "Refresh templates" action pulls new Wisdom publishes. |
| Mid-campaign list updates: open question | PRDENG-2795 explicitly: "Mid-campaign list updates are **rejected at the API edge**." | Hard rule, not a guess. Upload Wizard shows a blocking error if list is in an active campaign, not a soft warning. |
| Unsubscribes filter sends | PRDENG-2800: "We do **not** enforce suppression on our send side" | UI copy must be clear: unsubscribes are **recorded** and **exported**; customer applies externally. Reframe the page accordingly. |

---

## Section 3 — Code state vs Jira

✓ aligned · ⚠️ needs change · ✗ missing

| Surface | Jira ticket | Current code | Status |
|---|---|---|---|
| Roles | PRDENG-444 | Org Admin / Dept Editor / Dept Read-Only in `RoleContext` | ✓ |
| Senders settings | PRDENG-2793 / PRDENG-2873 | `/senders/` + `AddSenderModal` | ✓ |
| Contact Lists CRUD | PRDENG-2795 / PRDENG-2876 | `/segments/` (misnamed) | ⚠️ Rename to `/contact-lists/`; add "mid-campaign update rejected" blocking message |
| List Upload flow | PRDENG-2795 / PRDENG-2869 | `UploadWizard` inside segments | ✓ on flow shape; ⚠️ rename + harden the rejection message |
| Topics index | PRDENG-2796 / PRDENG-2870 | ✗ Only `/topics/[id]/` exists | ✗ Missing entirely — primary work surface |
| Topic detail | PRDENG-2796 / PRDENG-2870 | `/topics/[id]/page.tsx` | ⚠️ Needs default Template, associated Lists, subscription count, campaigns-in-Topic |
| Templates index + editor | PRDENG-2797 / PRDENG-2872 | `/templates/` + `[id]` | ⚠️ Copy should reflect Wisdom backing; version dropdown semantics |
| Campaign list | PRDENG-2799 / (general) | `/campaigns/` | ⚠️ Email campaign rows should show Topic column |
| Campaign stepper | PRDENG-2799 / PRDENG-2874 | `/campaigns/new/page.tsx` | ⚠️ Email type must require Topic; refresh-templates action |
| Campaign detail | PRDENG-2799 | `/campaigns/[id]/page.tsx` | ⚠️ Show Topic breadcrumb; Wisdom template ARN + version captured at creation |
| Org hierarchy tree | PRDENG-2794 / PRDENG-2875 | `/preferences/` (misnamed) | ⚠️ Rename to `/organization/`; add Topic as a 5th level |
| Unsubscribes tracking | PRDENG-2800 / PRDENG-2801 / PRDENG-2871 | `/unsubscribers/` | ⚠️ Rename to `/unsubscribes/`; reframe copy as record-only, not suppression |
| Metrics dashboard | PRDENG-2802 / PRDENG-2871 | `/metrics/` | ⚠️ Add Topic-level rollups, not just per-campaign |
| Domain Configuration | PRDENG-2868 | ✗ Missing | ✗ Need a new page |

---

## Section 4 — Prompt sequence

Run in order. Each is sized for a single Claude Code session. Naming choices below match Jira's vocabulary — if you disagree with any naming call, edit before sending.

> **Before Prompt 1:** the earlier followup prompts (Prompts A, B, C in `campaigns-email-followup-prompts.md`) and the role-rename prompt in `campaigns-email-alignment-plan.md` should be cancelled or rolled back if any are in flight. The role names in current code are correct per Jira. The rename prompts in the previous file are not.

### Prompt 1 — Rename Segments → Contact Lists

**Paste:** files under `app/sandbox/campaigns-email/segments/`, the layout, and the campaign stepper.

**Ask:**
> Rename the audience-unit surface from "Segments" to "Contact Lists" to match Jira PRDENG-2795 / PRDENG-2876.
>
> 1. Rename directory `app/sandbox/campaigns-email/segments/` → `app/sandbox/campaigns-email/contact-lists/`. Update the colocated `_components/UploadWizard.tsx` path accordingly.
> 2. In `layout.tsx` `NAV_SECTIONS`: label `'Segments'` → `'Contact Lists'`, href `/segments` → `/contact-lists`. Icon stays `UsersThreeIcon` or switch to `ListBulletsIcon`.
> 3. Update every user-facing string: "Segments" → "Contact Lists", "segment" → "contact list" / "list" where appropriate. Headings, subtitles, empty states, button copy.
> 4. Update `campaigns/new/page.tsx` (stepper): "Direct segments" → "Direct lists", "Topic or segments" → "Topic or lists", `N segment(s)` → `N list(s)`.
> 5. Update dashboard `page.tsx` `SECTIONS` array entry.
> 6. Keep `_mock/lists.ts` as the internal filename — no rename needed there.
> 7. In `UploadWizard.tsx`, change the mid-campaign warning from a soft warning to a **blocking error**: per PRDENG-2795 "mid-campaign list updates are rejected at the API edge". Use `components/ui/message-box.tsx` variant=error, and disable the Submit button when the list is associated with an active or in-progress campaign.
> 8. Run `pnpm typecheck`. Walk through to confirm every link to `/segments/*` is gone and `/contact-lists/*` resolves.

**Acceptance:** all routes and user-facing copy reflect "Contact Lists"; the mid-campaign block is a hard error; mock data files unchanged.

---

### Prompt 2 — Rename Preferences → Organization

**Paste:** all files under `app/sandbox/campaigns-email/preferences/`, layout.

**Ask:**
> Rename the org-hierarchy surface from "Preferences" to "Organization" to match Jira's framing (PRDENG-2794 introduces Account/Component above Campaign Group; PRDENG-2875 calls the surface "Campaign Groups & Organizational Hierarchy UI").
>
> 1. Rename directory `app/sandbox/campaigns-email/preferences/` → `app/sandbox/campaigns-email/organization/`.
> 2. In `layout.tsx` `NAV_SECTIONS`: label `'Preferences'` → `'Organization'`, href `/preferences` → `/organization`. Icon stays `SlidersIcon` or change to `TreeStructureIcon` / `BuildingsIcon`.
> 3. Update page heading and subtitle: "Preferences" → "Organization", subtitle: "Browse the Account / Campaign Group / Topic hierarchy and manage scope-based access."
> 4. In `DetailPane.tsx`, update root node label and any internal "Preferences" strings.
> 5. Update dashboard `page.tsx` SECTIONS array.
> 6. Update `_OPEN_QUESTIONS.md` if it mentions Preferences as the entity name.
> 7. Run `pnpm typecheck`.

**Acceptance:** no `/preferences` route; nav reads "Organization"; tree renders identically.

---

### Prompt 3 — Rename Unsubscribers → Unsubscribes; reframe as record-only

**Paste:** `app/sandbox/campaigns-email/unsubscribers/`, layout, PRDENG-2800 text.

**Ask:**
> Rename `/unsubscribers/` to `/unsubscribes/` and reframe the surface as a record/export tool, not a suppression gate, per PRDENG-2800: "We do not enforce suppression on our send side; the customer pulls the unsubscribes export and applies it externally when they upload their next CSV."
>
> 1. Rename directory `app/sandbox/campaigns-email/unsubscribers/` → `app/sandbox/campaigns-email/unsubscribes/`.
> 2. In `layout.tsx`: label `'Unsubscribers'` → `'Unsubscribes'`, href update.
> 3. Update page heading + subtitle. New subtitle: "Recorded unsubscribe events available for export. Customers apply exports externally when uploading their next CSV — the platform does not suppress sends server-side."
> 4. Add a `components/ui/message-box.tsx` variant=info banner near the top of the page explaining the record-only model. One paragraph.
> 5. The 14-day grace pill stays — but change the tooltip to say: "Available in export N days from now. Grace governs export visibility, not send-time filtering."
> 6. CSV download filename: `unsubscribes.csv` (not `unsubscribers.csv`).
> 7. Add filters per PRDENG-2801: Account / Component, Campaign Group, Topic, date range. (Group filter likely already exists.)
> 8. Update dashboard `SECTIONS` entry: "Unsubscribers" → "Unsubscribes".
> 9. Run `pnpm typecheck`.

**Acceptance:** route renamed; copy clearly states the record-only model; filters cover the four dimensions Jira specifies.

---

### Prompt 4 — Build Topics index page

**Paste:** `_mock/topics.ts`, `_mock/campaigns.ts`, layout, dashboard.

**Ask:**
> Topics is the primary work surface per PRDENG-2796 ("the new direct parent of email campaigns… simultaneously the hierarchy slot below a Campaign Group and the subscription unit"). The route `/topics/[id]/` exists; the index does not. Build `app/sandbox/campaigns-email/topics/page.tsx`.
>
> 1. Layout: header "Topics" + subtitle "Communication streams that subscribers opt into. Each Topic is the parent of one or more email campaigns and is associated with one or more contact lists."
> 2. Header right-action: "+ New Topic" CTA (gate to Org Admin and Dept Editor — Dept Read-Only sees nothing here).
> 3. Filter bar: Campaign Group, status (`active` / `paused` / `archived`).
> 4. Table columns: Name, Campaign Group, Default Template, Subscribers, Active Campaigns, Last Sent, Status. Each row links to `/topics/[id]`.
> 5. Empty state with CTA.
> 6. In `layout.tsx` `NAV_SECTIONS`, add Topics as the first item under CAMPAIGNS (before "Campaigns"). Icon: `TagIcon` or `BroadcastIcon`.
> 7. Update dashboard `SECTIONS` array to include Topics first.
> 8. Run `pnpm typecheck`.

**Acceptance:** index renders; filters work; click-through to existing detail works; Topics nav item appears first.

---

### Prompt 5 — Update Topic data model + detail page

**Paste:** `_mock/topics.ts`, `app/sandbox/campaigns-email/topics/[id]/page.tsx`.

**Ask:**
> Update the Topic data model and detail page to match PRDENG-2796:
>
> **Mock data updates (`_mock/topics.ts`):**
> 1. Add fields to the `Topic` interface: `defaultTemplateArn: string`, `defaultTemplateVersion: number`, `listIds: string[]` (Contact Lists this Topic publishes to), `subscriptionCount: number` (explicit, per the Subscriptions table). Keep existing fields.
> 2. If a `_mock/subscriptions.ts` doesn't exist, add one. Type: `{ topicId, subscriberId, subscribedAt, status }[]`. Seed 30–50 mock rows. This makes the subscription count traceable.
>
> **Topic detail page (`topics/[id]/page.tsx`):**
> 1. Header: Topic name + breadcrumb Campaign Group → Account. Right actions: "+ New campaign in this Topic" (primary), "Edit Topic" (Org Admin / Dept Editor only).
> 2. Stats row: Subscribers (from explicit subscription count), Active Campaigns, Last Sent, Avg Open Rate.
> 3. Tabs:
>    - **Overview:** default Template card (link to template detail), associated Contact Lists (chips), recent campaigns (5 rows).
>    - **Campaigns:** all campaigns where `campaign.topicId === topicId`. Same column shape as the main campaigns list.
>    - **Audience:** Contact Lists table; subscriber count panel that says "Subscribers stored in `Subscriptions` table" (reference Jira data model).
>    - **Settings:** status toggle, default Template picker, associated Lists multi-select, delete (Org Admin only).
> 4. "+ New campaign in this Topic" routes to `/campaigns/new?topicId=[id]` — the stepper reads this and pre-fills.
> 5. Run `pnpm typecheck`.

**Acceptance:** Topic detail shows all four tabs; subscription count reads from mock subscriptions; "+ New campaign in this Topic" pre-fills the stepper.

---

### Prompt 6 — Campaign stepper: enforce Topic for email type

**Paste:** `app/sandbox/campaigns-email/campaigns/new/page.tsx`, `_mock/topics.ts`.

**Ask:**
> Per PRDENG-2799: "Email campaigns require a Topic (their direct parent in the new hierarchy); voice/SMS campaigns continue to live under a Campaign Group with no Topic." Enforce this in the campaign stepper.
>
> 1. Add Topic selection as a required step. Since this prototype is email-only, Topic should be **step 1** (replacing the current first step or coming before it).
> 2. Read `?topicId=` query param on mount. If present, pre-fill Topic (lock it — show as read-only with a "Change topic" link that clears and unlocks), and use Topic defaults for Audience (Topic's `listIds`), Template (`defaultTemplateArn`), Sender (no Jira-defined default; keep user choice).
> 3. Add a **"Refresh templates"** button on the Template step per PRDENG-2797. On click: mock 800ms spinner, then toast "Templates refreshed." If a newer version of the currently-selected template exists, surface a chip "v3 published — click to switch."
> 4. Validation: cannot proceed past Topic step without a Topic selected. Cannot proceed past Template step without a Template selected. The submitted Campaign records `topicId`, `templateArn`, `templateVersion` at the time of creation (these are captured at version, not by reference — per PRDENG-2799 "Wisdom template ARN at a specific published version at creation time").
> 5. Review step shows the captured ARN and version, with a note: "This template version is locked at creation. Later publishes won't change this campaign's content."
> 6. Run `pnpm typecheck`.

**Acceptance:** stepper forces Topic-first; query param pre-fill works; Refresh templates action toasts; template version is captured at submit.

---

### Prompt 7 — Organization tree: add Topic as 5th level

**Paste:** `app/sandbox/campaigns-email/organization/page.tsx` (renamed in Prompt 2), `DetailPane.tsx`, `_mock/groups.ts`, `_mock/topics.ts`.

**Ask:**
> Update the Organization tree to reflect the full Jira hierarchy: **Org → Account / Component → Campaign Group → Topic → (Campaign).**
>
> 1. In `organization/page.tsx`, the tree currently has 3–4 levels. Confirm it shows: root → Account/Component → Campaign Group (current depth). Add **Topic** as a 4th level (depth 3) beneath each Campaign Group.
> 2. Topic nodes are leaves in the tree (Campaigns are not rendered as tree nodes — too many).
> 3. Topic nodes show subscriber-count chip inline.
> 4. Selecting a Topic in the tree updates the right pane to a `TopicDetail` view (mini): name, status, default Template, associated Lists chips, subscriber count, "Open full Topic page →" link to `/topics/[id]`.
> 5. The existing Campaign Group detail should now show a "Topics" section listing Topics under that Group, each clickable (selects in tree + updates pane).
> 6. Keep each file under 300 lines — extract `TopicDetail` as a named function in `DetailPane.tsx`.
> 7. Naming inside the tree: use "Account" for the level above Campaign Group (per PRDENG-2794 which uses "Account (a.k.a. Component)" — Account is the title-cased name, Component is the technical/scope name). Subtitles can clarify "Account = SSA Component."
> 8. Run `pnpm typecheck`.

**Acceptance:** tree shows 4 levels; Topic node click works; Campaign Group detail lists Topics; vocabulary uses "Account."

---

### Prompt 8 — Topic creation modal

**Paste:** `_mock/topics.ts`, `_mock/groups.ts`, `_mock/templates.ts`, `_mock/lists.ts`, `_store/campaigns-store.ts`, `components/ui/modal.tsx`.

**Ask:**
> Build a Topic creation modal triggered from:
> 1. "+ New Topic" on `/topics/page.tsx`
> 2. "+ Add Topic" on the Organization tree's Campaign Group detail pane (add this CTA there if not present)
>
> Modal fields (single screen, no stepper):
> - Name (required, unique within Campaign Group)
> - Description (optional, helper "Visible to subscribers when managing preferences")
> - Account / Campaign Group (required dropdowns, cascading — filtered to user's accessible scope)
> - Default Template (required dropdown filtered by selected Group's Wisdom templates)
> - Associated Contact Lists (multi-select, required at least one, filtered by selected Group)
> - Status (radio: active / paused — default active)
>
> No default Sender field — that's a per-campaign choice per current Jira scope.
>
> Validation per Jira:
> - Name unique within Campaign Group
> - At least one Contact List
> - Template must belong to the selected Campaign Group
>
> On submit: mock-create the Topic via `_store/campaigns-store.ts` (add `addTopic` if not present). Close modal. Toast "Topic '<name>' created." Route to `/topics/[new-id]`.
>
> Gate the trigger CTAs to Org Admin and Dept Editor. Dept Read-Only sees no button.
>
> Run `pnpm typecheck`.

**Acceptance:** modal opens from both entry points; validation enforced; new Topic appears in the list and detail page loads.

---

### Prompt 9 — Templates copy: reflect Wisdom backing

**Paste:** `app/sandbox/campaigns-email/templates/page.tsx`, `templates/[id]/page.tsx`, PRDENG-2797.

**Ask:**
> Per PRDENG-2797, templates are stored in **Connect Wisdom message templates**, not a custom store. Update the Templates UI copy and version semantics to reflect this:
>
> 1. **Index page:** add a single-line subtitle: "Templates are stored in Amazon Connect Wisdom. Each Topic can declare a default template version."
> 2. **Editor page:** the Save / Publish-as-new-version actions stay. Add a metadata strip near the top showing: Wisdom Template ARN (truncated, with copy button), Current Version, Published At.
> 3. Version dropdown: shows Wisdom versions (mock these as `v1`, `v2`, `v3`). Selecting an earlier version puts the editor in read-only mode with a banner: "Viewing v2. Edit the latest version (v3) to make changes."
> 4. Mid-page: the live preview iframe stays as is. Variables drawer stays.
> 5. "Publish as new version" creates a new entry in mock state and updates `EmailTemplateIndex` (the local index table) — keep this in `_mock/templates.ts` for now, but type-define the version row.
> 6. "Set as default for topic" action: opens a modal listing Topics in the current Campaign Group; user picks Topic(s); on confirm, updates each Topic's `defaultTemplateArn` + `defaultTemplateVersion` in mock state.
> 7. Run `pnpm typecheck`.

**Acceptance:** template editor reflects Wisdom-backed storage; version dropdown locks earlier versions read-only; "Set as default" updates Topics correctly.

---

### Prompt 10 — Build Domain Configuration page (NEW)

**Paste:** PRDENG-2868 description.

**Ask:**
> PRDENG-2868 ("Domain Configuration") is a sibling Story under the Epic and was missing from the prototype. Build it.
>
> 1. New route: `app/sandbox/campaigns-email/domains/page.tsx`.
> 2. Add to `layout.tsx` `NAV_SECTIONS` under CAMPAIGNS, after Senders. Icon: `GlobeIcon`. Label: "Domains".
> 3. New mock data file `_mock/domains.ts` with 3–5 mock SES domain rows. Schema: `{ id, domain, verificationStatus: 'verified' | 'pending' | 'failed', verifiedAt, dnsRecords: { type, name, value }[], connectInstanceId: string | null }`.
> 4. Page layout:
>    - Header: "Domains" + subtitle "SES-verified email sending domains."
>    - Table columns: Domain, Verification Status (use existing `SenderIdentityStatus` component shape), Connect Instance (or "Not associated"), Verified Date, Actions.
>    - Row actions: View DNS records (opens modal showing TXT/CNAME records with copy buttons + "Download .csv" button), Associate to Connect instance (opens a small picker modal), Open in AWS SES Console (external link — mock URL).
> 5. Gate "Associate to Connect instance" and DNS download to Org Admin only.
> 6. Dashboard `SECTIONS`: add a "Domains" card with the mock count.
> 7. Run `pnpm typecheck`.

**Acceptance:** Domain page exists, listed in nav; DNS records modal opens with copy + download; association action gated to Org Admin.

---

### Prompt 11 — Reconcile `_OPEN_QUESTIONS.md`

**Paste:** `_OPEN_QUESTIONS.md`.

**Ask:**
> Reconcile `_OPEN_QUESTIONS.md` against what Jira now resolves explicitly. For each item, either move to a "Resolved by Jira" section (with the ticket reference) or rewrite to reflect the actual remaining ambiguity.
>
> **Resolved by Jira:**
> - Q4 (topic objects vs labeled lists): resolved — PRDENG-2796 defines first-class Topic objects with explicit `Topics` and `Subscriptions` tables.
> - Q6 (how are subscriber counts kept in sync): resolved — PRDENG-2796 explicit `Subscriptions` table is the source of truth.
> - Q10 (role model): resolved — PRDENG-444 defines Org Admin / Dept Editor / Dept Read-Only. Three tiers, no Supervisor/Agent.
> - Q17 (grace period configurable per Component): resolved by PRDENG-2800 — 14 days is fixed; governs export availability, not send-time filtering.
> - Q5 (campaign target both Topic AND lists): resolved by PRDENG-2799 — email campaigns require a Topic; targeting is via Topic, which references Lists.
>
> **Still open:**
> - Topic publication consent flow (creating a new Topic = new subscription stream that nobody has opted into yet — what's the bootstrap?)
> - Cross-Account subscriber preference center for the public (out of Epic scope per PRDENG-2867 "out of scope")
> - Default Sender per Topic — not defined in Jira; intentional?
> - Approval workflow for Campaign publication at SSA scale (not in any ticket; worth surfacing to product)
>
> Add a header "_Last reconciled with Jira: 2026-05-13_".

**Acceptance:** doc reflects what Jira resolves vs what's still open; resolved items reference ticket numbers.

---

## Section 5 — What this plan deliberately does not change

- **Role names in `RoleContext`** — Org Admin / Dept Editor / Dept Read-Only stays. Per PRDENG-444. My earlier "rename to Admin / Supervisor / Agent" recommendation is **withdrawn**.
- **Shared `components/ui/*` primitives** — untouched.
- **Mock data filenames** — internal-only, no renames needed even when the route is renamed.
- **The Campaigns list page as a top-level nav item** — stays. Voice/SMS campaigns flow through Campaign Group directly (no Topic per PRDENG-2799), so a flat campaigns view remains relevant even when email is Topic-first.
- **The followup file `campaigns-email-followup-prompts.md`** Prompt A (dashboard link fix) and Prompt B (Q4 reconciliation) — still applicable but **Prompt C (RBAC audit)** can run unchanged because role names are unchanged.
- **The earlier alignment plan file `campaigns-email-alignment-plan.md`** — superseded by this document. Prompts 1, 6, 7 from that file (role rename, Topic-first campaign creation refactor as a hard kill of `/campaigns/new`, Components tree rename) are **either wrong or need rewording** — use the prompts in this file instead.

---

## Section 6 — Sequencing summary

| Step | Prompt | Depends on | Effort |
|---|---|---|---|
| 1 | Segments → Contact Lists | none | Small |
| 2 | Preferences → Organization | none | Small |
| 3 | Unsubscribers → Unsubscribes + reframe | none | Small |
| 4 | Topics index page | layout updated (P1–3 optional) | Medium |
| 5 | Topic data model + detail upgrade | P4 | Large |
| 6 | Campaign stepper Topic-first | P4, P5 | Medium |
| 7 | Organization tree adds Topic level | P2, P5 | Medium |
| 8 | Topic creation modal | P4, P5 | Medium |
| 9 | Templates Wisdom semantics | none | Small |
| 10 | Domain Configuration page | none | Medium |
| 11 | Open Questions reconciliation | all previous | Small |

Critical path: P4 → P5 → P6 unlock the new IA. P1, P2, P3, P9, P10 are independent and can run in parallel. P7, P8 are polish.

Rough estimate: 9–12 Claude Code sessions of 30–90 minutes.
