# CxPortal DS — Component Audit Handoff

_Last refreshed: 2026-09-07 (second pass, after the Figma connection came up).
Supersedes the 2026-09-03 16:50 version, which went stale mid-session._

## Context

We are running a component-by-component audit of the CxPortal Design System —
every component in Figma reviewed against its counterpart in the Next.js DS app.

**Project root:** `/Users/rodrigo.seoane/local-sites/pronetx/project_portal/`
**Dev server:** `localhost:3400` (`npm run dev`)
**Figma DS file:** `https://www.figma.com/design/exoHhvasbJSziVGakV8Y0r/CxPortal-%7C-Design-System` (key: `exoHhvasbJSziVGakV8Y0r`)
**Sheet (audit tracker):** `https://docs.google.com/spreadsheets/d/1kBLCPTp-5V09Nj6pNLOB6woqD1WAm9CF02sku5-8jBk/edit`

Figma is the source of truth. When code drifts, code updates.

## Approach (already agreed)

Hybrid: (1) **Audit pass** — walk every component, log findings in the sheet.
(2) **Mechanical sweep** — token-only fixes in one horizontal pass.
(3) **Per-component work** — each "major"-tagged component gets its own PR.

In practice from G1 onward we've been auditing *and* fixing in the same pass,
then committing per component group. That's working; keep doing it.

Batching: Foundations → Global (G1–G5) → Knowledge Management → Campaigns → DFC.

- G1 — Form primitives: Input, Labels & Fields, Checkbox & Radio, Switch, Dropdown, Combobox
- G2 — Actions & feedback: Button, Alert Messages, Counter, Tooltip, Modal, Toast
- G3 — Navigation: Breadcrumb, Horizontal Tabs, Vertical Tabs, Left/Vertical Nav, Top Bar, Page Title
- G4 — Data display: Table, Pagination, Metric Tiles, Inline Stats Cards, Inline Context Data, Chips & Tags
- G5 — Composites: Instance Cards, Collapsible Filters, File Tree

## Files in `project_portal/audit/`

- `component-audit-seed.csv` — full component list (Section/Batch/Component), already in the sheet
- `component-audit-fill.csv` — same rows with Figma node IDs and code paths filled
- `component-audit-fill-2cols.csv` — Figma node + Code path only, for pasting
- `component-audit-results.csv` — **the live findings log** (13 rows as of 2026-09-07)
- `component-audit-results-paste-g1.csv` — Status→Notes block for G1
- `component-audit-results-paste.csv` — same, Foundations batch

Stale duplicates of the seed/fill/results CSVs also sit loose in the project
root from before this folder existed. Ignore them; `audit/` is canonical.

## Sheet columns

Section, Batch, Component, Figma node, Code path, Status, Variants delta,
Tokens delta, Docs status, Priority, Notes.

- Status: aligned / minor / major / missing
- Docs status: complete / missing principles / missing usage / missing both / partial / needs verification
- Priority: P0 / P1 / P2

**Sheet is current through G2 Alert Messages** (user confirmed 2026-09-07).

## Naming decisions

Sheet name wins over code/Figma on conflict:

- "Alert Messages" (not "Message Box")
- "Dropdown" (not "Select")
- "Instance Cards" (not "Clickable Card") — Global only; the Campaigns Clickable Cards row was dropped as a duplicate
- "Sidepanel" (not "Drawer")
- "Voice Controls" — still needs confirmation vs "Distribution Controls"
- "Metric Tiles" (renamed from "Stats Cards [Metric Tile]" per shadcn convention)
- Left/Vertical Nav — single row, do not split (Figma has separate Navigation + Nav Item nodes)
- Extra code-side components added as rows: Chips & Tags (G4), Combobox (G1), Toast (G2). Border Radius added as a Foundation.
- Prototypes-in-app-only (Collapsible Filters, Markdown, Upload) are "missing" in DS.

## Progress — Foundations (DONE)

| Component | Status | Priority | Key notes |
|---|---|---|---|
| Colors | aligned | P0 | done before the audit walk |
| Typography | aligned | P0 | done before the audit walk |
| Grid | missing | P0 | build `components/foundations/grid.stories.tsx` + `app/foundations/grid/`; create P&U frames in Figma. 5 layouts, 12 cols / 16 gutter / 16 outer |
| Phosphor Icons | minor | P1 | align code weight to Light; keep code curated; create P&U frames |
| Brand Icons | missing | P1 | build `components/foundations/brand-icons/`. PRDENG-3422 exists. 18 symbols. P&U complete |
| Spacing | minor | P1 | align page copy to Figma; verify SpacingGrid uses `--scale/N`; drop legacy `--scale/400`; add Principles |
| Border Radius | minor | P1 | add `--radius-none`; decide on a "Regular" alias for md; create P&U frames. Values aligned (2/4/8/16/64) |

## Progress — G1 (DONE, fixes committed)

| Component | Status | Priority | Docs |
|---|---|---|---|
| Input | major | P0 | complete (P 698-1820, U 698-5991) |
| Textarea | aligned | P2 | needs verification |
| Labels & Fields | missing | P1 | missing both — kept as its own row |
| Checkbox & Radio | minor | P1 | complete (P 2980-499, U 2980-534) |
| Switch & Boolean Icon | minor | P2 | complete |
| Dropdown | minor | P2 | complete |
| Combobox | — | — | **not yet audited** (node 2255-8066) |

The recurring bug across all of G1: components picked
`--content-action-primary-600` (a dark forest green left from the Caylent
rebrand) where Figma specifies the `-300` / `-default` steps. Correct tokens
already existed — wrong-token bug, not a token gap.

Still open inside G1:
- Input: add Hover + Filled states, `labelPosition=Left`, label info icon with Tooltip, Combo-2-Inputs handling; add Password to Figma
- Labels & Fields: build a reusable Label component; no Figma P&U frames exist to document from yet
- Radio checked colour is baked into an SVG asset — assumed to match Checkbox, not pixel-verified
- Dropdown: the closed-trigger node was never provided, so trigger radius/border/caret/disabled/error were not verified
- **Combobox has not been audited at all** — that's the one G1 row still missing

## Progress — G2 (IN PROGRESS)

| Component | Status | Priority | Docs |
|---|---|---|---|
| Button | major | P0 | complete |
| Alert Messages | major | P0 | complete |
| Counter | missing → built | P1 | complete |
| Tooltip | major | P0 | complete |
| Modal | — | — | not started |
| Toast | — | — | not started |

Button — added `secondary-destructive` + `text-destructive`, rebuilt disabled
states per variant, corrected sizing at all three sizes (gap is 8px everywhere
in Figma, not 8/6/4), XS gets its own 4px radius.

Alert Messages — added `theme` (dark/light), `rounded`, and a CTA slot; icon
24→16px, body 14→12px, removed a fabricated per-type title size.

## Git state

Branch: **`fix/ds-audit-g1-g2-figma-alignment`** (cut from
`claude/assign-worker-flow-prototype-rb4ms4`, which is where this work was
sitting uncommitted by mistake). Four commits, 2026-09-07:

1. `fix(tokens): correct action and form-field semantic aliases` — the 4 shared globals.css aliases, landed first because of blast radius
2. `fix(g1): align form primitives to Figma tokens and sizing`
3. `fix(button): align variants, sizing, and disabled states to Figma`
4. `feat(message-box): add dark theme, rounded corners, and CTA slot`
5. `fix(g2): close Button Icon Small and apply the Figma docs-frame findings`

Not merged to main, no PR opened yet. Note the branch's ancestry still carries
22 commits of Assign-to-Worker v2 prototype + Caylent rebrand work that were
already on this branch.

`audit/` itself is **untracked** — the CSVs and this file have never been
committed. Decide whether they belong in the repo.

## Open threads

All six docs frames supplied on 2026-09-07 have been read, and Button Icon Small
(`2625-18667`) is closed. What came out of them:

**Resolved**
- Icon Small was 36×36 with an 18px icon; Figma says 32×32 / 16px / radius 4px. Fixed.
- Destructive palette: Usage `742-11289` specified `#c41030` / `#d91040` / `#8b1a2a`
  with a WCAG rationale, but no token or component variant uses them. Component
  nodes win (user decision); code stays on the `--error/*` ramp, and the Figma
  Usage page was corrected the same day (text nodes `2373:17943`, `742:11524`).
- Alert dismiss button IS in the spec — 24×24 XCircle, hidden by default. Last
  pass had it backwards. Code now `dismissible={false}` + 24px.
- Alert a11y: `role="alert"` for error only, `role="status"` otherwise.
- New prop found and built: `noPadding`, scoped to text and text-destructive,
  from Figma's `Padding=True/False` on Only Text Destructive.
- Icons are left-only per both docs frames; `iconPosition: 'right'` dropped from
  the registry playground.

**Still open — needs a designer, not code**
- Usage `742-11289` still describes the old model ("four types … two cross-cutting
  variants"). Principles `724-25874` and Usage `2783-18749` both contradict it
  (8 types, 3 destructive sub-types). Not yet corrected in Figma.
- Alert Messages docs forbid what the component set ships: Principles says a
  message needing "multiple lines, paragraphs, or action buttons" has outgrown the
  component, and Usage adds "Don't use when the content exceeds a single line" —
  yet Multi Line (`3418-14435`) exists and is built as `size="block"`. The CTA
  slot is fine (Usage permits one inline link); the multi-line size is the
  contradiction.
- Stale doc values deliberately not followed: Alert light-theme link colour given
  as a flat `#4285F4` for every type (code uses per-type semantic colours; the blue
  reads pre-rebrand), and body text hexes `#021920` / `#EFF1F3` which don't match
  the tokens' `#1d1d1d` / `#efefef`.
- Principles constraints not encoded anywhere in code or registry: max 1 primary
  button per page, Only Text is N/A at regular size, destructive is N/A at extra
  small icon size.

**Unverified from the fix passes**
- `--text-form-field-disabled` (now `neutral-300`) was a placeholder.
- Alert dark-theme icon colour uses the neutral on-dark text colour as a guess.
- Button icon glyph colours (21+ baked SVG assets) assumed to inherit via
  `currentColor`, not pixel-verified.
- Dropdown's closed-trigger node was never supplied, so trigger radius/border/
  caret/disabled/error remain unchecked.

**Registry leftover spotted, not fixed:** the Button playground wraps colored-bg
in `bg-[#4285f4]` — a hardcoded Google blue the Caylent rebrand sweep missed.
Needs a decision on which surface colour the demo should use.

## Immediate next actions

1. Paste `component-audit-results-paste-g2-partial.csv` into the sheet — the
   Button and Alert Messages rows both changed materially on 2026-09-07.
2. Get a designer call on the two Figma-internal contradictions above (old
   variant model on Usage 742-11289; multi-line Alert vs its own docs).
3. Audit Combobox (2255-8066) to actually close G1 — still the one hole in that batch.
4. Continue G2: Modal → Toast. Counter and Tooltip were done 2026-09-07; the Tooltip row also
   covered Dismissible Tip (3210-1866), which was missing and is now built.
5. Produce the full G2 paste block when the batch closes.
6. Decide whether to commit `audit/` and whether to open a PR for the branch.

## Rules for how to read Figma (learned the hard way)

1. **Call `get_design_context` directly** on each node the user pastes. Do not
   delegate parsing to a subagent — that's how the Input small-size padding got
   misread as 4px when it's 8px.
2. If a dump ever exceeds context, query the saved JSON with `jq`/`python` for
   the specific property. Never a summary-style subagent for numeric claims.
3. **Show the raw Figma value** in chat, not a paraphrase, so it can be spot-checked.
4. Ask the user to select the node in Figma first — Dev Mode MCP sometimes
   requires an active selection.
5. Baked SVG assets (icons, radio dots) carry no readable colour. Flag those as
   unverified rather than asserting a value.
6. Foundations pages sometimes have no separate Principles/Usage frames — mark
   Docs status "missing" or "partial".

## Tooling caveat

Claude Code reaches Figma through the **claude.ai Figma connector**, which needs
an OAuth pass first (`/mcp` → "claude.ai Figma"). Once connected it provides
`get_design_context`, `get_metadata`, `get_variable_defs`, `get_screenshot`, and
`use_figma` for writes. Check the connection before promising Figma verification.

Two mechanics worth knowing:
- `get_design_context` on a docs frame usually **exceeds the context limit** and
  gets saved to a file instead. Parse it yourself with python/jq (regex the `<p>`
  and backtick-template contents) — per rule 2 above, do not hand it to a
  summarising subagent.
- Writes need the `figma-use` skill loaded first, and text edits need
  `loadFontAsync` before mutating. Prefer `deleteCharacters` +
  `insertCharacters(idx, text, 'BEFORE')` over replacing whole `characters`, so
  bullet-list and mixed-style formatting survives.

## Rules for how to run each row

1. User pastes Figma node URLs (Component, plus Principles + Usage frames).
2. Read Figma design context directly.
3. Read the code side: `components/ui/{slug}.tsx`, `lib/component-registry.ts`, `content/components/{slug}.mdx`.
4. Produce a delta table. Show raw Figma values for anything numeric.
5. Ask for decisions on any drift.
6. Apply the fixes, verify in the browser at `localhost:3400`.
7. Append the row to `audit/component-audit-results.csv`.
8. Commit per component group, conventional message, no `Co-Authored-By` trailer.
9. At batch end, produce a paste-ready CSV (Status→Notes only).

## Rules for how to communicate

- No sugar-coating. Point out my own mistakes when they happen.
- Casual professional, short and precise, not verbose.
- Never Reddit or Twitter as sources.
- `AskUserQuestion` for genuine decision points only, not for things inferable
  from context.
