# Email Campaigns Prototype — Follow-up Prompts

Three prompts to close the gaps surfaced in the review of the current code state. Run in order — A is a quick fix that unblocks the dashboard, B is a 2-minute doc reconciliation, C is the bigger RBAC audit pass that earns the prototype "review-ready" status.

---

## Prompt A — Fix stale dashboard links after nav restructure

**Goal:** Bring the dashboard's "Prototype Sections" grid back in sync with `layout.tsx` after the Groups→Preferences, Lists→Segments, Unsubscribes→Unsubscribers rename, and remove the dead `/topics` index link.

**Context to paste:**
- Files: `app/sandbox/campaigns-email/page.tsx`, `app/sandbox/campaigns-email/layout.tsx`
- Reference: the `NAV_SECTIONS` array in `layout.tsx` (lines ~31–54) is the source of truth for which sub-routes exist
- Reference: `app/sandbox/campaigns-email/PLAN-nav-restructure-preferences.md` for the rationale behind the renames

**Ask:**
> The dashboard at `app/sandbox/campaigns-email/page.tsx` has three broken links and is out of date with the `NAV_SECTIONS` defined in `layout.tsx`. Reconcile the dashboard's `SECTIONS` array so it mirrors the nav structure exactly:
>
> 1. **Replace** `Lists → /sandbox/campaigns-email/lists` with `Segments → /sandbox/campaigns-email/segments` (icon stays `UsersThreeIcon`, description: "Segmented recipient lists scoped to a campaign group").
> 2. **Replace** `Groups → /sandbox/campaigns-email/groups` with `Preferences → /sandbox/campaigns-email/preferences` (icon `SlidersIcon` from `@phosphor-icons/react`, description: "Organization structure and topic preferences per campaign group").
> 3. **Remove** the `Topics` entry entirely — there is no `/topics` index page anymore, only `/topics/[id]/`. Topics are now accessed via the Preferences page.
> 4. **Add** an `Unsubscribers` entry → `/sandbox/campaigns-email/unsubscribers` (icon `UserMinusIcon`, count = number of mock unsubscribes, description: "Opt-out tracking with grace-period and CSV export").
> 5. Update the **count** on the Segments entry to read from `_mock/lists.ts` (`LISTS.length`) — the mock file kept its original name even though the user-facing concept is now "Segments". Don't rename the import.
> 6. Update the **Preferences** count to be the number of campaign groups (`CAMPAIGN_GROUPS.length` from `_mock/groups.ts`), not a hardcoded `24`.
>
> Do not change any other part of the dashboard. Do not rename any mock-data files. After the change, every `href` in the `SECTIONS` array must resolve to an existing route, and the visible labels must match the sub-nav labels.
>
> Verify by running `pnpm typecheck` and opening the dashboard — clicking every section card should land on a real page, not 404.

**Acceptance:**
- All six cards resolve to live routes
- Section labels match `layout.tsx` exactly: Campaigns, Templates, Senders, Segments, Preferences, Unsubscribers, Metrics
- Counts come from mock data, not hardcoded numbers
- No new imports beyond what's needed for the new icons

---

## Prompt B — Reconcile `_OPEN_QUESTIONS.md` Q4 with current code

**Goal:** The doc describes a toggle that no longer exists in code. Bring the doc back in sync and record the decision rationale so it doesn't get rediscovered in three months.

**Context to paste:**
- File: `app/sandbox/campaigns-email/_OPEN_QUESTIONS.md`
- File: `app/sandbox/campaigns-email/layout.tsx` (to confirm `TopicModelContext` is gone)
- File: `app/sandbox/campaigns-email/PLAN-nav-restructure-preferences.md` (step 9 documents the deletion)

**Ask:**
> `_OPEN_QUESTIONS.md` Q4 ("Topic model vs. labeled-lists: what's the migration path?") still describes a `TopicModelContext` toggle in the layout. That context was deleted in the nav restructure (see `PLAN-nav-restructure-preferences.md` step 7 and step 9), and the code now implicitly commits to first-class topic objects accessed via the Preferences page. The doc and the code disagree.
>
> Update `_OPEN_QUESTIONS.md` to reflect reality:
>
> 1. **Move Q4 out of the "Audience & Targeting" Open Questions section.** Add a new section at the top titled `## Resolved (pending product ratification)`. Place the updated Q4 there.
> 2. **Rewrite the Q4 body** to:
>    - State the resolution: "Implemented as first-class topic objects. The `TopicModelContext` toggle was removed in the nav restructure (2026-05-12). Topics are reachable via the Preferences page tree and `/topics/[id]/` detail routes; no top-level Topics index exists."
>    - List the implications still owed to product: "Needs ratification by J.C. Paz (PM) before engineering handoff. If product reverses this, we'll need to: (a) restore `_context/TopicModelContext.tsx`, (b) re-add the labeled-lists branch in the Segments topic-column rendering, and (c) restore the `/topics/page.tsx` index."
>    - Add an "**Owner:**" line — leave it as `J.C. Paz — needs ratification`.
> 3. **Renumber the remaining questions in Audience & Targeting** so they read Q4, Q5 instead of Q5, Q6 (originally Q5 and Q6 stay; the old Q4 is now moved). Update cross-references if any exist (search the doc for "Q4" / "Q5" / "Q6").
> 4. **Add a one-line note** at the top of the doc above the existing intro: `_Last reconciled with code: 2026-05-13._`
>
> Also do a quick sanity grep across `app/sandbox/campaigns-email/` for any orphan references: `grep -r "TopicModelContext\|useTopicModel\|TopicModelProvider" app/sandbox/campaigns-email`. Report any hits in the PR description.

**Acceptance:**
- Q4 is in a "Resolved (pending ratification)" section with rationale
- Audience & Targeting questions are renumbered cleanly
- Reconciliation date stamp added
- No orphan code references to the deleted context

---

## Prompt C — RBAC affordance audit across all surfaces

**Goal:** The `RoleContext` switcher exists in the sidebar but I have not verified that every CTA on every screen reflects the active role. This is the gate between "click-through" and "demo-ready for a stakeholder review." From the original plan, this is Prompt 11.

**Context to paste:**
- File: `app/sandbox/campaigns-email/_context/RoleContext.tsx` (defines `Org Admin`, `Dept Editor`, `Dept Read-Only` — confirm the IDs)
- Files to audit (everywhere a button, link, or form action appears):
  - `app/sandbox/campaigns-email/page.tsx` (dashboard — "New campaign" CTA)
  - `app/sandbox/campaigns-email/campaigns/page.tsx`
  - `app/sandbox/campaigns-email/campaigns/[id]/page.tsx`
  - `app/sandbox/campaigns-email/campaigns/new/page.tsx`
  - `app/sandbox/campaigns-email/templates/page.tsx`
  - `app/sandbox/campaigns-email/templates/[id]/page.tsx`
  - `app/sandbox/campaigns-email/senders/page.tsx` + `senders/AddSenderModal.tsx`
  - `app/sandbox/campaigns-email/segments/page.tsx` + `segments/[id]/page.tsx` + `segments/_components/UploadWizard.tsx`
  - `app/sandbox/campaigns-email/preferences/page.tsx` + `preferences/DetailPane.tsx`
  - `app/sandbox/campaigns-email/topics/[id]/page.tsx`
  - `app/sandbox/campaigns-email/metrics/page.tsx`
  - `app/sandbox/campaigns-email/unsubscribers/page.tsx`

**Role matrix to enforce** (from the SOW — RBAC required with component-level isolation):

| Capability | Org Admin | Dept Editor | Dept Read-Only |
|---|---|---|---|
| Create / edit / delete campaigns | ✓ | ✓ (own group only) | — |
| Send / schedule campaign | ✓ | ✓ (own group) | — |
| Create / edit / version templates | ✓ | ✓ (own group) | — |
| Add / verify / delete senders | ✓ | — | — |
| Create / edit / delete segments | ✓ | ✓ (own group) | — |
| Upload list CSV | ✓ | ✓ (own group) | — |
| Manage preferences (group structure) | ✓ | — | — |
| View metrics & unsubscribers | ✓ | ✓ (own group) | ✓ (own group, no PII export) |
| Export unsubscribers CSV | ✓ | ✓ (masked beyond own group) | — |
| Switch role (dev tool) | always available | always available | always available |

For this audit, treat "own group" affordances as **enabled for both Org Admin and Dept Editor** in the prototype — we don't need per-group mock scoping yet, just the right action shape per role.

**Ask:**
> Run an RBAC audit across every page under `app/sandbox/campaigns-email/`. For each surface listed above:
>
> 1. **Identify every interactive element** — buttons, link-as-button CTAs, table row actions, form submit buttons, modal triggers, CSV download buttons, edit/delete kebabs.
> 2. **Gate it against the role matrix above.** The current role is available via `useRole()` from `_context/RoleContext.tsx`. For each action that doesn't match the matrix for the current role:
>    - **If the action should be hidden:** wrap the element in a `role === ...` check.
>    - **If the action should be disabled with a tooltip:** add `disabled` + a `title` attribute explaining why ("Read-only role can't send campaigns"). Use the existing `components/ui/tooltip.tsx` if available — do not create a new one.
>    - **Prefer disable-with-explanation over hide** for primary CTAs so reviewers can see *what* is gated, not just *that* something is missing.
> 3. **Add a small role indicator** to the page header of every surface (a `components/ui/chip.tsx` reading "Read-only" or "Editor — Group X" when role ≠ Org Admin) so a stakeholder walking through can see the role context without checking the sidebar.
> 4. **Special cases:**
>    - Unsubscribers CSV export: Dept Read-Only sees the button but it produces a CSV with email column replaced by `***@***.***` (mock PII masking — note this in a `title` attr).
>    - Sender add/verify: only Org Admin sees the "Add sender" button; Dept Editor and Dept Read-Only see the table only.
>    - Preferences page: tree is read-only for everyone except Org Admin; Dept Editor sees the tree but no edit affordances; Dept Read-Only sees the tree but the detail pane shows membership only (no edit links).
> 5. **Document gaps.** If any page has an action that doesn't map cleanly to the matrix, list it in a new `RBAC-AUDIT.md` at the prototype root with: surface, action, current behavior, expected behavior, and a "needs product input" flag if appropriate. Don't silently invent rules.
>
> **Do not modify** the `RoleContext` itself, the mock data, or any shared `components/ui/*` primitive. This is purely a per-page wiring pass.
>
> Verify by switching to each role in the sidebar role switcher and clicking through the full app — Dept Read-Only should never expose a destructive or state-changing action.

**Acceptance:**
- Every interactive element on every surface is gated correctly per the matrix
- Role indicator chip visible in page headers for non-admin roles
- `RBAC-AUDIT.md` lists any case that needed a judgment call
- Stakeholder can walk the prototype as Read-Only and never find a way to break things
- `pnpm typecheck` passes; no new shared primitives added

---

## After these three

You'll be at the original plan's Prompt 12 — empty / loading / error / a11y pass — which is the final step before this prototype is genuinely review-ready. If you want, ask me to lift Prompt 12 from the original plan and re-tune it to the renamed routes (Segments / Preferences / Unsubscribers) before you send it.
