# CxPortal DS — Component Audit Handoff

_Last refreshed: 2026-09-09 (eleventh pass — Pagination closed). Supersedes
the earlier 2026-09-09 version.
**Also fixed this pass:** several turns' worth of `audit/` edits (Modal
through Vertical Tabs) had been sitting uncommitted on tracked files because
of a wrong assumption that `audit/` was untracked — it was committed back in
`e2272da`. Caught and committed properly in the prior pass; see Git state below._

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
- `component-audit-results.csv` — **the live findings log** (27 rows as of 2026-09-09)
- `component-audit-results-paste-g1.csv` — Status→Notes block for G1
- `component-audit-results-paste-g2.csv` — same, full G2 (Button, Alert Messages, Counter, Tooltip, Modal, Toast)
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
- Extra code-side components added as rows: Chips & Tags (G4), Combobox (G1), Toast (G2), **Table Filter (G4, new this pass)**. Border Radius added as a Foundation.
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

## Progress — G2 (DONE)

| Component | Status | Priority | Docs |
|---|---|---|---|
| Button | major | P0 | complete |
| Alert Messages | major | P0 | complete |
| Counter | missing → built | P1 | complete |
| Tooltip | major | P0 | complete |
| Modal | minor | P1 | complete |
| Toast | major | P0 | complete |

Button — added `secondary-destructive` + `text-destructive`, rebuilt disabled
states per variant, corrected sizing at all three sizes (gap is 8px everywhere
in Figma, not 8/6/4), XS gets its own 4px radius.

Alert Messages — added `theme` (dark/light), `rounded`, and a CTA slot; icon
24→16px, body 14→12px, removed a fabricated per-type title size.

Modal — footer Cancel icon was plain X, Figma specifies XCircle (fixed).
Header/footer border used `--neutral-100` instead of the semantic alias
`--border-color-surface-active-terciary-default` (same hex, wrong token —
G1-pattern bug, fixed). Focus never returned to the trigger element on
close despite the component's own MDX promising it — implemented. MDX's
token-reference table named tokens that don't exist in the codebase
(`--surface/nav`, `--surface/section`, `--border-color/neutral`) — synced
to the real ones. `xlarge` size has zero Figma backing (only Large/Medium
exist) but is load-bearing in two campaigns-email upload-wizard call sites —
left in code, flagged for Figma. Sizing/radius/typography/button-sizing
were all already correct, no changes needed there.

Toast — Figma's actual component is much leaner than the code (two Length
variants, one generic Info icon slot, no type/colour variants at all); the
code's six-type icon+colour system has no Figma variant backing but is
directly supported by Design Principle #4 and was kept. Real fixes: removed
a border Figma doesn't have; drop-shadow blur was 24px vs the "Tooltip
Shadow" effect's 12px (same effect as Tooltip, now shares the same literal);
the Undo/action button and the shared `--icon-action` alias had the same
wrong-ramp-step bug (`-600`/`-700` instead of `-default`/`-300`) found
throughout this whole audit; toasts with an action now persist instead of
auto-dismissing (Figma Behaviour doc); the enter animation was simply
missing — new toasts popped in at full opacity with nothing to transition
from, now they actually slide/fade in. Left `--icon-success` alone even
though it's also wrong (Toast's own MDX proves it) — Message Box consumes
the same alias and wasn't re-checked against Figma this pass, so Toast's
success icon now points directly at `--success-500` instead of repointing
the shared token.

## Progress — G3 (DONE)

| Component | Status | Priority | Docs |
|---|---|---|---|
| Breadcrumb | missing → built | P1 | complete |
| Horizontal Tabs | major | P0 | complete |
| Vertical Tabs | major | P0 | complete |
| Left/Vertical Nav | major | P0 | complete |
| Top Bar | major | P0 | complete |
| Page Title | major | P0 | complete |

Breadcrumb — no prior implementation existed (14+ inline JSX call sites,
plus an MDX doc describing a component that was never built). Figma's
component node exposes its internal variant props
(`property1`/`prop1stBranch`/`prop2ndBranch`/`prop3rdBranch`); the Usage
doc's own "Code" section shows a different, better `items` array API
(`items: {label, href}[]`, depth = `items.length`) — built that one, since
it's the doc's own stated public interface. Colour is a three-way Figma
conflict (component says green `--text-on-action-transparent`; Principles
and Usage each claim a different, mutually-inconsistent gray that matches
no real token) — took the component's value per the standing rule, flagged
the conflict rather than picking silently. The 14 existing inline call
sites were **not** migrated to the new component this pass.

Horizontal Tabs — Figma names two *different* greens for the active state
(border `--border-color-surface-active-primary-default` #629944, text
`--content-action-primary-default` #3a8015) that code was conflating into
one wrong token (`-600`, #204704). Default/active text routed through two
MORE shared aliases (`--text-action`, `--text-body-primary`) that are
themselves wrong-ramp-stepped — same recurring bug, now hitting a growing
list of tokens (see Cross-cutting thread below). Hover had no real
treatment at all for Minimal type and used a translucent overlay instead
of solid white for Button type — Figma previews the active look (green
text, white bg) on hover for both types, now implemented. Minimal type's
own group gap (12px not 4px), tab padding (2/4px split not uniform 4px),
tab gap (4px not 8px), and icon size (9px not a universal 16px) were all
wrong. **Figma-internal contradiction:** Principles caps tab count at 4
("do not exceed 4"), but the Tab Group component itself ships a 5-tab
`Size=05` variant — component wins, cap raised to 5 in code and docs.

Vertical Tabs — active background had the same wrong-ramp-step bug
(`-600` #204704 instead of `#3a8015`); default/disabled text routed
through two more of the growing list of wrong-ramp-stepped shared
aliases. Figma's own Anatomy text says rows have **zero** gap ("the
filled Active state is what separates one tab from the next, not
spacing") — code had 4px. Biggest gap: **no keyboard navigation existed
at all** — no `onKeyDown`, no roving `tabIndex` — despite Figma's Usage
doc explicitly requiring Arrow Up/Down roving-tabindex nav identical in
shape to what Horizontal Tabs already implements. Added the same
pattern. Default demo icon (Shield) didn't semantically fit its "Global
Permissions" label; Figma's own demo uses Globe — swapped. No Hover
state exists in Figma for this component at all (unlike Horizontal
Tabs) — kept as an inferred nicety, flagged rather than asserted.

Left/Vertical Nav — the biggest row this audit. The same wrong-ramp-step
active/hover bug turned up in **three independent implementations** of
this component at once: `nav-item.tsx` (the DS primitives), `Sidebar.tsx`
(the actual production sidebar — rendered on every page including this DS
site — which doesn't consume `nav-item.tsx` at all, a pre-existing DRY
violation, flagged not fixed), and a third hardcoded showcase in
`app/components/[slug]/page.tsx`. Fixed all three to the same corrected
values. Sub-item height/padding changed from 40px/48px/24px to
48px/36px/8px on a 2-vs-1 evidence split — two freshly-pulled live
components agreed against one stale doc comparison grid, so component(s)
won. The `navigation` registry entry was a wholly separate, hand-rolled
implementation with hardcoded pre-rebrand blue hexes (`#3264b8`,
`#4285f4`) and an empty `scope` — didn't render the real components at
all; rebuilt to actually compose `NavMenuItem`/`NavSubItem`/
`NavMenuItemCollapsed`. Fixed `--surface-action-primary-hover` globally
(not just locally bypassed) since a blast-radius check found zero real
consumers before this pass — the one shared-token fix this session that
was safe to do outright.

**NT Menu — new redesign, built from scratch this pass.** What looked
like it might be a fourth nav-family node set (`3660-6232` /
`3869-13623` / `3660-6296`, Figma-internal names `MenuItemRow` /
`MenuItemRowCollapsed` / `ModuleMenuGroup`) turned out to be a
completely different, currently-unbuilt tree-view "module menu" pattern
— light theme, pastel-green pill rows, drop shadows, tree connector
lines. Confirmed via the Usage doc, which only covers the old dark
sidebar and never mentions it. Per the user: this is CxPortal's active
redesign target for the whole left nav, so it was built for real rather
than just logged — new `components/ui/nt-menu.tsx`, registered, MDX'd,
verified in the browser — but deliberately **not** wired into
`Sidebar.tsx` as the live default yet. That swap is a separate later
step once it's been tested. See the **NT Menu** page's own Open
Questions for what's approximated (the tree-connector line height is a
formula, not Figma's five-magic-number lookup table) and what's simply
undocumented (no Principles/Usage exists for it yet).

Top Bar — Figma's component node has a fourth `product` variant, "New UI",
with zero Principles/Usage backing — same open-question shape as NT Menu,
but simpler to build for real since Figma modeled it as a variant of the
*same* component rather than a separate family (Instance + 3 utility icons
only, no brand/user-email/sign-out/dividers). Built as `product="new-ui"`.
**Deliberate exception to the standing component-wins-over-docs rule:**
Figma's live CxPortal component still renders a lavender/purple accent
(`#b2a3ff`/`#d6d7ff`) distinct from CxCentral/Cases' green — reasoned as a
stale pre-Caylent-rebrand ("Pronetx purple") leftover rather than a real
distinct brand (per the project's own rebrand history, the code's own
pre-existing rationale comment, Principles/Usage's total silence on a
per-product accent, and CxCentral/New UI's own unified green) — not
replicated, flagged in the MDX for a designer to confirm and fix in Figma
itself. Same wrong-ramp-step pattern as the rest of the audit hit a
seventh time: user-email/icon/instance-label text routed through
`--text-body-primary` (bypassed to `--neutral-800` locally, same as
every other row). The per-product `THEMES` record was collapsed into one
flat `THEME` object since all three green variants share one accent/border
pair — Figma actually names *two* distinct green steps here (accent
`#3a8015` vs. button-border `#629944`), which the old per-product object
was obscuring by giving every variant identical values anyway. Divider
length corrected 36px → 32px. Two **new accessibility requirements** found
in Usage that didn't exist in code at all: utility-icon `aria-label`s must
include the live unread count (e.g. "Notifications, 4 unread"), and a
visually-hidden `aria-live="polite"` region must announce count changes —
both implemented. One token choice confirmed **correct** in this
component specifically, worth not conflating with the "always wrong"
conclusion elsewhere: the badge count text uses
`--text-body-on-dark-surface`, which Figma explicitly names here and which
resolves correctly (`#efefef`) for this context — contrast with Left/Vertical
Nav, where that exact same alias was the *wrong* token choice.

Page Title — closes out G3. **The "Component" Figma link pasted this round
turned out to be a copy-paste carryover of the Top Bar node from the
previous message**, not a real Page Title component link — caught and
not used; built entirely from "Open Page Title" (`3700-1594`) and "Title
Controls" (`2542-4924`) instead, both of which cleanly matched the
requested component. Two real color bugs: Title was wired to the green
`--content-action-primary-default`, but Figma's live component renders
it in plain dark neutral (`text/body/primary`, `#1d1d1d`) — not a brand
color at all; bypassed to `--neutral-800` directly per the usual
wrong-ramp-step workaround. Subtitle was wired to `--text-body-primary`
— wrong semantic token entirely (not just wrong ramp step) — Figma wants
`text/body/secondary`, and that alias already resolves correctly
(`#8d8d8d`) in this codebase, so it was a straightforward token swap, no
bypass needed. Chip text hit the same `--text-on-action-secondary`
wrong-ramp-step bug already confirmed on Horizontal/Vertical Tabs.
Chip was also missing its leading icon entirely (Figma's chip anatomy
always pairs a 12px icon with the label) — added. Title-to-subtitle gap
corrected from 4px to 12px (both the old code AND Usage's own
Specifications table had 4px — component wins). Container padding
corrected from 24px horizontal to a uniform 16px. Actions row alignment
was hardcoded to always vertically center; Figma bottom-aligns it with
the title block whenever actions are present — fixed to be conditional.
**Story-file fix:** `page-title.stories.tsx`'s `DfcHeaderActions` example
(surfaced in the doc's own "DFC Header Controls" code samples) had
fabricated a "Path Tester" button and an Admin/Business User/Reader
segmented-tab control with zero Figma backing, including a one-off
hardcoded teal (`#3d5459`) that doesn't exist anywhere in this design
system — rebuilt to match Figma's real "Title Controls" `User Roles`
variant (Search field + 4 icon-only utility buttons + Role dropdown),
verified live in a temporarily-started Storybook instance since this
repo has no Storybook server running by default and the docs-site
registry playground doesn't exercise the `actions` slot.

## Progress — G4 (IN PROGRESS)

| Component | Status | Priority | Docs |
|---|---|---|---|
| Table | major | P0 | complete (Principles 795-2128 + Usage 795-2129) |
| Table Filter | missing → built | P1 | complete (shared P&U with Table) |
| Pagination | major | P0 | complete (Principles 797-4236 + Usage 797-4251) |
| Metric Tiles | — | — | not started |
| Inline Stats Cards | — | — | not started |
| Inline Context Data | — | — | not started |
| Chips & Tags | — | — | not started |

Table — the existing `components/ui/table.tsx` primitives (`Table`/
`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`/
`TableCheckboxHead`/`TableCheckboxCell`) are a deliberate, more idiomatic
composable abstraction of Figma's "Table Fields Wide/Compact" mega-variant
field component (`69-1408` / `422-7991`) rather than a 1:1 prop-for-prop
port — confirmed this is the intended architecture by the component's own
pre-existing "Cell content types" doc section, which already documents
composing Chip/Tag/Switch/Progress-Bar inline rather than baking every
Figma field type into `TableCell`. **New behavior confirmed and
implemented:** Figma's live component (both Wide and Compact pulls,
independently) recolors `default`- and `link`-variant cell text on row
Hover — this didn't exist in code at all; implemented via a shared
row-hover context `TableCell` now consumes. `secondary`/`visited` have no
Hover variant in Figma, so they intentionally stay static. Table Row
Checkbox (`69-1469`) uncovered three real bugs in `InlineCheckbox`, none
previously caught: idle/unchecked border was pointing at the classic
wrong-ramp-step token (`--content-action-primary-600`) where Figma's idle
*and* checked states share one border; hover fill was pointing at what's
actually the *idle* border token, not a hover value at all, where Figma
wants `--surface-action-primary-hover` (#366618, matching this whole
audit's "hover = -500 step" convention) for both fill and border; disabled
border was off by a near-miss hex (`#cfd7c2` vs. Figma's actual `#cdcdcd`).
All three fixed. Table Title (`571-1533`) has an optional leading-icon
slot `TableHead` had no support for at all — added — plus its
label-to-icon gap was 4px where Figma measures 8px — fixed. Two entirely
unbuilt pieces found: **Table Filter** (`71-16179`) — built as a new,
separately-registered component, see its own row above — and **Table
Field Select** (`273-18568`) — documented as a compose-inline cell
pattern instead (matching the Chip/Tag precedent), since it's just an
icon-or-Counter + label + caret with no border/chrome and no dropdown
panel modeled in Figma's pull; a dedicated component would just duplicate
the DS's existing full-featured `Select` for a narrower case Figma
doesn't clearly justify as its own thing. **Registry DRY fix:** the
`chip`/`tag`/`switch`/`filter` cell-type demos in
`lib/component-registry.ts` previously hand-rolled raw markup with
several stale pre-rebrand hex values (`#4285f4` blue switch track/filter
badge, `#021920` text) that duplicated — badly — this codebase's own
existing `Chip`/`Tag`/`Switch` components; rewired to import and use the
real components (Chip/Tag/Switch's own internal correctness wasn't
re-verified — Chips & Tags gets its own row later in this batch).

Pagination — the code's 4 variants (`directional`, `directional-counter`,
`back-next`, `numbered`) already mapped cleanly onto Figma's 5 `type`
values, and the gaps (8px / 24px for the counter variant) already
matched exactly — structurally this component was in good shape. The
real bug: **every button in every one of the 5 pulled variants renders
on a white background** — the code had idle (and disabled) background
hardcoded to `transparent` everywhere. Fixing that surfaced a second
problem: the pre-existing "current page" background (white,
`--surface-form-field`) would have become indistinguishable from the
now-corrected white idle background, erasing the current-page indicator
Usage's own docs require — recoloured to a solid green fill, an
*inferred* choice since Figma's own component exposes no per-page
"active" state at all (only a single `type` prop controls which UI form
to show) — a real component-vs-its-own-docs contradiction, not a stale-
doc mismatch. Page-number buttons/Ellipsis had no explicit height
(content-driven, ~36px) where Figma measures a fixed 25px; Back/Next
buttons were always sized like the standalone 32px variant even when
paired with page numbers, where Figma shrinks them to match the page
buttons' 25px/36px-min-width sizing — both fixed. The "X of Y" counter
text routed through the classic wrong-ramp-step `--text-body-primary`,
but Figma's own component actually fills that text literal pure black
(`#000000`, no token) — a likely one-off Figma-authoring slip since no
other text anywhere in this DS uses raw black — bypassed to
`--neutral-800` for consistency instead of matching the raw value
literally. **Doc bug found independent of any code change:** the MDX's
own token table claimed `--text-on-action-transparent` resolves to
`#366618` (that's actually the hover green); it resolves to `#3a8015` —
corrected. **Accessibility contradiction flagged, not resolved:**
Usage's own Don'ts require a 44×44px minimum touch target, but the real,
confirmed component renders every button smaller than that in at least
one dimension — component wins per the standing rule since these are
directly-measured live values, but it's worth a designer call.

## Git state

Branch: **`fix/ds-audit-g1-g2-figma-alignment`** (cut from
`claude/assign-worker-flow-prototype-rb4ms4`, which is where this work was
sitting uncommitted by mistake). 23 commits ahead of `main` (2026-09-07 to
2026-09-09):

1. `fix(tokens): correct action and form-field semantic aliases` — the 4 shared globals.css aliases, landed first because of blast radius
2. `fix(g1): align form primitives to Figma tokens and sizing`
3. `fix(button): align variants, sizing, and disabled states to Figma`
4. `feat(message-box): add dark theme, rounded corners, and CTA slot`
5. `fix(g2): close Button Icon Small and apply the Figma docs-frame findings`
6. `docs(audit): track the DS component audit log and handoff`
7. `fix(tokens): point the primary border alias at the -300 ramp step`
8. `feat(counter): add Counter from Figma 68-2468`
9. `refactor(counter): name the colour prop by intent, not colour`
10. `fix(tooltip): repaint from the secondary surface and implement the spec`
11. `feat(dismissible-tip): add Dismissible Tip from Figma 3210-1866`
12. `fix(modal): correct footer icon and border token, restore focus on close`
13. `fix(toast): align panel/shadow/action-button to Figma, fix enter animation`
14. `feat(breadcrumb): build Breadcrumb from Figma 1933-2500` — file rename only; the actual content landed in the next commit (see below)
15. `feat(breadcrumb): add the built component, docs, and registry entry`
16. `fix(tabs): align states, minimal-type sizing, and tab-count cap to Figma`
17. `fix(vertical-tabs): correct active colour, remove row gap, add keyboard nav`
18. `fix(nav): align Left/Vertical Nav to Figma; build the NT Menu redesign`
19. `docs(audit): catch up audit/ commits through Left/Vertical Nav + NT Menu`
20. `fix(top-bar): align product theme, instance styling, and a11y to Figma`
21. `fix(page-title): correct colors, spacing, and DFC controls story to Figma`
22. `fix(table): correct checkbox/link/header tokens, add row-hover recolor; build Table Filter`
23. `fix(pagination): correct idle/active button backgrounds and sizing to Figma` — about to be committed

Not merged to main, no PR opened yet. Note the branch's ancestry still carries
22 commits of Assign-to-Worker v2 prototype + Caylent rebrand work that were
already on this branch.

`audit/` **is tracked** (`HANDOFF-PROMPT.md` and `component-audit-results.csv`
were committed in `e2272da`) — a prior version of this doc wrongly said
otherwise, which let several turns of edits (Modal through Vertical Tabs)
pile up uncommitted. Caught and committed in this pass. The `-paste-*.csv`
files are a mix: `g1`/foundations were committed early on; `g2` (the full
version, replacing a deleted `-partial`) is new and gets committed alongside.

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
- Modal: Figma's Accessibility notes say use `role="alertdialog"` for destructive
  confirmations; modal.mdx explicitly says the opposite ("Do not use
  `alertdialog` unless...system-level alert"). Same category as the Alert
  Messages conflict above — needs a designer call, not a silent code pick.

**Cross-cutting wrong-ramp-step tokens — needs a decision, bigger than one component**
- `--text-body-primary` (`--neutral-700`, `#373737`) is very likely the wrong
  ramp step site-wide. Now confirmed on **nine** rows: G1 Checkbox & Radio
  (first local workaround, switched to `--neutral-800` directly); Modal's
  Header node (`Text/Body/Primary = #1d1d1d`); Toast's component node (same);
  Horizontal/Vertical Tabs; Left/Vertical Nav (via `nav-item.tsx`'s own
  `text-on-action-secondary` comment noting the same underlying split); Top
  Bar's user-email/icon/instance-label text; Page Title's title text
  (previously wired to the green accent token instead, masking the same
  underlying alias bug until the component was actually compared against
  Figma); and now Table's header label + default cell text. `--neutral-800`
  (`#1d1d1d`) already exists as the correct value. NOT fixed globally —
  `--text-body-primary` also backs `--color-text-primary`, `--foreground`,
  `--secondary-foreground`, `--accent-foreground`, `--card-foreground`, and
  `--popover-foreground`, so repointing it changes text colour app-wide
  across dozens of components already marked aligned/complete. Every row
  above follows the same local workaround (points at `--neutral-800`
  directly) rather than touching the shared alias. Needs an explicit go/no-go
  on the global sweep, not another silent per-component workaround.
- `components/foundations/colors.stories.tsx` (the Colors foundation, marked
  **aligned** before the audit walk even started) hardcodes `#204704` for
  `--color-text-action`, `--color-icon-action`, and `--color-surface-action-primary`
  ("Primary") — the exact wrong-ramp-step value fixed on Button, Counter,
  Switch, Dropdown, and now Toast throughout this entire audit. The Colors
  foundation has clearly gone stale for the whole Action-color family and
  needs its own re-pass; not touched here, out of scope for a single
  component row.
- `--icon-success` (`--success-300`, `#87d95e`) is also very likely wrong —
  Toast's own MDX already documented the correct value (`#4b9924` =
  `--success-500`) before this audit even touched it. Not repointed globally
  because Message Box also consumes `--icon-success` and wasn't re-verified
  against Figma this pass; Toast's CheckCircle now points at `--success-500`
  directly instead. Worth a quick Message Box re-check, then decide on the
  global alias.
- `--text-action` (`--content-action-primary-600`, `#204704`) and
  `--text-on-action-secondary` (`--neutral-700`, `#373737`) join the list —
  both confirmed wrong by direct Figma reads on Horizontal Tabs (should be
  `#3a8015` / `#1d1d1d`). `--text-action` alone has real blast radius beyond
  Tabs: this row correctly predicted it was also consumed by `table.tsx` —
  now confirmed and fixed there too (`textLink`, Table's link-cell text),
  plus it's still consumed unverified by `Sidebar.tsx` and several
  un-audited `open-inventory` components. Tabs and Table both bypass it
  locally, same pattern as above. `--text-on-action-secondary` was
  confirmed wrong a **second** time
  on Vertical Tabs the same session — its Default-state text token reads
  the identical `#373737`-instead-of-`#1d1d1d` split — and a **third** time
  on Page Title's chip text. This is now five confirmed tokens in the
  same wrong-ramp-step family (`--text-body-primary`, `--icon-action`,
  `--icon-success`, `--text-action`, `--text-on-action-secondary`), hit
  across eight component rows total — worth asking whether there's a systemic cause (e.g. a bulk
  find-replace during the rebrand that landed one ramp step short) rather
  than treating each as an isolated bug.
- `--surface-action-primary-hover` joins the list too, but with a twist:
  blast-radius check found **zero real consumers** anywhere before this
  pass (only the token definition itself and the non-consuming reference
  map in `lib/tokens.ts`), so it was safe to fix outright rather than just
  flag-and-bypass. Now fixed globally and consumed for real by
  `nav-item.tsx` and `Sidebar.tsx`.
- `--text-body-on-dark-surface` is a related but distinct case: it's not
  necessarily wrong in absolute terms (Counter, Tooltip, DismissibleTip,
  and Message Box all consume it and weren't re-checked), but the Left
  Nav showcase in `app/components/[slug]/page.tsx` had picked the *wrong
  semantic token entirely* for its text colour (this one resolves to
  `--neutral-100` #efefef; Figma's actual token for that spot is
  `text/on-action/primary`, i.e. `--neutral-50` #f8f8f8). Swapped locally
  to the correct alias rather than touching the shared one. **Important
  nuance confirmed on Top Bar:** this is a wrong-token-*choice* bug, not a
  wrong-*value* bug — Top Bar's own notification badge explicitly wants
  `text/body/on-dark-surface` in Figma, and the alias resolves correctly
  there (`#efefef` matches exactly). Don't generalize "this alias is wrong"
  from the Left Nav case; it's context-dependent on which spot in Figma is
  actually being read.

**Unverified from the fix passes**
- `--text-form-field-disabled` (now `neutral-300`) was a placeholder.
- Alert dark-theme icon colour uses the neutral on-dark text colour as a guess.
- Button icon glyph colours (21+ baked SVG assets) assumed to inherit via
  `currentColor`, not pixel-verified.
- Dropdown's closed-trigger node was never supplied, so trigger radius/border/
  caret/disabled/error remain unchecked.
- Modal: no panel/backdrop/body node exists anywhere in the Figma file — panel
  shadow and body padding are doc-only claims, unverifiable against Figma.
- Modal: backdrop/rest-of-page `aria-hidden`/inert while open, required by
  Figma's a11y notes, is not implemented — it's an app-shell change, not
  something `modal.tsx` alone can do. Left as an open gap.
- Toast: the dismiss (×) button has zero Figma backing — no node, variant, or
  docs mention anywhere in Anatomy or Behaviour. Kept (Principle #2 hints
  errors "may... require manual dismissal") but flagged, not verified.
- Breadcrumb: caret separator colour is a baked SVG asset — matched to the
  existing inline JSX's own `--neutral-300` convention, not pixel-verified.
- Horizontal Tabs: Minimal-type active underline width (1px) is inferred
  from the absence of a Tailwind width modifier on the component's `border-b`
  class, not an explicit numeric spec.
- Vertical Tabs: no Hover state exists in Figma at all for this component
  (only Default/Active/Disabled) — the hover tint is pure inference, kept
  and re-tinted from the corrected active green but never spec'd either way.
- Vertical Tabs: keyboard nav was implemented by direct pattern-match to
  Horizontal Tabs' already-verified `onKeyDown` logic, not independently
  re-tested key-by-key in the browser this pass.
- Left Nav: `bkgTheme="Cases"` and `iconFamily="Brand"|"Phosphor"` exist as
  formal Figma variant axes with zero doc or code backing. Not built —
  the existing `darkMode: boolean` + freeform icon-slot API already covers
  the practical need without a 1:1 prop translation.
- NT Menu: the vertical tree-connector line height is a row-height formula,
  not Figma's own five-magic-number lookup table (28/73/119/164/209px for
  1-5 sub-items) — visually close, not pixel-identical. No Principles or
  Usage doc exists for this component yet, so the whole build is read
  directly off component nodes with nothing to cross-check against.
- Top Bar: icon asset weight difference between CxCentral's bell icon and
  CxPortal/Cases' — Figma appears to use a bolder/duotone asset with an
  extra loop mark for the latter two, but it's a flattened SVG export with
  no readable exact Phosphor weight. Flagged, not guessed at; code uses one
  consistent `weight="regular"` everywhere.
- Top Bar: the "New UI" variant has zero Principles/Usage backing, same
  situation as NT Menu — built directly off the component node with
  nothing to cross-check against.
- Page Title: the "Metadata Section" / "Title w KB Details" anatomy piece
  (version, dates, associations) is documented as a live, non-deprecated
  Figma variant, but no concrete component node showing it was supplied
  this pass — not built, flagged rather than guessed at.
- Table: keyboard-focus / "Active" row state — Usage's own Table Row
  States table and Accessibility section both call for a fourth
  state ("Active/Focused" — focus ring or highlight, keyboard nav
  required) that `TableRow` has zero support for (no `tabIndex`, no
  focus tracking, no ring). Not built — Figma gives no exact visual
  spec, and deciding which rows should even become focusable is a
  product decision, not a token-alignment fix.
- Table Filter: Figma models three Active-state digit-count variants
  (01/02/03) with three hardcoded badge widths; the built component
  sizes the badge with `minWidth` + padding instead, matching any count
  without replicating three near-identical variants literally.
- Table Field Select (`273-18568`): documented as a compose-inline cell
  pattern (icon-or-Counter + label + caret) rather than built as its own
  component — no dedicated component node justifies duplicating the
  DS's existing full-featured `Select` for this narrower, chrome-less
  case.
- Pagination: no per-page "active/current" state, Hover, or Disabled
  variant exists anywhere in Figma's pull (the component's whole API
  surface is a single `type` prop). The current-page green fill, hover
  tint, and disabled colors are all inferred/pre-existing choices, not
  Figma-confirmed.
- Pagination: the "X of Y" counter text is literal pure black (`#000000`,
  no token) in Figma's own component — no other text anywhere in this DS
  uses raw black. Treated as a Figma-authoring slip, bypassed to
  `--neutral-800` instead of matched literally.

**Pagination — 44×44px touch-target requirement, needs a designer call**
- Usage's own Don'ts explicitly say "Don't make pagination buttons too
  small for touch targets (min 44×44px)." The real, directly-measured
  component renders every button smaller than that in at least one
  dimension (32px/25px tall, 36px page-button width). Component wins per
  the standing rule — these aren't stale-doc guesses, they're the live
  component's own confirmed pixel values — but this is a genuine
  component-vs-its-own-docs contradiction, not the usual stale-prose
  mismatch pattern seen elsewhere in this audit.

**Horizontal Tabs — Figma-internal contradiction, needs a designer call**
- Principles (`2544-75780`) explicitly caps tab count at "2, 3, or 4 — do not
  exceed 4", repeated in its own When to Use / When Not to Use sections. But
  the Tab Group component (`280-20700`) ships a labelled `Size=05` variant
  with 5 tabs, screenshot-rendered. Component wins per the standing rule —
  code and docs now say 2-5 — but the Principles text itself is still wrong
  and needs a designer fix, not just a doc-side workaround.

**Breadcrumb — needs a designer call, same category as the other conflicts**
- Three-way colour conflict: the live component renders every label
  (ancestor and current) in green (`--text-on-action-transparent`,
  `#3a8015`); Principles + Usage's Accessibility note both claim a
  nonexistent token (`--text/breadcrumb`, `#323840`); Usage's own Token
  Reference table claims a third value (`#7a828c`) that doesn't match any
  real token either. Built with the component's green per the standing
  rule, but a bold, non-link "current page" label in link-green is worth a
  second look — Principles' own anatomy explicitly wants it visually
  distinct from clickable ancestors.
- 14+ existing inline breadcrumb call sites across the app (access-management,
  campaigns-email, wfm reporting) were **not** migrated to the new shared
  component. They also skip the accessibility requirements the new component
  implements (`<button onClick>` instead of real links, no `<ol>/<li>`
  structure) — a real gap, just not touched this pass.

**Left/Vertical Nav — architectural duplication, flagged not fixed**
- `Sidebar.tsx` (the real production sidebar) doesn't consume
  `nav-item.tsx`'s `NavMenuItem`/`NavSubItem`/`NavMenuItemCollapsed` at
  all — it's a completely separate, hand-rolled implementation of the same
  visual language with its own token object. Both were fixed to the same
  corrected colours/sizing this pass, but they're still two
  implementations of one component. Consolidating them is a real
  refactor (Sidebar.tsx also carries framer-motion animation, active-group
  routing logic, and status badges nav-item.tsx doesn't have) — not
  attempted here.
- Given the NT Menu redesign is coming, this may resolve itself: once NT
  Menu replaces the live sidebar, `nav-item.tsx`'s dark-theme family
  becomes legacy rather than something worth reconciling with `Sidebar.tsx`.

**Registry leftover spotted, not fixed:** the Button playground wraps colored-bg
in `bg-[#4285f4]` — a hardcoded Google blue the Caylent rebrand sweep missed.
Needs a decision on which surface colour the demo should use.

**Top Bar — CxPortal purple, needs a designer call**
- Figma's live `cx-portal` variant of the component renders a lavender/purple
  accent (`#b2a3ff` fill / `#d6d7ff` on brand text) instead of the green every
  other variant (CxCentral, Cases, New UI) uses. Neither Principles nor Usage
  mention a per-product accent colour at all. Reasoned as a stale
  pre-Caylent-rebrand ("Pronetx purple") leftover in Figma rather than a
  deliberate distinct identity — not replicated in code, a deliberate
  exception to the standing "component wins over docs" rule (justified from
  project history, not from doc-vs-component precedence). Worth a designer
  confirming and updating the Figma component itself, since as-is it
  contradicts the rest of the family.

**Page Title — `<h2>` vs `<h1>`, needs a decision**
- Figma's Usage doc says the page title "should be the first heading
  element on the page for screen reader navigation," which argues for
  `<h1>`. Not changed — at least three routes
  (`access-management/roles|users|companies/[id]`) already render their
  own literal `<h1>` for a record name via a shared layout that also
  renders this component, so switching to `<h1>` would create duplicate
  top-level headings on those specific pages. Left as `<h2>`, flagged
  for whoever owns the app's heading hierarchy rather than resolved here.

## Immediate next actions

1. Paste `component-audit-results-paste-g2.csv` into the sheet — the full G2
   batch (Button, Alert Messages, Counter, Tooltip, Modal, Toast). The whole
   of G3 (Breadcrumb, Horizontal Tabs, Vertical Tabs, Left/Vertical Nav, Top
   Bar, Page Title) and Table + Table Filter + Pagination (G4 so far) still
   need their own paste blocks produced.
2. Get a designer call on the Figma-internal/docs contradictions logged above:
   old variant model on Usage 742-11289; multi-line Alert vs its own docs;
   Modal's `role="alertdialog"` conflict; Modal's missing `xlarge` Figma frame;
   Breadcrumb's three-way colour conflict; Horizontal Tabs' 4-vs-5-tab cap;
   Top Bar's CxPortal-purple-vs-green accent; Page Title's `<h2>`-vs-`<h1>`
   heading-hierarchy tension; Table's keyboard-focus row state (documented,
   unbuilt); Pagination's 44×44px touch-target contradiction and its
   missing current-page/hover/disabled Figma variants.
3. Decide on the cross-cutting wrong-ramp-step token sweep (see Cross-cutting
   thread above) — six confirmed tokens, `--text-body-primary` alone now
   hit on nine component rows. Worth asking whether this is one systemic
   rebrand-migration bug rather than isolated ones.
4. Audit Combobox (2255-8066) to actually close G1 — still the one hole in that batch.
5. Continue G4: Table, Table Filter, and Pagination are done. Next — Metric
   Tiles, Inline Stats Cards, Inline Context Data, Chips & Tags.
6. Add a `select` cellType demo to the Table registry playground for parity
   with chip/tag/switch/filter — skipped this pass (polish, not a Figma
   drift fix) since "Table Field Select" was documented as compose-inline
   rather than built as its own component.
7. Decide whether to migrate the 14+ existing inline breadcrumb call sites to
   the new shared component — not done this pass, flagged only.
8. Decide whether to consolidate `nav-item.tsx` and `Sidebar.tsx`'s duplicated
   implementations — not done this pass, flagged only.
9. Test the new NT Menu pattern (`/components/nt-menu`) and decide when to
   wire it into `Sidebar.tsx` as the live default, per the user's own framing.
10. Decide whether to open a PR for the branch.

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
