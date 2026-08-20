# Execution Plan — Assign to Worker Prototype (Option 1 pattern)

**Working branch:** `claude/assign-worker-flow-prototype-rb4ms4` (restarted from `origin/main` — previous PR #7 merged)
**Working dir:** `.workflow/assign-to-worker/`
**Status:** DRAFT v2 — awaiting go-ahead before Step 1 fires.

---

## 0. TL;DR

Three skills run sequentially, with a human checkpoint between each. Each skill's raw output is saved verbatim into this folder. The final deliverable is a working Next.js route at `app/open-inventory/task-queue-visibility-v2/` implementing the numbered-stacked-steps Option 1 pattern (all three tables always visible; steps ②/③ dimmed until upstream fills; sticky FOOTER with running summary + Assign CTA).

**Critical context discovered this pass:** v1 already exists at `app/open-inventory/task-queue-visibility/assign/` and is *itself* a redesign of the old Figma screen — a "Guided Assignment Builder" using a single-focus / one-table-at-a-time swap pattern with slots + Assign anchored in the *header*. v2 is therefore a **third** interaction model, not "the redesign" — it's an alternative to both the old Figma screen AND v1. Plenty of v1's plumbing (types, mocks, reducer, hook, table components) is directly reusable.

```
Step 1 ──► PRD.md ──[PAUSE 1: approve PRD]──► Step 2 ──► SPEC.md ──[PAUSE 2: approve SPEC]──► Step 3 ──► route + reuses + README
```

---

## 1. Working directory structure

```
.workflow/assign-to-worker/
  PLAN.md                     ← this file
  PRD.md                      ← Step 1 output (verbatim)
  SPEC.md                     ← Step 2 output (verbatim)
```

Prototype source lives under `app/open-inventory/task-queue-visibility-v2/` and reuses `components/open-inventory/task-queue-visibility/*` + `app/open-inventory/task-queue-visibility/assign/_data.ts` where possible (see §3).

---

## 2. Route path decision

**Route:** `app/open-inventory/task-queue-visibility-v2/page.tsx` (user-directed).

**Sidebar registration** (see `components/layout/Sidebar.tsx:146` for the `Open Inventory` group). Current v1 entry lives at line 153:
```ts
{ label: 'Task Queue Visibility', href: '/open-inventory/task-queue-visibility/assign', status: 'wip' },
```

v2 will be added *alongside* v1 (my default — flag if you want v2 to replace v1 in the sidebar):
```ts
{ label: 'Task Queue Visibility (v2)', href: '/open-inventory/task-queue-visibility-v2', status: 'wip' },
```

**URL when running:** `localhost:3400/open-inventory/task-queue-visibility-v2`

---

## 3. Codebase-exploration findings — the ones that reshape this plan

### 3.1 v1 already exists and is already a redesign

`app/open-inventory/task-queue-visibility/assign/`:
```
_data.ts                        (237 lines — full mock domain + isEligible())
assignment-builder-reducer.ts   (110 lines — pure state machine)
use-assignment-builder.ts       (51 lines — hook wrapper)
page.tsx                        (141 lines — swap-pattern shell)
```

**v1's interaction model (from `page.tsx` and the header comment block):**
- Persistent header with three numbered slots (① Queue → ② Task → ③ Worker) + Assign button.
- Only ONE table shown at a time — Queues OR Tasks OR Workers, driven by `state.activeStep`.
- Picking Queue advances to Task; picking Task auto-advances to Worker after 150ms; picking Worker just enables Assign.
- Assign resets Task/Worker; preserves Queue; shows inline success strip.
- Backtrack warning on editing filled slot with downstream picks.

**v2's interaction model (the brief):**
- All three tables **always visible, stacked vertically**.
- Steps ②/③ **dimmed & non-interactive** until upstream selection exists.
- Assign CTA + running summary anchor in a **sticky FOOTER**, not the header.
- No auto-advance — picking Task enables (but doesn't fire) step ③.
- Same six states + three empty states.

The state machine (Queue → Task → Worker + backtrack + assign) is **identical** — only presentation differs.

### 3.2 What v2 can reuse directly (no fork, no duplication)

Everything below is under `components/open-inventory/task-queue-visibility/`:

| File | Purpose | v2 reuse verdict |
|---|---|---|
| `QueueTable.tsx` | Queue rows with priority filter | **Reuse as-is** — accepts `selectedQueueId`, `onSelect` |
| `TaskTable.tsx` | Task rows with status filter | **Reuse as-is** |
| `WorkerTable.tsx` | Worker rows with status filter + eligible-only toggle | **Reuse as-is** |
| `FilterRail.tsx` | Left rail whose facets swap by active step | **Adapt or fork** — v1 shows facets for one step at a time; v2 filter rail per locked decision #4 applies to *all three* tables. Likely fork to a `FilterRailV2.tsx` that shows all three facet groups stacked, or extend the current one with a `mode: 'single' \| 'all'` prop. SPEC decides. |
| `TableSectionHeader.tsx` | "{Title} ({count})" + search + chip strip | **Reuse as-is** — this IS the "reusable section-header/slot component" the brief asks for; already used per-step, exactly what v2 needs three of |
| `BuilderSlot.tsx` | Numbered slot bullet + label + edit affordance | **Do NOT reuse in the header** (v2 removes header slots), **but reuse inside the sticky footer** as the summary chips ("Queue: X · Task: Y · Worker: Z"); it exposes `variant: 'empty' \| 'active' \| 'filled' \| 'disabled'` which is exactly the v2 vocabulary |
| `StatusDot.tsx` | Colored status pill | **Reuse as-is** |
| `DailyAssignmentsPopover.tsx` | Daily counter popover for PageTitle actions slot | **Reuse as-is** — this is the "12 assigned today" counter from locked decision #3 |
| `AssignmentBuilderHeader.tsx` | v1's header (slots + Assign + confirm/cancel flows) | **Do not reuse** — v2 splits its concerns into stacked section headers + sticky footer |

### 3.3 Domain types + mock data — reuse `_data.ts` from v1

`app/open-inventory/task-queue-visibility/assign/_data.ts` already contains:
- `Queue`, `Task`, `Worker`, `AssignmentLogEntry` types.
- `Priority`, `TaskStatus`, `WorkerStatus` enums.
- Seeded `QUEUES`, `TASKS`, `WORKERS` datasets.
- `tasksForQueue(queueId)`, `isEligible(worker, queueName)`, plus `PRIORITY_COLOR`, `TASK_STATUS_CHIP`, `WORKER_STATUS_COLOR` maps.

**Recommendation:** import from `../task-queue-visibility/assign/_data` — no duplication.

If you'd rather have v2's data live under `mocks/open-inventory/` (matching your earlier direction), we can either:
- **Option A** (my preferred): leave `_data.ts` where it is; v2 imports from it. Rationale: it's tightly coupled to the components (`QueueTable` et al.) that already live in `components/open-inventory/...` and both currently coexist there.
- **Option B**: move `_data.ts` → `mocks/open-inventory/task-queue-visibility/data.ts` and update v1 + v2 to both import from the new location. This is a one-commit move + import fix but touches v1.

Question in §6 — please pick.

### 3.4 Reducer + hook reuse

`assignment-builder-reducer.ts` (110 lines, pure) and `use-assignment-builder.ts` (51 lines) implement:
- Action types for select/edit/assign/confirm-pending/cancel-pending/dismiss-confirmation.
- Auto-advance from Task → Worker (v2 doesn't want this).
- Assign → reset Task/Worker, preserve Queue, log entry.

**Two differences v2 needs from v1's reducer:**
1. **No auto-advance** on Task select. v1 has the 150ms delay + `confirmPending` flow — v2 doesn't need it.
2. **No `activeStep`** field driving which single table renders. v2 shows all three, so it doesn't need `activeStep` for presentation — but it might still need it for keyboard-focus targeting when a step becomes newly enabled.

**Recommendation:** SPEC evaluates whether to (a) fork a `assignment-builder-v2-reducer.ts` next to it (safer, non-breaking for v1) or (b) parameterize the existing reducer to disable auto-advance. Preferred = **fork** — the reducers are small and diverging risks are non-trivial. This is a §6 question.

### 3.5 Sidebar registration

`components/layout/Sidebar.tsx:146-154` — `Open Inventory` group. v2 insert goes at line ~154 (alongside v1's line 153). Mandatory SPEC line item.

### 3.6 Stack recap (unchanged from previous pass)

- Next.js 16.2.2 App Router, React 19, TypeScript strict.
- Tailwind v4 with `@theme inline` in `app/globals.css`.
- Icons: `@phosphor-icons/react` exclusively.
- Animation: framer-motion v12.
- No global store, no data-fetching library, no auth.
- Full DS component library at `components/ui/*` — `PageTitle`, `Switch`, `Button`, `Modal`, `MessageBox`, `Chip`, `Tooltip`, `Table`, etc.

### 3.7 New v2-specific work (what the SPEC will design)

- `page.tsx` — layout with `PageTitle` + `<FilterRail>` + `<StackedStepSection>` × 3 + `<StickyActionBar>` + backtrack `<Modal>` + post-assign `<MessageBox>` success strip.
- `StackedStepSection.tsx` — wraps a step's `TableSectionHeader` + table, applies `data-disabled` / `aria-disabled` when dimmed, handles focus targeting when newly enabled.
- `StickyActionBar.tsx` — running summary using reused `BuilderSlot` chips + primary Assign `<Button>`; `sticky bottom-0` container; `Cmd/Ctrl+Enter` shortcut binding.
- `use-assignment-builder-v2.ts` + `assignment-builder-v2-reducer.ts` — forked from v1, auto-advance removed.
- `FilterRail` treatment — SPEC picks: extend v1's or fork `FilterRailV2.tsx` that shows all three facet groups stacked.
- Sidebar edit.

**Gaps to flag inline (per Step 3 brief):**
1. No DS Radio primitive — compose with `role="radio"` in table cells (v1 already handles this — verify pattern in `TaskTable.tsx` / `WorkerTable.tsx`).
2. No DS StickyBar — inline `sticky bottom-0` div.

---

## 4. The three-step workflow

### Step 1 — `/ux-research-specialist`

**Skill outcome:** structured PRD.

**Inputs handed in:**
- The user's brief (verbatim), including the seven locked decisions.
- Figma reference: `https://www.figma.com/design/54ARm4erwwo8sI5rp2MQAq/WFM?node-id=519-85755` — **treated as the OLD design that v1 already replaced with a different pattern**; v2 targets Option 1 stacked-visible.
- Design System reference: `https://www.figma.com/design/exoHhvasbJSziVGakV8Y0r/CxPortal-%7C-Design-System?node-id=69-1456`.
- Codebase context (§3 above) — including that v1 exists as a different alternative pattern, so the PRD does NOT re-describe v1 as "the old screen" and does compare/contrast where relevant.
- **Constraint envelope:** the seven locked decisions are constraints, not open questions. If the skill wants to re-open one, it stops and surfaces the conflict at Checkpoint 1.

**What the PRD must cover:**
- User story variants (queue-first vs worker-first entry) and whether Option 1 supports both.
- Edge cases: backtrack invalidation, empty states, filter interactions across all three simultaneously visible tables.
- Success metrics.
- Accessibility requirements (WCAG AA, `aria-disabled` semantics on dimmed sections, focus management when a step becomes newly enabled, keyboard flow across dimmed regions).
- Keyboard flow across the three stacked slots + sticky bar.
- **Sticky footer summary string format** (exact microcopy).
- **Slot/section dimmed-state anatomy** (visual + a11y).
- **Empty-state copy** for: no matching queues, no open tasks in queue, no eligible workers.
- **Explicit comparison note** to v1's swap pattern where user-flow implications differ (skimmability, scroll cost, cognitive load).

**Expected output:** `PRD.md` in `.workflow/assign-to-worker/PRD.md` — saved verbatim.

**🛑 Checkpoint 1 — pause and present the PRD.**
Present: path to PRD file, clarifying questions the skill raised, locked-decision conflicts (if any). Nothing else.

---

### Step 2 — `/b2b-saas-product-spec-writer`

**Skill outcome:** file-by-file SPEC.

**Inputs handed in:**
- `PRD.md` from Step 1.
- Codebase reality (§3).
- The route path decision from §2.
- **Constraint envelope:**
  - Route: `app/open-inventory/task-queue-visibility-v2/page.tsx`.
  - Reuse the reusable pieces from §3.2 (`QueueTable`, `TaskTable`, `WorkerTable`, `TableSectionHeader`, `StatusDot`, `DailyAssignmentsPopover`, `BuilderSlot`). No forking of these.
  - Domain types + mock data: **reuse `_data.ts` from v1** (Option A in §3.3) unless the human picks Option B at Checkpoint 1.
  - Reducer + hook: **fork** to `assignment-builder-v2-reducer.ts` + `use-assignment-builder-v2.ts` (drop auto-advance) unless the human picks parameterize at Checkpoint 1.
  - `FilterRail`: SPEC picks extend-vs-fork per §3.2's guidance.
  - No new tokens. Local React state only. No global store. No persistence.
  - TypeScript strict. Named exports.
  - Sidebar registration (line ~154 of `components/layout/Sidebar.tsx`) is a SPEC line item.

**What the SPEC must produce:**
- New files with paths and one-line purpose.
- Edited files with exact edit points (Sidebar `NAV_GROUPS` line).
- Component tree diagram: `AssignPage` → `PageTitle` + `FilterRail(V2?)` + `StackedStepSection ×3` (wrapping `TableSectionHeader` + `<QueueTable | TaskTable | WorkerTable>`) + `StickyActionBar` + backtrack `Modal` + success `MessageBox`.
- Reducer action list covering all six states + three empty states + backtrack.
- Keyboard-handling responsibilities per component (Tab order across dimmed regions, arrow-key row navigation, Enter/Space to select, `Cmd/Ctrl+Enter` on Assign).
- Accessibility annotations (`aria-disabled` on dimmed sections, focus targeting on step enable, live region for post-Assign, `aria-live="polite"` for the daily counter).
- What is explicitly NOT built (gaps flagged in comments only — see §3.7).

**Expected output:** `SPEC.md` in `.workflow/assign-to-worker/SPEC.md` — verbatim.

**🛑 Checkpoint 2 — pause and present the SPEC.**
Present: path, clarifying questions, locked-decision conflicts. Nothing else.

---

### Step 3 — `/react-frontend-architect`

**Skill outcome:** working prototype route, dev server clean.

**Inputs handed in:**
- `SPEC.md` from Step 2.
- Codebase.

**Constraint envelope:**
- Follow the skill's four-phase process (Phase 1 discovery + Phase 2 plan happen before any code — do not skip). **Phase 1 must read v1 at `app/open-inventory/task-queue-visibility/assign/` to mirror shell conventions and confirm reuse targets.**
- Reuse per §3.2. Anything missing → comment on the route file, not a new primitive.
- Ship all six states as fully interactive:
  1. Landing (nothing selected, ①=active, ②/③=disabled).
  2. Queue picked (①=filled, ②=active, ③=disabled).
  3. Task picked (①=filled, ②=filled, ③=active).
  4. All filled (①/②/③=filled, footer summary complete, Assign enabled).
  5. Post-Assign (①=filled preserved, ②/③=reset to disabled/active depending, success strip visible, counter incremented).
  6. Backtrack warning modal (upstream edit with downstream picks).
- Plus three empty states:
  - No matching queues (filter combination).
  - No open tasks in queue.
  - No eligible workers (with "Show all workers" toggle off).
- **Keyboard:**
  - Tab: filter rail → ① rows → ② rows (skipped when dimmed) → ③ rows (skipped when dimmed) → sticky footer CTA.
  - Arrow keys navigate rows within a section's table.
  - Enter/Space selects focused row.
  - `Cmd/Ctrl+Enter` fires Assign when CTA is enabled.
- **File-level README comment** at the top of `page.tsx` linking back to the Figma reference and to `.workflow/assign-to-worker/`.
- Compile check: `npm run dev` starts cleanly on port 3400, route loads, no TS errors, no console errors.

**Expected outputs:**
- `app/open-inventory/task-queue-visibility-v2/page.tsx`
- `app/open-inventory/task-queue-visibility-v2/StackedStepSection.tsx`
- `app/open-inventory/task-queue-visibility-v2/StickyActionBar.tsx`
- `app/open-inventory/task-queue-visibility-v2/assignment-builder-v2-reducer.ts`
- `app/open-inventory/task-queue-visibility-v2/use-assignment-builder-v2.ts`
- Optionally: `components/open-inventory/task-queue-visibility/FilterRailV2.tsx` (if SPEC picks fork)
- Edit: `components/layout/Sidebar.tsx` (nav registration).
- Commits on `claude/assign-worker-flow-prototype-rb4ms4`, small and focused per Rule 24. No `Co-Authored-By`.

**No Checkpoint 3 gating** — skill runs to completion, human reviews live prototype.

---

## 5. Orchestration rules

- **Between each step:** pause, show the verbatim artifact path, wait for `go`.
- **Verbatim saves:** no compression of PRD or SPEC.
- **Clarifying questions from a skill:** surface to human, don't answer on their behalf.
- **Locked-decision conflicts:** flag in pause message; locked decision wins unless human overrides.
- **Commit hygiene:** small, focused commits on the working branch, no `Co-Authored-By` (project Rule 24).
- **Do not open a PR** — brief does not request one.

---

## 6. Assumptions to confirm before Step 1 fires

Please confirm or amend:

1. **Route** = `app/open-inventory/task-queue-visibility-v2/page.tsx`. Sidebar entry = `Task Queue Visibility (v2)`, `wip` badge, added alongside v1 (v1 not removed).
2. **Domain types + mock data source** — pick one:
   - **A (recommended)**: v2 imports from `../task-queue-visibility/assign/_data.ts`. Zero churn on v1.
   - **B**: move `_data.ts` → `mocks/open-inventory/task-queue-visibility/data.ts` and update both v1 and v2 to import from there. Cleaner separation, but touches v1.
3. **Reducer + hook** — pick one:
   - **A (recommended)**: fork to `assignment-builder-v2-reducer.ts` + `use-assignment-builder-v2.ts`. Zero churn on v1.
   - **B**: parameterize the existing v1 reducer with a `mode: 'v1' | 'v2'` prop. Shared code, but changes v1's implementation.
4. **`FilterRail` treatment** — leave to SPEC to decide extend-vs-fork, or you can pre-decide here.
5. **"Section-header/slot component"** = `TableSectionHeader.tsx` (already exists, already used per-step) satisfies the "reusable section-header" requirement in the Step 3 brief. `BuilderSlot.tsx` satisfies the "slot" concept in the sticky footer summary. Confirmed?
6. **Locked decision #7 (remove vertical/horizontal view toggle)** — confirmed nothing about the toggle carries into v2. Note that v1 doesn't have it either.
7. **Post-Assign daily counter** persists in local component state only — resets on page reload. No `localStorage`. (v1 already works this way via `DailyAssignmentsPopover`.) Confirm.
8. **Skill invocation model.** Invoked via the `Skill` tool, one at a time, with the constraint envelopes above. No subagents.
9. **`.workflow/assign-to-worker/PLAN.md`** stays in-repo (the "stale planning docs" removed on `main` in commit `a3a50cb` were unrelated root-level docs, not this folder). Confirm.

---

## 7. What happens next

1. You review this plan.
2. You either say `go` (I fire Step 1) or amend §6 first.
3. Step 1 → `PRD.md` → 🛑 Checkpoint 1 → your go.
4. Step 2 → `SPEC.md` → 🛑 Checkpoint 2 → your go.
5. Step 3 runs to completion. Route live at `localhost:3400/open-inventory/task-queue-visibility-v2`. Small commits pushed. No PR opened.

Stopping here.
