# Email Campaigns — v3 Implementation Plan

**Supersedes:** `campaigns-email-v2-update-plan.md` and `campaigns-email-meeting-followups.md`  
**Figma file:** [Campaigns - Emails](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails)  
**Sandbox root:** `app/sandbox/campaigns-email/`  
**Dev server:** `localhost:3400`

---

## Context snapshot

### What's already built (current prototype)

**Routes:** `campaigns/`, `campaigns/[id]/`, `campaigns/new/`, `templates/`, `templates/[id]/`, `senders/`, `segments/`, `segments/[id]/`, `preferences/`, `metrics/`, `unsubscribers/`, `topics/[id]/`

**Primitives:** `_components/SenderIdentityStatus`, `_components/MetricTile`, `_components/ChannelBadge`, `_context/RoleContext`, `_store/campaigns-store`

**Mock data:** `_mock/groups.ts` (Account→CampaignGroup hierarchy), `_mock/campaigns.ts`, `_mock/senders.ts`, `_mock/lists.ts`, `_mock/templates.ts`, `_mock/topics.ts`, `_mock/metrics.ts`, `_mock/unsubscribes.ts`

### Target nav (from Figma 122:7830)

The 5 sub-items live inside the global CxPortal sidebar as children of the Campaigns nav group. In the sandbox, keep the secondary sidebar pattern but restructure to these 5 flat items:

| Label | Route |
|---|---|
| Dashboard | `/sandbox/campaigns-email` |
| Account Management | `/sandbox/campaigns-email/account-management` |
| Recipient Lists | `/sandbox/campaigns-email/lists` |
| Email Templates | `/sandbox/campaigns-email/templates` |
| Channels | `/sandbox/campaigns-email/channels` |

### Route disposition

| Existing route | Action |
|---|---|
| `senders/` | Rename → `channels/`, redirect old path |
| `segments/` | Rename → `lists/`, redirect old path |
| `templates/` | Keep route, restyle |
| `campaigns/new/` | Keep route, rebuild as 4-step flow |
| `campaigns/`, `campaigns/[id]/` | Keep as drill-down targets from Dashboard |
| `metrics/`, `unsubscribers/`, `preferences/` | Deprecated — stub in Prompt 1, delete in Prompt 8 |
| `topics/[id]/` | Absorbed into Account Management — delete in Prompt 8 |

### Key Figma observations

- **Dashboard** — KPI bar (5 DataCards with weekly delta), Campaigns table (Name, Group, Type chip, Contacts, Delivery Rate, Status chip), collapsible filter panel, "Switch Account" button, info banner linking to Channels.
- **Account Management** — 3 drill-down levels: Account list → Campaign Group detail (tabs: Topics, Lists, Members, Active Campaigns) → Topic detail (Overview + Campaigns tabs). No full-page navigation between levels — use URL params.
- **Recipient Lists** — Table (Name, Campaign Group, Status, Topics, Type, Records). Upload is a 4-step modal: Name → File → Column Mapping → Preview.
- **Email Templates** — List (Template Name, Account, Topic, Version, Status, Last Edit). Full-page split-pane editor: HTML Source + Preview. Variables drawer slides in. Form row at top: Name, Subject, Topic, Version. Actions: Save Draft, Publish New Version, Set Default toggle.
- **Channels** — Page title "Sender Identities". Table: Email, Display Name, Campaign Group, Status, Last Verified. 3-dot action menu per row. Add New Sender modal.
- **Create Campaign** — 4-step wizard with sidebar stepper: (1) Type (Group select + 5 clickable type cards), (2) Message Content (Name, Subject, Sender, List, Template, HTML/Preview), (3) Schedule (Send Now vs Scheduled + datetime), (4) Review & Launch.

---

## Execution rules (apply to every prompt)

- Pull `get_design_context` + `get_screenshot` for the named Figma node **before writing a line of code**
- Read `CLAUDE.md` and `guidelines.md` at the start of every session
- Reuse before creating: search `components/ui/*` first
- Net-new sub-components go in `_components/` until Rule of Three earns promotion to `components/ui/`
- No inline styles for static values — Tailwind first, CSS vars from `globals.css` second
- Component files ≤ 250 lines; split if exceeded
- **Load More pattern** for every table: `useState(10)`, slice, reset on filter/search, +10 per press
- No `any` types — type everything
- No Co-Authored-By trailers in commit messages
- After each prompt: run `pnpm typecheck`. Fix every error before moving on.

---

## Prompt sequence

### Prompt 1 — Foundation: Nav + RoleContext + Mock Data

**Status:** `[x] complete`

**Figma:** [Nav — 122:7830](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7830)

**Read first:** `CLAUDE.md`, `guidelines.md`, `app/sandbox/campaigns-email/layout.tsx`, `_context/RoleContext.tsx`, `_mock/groups.ts`

---

Update `layout.tsx` to replace the three-section nav (CAMPAIGNS / AUDIENCE / ANALYTICS) with a single flat list:

- Dashboard → `/sandbox/campaigns-email`
- Account Management → `/sandbox/campaigns-email/account-management`
- Recipient Lists → `/sandbox/campaigns-email/lists`
- Email Templates → `/sandbox/campaigns-email/templates`
- Channels → `/sandbox/campaigns-email/channels`

Keep the RBAC role-switcher dev affordance. Match the active state styling from Figma (primary-colored left border, `var(--color-info-100)` background, filled icon weight when active).

Update `RoleContext.tsx` — rename roles to match the real model:

```ts
type Role = 'super-admin' | 'account-admin' | 'editor' | 'viewer'
```

Update `canEdit` and `canDelete` helpers accordingly. Keep the switcher UI functional.

Stub deprecated routes — add a comment at the top of each affected page file (do **not** delete anything yet):

- `senders/page.tsx` → `// RENAMED → /sandbox/campaigns-email/channels`
- `segments/page.tsx` → `// RENAMED → /sandbox/campaigns-email/lists`
- `preferences/page.tsx` → `// DEPRECATED — not in new IA`
- `metrics/page.tsx` → `// DEPRECATED — absorbed by Dashboard`
- `unsubscribers/page.tsx` → `// DEPRECATED — absorbed by Dashboard`

Create `_mock/accounts.ts` with 2 mock accounts (e.g., "SSA — Field Operations" and "SSA — Retirement Services"), each containing an array of `campaignGroupIds` that cross-reference `groups.ts`. Add `accountId: string` to `CampaignGroup` in `groups.ts` and update all existing groups.

Create `_store/ui-store.ts` with a `useUIStore` hook that persists `activeAccountId: string` in React state.

Add a `// LOAD-BEARING — refactors require explicit approval` comment at the top of `_store/campaigns-store.ts` and `_context/RoleContext.tsx`.

**Acceptance:** new nav renders with 5 items, role switcher shows 4 roles and works, `pnpm typecheck` passes, deprecated route files carry their comments.

---

### Prompt 2 — Dashboard

**Status:** `[x] complete`

**Figma:**
- [Filter Collapsed — 36:8482](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=36-8482)
- [Filter Expanded — 39:21938](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=39-21938)

**Read first:** `app/sandbox/campaigns-email/page.tsx`, `_components/MetricTile.tsx`, `_mock/metrics.ts`, `_mock/campaigns.ts`, `_mock/accounts.ts`

---

Replace `app/sandbox/campaigns-email/page.tsx` with the Dashboard implementation.

**Page header:** Title "Dashboard", subtitle "Track your agencies and campaigns performances". Add a `SwitchAccountButton` in the page header area (right side of PageTitle) — a small button showing the active account name with a chevron dropdown. The dropdown lists the 2 mock accounts from `_mock/accounts.ts`; selecting one updates `activeAccountId` in `_store/ui-store.ts`. Keep it visual — no data re-filtering needed for the prototype.

**Info banner:** `components/ui/message-box.tsx` (info variant): "1 sender identity awaiting verification. Review senders →". Link href: `/sandbox/campaigns-email/channels`.

**Overall Performance:** Section title "Overall Performance" + "Last 7 days" select (visual only, no filtering). 5 `MetricTile` instances in a horizontal row:
- Active Campaigns: 24, +5.2% vs last week
- Messages Sent: 156,742, +2.3% vs last week
- Delivery Rate: 87.7%, +1.6% vs last week
- Survey Responses: 3,421, +5.2% vs last week
- Voicemail Responses: 14.1%, +2.7% vs last week

Seed these values in `_mock/metrics.ts`.

**Campaigns table:** Section title "Campaigns" + "Create New Campaign" CTA button (links to `/sandbox/campaigns-email/campaigns/new`). Search input filters by campaign name. Table using `components/ui/table.tsx` with columns:
- Campaign Name — link to `/sandbox/campaigns-email/campaigns/[id]`
- Campaign Group
- Type — chip (Voice Survey / SMS Survey / Voice Notification / SMS Notification / Email Campaign)
- Contacts
- Delivery Rate
- Status — chip (Running: info, Paused: warning, Scheduled: success, Initialized: default, Failed: error, Completed: success)

Add `type`, `contacts`, `deliveryRate`, `status` fields to `_mock/campaigns.ts` if missing. Seed 10+ mock campaigns covering all type and status variants.

Load More pattern: start at 10, +10 per press, reset to 10 whenever search input changes.

**Collapsible filter panel:** A toggle button (funnel/filter icon) at top-left of the content container opens a 250px left panel with filter selects for Campaign Group, Type, Status, and Date Range. When collapsed, the table uses full content width; when expanded, the table shifts right. Use local `useState` — no external store needed.

**Acceptance:** page loads at `/sandbox/campaigns-email`, 5 KPI tiles render, campaigns table with correct chips, search filters, load more increments, filter panel toggles open/closed.

---

### Prompt 3 — Channels

**Status:** `[x] complete`

**Figma:**
- [List — 36:5547](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=36-5547)
- [Add New modal — 40:9478](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=40-9478)
- [Action menu — 40:10116](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=40-10116)

**Read first:** `senders/page.tsx`, `senders/AddSenderModal.tsx`, `_components/SenderIdentityStatus.tsx`, `_components/ChannelBadge.tsx`, `_mock/senders.ts`, `_mock/groups.ts`

---

Create `app/sandbox/campaigns-email/channels/page.tsx` by adapting `senders/page.tsx`. Do **not** delete `senders/` yet.

**Page title:** "Sender Identities". Subtitle: "Verified sender email addresses used in campaign From fields. Each sender must pass domain verification before it can be used in a campaign."

**Table:** Count label "Senders (N)" + "Add New Sender" CTA button. Columns: Email, Display Name, Campaign Group, Status (chip), Last Verified. Each row has a 3-dot `⋮` action menu with 4 items: View Details (stub — opens a stub modal), Edit (stub), Re-verify (stub — shows a toast "Verification email sent"), Delete (opens a confirm dialog, removes from mock state).

Status chips: Verified → success variant, Expired → warning variant, Failed → error variant.

Add `campaignGroupId` to each entry in `_mock/senders.ts` (or copy the file to `_mock/channels.ts` and update the import). Cross-reference with `_mock/groups.ts` to display the group name in the Campaign Group column.

Copy `senders/AddSenderModal.tsx` to `channels/AddChannelModal.tsx`. Keep the existing form fields (Email, Display Name, Campaign Group select). Update the modal title to "Add New Sender Identity". On submit, add the new sender to mock state and refresh the table.

Extend `ChannelBadge.tsx` to include `'whatsapp'` in the union type with a "Coming Soon" tooltip on hover. Do not add any whatsapp rows to mock data — this is forward-compat typing only.

Add a redirect in `senders/page.tsx` — replace its content with:
```tsx
import { redirect } from 'next/navigation'
export default function SenderRedirect() {
  redirect('/sandbox/campaigns-email/channels')
}
```

**Acceptance:** table at `/channels` renders with correct chips and count, 3-dot menu shows 4 options, Add New Sender modal adds to list, `/senders` redirects to `/channels`, typecheck passes.

---

### Prompt 4 — Recipient Lists

**Status:** `[x] complete`

**Figma:** [122:7849](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7849)

**Read first:** `segments/page.tsx`, `segments/[id]/page.tsx`, `segments/_components/UploadWizard.tsx`, `_mock/lists.ts`, `_mock/groups.ts`

---

Create `app/sandbox/campaigns-email/lists/page.tsx` and `lists/[id]/page.tsx` by adapting the segments routes. Do **not** delete `segments/` yet.

**List index page** (`lists/page.tsx`): Page title "Recipient Lists". Table columns: Name, Campaign Group, Status (Active/Inactive chip), Topics (count of associated topics), Type (email-only/phone-only/both chip), Records. "New List" CTA → opens the upload modal. Each row has an "Update List" action that opens the same modal with the list name pre-filled. Follow Load More pattern.

**List detail page** (`lists/[id]/page.tsx`): Page title = list name. Shows list metadata at the top (group, status, record count, last updated). Table below showing individual contact records — columns from the list's schema (at minimum: email, firstName, lastName). Seed 10+ mock contacts in `_mock/lists.ts`.

**Upload modal** — 4-step modal (use a local step indicator, not `components/ui/stepper.tsx` which is for page-level flows):

Step 1 — **Name:** Text input for list name (pre-filled when updating an existing list).

Step 2 — **Upload:** Drag-and-drop zone with upload icon and "Drop a CSV file here, or click to browse" label. For the prototype, clicking "Select File" or dropping sets a mock filename and advances to Step 3 automatically.

Step 3 — **Column Mapping:** Table with one row per mock CSV column (seed 8 columns: `email`, `first_name`, `last_name`, `date_of_birth`, `phone`, `member_id`, `preferred_language`, `zip_code`). Each row shows:
- CSV header (read-only)
- Inferred attribute — editable select with options: system attributes (email, firstName, lastName, phone, dateOfBirth, memberId), "Custom attribute" (text input appears), "Ignore"
- A chip indicating the mapping state: system attribute (info/blue), custom attribute (warning/yellow), ignored (default/gray)

Hard-block the Next button in Step 3 if no email or phone column is mapped — show an inline error. Show an attribute counter "X of 100 attributes used" below the table.

Step 4 — **Preview:** Title "Import Preview". Table showing first 5 mock rows with the mapped column names as headers. "Import" button — on click, adds the list to mock state, shows a toast "List imported successfully", closes the modal.

Add a redirect from `segments/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
export default function SegmentRedirect() {
  redirect('/sandbox/campaigns-email/lists')
}
```

**Acceptance:** list table renders at `/lists`, upload modal walks all 4 steps, hard-block on no email/phone column, Import adds to list, detail page shows records, `/segments` redirects.

---

### Prompt 5 — Email Templates

**Status:** `[x] complete`

**Figma:**
- [List — 36:5405](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=36-5405)
- [Add New editor — 38:13783](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=38-13783)
- [Edit editor, drawer closed — 39:20281](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=39-20281)
- [Edit editor, drawer open — 59:20041](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=59-20041)

**Read first:** `templates/page.tsx`, `templates/[id]/page.tsx`, `_mock/templates.ts`, `_context/RoleContext.tsx`

---

**Templates list** (`templates/page.tsx`): Restyle to match Figma. Page title "Email Templates", subtitle "Reusable email templates scoped to a campaign group. Each template supports versioning and Connect-style variable placeholders."

Table columns: Template Name (link → editor), Account, Topic, Version (v1/v2/v3), Status (Published: success chip, Draft: default chip), Last Edit. "Add New Template" CTA → navigates to `/templates/new`.

Update `_mock/templates.ts` to add `account: string`, `topic: string`, `version: string`, `status: 'published' | 'draft'`, `lastEdit: string` fields. Seed 7 templates covering both published and draft statuses.

Follow Load More pattern.

**Templates editor** (`templates/[id]/page.tsx` and `templates/new/page.tsx`):

This is a full-page view. The sub-nav sidebar should be hidden on the editor pages — pass a prop or use a layout-level flag. Check if `layout.tsx` can conditionally suppress the sub-nav based on a route segment or a React context boolean. If layout changes are needed, keep them minimal.

Editor layout from top to bottom:
1. **Form row** (90px height): Template Name input (240px), Subject input (382px), Topic select (240px) — all inline in a single row
2. **Action row** (right side of form row): Save Draft button, Publish New Version button, Set Default toggle (`components/ui/switch.tsx` or equivalent), Variables button (opens drawer)
3. **Split pane** (fills remaining height): Left half = HTML Source label + textarea for raw HTML. Right half = Preview label + rendered preview div that replaces `{{variable}}` placeholders with mock values

**Variable substitution (mock values):**
```ts
const MOCK_VARS: Record<string, string> = {
  'recipient.firstName': 'Jane',
  'recipient.lastName': 'Smith',
  'recipient.email': 'jane.smith@example.gov',
  'topic.name': 'Medicare IEP Reminders',
  'campaign.name': 'Medicare IEP Reminder — Jan 2026',
  'unsubscribe.url': '#',
  'sender.displayName': 'SSA Medicare Coordination',
  'benefit.amount': '$1,847.00',
  'benefit.effectiveDate': 'January 2026',
  'office.name': 'Baltimore Field Office',
  'office.phone': '410-965-2900',
}
```

Apply substitution with a regex replace on textarea content before rendering the preview.

**Variables drawer:** Slides in from the right (overlay, not push). Header: "Variables — Click a variable to insert at cursor. List pending from Connect integration." Each variable row shows: `{{variable.name}}` (monospace) + plain-text description. Clicking a row copies the variable string to the clipboard. Close button (×) dismisses the drawer.

**RBAC:** `viewer` role hides Save Draft, Publish New Version, and Set Default — replace with read-only text labels. All other roles can edit.

**Acceptance:** list shows 7 templates with correct columns, click navigates to editor, split pane renders, variables drawer opens/closes, mock variables replace in preview, RBAC hides actions for viewer, `pnpm typecheck` passes.

---

### Prompt 6 — Account Management

**Status:** `[x] complete`

**Figma:** [122:7848](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7848)

**Read first:** `_mock/accounts.ts`, `_mock/groups.ts`, `_mock/topics.ts`, `_mock/lists.ts`, `_mock/templates.ts`, `_mock/senders.ts`, `_context/RoleContext.tsx`, `_store/ui-store.ts`

---

Build `app/sandbox/campaigns-email/account-management/page.tsx`. This is the hierarchy browser — three drill-down levels rendered in a single page that updates its content panel on selection. Use URL search params (`?account=rsc&group=rsc-g1&topic=topic-id`) so the browser back button works.

**Level 1 — Account list** (shown when no account is selected in URL):

Page title "Account Management". Table columns: Component Name, Campaign Groups (count), Topics (count), Lists (count), Active Campaigns (count). Clicking a row selects that account and shows Level 2.

RBAC: `super-admin` sees all accounts. `account-admin` and below see only their account — skip Level 1 entirely and land directly on Level 2 for their account (derive the account from mock role data).

**Level 2 — Campaign Group detail** (shown when `?account=X` in URL):

Breadcrumb: Account Management / [Account Name]. Shows the account name as the section header with a description. Tabs using `components/ui/tabs.tsx`:

- **Topics tab** — table: Topic Name, Default Template, Subscriber Count, Active Campaigns, Status (enabled chip / disabled chip). "Add Topic" button (admin only — `account-admin` or `super-admin`) opens the Create Topic modal.
- **Lists tab** — table: List Name, Records, Topics (count), Status. Read-only links to `/lists/[id]`.
- **Members tab** — table: Name (mock), Email (mock), Role chip. Read-only.
- **Active Campaigns tab** — table: Campaign Name, Type chip, Status chip, Scheduled. Read-only links to `/campaigns/[id]`.

"Add Campaign Group" button (admin only) opens the Add Campaign Group modal.

Clicking a topic row selects it and shows Level 3.

**Add Campaign Group modal:** Single input — Campaign Group Name. On save, adds to mock state and refreshes the tab.

**Level 3 — Topic detail** (shown when `?account=X&group=Y&topic=Z` in URL):

Breadcrumb: Account Management / [Account] / [Campaign Group] / [Topic Name]. Two tabs:

- **Overview tab:** Topic metadata panel — Name (read-only text or editable for admin), Description, Default Sender (select from channels in this group), Default Template (select from all published templates), Default Recipient List (select from lists in this group), Enabled/Disabled toggle. "Save Changes" button (admin only). Below the metadata: a metrics summary (Total Subscribers, Active Campaigns, Messages Sent last 30 days) using MetricTile.

- **Campaigns tab:** Table of campaigns under this topic — columns: Campaign Name (link), Type chip, Status chip, Scheduled, Contacts.

**Create Topic modal:** Fields — Name (text), Description (text), Default Sender (select), Default Template (select), Default Recipient List (select), Enabled (toggle). Save adds to mock state.

**RBAC summary:**
- `viewer` — no Create/Edit buttons anywhere, no modals
- `editor` — read-only; can view everything but cannot create groups/topics
- `account-admin` — can add groups and topics within their account, can edit topic settings
- `super-admin` — all of the above across all accounts

**Acceptance:** three levels navigate with URL params, back button returns to previous level, Add Campaign Group modal works, Create Topic modal works, RBAC gates buttons per role, tabs render correct data.

---

### Prompt 7 — Create Campaign (4-step flow)

**Status:** `[ ] not started`

**Figma:**
- [Step 1 — Type — 52:10753](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=52-10753)
- [Step 1.2 (type selected) — 77:23733](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=77-23733)
- [Step 2 — Message — 52:11782](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=52-11782)
- [Step 3 — Schedule — 52:12729](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=52-12729)
- [Step 3.2 (scheduled selected) — 77:23989](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=77-23989)
- [Step 4 — Review — 52:13241](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=52-13241)

**Read first:** `campaigns/new/page.tsx`, `_store/campaigns-store.ts`, `_mock/campaigns.ts`, `_mock/templates.ts`, `_mock/senders.ts`, `_mock/lists.ts`, `_mock/groups.ts`

---

Rebuild `app/sandbox/campaigns-email/campaigns/new/page.tsx` as a 4-step wizard.

This is a full-page view — suppress the sub-nav sidebar (same approach as Prompt 5 editor pages).

Extract each step into its own component file under `campaigns/_components/steps/` to keep the page file under 250 lines:
- `StepType.tsx`
- `StepMessage.tsx`
- `StepSchedule.tsx`
- `StepReview.tsx`

**Page layout:** Two-column:
- Left (280px): "New Campaign" title + vertical stepper showing 4 steps. Use `components/ui/stepper.tsx` if available, otherwise build a minimal local stepper. Completed steps show a checkmark; current step is highlighted; future steps are dimmed.
- Right (flex-1): Current step content

**Step 1 — Select Campaign Type:**

Campaign Group select (required, full-width, with helper text: "To create a campaign you need to associate it with a Campaign Group."). Selecting a group gates the Next button.

"Type" heading below. Grid of 5 `components/ui/clickable-card.tsx` (or the nearest existing card primitive):
- Voice Survey — "Collect feedback through interactive voice calls with up to 5 questions. Responses are entered via keypad."
- SMS Survey — "Gather insights with interactive text surveys of up to 5 questions. Responses are sent back via SMS."
- Voice Notification — "Send automated voice calls with pre-recorded or text-to-speech messages. Perfect for quick updates and alerts."
- SMS Notification — "Send one-way text messages directly to mobile devices. Ideal for reminders and announcements."
- Email Campaign — "Send one-way text messages directly to mobile devices. Ideal for reminders and announcements."

Selecting a card highlights it. Both a Campaign Group and a Type must be selected to enable Next.

Bottom action row: Cancel (with discard confirmation modal) + Next.

**Step 2 — Create Your Message Content:**

- Campaign Name (text input, required)
- Subject line (text input) — shown only when type is Email Campaign
- Sender select — options from `_mock/senders.ts` filtered by the selected Campaign Group
- Recipient List select — options from `_mock/lists.ts` filtered by the selected Campaign Group
- Template select — shown only for Email Campaign; options from `_mock/templates.ts`; selecting pre-populates the HTML textarea below
- HTML Source + Preview split pane (half-width each) — shown only for Email Campaign; same variable substitution logic as Prompt 5 editor

Bottom action row: Cancel + Back + Save Draft + Next.

**Step 3 — Schedule Your Campaign:**

"Schedule Your Campaign" section title.

Two `ClickableHorizontalCard` options side by side:
- Send Now — launches immediately on submit
- Scheduled — reveals date/time inputs below when selected

If "Scheduled": Start Date input (date picker or text input `type="date"`) + Start Time input (`type="time"`).

Bottom action row: Cancel + Back + Save Draft + Review.

**Step 4 — Review & Launch:**

"Review & Launch" section title.

**Campaign Details block** with "Edit" link (jumps back to Step 1/2):
- Campaign Name
- Campaign Group + Topic (if applicable)
- Recipient List + Sender

**Email Template block** with "Choose Different Template" link (jumps to Step 2):
- Template name + version
- Preview div (same mock variable rendering from Step 2)

Bottom action row: Cancel + Back + Save Draft + Launch Campaign.

**Launch:** On click — add the new campaign to `_store/campaigns-store.ts` mock state with status "Initialized", show a toast "Campaign created successfully", navigate to `/sandbox/campaigns-email` (Dashboard).

**Cancel / discard:** Clicking Cancel at any step opens a `components/ui/modal.tsx` confirmation: "Discard this campaign? Your progress will be lost." Confirm discards and navigates to Dashboard. Dismiss returns to the step.

**Save Draft:** Saves current step data to `_store/campaigns-store.ts` with status "draft" and navigates to Dashboard (no confirmation needed).

**Wire entry point:** The "Create New Campaign" CTA on the Dashboard (Prompt 2) links to `/sandbox/campaigns-email/campaigns/new`.

**Acceptance:** 4 steps navigate forward and back, stepper tracks current step, Email-only fields show only for Email Campaign type, Launch adds to mock state + redirects, Cancel shows confirmation, Save Draft works, `pnpm typecheck` passes.

---

### Prompt 8 — Polish: Cleanup, Cross-flow Wiring, Empty/Error States

**Status:** `[x] complete`

**No Figma — implementation only.**

**Read first:** All pages under `app/sandbox/campaigns-email/`. Run `pnpm typecheck` first and note any pre-existing errors.

---

**1. Remove dead routes:**

Grep first: `grep -r "senders\|segments\|metrics\|unsubscribers\|preferences\|topics/" app/sandbox/campaigns-email/ --include="*.tsx" --include="*.ts"`

Fix any remaining references in imports or links. Then delete:
- `senders/` directory (replaced by `channels/`)
- `segments/` directory (replaced by `lists/`)
- `metrics/` directory (absorbed by Dashboard)
- `unsubscribers/` directory (absorbed by Dashboard)
- `preferences/` directory (deprecated)
- `topics/` directory (absorbed by Account Management)

**2. Empty states:**

Every table must render an empty state when its data array is empty. Use `components/ui/message-box.tsx` (info variant):
- Dashboard campaigns table: "No campaigns yet." + "Create New Campaign →" button
- Channels: "No sender identities registered." + "Add New Sender →" button
- Lists: "No recipient lists." + "Import a List →" button
- Templates: "No email templates." + "Add Template →" button
- Account Management (each tab): "No [items] in this [level] yet."

**3. Loading states:**

Each page shows skeleton placeholder rows for 600ms on mount before revealing real data. Implement with:
```tsx
const [loading, setLoading] = useState(true)
useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t) }, [])
```
Show 3 skeleton rows (gray animated pulse bars) while `loading` is true.

**4. Error state:**

Add `?error=1` URL param support on each page. When present, replace the page content with a `message-box.tsx` (error variant): "Something went wrong loading this page. Try refreshing or contact support."

**5. Cross-flow wiring — verify all links work:**

| From | To |
|---|---|
| Dashboard info banner "Review senders →" | `/channels` |
| Dashboard campaign name (table row) | `/campaigns/[id]` |
| Dashboard "Create New Campaign" | `/campaigns/new` |
| Channels "View Details" (3-dot menu) | stub modal (ok to leave) |
| Lists detail view | `/lists/[id]` |
| Lists "Associate Topic" | Account Management topic detail |
| Templates list row | `/templates/[id]` (editor) |
| Account Management Topics tab | Topic Level 3 detail |
| Account Management Lists tab | `/lists/[id]` |
| Account Management Campaigns tab | `/campaigns/[id]` |
| Campaign create Step 4 "Edit" links | Jump back to correct step |
| Campaign create Step 2 template preview | Same variable substitution as Prompt 5 |

**6. RBAC audit:**

Walk through each role in the switcher and verify:
- `viewer` — zero Create, Edit, Delete buttons visible anywhere
- `editor` — "Create New Campaign" visible, no group/topic/sender management
- `account-admin` — all editor permissions + Add Campaign Group, Create Topic, Add New Sender
- `super-admin` — all of the above, sees all accounts in Account Management Level 1

**7. Final typecheck + stale string grep:**

```bash
pnpm typecheck
grep -r "senders\|segments\|metrics\|unsubscribers\|preferences" app/sandbox/campaigns-email/ --include="*.tsx" --include="*.ts"
grep -rn "dept-editor\|dept-readonly\|org-admin" app/sandbox/campaigns-email/ --include="*.tsx" --include="*.ts"
```

Fix every hit. No `any` types. No stale role names.

**Acceptance:** full demo walkthrough as each role shows no dead links, no 404s, correct empty/loading states, no stale role names or route strings, `pnpm typecheck` exits clean, `pnpm build` succeeds.

---

## Post-plan schema fixes

Applied after all 8 prompts were complete, based on gaps identified in `campaigns-email-cardinalities-matrix.md`:

| Gap | Fix |
|---|---|
| `Topic.defaultSenderId` missing | Added `defaultSenderId: string \| null` to `Topic` interface; seeded in all 8 mock topics; `LevelThree` state now initialises from `topic.defaultSenderId` |
| `Topic.defaultListId` missing | Added `defaultListId: string \| null` to `Topic` interface; seeded in all 8 mock topics; `LevelThree` state now initialises from `topic.defaultListId` |
| `AddTopicModal` omitted new fields | Added `defaultSenderId` and `defaultListId` to the constructed `Topic` object on save |

Open cardinality question (Template ↔ Topic 1:1 vs N:N) remains a product decision — schema already supports either; no code change needed until the decision is made.

---

## Risk flags

| Risk | Mitigation |
|---|---|
| Account Management (Prompt 6) is the most complex — 3 levels + URL params + RBAC + modals | Do it after Prompts 1–5 are stable. Keep level state in URL params, not in a store. |
| Template editor hides the sub-nav — may need layout changes | Add a React context boolean `hideSideNav` that `layout.tsx` reads; set it in the editor `useEffect`. Keep the change to 2–3 lines in layout. |
| Create Campaign is 4 steps in one route — file size risk | Extract each step to `campaigns/_components/steps/StepX.tsx`. The page file orchestrates only. |
| Upload modal column mapping (Prompt 4) — complex UI | Seed exactly 8 mock columns; don't parse a real CSV. Keep the mapping table as a static array with local state per row. |
| `campaigns-store.ts` is load-bearing | Do not refactor its shape — only add fields. If a type change is needed, add it additively. |

---

## Progress tracker

Update statuses as prompts complete:

```
[x] Prompt 1 — Foundation: Nav + RoleContext + Mock Data
[x] Prompt 2 — Dashboard
[x] Prompt 3 — Channels
[x] Prompt 4 — Recipient Lists
[x] Prompt 5 — Email Templates
[x] Prompt 6 — Account Management
[x] Prompt 7 — Create Campaign
[x] Prompt 8 — Polish
```

Change `[ ]` → `[x]` when a prompt is complete and `pnpm typecheck` passes.
