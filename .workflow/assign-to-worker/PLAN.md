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

## 2. Route path decision

**Route (user-directed):** `app/open-inventory/task-queue-visibility-v2/page.tsx`

This is a v2 sibling of the existing `app/open-inventory/task-queue-visibility/` route — v1 stays untouched, this prototype replaces its interaction model.

**⚠ Visibility caveat:** the `app/open-inventory/` folder is not present on this checked-out branch (`claude/assign-worker-flow-prototype-rb4ms4`), on `origin/main`, or anywhere else I can search. It's presumed to exist on a branch not visible from this session. Concrete impact:

- I cannot inspect v1's shell/nav/mocks/page structure right now.
- **Step 3 (react-frontend-architect) will read v1 at execution time** as its Phase-1 discovery target and mirror its conventions (page.tsx layout, header comment block, sibling panel files, sidebar entry structure).
- **Step 2 (spec writer) will assume the WFM-reporting conventions** documented in §3 unless you tell me otherwise before Step 1 fires — those are the closest visible sibling pattern.

**Sidebar entry (to confirm at Checkpoint 2):** the existing v1 already registers a sidebar entry somewhere. v2 either (a) replaces v1 in-place in the sidebar with a `wip` badge, or (b) sits alongside v1 as `Task Queue Visibility (v2)`. My default assumption is **(b) alongside v1** so v1 remains reachable during prototype review — flag if you want (a).

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

### 3.3 Mock data location (user-directed)

**Mocks live at `mocks/open-inventory/store.ts`** — a new file authored fresh for this prototype. All three domain shapes (`Queue`, `Task`, `Worker`) are defined and populated there. No reuse of `mocks/wfm/store.ts` — WFM Reporting and Open Inventory are distinct sections with their own domain vocabulary.

Populated by the spec:
- `QUEUES`: ~15 queues named to match the Figma reference (`Corr_Duals_FL` style IDs).
- `TASKS`: ~8–12 open tasks per queue (`Task-01144` style IDs), keyed by queue ID.
- `WORKERS`: ~15–20 workers with numeric IDs (`00767` style) and an `eligibleFor: string[]` referencing queue IDs.

Route-file consumption:
```ts
import { QUEUES, TASKS, WORKERS } from '@/mocks/open-inventory/store'
```

### 3.4 Sidebar registration

The Sidebar is `components/layout/Sidebar.tsx`, a hardcoded `NAV_GROUPS` array. v1 (`task-queue-visibility`) is already registered somewhere in it (per the user; not visible in this branch). v2 needs its own entry — Step 3 reads v1's registration at execution time and mirrors its group placement / label conventions. **Mandatory SPEC line item.**

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
  - Route: `app/open-inventory/task-queue-visibility-v2/page.tsx`.
  - Mocks: `mocks/open-inventory/store.ts` — all three domain shapes authored fresh (see §3.3).
  - Reuse existing `components/ui/*` (and `components/wfm/*` where applicable). No new tokens. No forking.
  - Queues: ~15. Tasks: ~8–12 per queue. Workers: ~15–20, each with `eligibleFor: string[]` referencing queue IDs.
  - Local React state only. No global store. No persistence.
  - TypeScript strict. Named exports.
  - Sidebar registration is a SPEC line item (mirror v1's placement — Step 3 discovers it).

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
- `app/open-inventory/task-queue-visibility-v2/page.tsx`
- `app/open-inventory/task-queue-visibility-v2/StepSlot.tsx` (reusable section-header/slot component)
- Sibling panels: `QueueTable.tsx`, `TaskTable.tsx`, `WorkerTable.tsx`, `FilterRail.tsx`, `StickyActionBar.tsx` (or as SPEC dictates)
- New file: `mocks/open-inventory/store.ts` (queues, tasks, workers, types)
- Edit: `components/layout/Sidebar.tsx` (v2 nav registration alongside v1)
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

1. **Route path** = `app/open-inventory/task-queue-visibility-v2/page.tsx` — user-directed. v1 (`task-queue-visibility`) untouched.
2. **Mock location** = `mocks/open-inventory/store.ts` — user-directed. Authored fresh: ~15 queues (Figma-style names like `Corr_Duals_FL`), ~8–12 tasks per queue (`Task-01144` style), ~15–20 workers (`00767` style) with `eligibleFor: string[]`.
3. **v1 folder is not visible on this branch.** Step 3's Phase-1 reads v1 at execution time to mirror its shell/nav/page conventions. If v1 lives under a different path than `app/open-inventory/task-queue-visibility/`, tell me before Step 1 fires.
4. **Sidebar entry** = new v2 item registered *alongside* v1 in whatever group v1 sits in (label suggestion: `Task Queue Visibility (v2)`, `wip` badge). If you'd rather replace v1 in the sidebar, say so.
5. **"Section-header/slot component" scope** = lives inside the route folder (`StepSlot.tsx`) for prototype-scope, not promoted to `components/ui/`. Aligns with project Rule 4 (rule of three — not yet three uses).
6. **Locked decision #7 (remove vertical/horizontal view toggle)** confirmed: nothing about the toggle carries into the prototype.
7. **Post-Assign daily counter** persists in local component state only — resets on page reload. No `localStorage`. Confirm this matches your intent for a prototype.
8. **Skill invocation model.** These three skills are project skills already scoped to write to disk and consume codebase context. I will invoke them via the `Skill` tool, one at a time, with the constraint envelopes above. No subagents.
9. **The existing `PLAN.md` at repo root is unrelated** (it's the design-system project plan) and is left untouched. This workflow's plan lives at `.workflow/assign-to-worker/PLAN.md` — same file as this one.

---

## 7. What happens next

1. You review this plan.
2. You either say "go" (and I fire Step 1) or you amend the assumptions in §6 first.
3. Step 1 runs, produces `PRD.md`, I pause at Checkpoint 1.
4. You review the PRD, say "go" or amend.
5. Step 2 runs, produces `SPEC.md`, I pause at Checkpoint 2.
6. You review the SPEC, say "go" or amend.
7. Step 3 runs to completion. Route is live at `localhost:3400/open-inventory/task-queue-visibility-v2`. Small commits pushed to the working branch. No PR opened.

Stopping here.
