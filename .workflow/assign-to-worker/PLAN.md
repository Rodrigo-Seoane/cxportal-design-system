# Execution Plan — Assign to Worker Prototype (Option 1 pattern)

**Working branch:** `claude/assign-worker-flow-prototype-rb4ms4`
**Working dir:** `.workflow/assign-to-worker/`
**Status:** DRAFT — awaiting go-ahead before Step 1 fires.

---

## 0. TL;DR

Three skills run sequentially, with a human checkpoint between each. Each skill's raw output is saved verbatim into this folder. The final deliverable is a working Next.js route implementing the numbered-stacked-steps Option 1 pattern (Queue → Task → Worker) with a sticky action bar, wired to inline mock data. No API, no global store, no new tokens.

```
Step 1 ──► PRD.md ──[PAUSE 1: approve PRD]──► Step 2 ──► SPEC.md ──[PAUSE 2: approve SPEC]──► Step 3 ──► route + mocks + README
```

---

## 1. Working directory structure

```
.workflow/assign-to-worker/
  PLAN.md                     ← this file
  PRD.md                      ← Step 1 output (verbatim)
  SPEC.md                     ← Step 2 output (verbatim)
  handoff-notes/              ← any clarifying-question resolutions from checkpoints (created if needed)
```

Prototype source lives outside the workflow folder, under `app/` and `components/` per project conventions (see §3).

---

## 2. Route path decision — findings + proposal

**Finding:** There is no `Open Inventory` folder in the app today. The WFM area is `app/wfm/reporting/`. The Figma reference file the brief links to (`WFM` — node `519-85755`) sits in a broader WFM design space that presumably owns an "Open Inventory" section — but no engineering scaffold exists here.

**Sibling convention (from `app/wfm/reporting/*`):**
- Top-level page = `page.tsx` (client component, marked `'use client'`).
- Header comment block documenting focus order, keyboard, ARIA, contrast, click targets, reduced-motion.
- Section panels colocated as sibling files (`QueuePanel.tsx`, `AgentsPanel.tsx`, `AlertsPanel.tsx`).
- Mock data centralized in `mocks/wfm/store.ts` — but sibling routes freely add their own inline mocks when they own new domain shapes.
- Sidebar registration in `components/layout/Sidebar.tsx` under a `NAV_GROUPS` entry.

**Proposed route:** `app/wfm/open-inventory/task-queue-visibility/assign/page.tsx`

Rationale:
- Mirrors the two-level nesting used by `wfm/reporting/<feature>/`.
- Leaves room for future Open Inventory siblings under the same parent segment.
- Path matches how the Figma file organizes the section.

**Sidebar entry (proposed):**
```ts
{
  group:    'WFM Open Inventory',
  Icon:     ListIcon,   // already imported
  basePath: '/wfm/open-inventory',
  items: [
    { label: 'Task Queue Visibility — Assign', href: '/wfm/open-inventory/task-queue-visibility/assign', status: 'wip' },
  ],
},
```

**Confirm-before-Step-1:** if the intended segment is something other than `open-inventory/task-queue-visibility/assign` (e.g. `task-queue-visibility` at the WFM root, or a different label for the sidebar group), say so — this is baked into the PRD's information architecture and the SPEC's route section.

---

## 3. Codebase-exploration findings that affect the plan

### 3.1 Stack in play
- **Next.js 16.2.2** App Router, React 19, TypeScript strict.
- **Tailwind v4** with `@theme inline` in `app/globals.css` (no `tailwind.config.ts` for tokens — CSS vars are the source).
- Icons: **`@phosphor-icons/react`** exclusively (not lucide-react — despite it being installed).
- Animation: **framer-motion v12**.
- No global store, no data-fetching library, no auth — everything is `useState`/`useReducer` per `notes/wfm-prototype-discovery.md`.

### 3.2 DS components already available (satisfies most needs)

From `components/ui/`:

| Need | Component | Path | Notes |
|---|---|---|---|
| Table with rows/cells | `Table`, `TableHeader`, `TableRow`, `TableCell` | `@/components/ui/table` | Confirmed used in `AgentTable.tsx` |
| Radio-style single-select | **GAP** — no dedicated Radio primitive | — | The table already supports row-selection idioms; task-row radio can be built from a bordered `<button role="radio">` inside the row's leading cell |
| Filter chips (dismissible) | `Chip` | `@/components/ui/chip` | For the filter chip strip |
| Sticky footer container | **GAP** — no `<StickyBar>` | — | Simple `<div className="sticky bottom-0 …">`; not worth extracting until we see it needed twice |
| Page title + breadcrumb + inline-context data | `PageTitle` + `InlineContextData` | `@/components/ui/page-title`, `@/components/ui/inline-context-data` | The "12 assigned today" counter goes here — matches locked decision #3 |
| Toggle "Show all workers" | `Switch` | `@/components/ui/switch` | |
| Success feedback | `MessageBox` (variant success, inline) | `@/components/ui/message-box` | For post-Assign inline strip |
| Warning dialog on backtrack | `Modal` | `@/components/ui/modal` | For the "changing this clears downstream selections" warning |
| Primary CTA | `Button` (variant primary) | `@/components/ui/button` | |
| Left filter rail | **GAP** in `ui/` — but `components/wfm/HierarchyFilter.tsx` exists | `@/components/wfm/HierarchyFilter` | Might be reusable if its API fits Queue/Task/Worker filters; likely we build a simple in-file `FilterRail` for the prototype and flag `HierarchyFilter` as the direction for graduation |

**Gaps to flag in the route file (per Step 3 constraint):**
1. No Radio primitive in DS → prototype uses ARIA-composed radio rows inside the table.
2. No StickyBar primitive → inline sticky `<div>`.
3. No `SectionHeader` / numbered-slot primitive → the brief calls for a reusable "section-header/slot component" (Step 3 explicit deliverable) — this ships in the route folder, not `components/ui/`, since it's prototype-scope.

### 3.3 Reusable domain assets

- `mocks/wfm/store.ts` already contains a `Queue` shape with 15+ realistic queues (`id`, `label`, `volume`, `sla`, `agentsOnQueue`, `longestWait`). **Recommendation for Step 2:** reuse `QUEUES` from `mocks/wfm/store.ts` for slot ① rather than duplicating. Tasks and Workers are new shapes and get their own mock file.
- `AGENT_BANK` in the same file is the mock worker pool — reusable for slot ③ if we augment each agent with `eligibleFor: string[]`.

### 3.4 Sidebar registration

The Sidebar is `components/layout/Sidebar.tsx` and it's a hardcoded array of `NAV_GROUPS`. Any new route must be added there or it won't be reachable from the app shell. **This is a mandatory SPEC line item.**

### 3.5 Guardrails from `CLAUDE.md` / `AGENTS.md`

- Next.js 16 has breaking changes — Step 3 must consult `node_modules/next/dist/docs/` for App Router APIs it uses (e.g. `useSearchParams` requires `Suspense`, which sibling routes already handle).
- No `Co-Authored-By` trailer in commits (session-guidance says use one, project rule says don't — **project rule wins**; the assistant footer in Bash system-guidance is git-commit-specific and conflicts with project rule 24, which the project rule overrides per CLAUDE.md).
- File size caps: page < 500 lines, complex component < 250. This is realistic for the six states + three empty states if we extract the two panels (`TaskTable`, `WorkerTable`) into siblings.

---

## 4. The three-step workflow

### Step 1 — `/ux-research-specialist`

**Skill outcome:** structured PRD.

**Inputs handed in:**
- The user's brief (verbatim), including the seven locked decisions.
- Figma reference URL: `https://www.figma.com/design/54ARm4erwwo8sI5rp2MQAq/WFM?node-id=519-85755`
- Design System reference URL: `https://www.figma.com/design/exoHhvasbJSziVGakV8Y0r/CxPortal-%7C-Design-System?node-id=69-1456`
- Codebase context (§3 above) so the PRD doesn't propose primitives that don't exist.
- **Constraint envelope:** the seven locked decisions are constraints, not open questions. If the skill wants to re-open one, it must stop and surface the conflict to the human (checkpoint 1).

**What the PRD must cover (per brief):**
- User story variants (queue-first vs worker-first entry) and whether Option 1 supports both.
- Edge cases: backtrack invalidation, empty states, filter interactions on all three tables.
- Success metrics.
- Accessibility requirements (WCAG AA, focus management across dimmed slots).
- Keyboard flow across the three slots + sticky bar.
- **Sticky footer summary string format** (exact microcopy).
- **Slot / section dimmed-state anatomy** (visual + a11y).
- **Empty-state copy** for: no matching queues, no open tasks in queue, no eligible workers.

**Expected output:** `PRD.md` in `.workflow/assign-to-worker/PRD.md` — saved verbatim, no summary.

**🛑 Checkpoint 1 — pause and present the PRD.**
Do not invoke Step 2 until human says "go".
Present:
- Path to the PRD file.
- Any clarifying questions the skill flagged that aren't answered by the brief.
- Any locked-decision conflicts, if the skill raised one.
- Nothing else.

---

### Step 2 — `/b2b-saas-product-spec-writer`

**Skill outcome:** file-by-file SPEC.

**Inputs handed in:**
- `PRD.md` from Step 1.
- Codebase reality (§3).
- The route path decision from §2 (unless the human amended it at Checkpoint 1).
- **Constraint envelope:**
  - Route: `app/wfm/open-inventory/task-queue-visibility/assign/page.tsx` (or the amended path).
  - Reuse existing `components/ui/*` and `components/wfm/*`. No new tokens. No forking.
  - All data mocked in-file — but Queue mock reuses `mocks/wfm/store.ts`'s `QUEUES` where possible (see §3.3).
  - Tasks: ~8–12 per queue. Workers: ~15–20, each with `eligibleFor: string[]` referencing queue IDs.
  - Local React state only. No global store. No persistence.
  - TypeScript strict. Named exports.
  - Sidebar registration is a SPEC line item.

**What the SPEC must produce (per skill's own contract + this brief):**
- New files with paths and one-line purpose.
- Edited files with the exact edit points (e.g. Sidebar `NAV_GROUPS` insertion).
- Component tree diagram: `AssignPage` → `FilterRail` + `SlotStack` (Slot × 3) + `StickyActionBar`.
- Types for `Queue`, `Task`, `Worker`, `AssignState` (reducer state shape).
- Reducer action list covering all six states + the three empty states + backtrack.
- Mock data spec: shapes + counts + eligibility mapping strategy.
- Keyboard-handling responsibilities per component.
- Accessibility annotations (roles, `aria-disabled`, focus targeting on slot enable, live region for post-Assign).
- What is explicitly NOT built (gaps flagged in comments only).

**Expected output:** `SPEC.md` in `.workflow/assign-to-worker/SPEC.md` — saved verbatim.

**🛑 Checkpoint 2 — pause and present the SPEC.**
Do not invoke Step 3 until human says "go".
Present:
- Path to the SPEC file.
- Any clarifying questions the skill flagged.
- Any locked-decision conflicts.
- Nothing else.

---

### Step 3 — `/react-frontend-architect`

**Skill outcome:** working prototype route, dev server clean.

**Inputs handed in:**
- `SPEC.md` from Step 2.
- Codebase.

**Constraint envelope:**
- Follow the skill's four-phase process (Phase 1 discovery + Phase 2 plan happen before any code is written — do not skip).
- Reuse DS components as-is; anything missing gets a comment on the route file, not a new primitive.
- **Ship all six states as fully interactive:**
  1. Landing
  2. Queue picked
  3. Task picked
  4. All filled
  5. Post-Assign (slot ① preserved; ② and ③ reset; filters preserved; success strip visible; counter incremented)
  6. Backtrack warning modal
- **Plus the three empty states:** no matching queues (filter combination), no open tasks in queue, no eligible workers (with the toggle off).
- **Keyboard:**
  - `Tab` cycles: filter rail → slot ① → slot ② → slot ③ → sticky footer CTA
  - Arrow keys navigate rows within a slot's table
  - `Enter`/`Space` selects the focused row (task = radio; worker = radio)
  - `Cmd/Ctrl+Enter` fires Assign when the CTA is enabled
- **File-level README comment** at the top of `page.tsx` linking back to the Figma reference and to `.workflow/assign-to-worker/`.
- Compile check: `npm run dev` starts cleanly on port 3400; route loads at the proposed path; no TypeScript errors; no console errors.

**Expected outputs:**
- `app/wfm/open-inventory/task-queue-visibility/assign/page.tsx`
- `app/wfm/open-inventory/task-queue-visibility/assign/mocks.ts` (or `_data.ts` — SPEC decides)
- `app/wfm/open-inventory/task-queue-visibility/assign/StepSlot.tsx` (the reusable section-header/slot component)
- Sibling panels: `TaskTable.tsx`, `WorkerTable.tsx` (or as SPEC dictates)
- Edit: `components/layout/Sidebar.tsx` (nav registration)
- Commits on `claude/assign-worker-flow-prototype-rb4ms4`, small and focused per Rule 24.

**No Checkpoint 3 gating** — the skill runs to completion, then the human reviews the live prototype.

---

## 5. Orchestration rules (recap of brief + concrete behavior)

- **Between each step:** pause, show the verbatim artifact path, wait for `go`.
- **Verbatim saves:** no compression of PRD or SPEC. Both live in `.workflow/assign-to-worker/`.
- **Clarifying questions from a skill:** surface to human, do not answer on their behalf.
- **Locked-decision conflicts:** flag in the pause message; locked decision wins unless human overrides.
- **Commit hygiene:** small, focused commits on the working branch, no `Co-Authored-By` (project Rule 24).
- **Do not open a PR** — brief does not request one.

---

## 6. Assumptions to confirm before Step 1 fires

Please confirm or amend each of these — they're baked into what I hand the skills:

1. **Route path** = `app/wfm/open-inventory/task-queue-visibility/assign/page.tsx`.
   Sidebar group label = `WFM Open Inventory`. Sidebar item label = `Task Queue Visibility — Assign`. Status badge = `wip`.
2. **Queue data source** = reuse `QUEUES` from `mocks/wfm/store.ts` for slot ① (12 queues today — close enough to "~15", and consistent with sibling routes). Tasks and Workers get new mock shapes in the route folder. If you'd rather have 15 fresh queues named to match the Figma reference (`Corr_Duals_FL` style), say so and I'll instruct Step 2 to author them from scratch.
3. **Worker pool source** = either reuse `AGENT_BANK` from `mocks/wfm/store.ts` (augmented with `eligibleFor`) or author fresh workers with the Figma-style numeric IDs (`00767`). Same question — reuse or author-fresh?
4. **"Section-header/slot component" scope** = lives inside the route folder (`StepSlot.tsx`) for prototype-scope, not promoted to `components/ui/`. Aligns with project Rule 4 (rule of three — not yet three uses).
5. **"Locked decision #7 removes the vertical/horizontal view toggle."** Confirmed: nothing about the toggle carries into the prototype. It's simply gone from the UI.
6. **Post-Assign daily counter** persists in local component state only — resets on page reload. No `localStorage`. Confirm this matches your intent for a prototype.
7. **Skill invocation model.** These three skills are project skills already scoped to write to disk and consume codebase context. I will invoke them via the `Skill` tool, one at a time, with the constraint envelopes above. No subagents.
8. **The existing `PLAN.md` at repo root is unrelated** (it's the design-system project plan) and is left untouched. This workflow's plan lives at `.workflow/assign-to-worker/PLAN.md` — same file as this one.

---

## 7. What happens next

1. You review this plan.
2. You either say "go" (and I fire Step 1) or you amend the assumptions in §6 first.
3. Step 1 runs, produces `PRD.md`, I pause at Checkpoint 1.
4. You review the PRD, say "go" or amend.
5. Step 2 runs, produces `SPEC.md`, I pause at Checkpoint 2.
6. You review the SPEC, say "go" or amend.
7. Step 3 runs to completion. Route is live at `localhost:3400/wfm/open-inventory/task-queue-visibility/assign`. Small commits pushed to the working branch. No PR opened.

Stopping here.
