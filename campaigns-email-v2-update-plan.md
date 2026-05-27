# Email Campaigns — v2 Figma Alignment Update Plan

**Supersedes:** [`campaigns-email-prototype-plan.md`](./campaigns-email-prototype-plan.md) and [`campaigns-email-meeting-followups.md`](./campaigns-email-meeting-followups.md) (kept for historical context only).

**New Figma file:** [Campaigns - Emails](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7830)

**Standing rules — applied to every prompt:**
- Read [`CLAUDE.md`](./CLAUDE.md) and `/app/guidelines/page.tsx` before writing code. Adhere to KISS / DRY / YAGNI / Single Responsibility. Component cap: ~250–300 lines. Tailwind utilities first, CSS vars from `globals.css` second, no inline styles for static values. Type everything; no implicit `any`. PascalCase for component files, kebab-case for data files, `use-*` for hooks.
- **Reuse before create.** Search `components/ui/*` and `app/sandbox/campaigns-email/_components/*` first. Anything net-new lives in `_components/` until Rule of Three earns promotion.
- **Figma access:** every prompt names a Figma node URL. Claude Code should pull the design via its Figma MCP (`get_design_context` for layout/screenshot, `get_variable_defs` for tokens). If a token doesn't match anything in `globals.css`, propose a mapping — don't inline hex codes.

---

## Context — what's already built and what needs to change

The prototype under `app/sandbox/campaigns-email/` is substantial. Current state (from a quick audit):

**Existing routes** — Campaigns (list/detail/new), Email Templates (list/detail), Senders, Segments (list/detail + UploadWizard), Preferences, Unsubscribers, Metrics, Topics (detail only).

**Existing primitives** — `_components/SenderIdentityStatus`, `_components/MetricTile`, `_components/ChannelBadge` (+ stories), `_context/RoleContext`, `_store/campaigns-store`.

**Current nav (in `layout.tsx`):**
- CAMPAIGNS — Campaigns, Email Templates, Senders
- AUDIENCE — Segments, Preferences, Unsubscribers
- ANALYTICS — Metrics

**Target nav (from new Figma):**
- Dashboard
- Account Management
- Recipient Lists
- Email Templates
- Channels

**Mapping old → new:**

| Existing surface | Disposition |
|---|---|
| `metrics/` + `unsubscribers/` + parts of `topics/` | **Consolidate** into new `dashboard/` |
| `senders/` (+ `AddSenderModal`, `SenderIdentityStatus`) | **Rename** to `channels/` with forward-compat for SMS/WhatsApp etc. |
| `segments/` (+ `UploadWizard`) | **Rename** to `lists/` (Recipient Lists per Figma) |
| `templates/` | **Keep route, restyle to new design** |
| `campaigns/new/` | **Keep route, rebuild to new Create Campaigns flow** |
| `campaigns/` + `campaigns/[id]/` | **Probably deprecated as top-nav** — verify in Figma; campaigns likely surface inside Account Management or Dashboard drill-downs |
| `topics/[id]/` | **Deprecate** unless Account Management explicitly contains topic surfaces |
| `preferences/` (+ `DetailPane`) | **Likely deprecate** — not in new nav |
| `_mock/groups.ts` + (implicit accounts) | **Restructure** into `_mock/accounts.ts` reflecting Account Management's hierarchy |

Every prompt below explicitly tells Claude Code whether to delete, rename, or keep a route — so nothing rots in place.

---

## Prompt sequence (8 prompts)

Order is deliberate: foundation first (nav + mock data), then leaf surfaces with the fewest dependencies (Channels, Recipient Lists), then the bigger restructures (Account Management, Templates, Create Campaigns), and Dashboard last because it pulls aggregates from everything that came before.

---

### Prompt 1 — Nav re-architecture, route triage, mock data reshape

**Goal:** Change the IA before changing the screens, so subsequent prompts have a stable target.

**Tell Claude Code to read first:** `CLAUDE.md`, `/app/guidelines/page.tsx`, `app/sandbox/campaigns-email/layout.tsx`, the contents of `app/sandbox/campaigns-email/_mock/`, and pull the nav design context from [Figma 122:7830](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7830) via its Figma MCP.

**Ask:**

> Update `app/sandbox/campaigns-email/layout.tsx` to replace the existing three-section nav with a single flat list matching the new Figma: **Dashboard, Account Management, Recipient Lists, Email Templates, Channels**. Keep the existing RBAC role-switcher dev affordance. Match icon styles and active states from Figma node 122:7830.
>
> Then triage existing routes — **without deleting any code yet**, just stub each affected route with a top-of-file comment marking it as `DEPRECATED (folded into <new-route>)` or `RENAMED → <new-path>` so subsequent prompts can clean up without surprises. Specifically:
> - `metrics/`, `unsubscribers/`, `topics/` → comment as deprecated, will be absorbed by Dashboard or Account Management.
> - `senders/` → comment as renamed → `channels/`.
> - `segments/` → comment as renamed → `lists/`.
> - `preferences/` → comment as deprecated.
> - `campaigns/`, `campaigns/[id]/`, `campaigns/new/` → leave a TODO referencing the campaigns audit in prompt 6.
>
> Restructure mock data so subsequent prompts have a consistent foundation: rename `_mock/groups.ts` → `_mock/accounts.ts`, where the data model is `Account → CampaignGroup → Campaign` (+ associated lists, templates, channels). Update consumers via grep so nothing breaks at compile time. Keep `_mock/topics.ts` for now — flag for re-evaluation in prompt 5.
>
> **Do not** create new pages yet. Do not modify any existing screen content. The acceptance is: nav renders correctly, `next dev` builds clean, every deprecated route loads with the warning comment visible.

**Acceptance:** new nav matches Figma; project type-checks; deprecated routes still render but carry their forward-pointer comments.

---

### Prompt 2 — Channels (rename + forward-compat)

**Figma:** [122:7851](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7851)

**Tell Claude Code to read first:** `app/sandbox/campaigns-email/senders/page.tsx`, `app/sandbox/campaigns-email/senders/AddSenderModal.tsx`, `_components/SenderIdentityStatus.tsx`, `_components/ChannelBadge.tsx`.

**Ask:**

> Rename `app/sandbox/campaigns-email/senders/` → `channels/`. Update all imports via grep. Rename the page heading from "Senders" to "Channels" and rewrite the page-level copy to make clear this is the central settings surface for **all** sender identities (today: email; future: SMS, WhatsApp). The `ChannelBadge` primitive already supports `email | sms | voice` — extend it to include `whatsapp` so the forward-compat is real, not just rhetorical.
>
> Implement the page to match Figma node 122:7851. Pull design context with `get_design_context`. Use existing primitives: `components/ui/table.tsx`, `components/ui/modal.tsx`, `components/ui/chip.tsx`, `components/ui/message-box.tsx`. Reuse the existing `AddSenderModal` flow — rename to `AddChannelModal` and have its first step ask "Which channel are you adding?" defaulting to email; SMS / WhatsApp options visible but disabled with "Coming soon" tooltips.
>
> Empty / loading / error states required per `CLAUDE.md` rule on Red Flags. Stories file alongside the page if any new sub-component is extracted.
>
> **Do not** touch `_mock/senders.ts` schema beyond renaming the file to `_mock/channels.ts` and adjusting the type name. **Do not** redesign the verification flow logic — only the visual layer.

**Acceptance:** route is `/sandbox/campaigns-email/channels`, table + modal match Figma, SMS/WhatsApp disabled states visible, `ChannelBadge` covers four channels.

---

### Prompt 3 — Recipient Lists

**Figma:** [122:7849](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7849)

**Tell Claude Code to read first:** `app/sandbox/campaigns-email/segments/page.tsx`, `app/sandbox/campaigns-email/segments/[id]/page.tsx`, `app/sandbox/campaigns-email/segments/_components/UploadWizard.tsx`, `_mock/lists.ts`.

**Ask:**

> Rename `app/sandbox/campaigns-email/segments/` → `lists/`. Update all imports via grep. Rename the entity term from "Segment" to "Recipient List" everywhere — page heading, table columns, button copy, mock data. The route becomes `/sandbox/campaigns-email/lists` with detail at `lists/[id]`.
>
> Match Figma node 122:7849. Use `components/ui/table.tsx` with the column set the design specifies (audit it against Figma — don't assume). The "Associated with Campaign Groups" column is required because lists are CG-scoped per the meeting decision; surface count + drill-out.
>
> **Audit the existing `UploadWizard.tsx`** — the meeting decision was *single scrollable form, not a stepper* (mirroring Amazon Connect's import). If the current implementation is still a stepper, refactor to a single scrollable modal: Name → Drag-drop upload zone → Auto-inferred column mapping table → Preview (first 5 rows) → Import action. Three chip styles for system-attribute / custom-attribute / ignored columns. Hard-block import if no email/phone column is mapped. Show "X of 100 attributes" warning approaching the cap.
>
> Wire the upload modal into both "New list" and "Update list" CTAs. **Do not** add single-record entry — confirmed out of phase 1 in the meeting.

**Acceptance:** route is `/lists`, upload is a single-page form not a stepper, mapping UI distinguishes the three column states, mid-campaign update warning appears on the seeded "in-progress" mock list.

---

### Prompt 4 — Email Templates

**Figma:** [122:7850](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7850)

**Tell Claude Code to read first:** `app/sandbox/campaigns-email/templates/page.tsx`, `app/sandbox/campaigns-email/templates/[id]/page.tsx`, `_mock/templates.ts`.

**Ask:**

> Restyle `app/sandbox/campaigns-email/templates/page.tsx` and `templates/[id]/page.tsx` to match Figma node 122:7850. The route stays at `/templates`. Templates remain a top-level entity (per meeting decision — they can be referenced by topics but they don't live under them).
>
> Use existing primitives only. The detail page split-pane (editor + preview) is already built — verify it still matches the new Figma, particularly the version dropdown, the variables side drawer, and the action row (Save draft / Publish as new version / Set as default for topic). If the new design changes any of these, update; if not, only restyle.
>
> **Mock variables** — keep the placeholder set (`{{recipient.firstName}}`, etc.) and the "Variable list pending from Connect integration" footnote. **Do not** wire up a real WYSIWYG; textarea-with-live-preview is the prototype contract.
>
> **RBAC fix from the meeting:** read-only roles must show **view only** for templates, not "view and use". Update `_context/RoleContext.tsx` if needed.

**Acceptance:** templates index + detail visually match Figma, version dropdown / variables drawer / actions intact, read-only role hides Save and Publish buttons.

---

### Prompt 5 — Account Management

**Figma:** [122:7848](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7848)

**Tell Claude Code to read first:** `_mock/accounts.ts` (renamed in prompt 1), `_context/RoleContext.tsx`, current `_mock/topics.ts` and any existing references to "groups" or "topics" routes.

**This is the biggest restructure.** The Account Management surface absorbs the old "accounts + campaign groups" split AND likely the topic configuration concept. Treat it as the central admin hub.

**Ask:**

> Build `app/sandbox/campaigns-email/account-management/page.tsx` (and any sub-routes the Figma implies — check `get_metadata` for child frames before deciding) to match Figma node 122:7848. Implement the hierarchy: **Account → Campaign Group → (Topics? — confirm in Figma)** with RBAC visibility per role, cross-agency segmentation, and the "customizable labels per customer" affordance (i.e., the labels for hierarchy levels can be renamed by an org admin — but for the prototype, just seed two label sets and expose a "label set: SSA | Generic" toggle).
>
> The "collections / folders" model from the SOW means a campaign group can host nested folders for organization — only build this if the Figma shows it; otherwise skip and note in code with `// TODO: collections — confirm Figma intent`.
>
> **Topics decision:** check Figma 122:7848 for topic surfaces. If topics appear inside Account Management → Campaign Group, port the existing `topics/[id]/page.tsx` content into a sub-route here and delete the old `topics/` folder. If topics are gone entirely, delete `topics/` and `_mock/topics.ts` after grep confirms no remaining references.
>
> **RBAC matrix:** every UI affordance must be gated on `useRole()`. Super admin sees all accounts; account admin sees a single account; editor sees only their assigned campaign groups; viewer sees but cannot edit. If the user is single-account, hide the account switcher entirely.
>
> Reuse: `components/ui/table.tsx`, `components/ui/tabs.tsx`, `components/ui/modal.tsx`, `components/ui/chip.tsx`, `components/wfm/HierarchyFilter.tsx` only as visual reference (do not import — it's wfm-scoped).
>
> **Do not** rebuild the role-switcher; it already exists in `layout.tsx`.

**Acceptance:** hierarchy renders for each role correctly; account/group/topic CRUD modals open and persist to mock state; label-set toggle re-renders the level labels; deprecated `topics/` route either ported or removed.

---

### Prompt 6 — Create Campaigns flow

**Figma:** [122:7852](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7852)

**Tell Claude Code to read first:** `app/sandbox/campaigns-email/campaigns/new/page.tsx`, `app/sandbox/campaigns-email/campaigns/page.tsx`, `app/sandbox/campaigns-email/campaigns/[id]/page.tsx`, `_store/campaigns-store.ts`, `_mock/campaigns.ts`.

**Ask:**

> Rebuild `app/sandbox/campaigns-email/campaigns/new/page.tsx` to match Figma node 122:7852. Pull the design context first to determine the exact step structure — the meeting outcome was that email campaigns started from a topic are simple (Name + Schedule, inheriting everything else), but the new Figma may show a different decision. **Verify Figma before assuming**, and if the design contradicts the meeting outcome, flag it in your response rather than silently picking one.
>
> Decide entry points:
> - If the Figma shows a top-level "New campaign" CTA, route from there.
> - If the design surfaces "Start campaign" inside Account Management or Dashboard drill-downs, wire those entry points instead.
> Document the entry points you wired in a comment at the top of `campaigns/new/page.tsx`.
>
> **Audit the existing campaign list and detail routes.** If the new design implies `campaigns/` and `campaigns/[id]/` should not exist as top-nav and only live as drill-down children of Account Management or Dashboard, move them and update links. If they're still needed standalone, keep but restyle to match Figma.
>
> Use `components/ui/stepper.tsx`, `components/ui/date-picker.tsx`, `components/ui/select.tsx`, `components/ui/modal.tsx` for the discard-confirm. Persist draft in `_store/campaigns-store.ts`.
>
> **Do not** invent new shared primitives. **Do not** wire up real submission — final step shows a toast and adds the campaign to mock state.

**Acceptance:** flow matches Figma; entry points documented in code; existing campaign list/detail routes either restyled in place or moved with all links updated; type-check passes.

---

### Prompt 7 — Dashboard

**Figma:** [122:7847](https://www.figma.com/design/LFuZW4gDl7e434AA2FGcLA/Campaigns---Emails?node-id=122-7847)

**Tell Claude Code to read first:** existing `app/sandbox/campaigns-email/page.tsx`, `metrics/page.tsx`, `unsubscribers/page.tsx`, `_components/MetricTile.tsx`, `_mock/metrics.ts`, `_mock/unsubscribes.ts`.

**Ask:**

> Replace `app/sandbox/campaigns-email/page.tsx` with the Dashboard implementation matching Figma node 122:7847. The Dashboard is the new landing surface and absorbs the old `metrics/` and (partially) `unsubscribers/` pages.
>
> Use `MetricTile` for KPI cards and `components/charts/GraphCard.tsx` / `components/charts/FullSizeChart.tsx` for trend visualizations. Mock data sources: `_mock/metrics.ts`, `_mock/campaigns.ts`, `_mock/unsubscribes.ts`. Account-scope the metrics per the meeting decision (phase 1 is account-level rollup).
>
> Wire account-scoped filters at the top of the page. Drill-out links from each metric tile go to the relevant detail screen (`channels`, `lists`, `templates`, `campaigns/[id]`, `account-management`).
>
> **Once the Dashboard is built, delete the old `metrics/`, `unsubscribers/`, `preferences/`, and `topics/` directories** if Account Management absorbed them in prompt 5. Grep for stale links. Update any lingering nav references.
>
> **Do not** invent new chart components — use what's in `components/charts/`. If a chart type genuinely isn't available, stop and report rather than building one inline.

**Acceptance:** Dashboard matches Figma, KPI tiles drill into the right surfaces, deprecated routes removed, no dead links anywhere in the prototype.

---

### Prompt 8 — Polish: cross-flow wiring, a11y, empty/error/loading states, cleanup

**Goal:** Make the prototype demo-grade.

**Ask:**

> Audit every page under `app/sandbox/campaigns-email/`. For each:
> 1. Verify the empty / loading / error states exist and look intentional (use `components/ui/message-box.tsx` and the existing skeleton patterns). Fake a 600ms initial render delay to make loading visible.
> 2. Add a `?error=1` query param escape hatch on each page that flips it into the error state, for demo purposes.
> 3. Keyboard navigation works on modals, tables, stepper, hierarchy tree. All interactive elements have accessible names. Color contrast against `globals.css` tokens meets WCAG AA.
> 4. Wire the cross-flow links: Dashboard tile → relevant module; Channels detail → "used by" campaigns; Recipient List detail → associated campaign groups; Template detail → "used by" topics/campaigns; Account Management drill-downs all working.
> 5. Verify RBAC role-switcher behavior is consistent across every screen.
> 6. Grep for any remaining `senders`, `segments`, `topics`, `metrics`, `unsubscribers`, or `preferences` strings in routes, imports, or copy — fix or justify each one in the PR description.
>
> Update `_OPEN_QUESTIONS.md` to reflect what's still genuinely unresolved (subscriber portal placement, unsubscribe detailed design, template ↔ default-topic relationship cardinality, account-switching UX dropdown vs page).
>
> **Do not** introduce new primitives. **Do not** redesign anything — this is polish, not iteration.

**Acceptance:** demo walkthrough as each role works without dead links, broken states, or stale terminology; type-check and build pass clean.

---

## How to use this plan

- Run prompts in order. Each is sized for one Claude Code session.
- Between prompts: `pnpm typecheck` and `pnpm build`. Heed deprecation notices from `node_modules/next/dist/docs/` per `AGENTS.md`.
- After each prompt, ask Claude Code to summarize the diff and any decisions it made where the Figma was ambiguous — capture those in `_OPEN_QUESTIONS.md` so they don't get lost.
- Every prompt template above already says "do not invent shared primitives" — if Claude Code adds one anyway, push back: it goes in `_components/` until Rule of Three earns promotion to `components/ui/`.

## What's intentionally NOT in this plan

- **Backend / API.** Stays mocked.
- **Unsubscribe handling detailed design** — explicitly deferred from the meeting; the Dashboard surfaces aggregates only.
- **Subscriber self-service portal** — still unresolved.
- **Account-switching UX** between dropdown and dedicated page — Prompt 5 instructs Claude Code to follow whatever the Figma shows. If Figma is silent, default to top-bar dropdown and flag in `_OPEN_QUESTIONS.md`.

## Risk notes

- **Topics absorption is the riskiest call.** If the new Figma doesn't actually contain topic surfaces inside Account Management, prompt 5 will need a follow-up to decide where topics live (or whether they survive at all). Verify in Figma before sending prompt 5.
- **Existing `campaigns/` routes** may still need to exist as a list page even if not in top-nav (e.g., reached from Account Management → Campaign Group → Campaigns). Prompt 6 explicitly asks Claude Code to check.
- **The `_store/campaigns-store.ts` and `_context/RoleContext.tsx`** are load-bearing. Subsequent prompts must not refactor them carelessly — flag this in prompt 1 by adding a `// LOAD-BEARING — refactors require explicit approval` comment.
