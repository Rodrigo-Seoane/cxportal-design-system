# Email Campaigns Prototype — Claude Code Prompt Plan

**Source material**

- SOW: SSA Digital Communications Campaign Platform (Apr 22, 2026)
- Epic: [PRDENG-2618 Email Campaigns](https://pronetx.atlassian.net/browse/PRDENG-2618)
- UI Design story (8 surfaces): [PRDENG-2867](https://pronetx.atlassian.net/browse/PRDENG-2867)
- Figma: [CxPortal | Campaigns](https://www.figma.com/design/rsaaFN1TrcJQbADpPSK7K6/CxPortal-%7C-Campaigns?node-id=2-856)

---

## Scope decisions (assumptions — change before starting if wrong)

1. **Where it lives.** Prototype goes under `app/sandbox/campaigns-email/` with co-located components, matching the existing sandbox pattern (`app/sandbox/collapsible-filter/`, `app/sandbox/login-report/`). The home page explicitly calls Sandbox the place to "build, test, and validate new features with devs and stakeholders before they graduate into the system." Anything that *graduates* later gets promoted to `components/campaigns/` and `app/campaigns/`.
2. **Fidelity.** Click-through prototype with hardcoded mock data in TS files — no API calls, no real state persistence. Local React state only. Mocks should reflect SSA scale (12 components, 80M+ subscribers in copy/badges, but rows stay small for perf).
3. **Reuse over rebuild.** All eight surfaces compose from existing `components/ui/*` primitives (Modal, Table, Stepper, StatsCards, Tabs, MessageBox, Toast, DatePicker, Chip, Select, etc.). If a screen *needs* a new shared primitive, that primitive goes in `components/campaigns/` first; only promote to `components/ui/` after the third reuse (Rule of Three).
4. **No backend assumptions baked in.** Stay channel-agnostic where the Voice/SMS overlap matters — wrap email-specific bits behind a `channel: 'email'` discriminator in the mock data layer so the existing campaign stepper story can evolve without parallel forks.
5. **Open product questions stay surfaced, not silently chosen.** Where Jira flags an open decision (topic objects vs labeled lists; hierarchy naming; subscriber portal placement), the prototype shows BOTH options behind a feature toggle in the page-level header so reviewers can compare.

If any of these is wrong, fix it before sending prompt #1 — they're load-bearing for everything that follows.

---

## Critical reuse map

Before writing prompts, know what's already in the design system. Every prompt below references these so Claude Code reuses them by path.

| Need | Existing primitive |
|---|---|
| Tabular data with pagination | `components/ui/table.tsx`, `components/ui/pagination.tsx` |
| Multi-step flows | `components/ui/stepper.tsx` |
| Metric cards | `components/ui/stats-cards.tsx` |
| Sectioned editors | `components/ui/tabs.tsx`, `components/ui/vertical-tabs.tsx` |
| Confirm / wizard modals | `components/ui/modal.tsx` |
| Status indicators | `components/ui/chip.tsx`, `components/ui/message-box.tsx` |
| Toasts | `components/ui/toast.tsx` |
| Inline forms | `components/ui/input.tsx`, `components/ui/select.tsx`, `components/ui/checkbox.tsx`, `components/ui/switch.tsx`, `components/ui/date-picker.tsx` |
| Page header | `components/layout/PageTitle.tsx`, `components/ui/page-title.tsx` |
| Drill-out / flyout patterns | `components/wfm/Flyout.tsx`, `components/wfm/DrillOutLink.tsx` (reference, not import — these are wfm-scoped) |
| Charts | `components/charts/GraphCard.tsx`, `components/charts/FullSizeChart.tsx` |
| Tenant/agency filtering UX precedent | `components/wfm/HierarchyFilter.tsx`, `components/wfm/RoleSwitcher.tsx` |

Every prompt should start with "Reuse from `components/ui/...` and `components/charts/...` — do not create new primitives unless the task description explicitly authorizes it."

---

## Prompt sequence (12 prompts)

Build order is layered: foundational entities first (Sender Identities, Groups), then content the campaigns *target* (Lists, Topics, Templates), then the campaign flow itself, then the post-send analytics layer. This minimizes cross-prompt rework — every prompt only depends on stuff already built.

### Prompt 1 — Module shell, route, mock data spine

**Goal:** Stand up the Campaigns Email prototype shell so all subsequent screens have a home.

**Paste into prompt:**
- Link to this plan file
- Sidebar file path: `components/layout/Sidebar.tsx` (so Claude wires the nav entry correctly)
- Sandbox pattern reference: `app/sandbox/collapsible-filter/page.tsx`

**Ask:**
> Create `app/sandbox/campaigns-email/layout.tsx` and `app/sandbox/campaigns-email/page.tsx` for the Email Campaigns prototype. The layout should provide a local sub-nav (Campaigns, Templates, Lists, Topics, Senders, Groups, Metrics) using `components/ui/nav-item.tsx`. The page should be a dashboard-style landing summarizing the prototype. Create `app/sandbox/campaigns-email/_mock/` with these typed mock data modules: `senders.ts`, `groups.ts` (orgs + groups + campaigns hierarchy reflecting SSA's ~12 components), `lists.ts`, `topics.ts`, `templates.ts`, `campaigns.ts`, `metrics.ts`, `unsubscribes.ts`. Use realistic SSA-flavored names (Retirement Services, Disability Services, Field Operations, etc.). Each mock module exports both the data and the TS interface. Wire the prototype into the existing `Sidebar.tsx` under Sandbox.

**Acceptance:**
- Sub-nav renders, active state works
- Mock data is typed, shareable, and reflects RBAC structure (every list, topic, template carries a `groupId`)
- No new shared primitives created

---

### Prompt 2 — `SenderIdentityStatus`, `MetricTile`, `ChannelBadge` shared primitives

**Goal:** Pre-build the three small components every following screen will need, so each later prompt is purely composition.

**Ask:**
> Inside `app/sandbox/campaigns-email/_components/`, create three small components (each <100 lines): (a) `SenderIdentityStatus.tsx` — pill with `verified` / `pending` / `failed` / `expired` states, color from `var(--color-success/warning/error)`; (b) `MetricTile.tsx` — extends `components/ui/stats-cards.tsx` with delta + sparkline slot, accepts `format: 'number' | 'percent' | 'currency'`; (c) `ChannelBadge.tsx` — `email | sms | voice` chip wrapping `components/ui/chip.tsx`. Story files alongside each, matching the convention from `components/ui/*.stories.tsx`. No coupling between them.

**Acceptance:** stories render in isolation; total LOC under 300 across all three.

---

### Prompt 3 — Sender Identity Verification Settings page (PRDENG-2873)

**Goal:** Central settings page for verified sender emails. The most foundational entity — campaigns depend on it.

**Paste into prompt:**
- PRDENG-2873 description (copy verbatim from Jira)
- Path to `_mock/senders.ts`, `SenderIdentityStatus.tsx`

**Ask:**
> Build `app/sandbox/campaigns-email/senders/page.tsx`. List view of verified sender identities using `components/ui/table.tsx` with columns: Email, Display Name, Component (Group), Status (`SenderIdentityStatus`), Last Verified, Actions. Add an "Add sender" button that opens a `components/ui/modal.tsx`-based wizard: enter email → mock "verification link sent" success state → can be set to `pending`/`verified` via a dev-only "Simulate verification" action so reviewers can walk both happy and failure paths. Show empty state, loading state, and an error state (verification expired). Reference the existing phone-number-source pattern in copy if you can find it.

**Acceptance:** four states visible (empty, loading, verified-with-rows, expired-error); modal flow walkable end-to-end with mock data.

---

### Prompt 4 — Campaign Groups & Hierarchy page (PRDENG-2875)

**Goal:** The hierarchy that every other entity (list, topic, template, campaign, sender) belongs to. SSA needs an extra level (Account/Component → Campaign Group → Campaign).

**Paste:** PRDENG-2875 description, Figma node link for any group/hierarchy frames, `_mock/groups.ts`.

**Ask:**
> Build `app/sandbox/campaigns-email/groups/page.tsx`. Render the three-level hierarchy (Account/Component → Campaign Group → Campaign) as a left-rail tree + right-pane detail layout. Tree uses recursive list rendering, NOT a heavy tree library. Detail pane shows membership (users, lists, topics, templates rolled up). Surface the open design question as a header-level toggle: "Hierarchy label set" — let reviewers switch between **Component / Group / Campaign** and **Account / Department / Campaign** labels live. Persist the choice in React state only. Use `components/ui/chip.tsx` for member counts. Use `components/wfm/HierarchyFilter.tsx` only as visual reference.

**Acceptance:** tree expand/collapse works; label-set toggle re-renders all labels; member rollups read from mock data correctly.

---

### Prompt 5 — Contact List Management page (PRDENG-2876)

**Goal:** CRUD over recipient lists. Lists are scoped by group and can be email-only / phone-only / both.

**Paste:** PRDENG-2876, `_mock/lists.ts`, `_mock/groups.ts`.

**Ask:**
> Build `app/sandbox/campaigns-email/lists/page.tsx`. DataTable of lists with columns: Name, Group, Channel (`ChannelBadge`), Recipients, Topics, Last Updated, Actions. Filters at top: by Group, by Channel. Each row links to a detail page `app/sandbox/campaigns-email/lists/[id]/page.tsx` showing the list metadata, a sample of recipients (10 rows from mock), and associated topics/campaigns. Include an "Access control" panel showing which roles can view/edit (reflect RBAC — Org Admin / Dept Editor / Dept Read-Only). No upload UI yet — that comes in prompt 6.

**Acceptance:** index → detail navigation works; filters compose correctly; access-control panel reflects the role of the current "viewer" set via a top-bar role switcher (mock-only).

---

### Prompt 6 — Recipient List Upload & Import flow (PRDENG-2869)

**Goal:** The CSV upload wizard used both from "New list" and from "Update existing list".

**Paste:** PRDENG-2869, `_mock/lists.ts`. Note explicitly that mid-campaign update support is **pending Mebin's confirmation** — design for the constrained case (block update if list is in active campaign).

**Ask:**
> Build a multi-step upload wizard component at `app/sandbox/campaigns-email/lists/_components/UploadWizard.tsx` using `components/ui/stepper.tsx` inside `components/ui/modal.tsx`. Steps: (1) Source — Single-column CSV vs. GovDelivery export CSV vs. Rich format (first/last/email); (2) Upload — drag-and-drop with mock file parsing summary (X valid rows, Y duplicates, Z invalid); (3) Channel — email-only / phone-only / both; (4) Mapping — only shown for rich format; (5) Review — show counts + the warning banner if the list is currently used in a sent or in-progress campaign. Wire this wizard into the "New list" CTA on the lists page from prompt 5, and to an "Update list" CTA on the list detail page. The mid-campaign block should use `components/ui/message-box.tsx` variant=warning. Do not break the lists page layout.

**Acceptance:** wizard reaches end-state; constraint message appears for the seeded "in-progress" mock list; final step shows a Toast and adds the list to mock state.

---

### Prompt 7 — Topic & Subscription Management page (PRDENG-2870)

**Goal:** Topics — recurring subscription-based campaign streams. Open question: are explicit topic objects needed, or are topics just labeled lists?

**Paste:** PRDENG-2870, `_mock/topics.ts`, `_mock/lists.ts`.

**Ask:**
> Build `app/sandbox/campaigns-email/topics/page.tsx`. Mirror the lists table pattern: Name, Group, Subscribers (count), Default Template, Open Rate, Last Sent. Detail page at `topics/[id]/page.tsx` shows: topic metrics (use `MetricTile` from prompt 2 — open / click / bounce / unsubscribe), associated lists, default template preview link, recent campaigns under this topic. **Important — surface the open product question:** at the top of the topics index, add a small `components/ui/message-box.tsx` info banner with a toggle "Model topics as: First-class objects | Labeled lists". When set to "Labeled lists", hide the Topics nav entry and instead show topic tags inline on the Lists page (you'll need to conditionally render — make this a clean React context, not URL state).

**Acceptance:** the toggle visibly restructures the IA so reviewers can argue both directions in one walkthrough.

---

### Prompt 8 — Email Template Editor & Versioning (PRDENG-2872)

**Goal:** Template list + per-template editor with versioning. Connect-style variable placeholders.

**Paste:** PRDENG-2872, `_mock/templates.ts`. Note: **Max owes us the canonical variable list** — design with a placeholder set (`{{recipient.firstName}}`, `{{recipient.email}}`, `{{topic.name}}`, `{{campaign.name}}`, `{{unsubscribe.url}}`, `{{sender.displayName}}`) and a "Variable list pending from Connect integration" footnote.

**Ask:**
> Build `app/sandbox/campaigns-email/templates/page.tsx` — index with table of templates (Name, Topic, Latest Version, Status, Last Edited). Build `templates/[id]/page.tsx` — split layout: left = HTML editor (use a plain `<textarea>` with monospace font, NOT a real WYSIWYG — prototype only), right = live preview rendered in an iframe with the mock variables substituted. Top-right actions: Save draft, Publish as new version, Set as default for topic. Version dropdown in the header showing past versions with diff link (diff can be a stub — link to a modal that says "Diff view — coming"). A "Variables" side drawer lists the available placeholders with click-to-insert.

**Acceptance:** typing in the editor updates the preview live; version dropdown shows three mock versions; "Publish as new" creates a v+1 entry in component state.

---

### Prompt 9 — Email Campaign Stepper (PRDENG-2874)

**Goal:** The big one. Extends the existing campaign creation stepper to support email — sender selection, template selection (with refresh), schedule, target lists/topics, review.

**Paste:** PRDENG-2874, Figma stepper screenshot (the Step 1–4 mockups at the top of the Campaigns Figma page), `_mock/senders.ts`, `_mock/templates.ts`, `_mock/lists.ts`, `_mock/topics.ts`.

**Ask:**
> Build `app/sandbox/campaigns-email/campaigns/new/page.tsx`. Use `components/ui/stepper.tsx` with steps: (1) Basics — name, group, channel (`email` pre-selected, locked for this flow), (2) Sender — radio list of verified senders from `_mock/senders.ts` (filter to current group's senders + show count of "unverified hidden"), (3) Audience — choose Topic OR direct List(s), with subscriber count preview, (4) Template — select from templates filtered by topic/group, **with an explicit Refresh button** to re-fetch (mock spinner + toast "Templates refreshed"), inline preview, link to "Edit template" that opens a small modal explaining "Editing templates happens in the Templates module — open in new tab?", (5) Schedule — send now vs. scheduled (use `components/ui/date-picker.tsx`), (6) Review — summary of all choices with edit-step links. Persist draft in component state; on final submit, route to `campaigns/[id]` showing the newly created campaign in `Draft` status. Cancel button always available, with confirm-discard modal if data is dirty.

**Acceptance:** stepper navigates forward and back without data loss; refresh button works; review step shows every selection accurately; created campaign appears in the campaigns list afterward.

---

### Prompt 10 — Campaign Metrics Dashboard + Unsubscribe Tracking (PRDENG-2871)

**Goal:** Post-send view. Two related screens — per-campaign metrics dashboard, and a standalone Unsubscribes page.

**Paste:** PRDENG-2871, `_mock/metrics.ts`, `_mock/unsubscribes.ts`, `components/charts/FullSizeChart.tsx`, `components/charts/GraphCard.tsx`.

**Ask:**
> Build two screens. (A) `app/sandbox/campaigns-email/campaigns/[id]/page.tsx` — campaign full view. Top row of `MetricTile`s: Sent, Delivered, Open Rate, Click Rate, Bounce Rate, Unsubscribes. Beneath: `GraphCard` for opens-over-time, table of recent unsubscribes (last 25). Provide a topic filter (when campaign is part of a recurring topic) that re-aggregates the metric tiles. Decide layout: tiles wrap on narrow viewports rather than horizontal scroll — call this out in a comment. (B) `app/sandbox/campaigns-email/unsubscribes/page.tsx` — table of unsubscribes across all campaigns with columns: Email, Campaign, Topic, Unsubscribe Date, Grace Period (show "in grace — X days left" pill for entries within 14 days). Add a "Download CSV" button that triggers a mock file download (encode mock data into a Blob client-side). Add date-range filter (`components/ui/date-picker.tsx`) and group filter.

**Acceptance:** metric tiles re-aggregate when topic filter changes; CSV download produces a real file; grace-period pill visible for at least 3 seeded rows.

---

### Prompt 11 — Cross-flow wiring + open-questions audit

**Goal:** Make the prototype feel like one product, not eight screens.

**Ask:**
> Audit the prototype end-to-end. Wire these connections: (a) "New campaign" button on the campaigns list / dashboard goes to the stepper; (b) sender list deep-links to the relevant settings page; (c) template "Edit" from inside the campaign stepper opens the templates editor in a new tab with a return-anchor; (d) clicking a metric tile drills into the underlying breakdown (use `components/wfm/DrillOutLink.tsx` pattern, but build a `campaigns-email`-local version — Rule of Three later if it's used elsewhere); (e) the role-switcher in the top bar conditionally hides/disables actions per RBAC (Org Admin: all; Dept Editor: no group CRUD; Dept Read-Only: no create/edit anywhere). Also: create `app/sandbox/campaigns-email/_OPEN_QUESTIONS.md` listing every open product question surfaced as a toggle (hierarchy labels, topic objects vs labeled lists, subscriber portal placement, mid-campaign list updates) with the location in the UI where reviewers can experience each option.

**Acceptance:** clicking through the prototype as each role surfaces different affordances; the open-questions doc is honest about what's still undecided.

---

### Prompt 12 — Empty / error / loading / a11y pass

**Goal:** Cover the states reviewers will inevitably ask about.

**Ask:**
> For every page under `app/sandbox/campaigns-email/`, ensure: (a) an empty state with a clear CTA (use `components/ui/message-box.tsx`), (b) a skeleton loading state (fake a 600ms delay on initial render so reviewers can see it), (c) an error state behind a `?error=1` query param so we can demo it in QA, (d) keyboard navigation works on the stepper, modals, tree, and tables, (e) all interactive elements have accessible names, (f) color contrast meets WCAG AA against the existing design tokens. Do NOT add any new primitives — only fix and reuse. List in the PR description any places where a missing primitive forced you to inline behavior.

**Acceptance:** the prototype is demo-grade — no crashed screens, no dead links, every promise the IA makes is honored at least with a stub.

---

## How to use this plan

- Run prompts in order. Each one is sized for a single Claude Code session (roughly 30–90 minutes of model time, including a build + verify loop).
- Before kicking off prompt 1, decide on the scope assumptions above. If you change "sandbox vs. main route" or "fidelity level", rewrite the prompts before sending them — the dependencies cascade.
- Between prompts, run `pnpm typecheck` and `pnpm build` locally. Carry forward any deprecation warnings from `node_modules/next/dist/docs/` per `AGENTS.md`.
- Each prompt explicitly tells Claude Code **not** to invent new shared primitives. If it does, push back and ask it to move the primitive into `components/campaigns/` (module-scoped) until it earns promotion to `components/ui/` via Rule of Three.
- After prompt 12, update the parent Jira story (PRDENG-2867) and link the merged PR(s) to each sub-task it satisfies.

## What's intentionally NOT in this plan

- **Backend / API integration.** Stays mocked. Sibling backend stories (PRDENG-2792–2803) own that.
- **Domain DNS / SES verification UI** — that's PRDENG-2868, separate from this story.
- **Subscriber self-service portal** — placement is unresolved (per Jira); revisit once team aligns.
- **Voice/SMS surface changes** — out of scope per the SOW; the existing campaign stepper keeps working for those channels.
