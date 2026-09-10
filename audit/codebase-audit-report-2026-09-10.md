# CxPortal Design System — Consolidated Codebase Audit
**Date:** 2026-09-10
**Scope:** Consolidation of three independent read-only audits (Part 1: stale tokens vs. `figma_styles.json`; Part 2: dead/deprecated code; Part 3: comment triage for Lessons/Open Questions).
**Status:** Audit only. No files were changed except this report.

---

## 1. Executive Summary

| Category | Confident / safe | Needs a decision | Informational only | Total |
|---|---|---|---|---|
| Part 1 — Stale tokens | 6 | 4 | 1 | 11 |
| Part 2 — Dead/deprecated code | 6 (2 delete + 4 stray-file delete candidates) | 5 (lib API surface, nav-item/nt-menu duplication, combobox/drawer docs, AdherenceBadge marker, breadcrumb migration) | 3 | 14 |
| Part 3 — Lessons/Open Questions | 4 lesson entries (covering 13 files) | 12 open-question entries | 0 | 16 |
| **Total findings** | **16** | **21** | **4** | **41** |

Key framing for the user:
- **Nothing has been changed.** Every item below is a proposal.
- The three reports overlap in three places (flagged in full in §6): the `#eff1f3`/`#aab0b8` orphan-hex thread (Part 1 open items 2–3, pre-existing `instance-card.mdx` open question, Part 3 Q1); the `--neutral-400` (`#7a828c`→`#8d8d8d`) fix category (Part 1 confirmed mismatch, same bug class as Part 3's L4 lesson); and `nav-item.tsx`/`nt-menu.tsx` (Part 2 dead-code check, also implicitly a Part 3-style "why" comment cluster on wrong-ramp-step tokens).
- No contradictions were found between the three reports — Part 2's own report already self-corrects two premises from its task brief (file locations for `nav-item`/`nt-menu` and the `notes/` CSV directory), and those corrections are carried through here as-is.

---

## 2. Naming Reconciliation Note

The user's original ask referenced tracking lessons/open questions in files named **"Lessons.md"** and **"Open_Questions.md"**. The project already has a checked-in, `CLAUDE.md`-referenced file at the project root named **`LESSONS.md`** (all caps, 2 existing entries, dated 2026-07-01, both about verifying Figma values directly rather than guessing).

**Reconciliation applied in this report:** proposals below target the **existing `LESSONS.md`** (append new entries to it) rather than creating a second, differently-cased `Lessons.md` file, which would fork the lesson history into two files and break the existing `CLAUDE.md` reference ("Before each new session begins, read LESSONS.md..."). A new **`Open_Questions.md`** (matching the user's requested casing, since no such file exists yet to conflict with) is proposed at the project root, sibling to `LESSONS.md`.

**Flagging this explicitly per instructions:** this is a naming call made on the user's behalf — confirm `LESSONS.md` (not a new `Lessons.md`) is the correct target before applying Part 3's proposed changes.

---

## 3. Proposed Changes — Part 1 (Stale tokens vs. `figma_styles.json`)

Ranking applies the project's established priority order for resolving token discrepancies: **Component > Variables > Hex > MDX > P&U**, plus the two standing rules ("Pronetx Blue → Caylent Green", "old token reference → new token value"). Component-level hex/value bugs rank above MDX prose bugs; MDX-only stale "blue" language ranks lowest among the confirmed fixes.

### Ready to apply (confirmed, mechanical fixes)

| # | Priority | File : Line | Current state | Proposed change | Expected result | Confidence |
|---|---|---|---|---|---|---|
| 1.1 | **P0 (Component / Variables)** | `lib/tokens.ts:484-487` (`textSize.heading`) | `h1.paragraphSpacing: 16`, `h2: 16`, `h3: 12`, `h4: 12` (Former Pronetx Blue-mode values, hardcoded as literals) | Replace hardcoded literals with the Caylent Green-mode values already correct in `globals.css`: h1/h2 → `4`, h3/h4 → `8` (h5 stays `8`) | `lib/tokens.ts` matches `globals.css`'s already-correct heading paragraph-spacing values; removes a silent drift between the two token sources | High |
| 1.2 | **P0 (Component, Pronetx Blue→Caylent Green)** | `components/open-inventory/task-queue-visibility/FilterRail.tsx:86-87` | `background: checked ? '#4285f4' : '#ffffff'`, `border: 1px solid ${checked ? '#689df6' : '#eff1f3'}` | `#4285f4` → `var(--content-action-primary-default)`; `#689df6` → `var(--content-action-primary-300)` (matches the already-fixed pattern in `components/ui/checkbox.tsx`) | FilterRail's checked-state colors render Caylent Green instead of the canonical old Pronetx blue; brings file in line with `checkbox.tsx`'s already-corrected values | High |
| 1.3 | **P0 (Component, old token→new token)** | `components/open-inventory/task-queue-visibility/FilterRail.tsx:49,57,62,65,94,151` | `#021920` (6 occurrences), `#eff1f3` literals | `#021920` → `var(--neutral-800)` / `var(--text-body-primary)` (`#1d1d1d`) — note `#eff1f3` occurrences here are covered by the open item in §3 "Needs a decision" below, not this fix | Removes an orphan dark-blue-black hex that matches nothing in `figma_styles.json`; aligns with the codebase's actual near-black neutral | High |
| 1.4 | **P1 (Component, internal consistency)** | `app/charts/graph-cards/page.tsx:298-302` | `captions=[{color:'#a0c2f9'},{color:'#689df6'},{color:'#4285f4'},{color:'#3264b8'},{color:'#1a3561'}]` (hardcoded blue palette for browser-share demo data) | Replace with `GraphCard.tsx`'s own `DEFAULT_CAPTIONS` values (`var(--content-action-primary-200/300/600/700/800)`) | Same dataset renders consistently green across the whole page — currently self-inconsistent within one file | High |
| 1.5 | **P1 (same category as 1.3, different file)** | `app/open-inventory/task-queue-visibility/assign/_data.ts:236` | `WORKER_STATUS_COLOR.Break = '#7a828c'` | `'#8d8d8d'` (`Neutral/400`) | Applies the already-resolved `#7a828c`→`#8d8d8d` decision (resolved 2026-09-10 in `instance-card.tsx`, per that file's own comment) to this file, which wasn't updated when the decision was made | High — this is applying an existing decision, not making a new one |
| 1.6 | **P2 (MDX, lowest per priority order)** | `content/components/switch.mdx:51,76` | "Thumb — Blue (#204704) when on" / "Blue thumb on the right" | Correct both: rename "Blue" → "Green" (or the component's actual state name) and update hex from `#204704` (valid Caylent Green raw token but wrong ramp step for this use) to `var(--content-action-primary-default)` (`#3a8015`), matching `switch.tsx:13`'s live `thumbOn` value | Doc text and hex both match the component's actual rendered "on" state | High |

### Confirmed stale "blue" prose (MDX/comments only — P2, lowest priority per Component>...>MDX>P&U)

| File : Line | Current text | Proposed change |
|---|---|---|
| `components/ui/vertical-tabs.stories.tsx:15` | "solid **blue** background" | → "solid green background" (renders `var(--surface-action-primary-default)`, `#3a8015`) |
| `components/ui/file-tree.stories.tsx:15` | "Selected topics highlight in **blue**" | → "...in green" (renders `content-action-primary-100`, `#d0ecc1`) |
| `components/ui/loading.tsx:114` | JSDoc: "Defaults to **primary blue**" | → "Defaults to primary green" |
| `components/ui/distribution-controls.tsx:200,237` | "Top: **blue** fill" / "dark **blue** fill" | → "Top: green fill" / "darker green fill" |
| `components/charts/GraphCard.tsx:125` | "// Primary **blue** palette steps" | → "// Primary green palette steps" |
| `content/components/combobox.mdx:23` | "a **blue** count badge" | Hold — see Part 2 finding: `combobox.mdx` has no live component to verify against (orphaned doc, §4). Fix text only if/when the doc is kept; otherwise moot if the doc is deleted. |

### Needs a designer/human decision before touching (do not apply without sign-off)

| # | File : Line | Issue | Why it can't be applied mechanically |
|---|---|---|---|
| D1 | `app/globals.css:298` `--surface-overlay: rgba(8, 17, 31, 0.7)` | Exact RGB match for `#08111F`, a canonical pre-rebrand Pronetx-blue hex. `figma_styles.json` has no "overlay" variable in any collection to confirm/deny against. | No ground truth exists in the source of truth file; needs a designer to confirm whether a Caylent Green modal/scrim overlay exists or this is intentionally kept. |
| D2 | `#eff1f3` — recurring orphan hex: `FilterRail.tsx:49,57,87`; `lib/component-registry.ts:1242,1269,1829,2252` (skeleton-card, skeleton-table, Stepper preview, FileTree preview) | Does not exist anywhere in `figma_styles.json`; closest neighbor is `--neutral-100` (`#efefef`), not an exact match. Same value as the **pre-existing open thread** in `components/ui/instance-card.tsx:9` / `content/components/instance-card.mdx:151`. | This is a token-definition-drift question, not a typo — resolving it centrally (one decision, then apply everywhere it appears) is safer than a per-file guess. See cross-cutting note in §6. |
| D3 | `app/open-inventory/task-queue-visibility/assign/_data.ts:236` `WORKER_STATUS_COLOR['Logged Off'] = '#aab0b8'` | Same orphan-hex family as D2, also absent from `figma_styles.json`. | Unclear whether this should map to an existing neutral/disabled token or is intentionally a distinct "logged off" gray — same decision as D2 should resolve both. |
| D4 | `app/globals.css:295,305` `--surface-action-empty: rgba(255,255,255,0)`, `--surface-action-secondary-disabled: rgba(249,251,247,0)` | Alpha-0 variants have no named Context entries in `figma_styles.json` (only opaque colors are exported). RGB channels match `Neutral/0` and `Content Action/Disabled/50` respectively, which is reassuring but not a direct citation. | Low-risk item — flagging for confirmation that the alpha-0 behavior is intentional, not blocking. |

### Informational only

- **`app/globals-17-08-2026.css`** — untracked pre-rebrand backup of `globals.css` (Mona Sans font, `--color-primary: #4285f4`). Zero references anywhere in the tracked tree; `app/layout.tsx` only imports `./globals.css`. No runtime risk, but invites accidental copy/paste confusion. Recommend deleting (also listed in Part 2, §4, as a stray artifact — see cross-cutting note in §6).

---

## 4. Proposed Changes — Part 2 (Dead/deprecated code)

### Confident deletions (safe, zero live references found)

| File | What it is | Proposed action | Expected result | Confidence | Blast radius |
|---|---|---|---|---|---|
| `components/ui/scroll-area.tsx` | Unused UI component — no registry entry, no MDX doc, no import outside its own `.stories.tsx` and the dead barrel | Delete, along with its `.stories.tsx` | One fewer dead file; no route or component references it | High | Zero live references. Must also remove the `export * from './scroll-area'` line in `components/ui/index.ts` (or delete that whole barrel, see below) |
| `components/ui/index.ts` | Dead barrel file — nothing imports bare `@/components/ui` anywhere in the tree; also incomplete/stale (missing `breadcrumbs`, `open-page-title`, `table-filter`) | Delete | Removes an unmaintained, unused barrel that could mislead future contributors into thinking it's the canonical import path | High | Zero references to bare `@/components/ui` found |
| `lib/index.ts` | Dead barrel — `export * from './tokens'`/`'./utils'`, zero importers of bare `@/lib` | Delete | Removes unused indirection; all real consumers already import `@/lib/tokens` / `@/lib/utils` directly | High | Zero references found |
| `lib/sandbox-registry.ts` → `getExperiment` (singular) | Unused export; only the plural `getExperiments()` is called (from `app/system/status/page.tsx:7`, `app/sandbox/page.tsx:3`) | Remove the `getExperiment(slug)` function (line 38) | One fewer dead export; `Experiment`/`ExperimentStatus` types stay (they're used) | High | Zero call sites |

### Stray/duplicate file deletions (untracked, confirmed safe)

| File | Reason | Confidence |
|---|---|---|
| `app/globals-17-08-2026.css` | Pre-rebrand snapshot, zero references (also Part 1 informational item — see §6) | High |
| `audit/component-audit-results.csv.bak` | 7-line backup superseded by tracked, canonical `audit/component-audit-results.csv` (36 lines) | High |
| `component-audit-fill-2cols.csv`, `component-audit-fill.csv`, `component-audit-results.csv`, `component-audit-seed.csv` (root-level, per current `git status`) / `notes/component-audit-*.csv` (per Part 2's on-disk check) | Working drafts/stubs superseded by tracked `audit/component-audit-results.csv`. **Note:** current `git status` shows these CSVs as untracked at project root, not under `notes/` as Part 2's report describes — confirm actual location before deleting (see §6 cross-check note) | Medium-High — verify path before deleting |
| `public/fonts/Roboto/Roboto-Italic-VariableFont_wdth,wght.ttf`, `public/fonts/Roboto/Roboto-VariableFont_wdth,wght.ttf` | Confirmed dead weight — `globals.css`'s `@font-face` rules reference only the sibling `.woff2` files; no `next/font` usage anywhere in the tree | High |
| `Archived plans/` | 960 KB, 27 files, all product/planning docs, no code inside, untracked | High (leave as-is or delete per user preference — zero code risk either way) |

### Needs a closer look / needs a decision — do NOT delete

| Item | Why it's not a simple deletion | Recommended path |
|---|---|---|
| `lib/tokens.ts` — 11 unused named exports: `raw`, `semantic`, `context`, `scale`, `borderWidth`, `borderRadius`, `fontFamily`, `fontWeight`, `textSize`, `colors`, `SpacingUnit` | Zero current importers, but these read as an intentionally-exposed public API surface mirroring the Figma variable collections 1:1 (per in-file comments), likely meant for future/external consumers, not accidental leftovers | Flag to human for a keep/prune decision; do not blanket-delete |
| `components/ui/nav-item.tsx` / `components/ui/nt-menu.tsx` | **Not dead** — both live via `lib/component-registry.ts` (slugs `navigation`/`nav-item`/`nt-menu`), rendered at `/components/navigation`, `/components/nav-item`, `/components/nt-menu`, documented in MDX, and linked from `Sidebar.tsx`'s catalog (lines 97-98). They are simply not consumed by `Sidebar.tsx`'s own hand-rolled render tree — a known, self-documented duplication (`content/components/navigation.mdx:472-476`; `nt-menu.tsx:16-22` self-describes as "not wired in as the live sidebar... expected to eventually replace" `nav-item.tsx`) | **Do not delete.** The actionable follow-up is the inverse: refactor `Sidebar.tsx` to consume `NavMenuItem`/`NavSubItem`/`NavMenuItemCollapsed` (or `nt-menu`'s components once that redesign ships) instead of hand-rolled markup. Per user memory (`project_nt_menu_redesign.md`), this should be built for real when touched, not just re-flagged. |
| `content/components/combobox.mdx`, `content/components/drawer.mdx` | Orphaned docs — `status: stable` frontmatter but no live component exists for either; visiting `/components/combobox` or `/components/drawer` 404s today (`getEntryMeta()` → `null` → `notFound()`) | Two-way decision needed: either (a) the components were never built and the docs should be deleted/marked `status: planned`, or (b) they need to actually be built + registered. Do not delete the docs without confirming which. |
| `components/wfm/AdherenceBadge.tsx:9` `@deprecated` marker on the `adherence` prop | Marker is misleading today: all 4 live call sites (`AgentsPanel.tsx:139`, `agent-scorecard/[agentId]/page.tsx:324`, `AgentTable.tsx:317`, `supervisor-scorecard/[scope]/page.tsx:475`) still use the "deprecated" `adherence` prop; zero call sites use the "recommended" `state` prop | Needs a decision: migrate the 4 call sites to `state`, or remove/soften the `@deprecated` marker until real adopters exist |
| `content/components/breadcrumb.mdx:13` — 14+ inline breadcrumb JSX call sites not yet migrated to the `Breadcrumb` component | Real migration backlog item, but touches 14+ page files — too large to action in this audit pass | Flag as a tracked backlog item, not a quick fix |
| `docs/email_campaigns/figma_styles_02_sep.json` / `figma_sync_02_sep.json` | `app/foundations/colors/semantic-tokens.ts:2` cites `figma_styles_02_sep.json` as documented provenance, but the current canonical export is root-level `figma_styles.json` (dated 2026-09-10, confirmed via file listing this pass). No code reads either JSON at runtime — comment-only reference. | Needs a closer look: update the provenance comment to point at `figma_styles.json`, or confirm the Sep 2 files are intentionally kept as historical snapshots |

---

## 5. Proposed Changes — Part 3 (`LESSONS.md` / `Open_Questions.md`)

Per §2's naming reconciliation, entries below are proposed as an **append to the existing `LESSONS.md`**, and as the **initial content of a new `Open_Questions.md`** at project root.

### 5a. Proposed append to `LESSONS.md`

```markdown
- [2026-09-08] Shared color-alias tokens (--text-body-primary, --text-on-action-secondary, --text-action) resolve to the wrong ramp step in this codebase (#373737 / --neutral-700 instead of the correct step). Bypass to the raw ramp token (e.g. --neutral-800) directly instead of the alias until the alias itself is fixed at the source; root cause tracked in audit/HANDOFF-PROMPT.md. Recurred independently across 13 files: components/ui/tabs.tsx, page-title.tsx, nt-menu.tsx, nav-item.tsx, vertical-tabs.tsx, file-tree.tsx, table-filter.tsx, table.tsx, collapsible-filters.tsx, inline-stats.tsx, chip.tsx, instance-card.tsx, components/layout/Sidebar.tsx.

- [2026-09-09] Chip/Tag: Figma's colorValue steps (100-600) don't map 1:1 onto each color ramp's literal steps except for neutral/grey — the four non-neutral families (red/success/warning/info) only define 100/200/300/500(default)/600/700, so colorValue 400/500/600 must map onto -500/-600/-700. Also, text color per (type, shade) is a hand-set Figma matrix, not a simple "light shade → dark text" rule — replicate exactly, don't infer a pattern. The previous Chip implementation was missing entire shade/family combinations; verify full 5×6 coverage against Figma before shipping a variant matrix like this.

- [2026-09-09] When mapping Figma icon names to Phosphor icon components, verify each one against the actual Figma node individually — 7 of 10 Metric Tile icon mappings were wrong Phosphor icons entirely (not just a color/token drift) before this pass caught it.

- [2026-09-10] Same lesson as the dimension-verification entry above, for color: when a hex value is in question, read Figma's Variables export directly rather than eyeballing/comparing swatches — resolved a --neutral-400 (#8d8d8d vs #7a828c) ambiguity this way in components/ui/instance-card.tsx. The same #7a828c-vs-#8d8d8d bug was independently found unresolved in app/open-inventory/task-queue-visibility/assign/_data.ts:236 during this audit — the decision exists, it just hadn't propagated to every consumer yet.
```

### 5b. Proposed initial content for new `Open_Questions.md`

```markdown
# Open Questions

Unresolved design/product decisions surfaced during development or audit. Each entry should be closed out (moved to a "Resolved" section or deleted) once a designer/PM makes the call, with the resolution optionally promoted to LESSONS.md if it teaches a reusable lesson.

---

- **Instance Card — no token matches Figma's border colors.** Figma's Default/Disabled secondary border hexes (#aab0b8, #eff1f3) don't match any existing token value in the codebase under any name. Is this a missing/new token, or should the component bind elsewhere? Also affects `app/open-inventory/task-queue-visibility/assign/_data.ts:236` (`#aab0b8` for "Logged Off" status) and four codegen snippets in `lib/component-registry.ts:1242,1269,1829,2252` (skeleton-card, skeleton-table, Stepper preview, FileTree preview) that all use the orphan `#eff1f3`, plus `components/open-inventory/task-queue-visibility/FilterRail.tsx:49,57,87`. Resolve once, centrally, then apply everywhere. (components/ui/instance-card.tsx:9-18; content/components/instance-card.mdx:151)

- **Pagination — active/current-page style is invented, not Figma-confirmed.** Figma's pulled variants show no distinct "current page" treatment despite docs requiring one; the current solid-fill active state was invented. Needs Figma confirmation. Possible duplicate of an existing note in content/components/pagination.mdx — check before filing twice. (components/ui/pagination.tsx:15-27)

- **Dismissible Tip — two Figma defects replicated as-is.** (1) Secondary theme has no visual difference between Dark/Light in Figma. (2) Container width is inconsistent across the Figma component set vs. the Usage demo (300/281 vs 274/257px) — code standardized on 300px and exposes a `width` prop. Confirm with design whether these are Figma bugs to fix upstream or intentional. (components/ui/dismissible-tip.tsx:7-13)

- **Stats Cards — `surface="blue"` prop renders gray, not blue.** Matches Figma's own naming oddity. Confirm intended color/naming with design. (components/ui/stats-cards.tsx:100-103)

- **Vertical Tabs — Hover state has no Figma spec.** No Hover state exists on the component in Figma; the current value is invented, tinted from the corrected active green. Verify with design if/when a Hover spec is added. (components/ui/vertical-tabs.tsx:31-32)

- **Deprecated cxportal-purple ramp has no successor token.** The old cxportal-purple color ramp is deprecated post-rebrand with no successor defined. app/system/status/page.tsx's "sandbox" category badge still uses hardcoded hex (#f0ebf8/#4a1a6b) as a result, and several --raw-cxportal-purple-* tokens in app/globals.css sit unused (tied to a "Former Pronetx Blue mode" that was never built). Needs a design decision: pick a successor token, or remove the dead purple tokens/mode reference. (app/system/status/page.tsx:56-57; app/globals.css:79)

- **Scroll Area story demo swatch has no token owner.** Generic light-blue placeholder background (#f0f4fb), not tied to a specific interactive role. Decide which token family (if any) placeholder/demo swatches like this should use. (components/ui/scroll-area.stories.tsx:49) — Note: scroll-area.tsx itself is proposed for deletion as dead code in Part 2; if deleted, this question may become moot.

- **Sidebar logo mark is still a placeholder.** Pronetx "P" shape pending the real Caylent-rebrand logo asset from the user. (components/layout/Sidebar.tsx:501)

- **Agent Status Summary table virtualization is a stand-in.** Row "virtualization" is a simple scroll-offset calc on fixed-height rows, not real virtualization. Swap for @tanstack/react-virtual before shipping to production. (app/wfm/reporting/agent-status-summary/AgentTable.tsx:3-6)

- **Campaigns Email TEMPLATE_VARIABLES is placeholder mock data.** Standing in for the real variable list pending the Connect integration. Confirm the final variable set once that integration lands. (app/sandbox/campaigns-email/_mock/templates.ts:25)

- **Module Action Modals field labels were inferred, not Figma-confirmed.** (Enable Module / Set Manual Deploy / Download CF Template) — the design context fetch fell outside a prior session's budget; fields were inferred from each modal's alert+input+toggle shape and the row kebab's 3 actions. Needs a Figma pass to confirm actual field labels/copy. (components/access-management/ModuleActionModals.tsx:9-12)

- **Task Queue Visibility v2 prototype is missing three DS primitives.** No DS Radio at region level (role="radio" composed manually in table cells), no DS StickyBar (inline position:sticky), no reusable numbered-slot component (StackedStepSection is prototype-local). Promote to components/ once a second consumer appears. (app/open-inventory/task-queue-visibility-v2/page.tsx:38-44)

- **Naming/rebrand open items carried over from the token audit (Part 1 of this report):**
  - `app/globals.css:298` `--surface-overlay` matches a pre-rebrand Pronetx-blue hex (#08111F) with no ground truth in figma_styles.json to confirm or deny.
  - `app/globals.css:295,305` alpha-0 surface variants have no direct Context-collection citation in figma_styles.json.

- **AdherenceBadge `@deprecated` marker may be premature.** All 4 live call sites still use the "deprecated" `adherence` prop; zero use the "recommended" `state` prop. Migrate call sites, or reconsider the deprecation until adopters exist. (components/wfm/AdherenceBadge.tsx:9)

- **combobox.mdx and drawer.mdx describe components that don't exist yet.** Both docs are `status: stable` but there is no live Combobox or Drawer component anywhere in the tree — visiting either doc route 404s today. Confirm: build the components, or mark the docs as not-yet-built / remove them. (content/components/combobox.mdx; content/components/drawer.mdx)

- **breadcrumb.mdx: 14+ inline breadcrumb call sites not yet migrated to the `Breadcrumb` component.** Real backlog item, out of scope for a quick fix — needs its own migration pass. (content/components/breadcrumb.mdx:13)
```

### 5c. In-file comments that could be trimmed/cross-linked after the LESSONS.md entry lands (not done here — read-only audit)

Once the consolidated wrong-ramp-step lesson is in `LESSONS.md`, these 13 near-verbatim in-file comments could each be shrunk to a one-line cross-link ("bypassed — see LESSONS.md 2026-09-08 wrong-ramp-step entry"), keeping only file-specific detail if any:

- `components/ui/tabs.tsx:32-35`
- `components/ui/page-title.tsx:8-11`
- `components/ui/nt-menu.tsx:31-33`
- `components/ui/nav-item.tsx:9-11`
- `components/ui/vertical-tabs.tsx:20-24`
- `components/ui/file-tree.tsx:31-34`
- `components/ui/table-filter.tsx:12-15`
- `components/ui/table.tsx:37-40, 44-45`
- `components/ui/collapsible-filters.tsx:25-28`
- `components/ui/inline-stats.tsx:12-15`
- `components/ui/chip.tsx:23-26`
- `components/ui/instance-card.tsx:36-39`
- `components/layout/Sidebar.tsx:24-26`

Also borderline (reviewer's call, not necessarily worth trimming — they double as legitimate architectural "why" documentation):
- `components/ui/vertical-tabs.tsx:31-32` (Hover-state rationale)
- `app/wfm/reporting/agent-status-summary/AgentTable.tsx:3-6` (virtualization rationale)
- `app/open-inventory/task-queue-visibility-v2/page.tsx:38-44` (DS-gap rationale)

---

## 6. Cross-Cutting Notes

1. **`#eff1f3` / `#aab0b8` orphan-hex thread spans Part 1 and the pre-existing `instance-card.mdx` open question, and is echoed in the new Open_Questions.md draft.** Part 1 found this hex recurring in `FilterRail.tsx`, four `lib/component-registry.ts` codegen snippets, and `_data.ts`'s "Logged Off" status color. This is the *same* unresolved thread already logged in `components/ui/instance-card.tsx:9` / `content/components/instance-card.mdx:151` before this audit ran. Recommend resolving it once, centrally (a single designer decision: either define the missing token or map to `--neutral-100`), then apply that single resolution across all ~7 call sites in one batch, rather than treating each file as a separate question.

2. **The `--neutral-400` (`#7a828c`→`#8d8d8d`) fix (Part 1, confirmed mismatch table) is the same bug category as Part 3's Lesson L4.** `instance-card.tsx` already resolved this exact hex ambiguity on 2026-09-10 by reading the Figma Variables export directly (the source of L4). Part 1 independently found the *same* stale `#7a828c` still present, unresolved, in `app/open-inventory/task-queue-visibility/assign/_data.ts:236` — i.e., the decision was made but hadn't propagated to every consumer. The proposed `LESSONS.md` entry for L4 (§5a) now explicitly cross-references this second occurrence so future sessions know to grep for the old hex across the whole tree when a similar ambiguity is resolved, not just fix the one file where it was noticed.

3. **`app/globals-17-08-2026.css` is flagged independently by both Part 1 (informational) and Part 2 (stray artifact, confident deletion).** Both reports reach the same conclusion (delete — zero references) via different investigative paths (Part 1 via token-value sweep, Part 2 via dead-file sweep). No contradiction; treat as one finding, not two.

4. **`nav-item.tsx` / `nt-menu.tsx` duplication (Part 2) is adjacent to Part 3's wrong-ramp-step lesson cluster.** Both files appear in Part 3's L1 list of 13 files carrying the same bypassed-token comment (`nt-menu.tsx:31-33`, `nav-item.tsx:9-11`) *and* in Part 2's "duplicated, not dead" finding. They are not the same issue (one is a token-alias bug, the other is an architectural duplication) but a future refactor that consolidates `Sidebar.tsx` onto these primitives (per user memory `project_nt_menu_redesign.md`) should carry the wrong-ramp-step-safe token usage forward, not reintroduce the bug.

5. **Part 2's report self-corrected two premises in its own task brief** (both carried through unchanged into this consolidated report, not treated as report contradictions): (a) `nav-item.tsx`/`nt-menu.tsx` actually live in `components/ui/`, not `components/layout/`; (b) the audit CSV files live in `notes/`, not at the project repo root, per Part 2's on-disk check. **However, this council's own check of the current `git status` snapshot** (provided in this session's context) shows `component-audit-fill-2cols.csv`, `component-audit-fill.csv`, `component-audit-results.csv`, and `component-audit-seed.csv` as untracked at the **project root**, not under `notes/`. This is a genuine discrepancy between Part 2's on-disk finding and the git-status snapshot available to this council — **flagged, not silently resolved**. Recommend re-verifying actual file locations (`ls notes/ 2>/dev/null; ls *.csv 2>/dev/null`) before deleting any of these CSVs, since Part 2's report and the git-status snapshot disagree on where they live (possibly both exist — a `notes/` copy and a root copy).

6. **No hard contradictions found between the three reports.** All three converge cleanly: Part 1's component-level fixes and Part 3's L1 lesson describe the same underlying token-alias defect from two angles (specific hex bugs vs. the repeated comment pattern documenting workarounds for it); Part 2's dead-code findings don't overlap with Part 1's token findings except via the shared `globals-17-08-2026.css` file (item 3 above).

---

## 7. Recommended Execution Order (if/when the user approves applying these)

**Batch A — Safe token fixes (Part 1 "Ready to apply" table + stale-prose table).**
Apply items 1.1–1.6 and the 6 stale-"blue"-prose corrections. Low risk, mechanical, each independently verifiable against `figma_styles.json` or the component's own already-correct value. Recommend one commit per file (per `CLAUDE.md` Rule 24: one thing per commit).

**Batch B — Safe deletions (Part 2 confident deletions + stray files).**
Delete `components/ui/scroll-area.tsx` (+ its `.stories.tsx`), `components/ui/index.ts`, `lib/index.ts`, `lib/sandbox-registry.ts`'s `getExperiment` export, `app/globals-17-08-2026.css`, `audit/component-audit-results.csv.bak`, the two dead `.ttf` font files. **Re-verify the CSV-file location discrepancy (§6 note 5) before deleting any `component-audit-*.csv` file** — confirm actual paths first. `Archived plans/` deletion is optional/low-stakes, user's call.

**Batch C — Lessons/Open Questions files (Part 3).**
Confirm the `LESSONS.md` vs. `Lessons.md` naming call (§2) with the user, then append the 4 entries to `LESSONS.md` and create `Open_Questions.md` with the drafted content (§5a, §5b). Do the in-file comment trims (§5c) as an optional follow-up pass, not bundled with the file creation.

**Batch D — Needs-a-decision items. Do not touch without sign-off.**
- Part 1: D1 (`--surface-overlay`), D2/D3 (`#eff1f3`/`#aab0b8` central resolution), D4 (alpha-0 surface variants).
- Part 2: `lib/tokens.ts`'s 11 unused exports (keep-or-prune decision), `nav-item.tsx`/`nt-menu.tsx` → `Sidebar.tsx` refactor (real build, not a flag, per user memory), `combobox.mdx`/`drawer.mdx` (build vs. delete), `AdherenceBadge.tsx` deprecation marker (migrate call sites vs. un-deprecate), `breadcrumb.mdx`'s 14+ call-site migration backlog, `docs/email_campaigns/figma_styles_02_sep.json` provenance-comment update.
- Part 3: every entry in the drafted `Open_Questions.md` — these are by definition unresolved and should stay open until a designer/PM closes them out, not be silently fixed as a side effect of Batch A–C work.
