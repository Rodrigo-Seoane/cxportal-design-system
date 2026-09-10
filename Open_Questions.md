# Open Questions

Unresolved design/product decisions surfaced during development or audit. Each entry should be closed out (moved to a "Resolved" section or deleted) once a designer/PM makes the call, with the resolution optionally promoted to LESSONS.md if it teaches a reusable lesson.

---

- **Pagination — active/current-page style is invented, not Figma-confirmed.** Figma's pulled variants show no distinct "current page" treatment despite docs requiring one; the current solid-fill active state was invented. Needs Figma confirmation. Possible duplicate of an existing note in content/components/pagination.mdx — check before filing twice. (components/ui/pagination.tsx:15-27)

- **Dismissible Tip — two Figma defects replicated as-is.** (1) Secondary theme has no visual difference between Dark/Light in Figma. (2) Container width is inconsistent across the Figma component set vs. the Usage demo (300/281 vs 274/257px) — code standardized on 300px and exposes a `width` prop. Confirm with design whether these are Figma bugs to fix upstream or intentional. (components/ui/dismissible-tip.tsx:7-13)

- **Stats Cards — `surface="blue"` prop renders gray, not blue.** Matches Figma's own naming oddity. Confirm intended color/naming with design. (components/ui/stats-cards.tsx:100-103)

- **Vertical Tabs — Hover state has no Figma spec.** No Hover state exists on the component in Figma; the current value is invented, tinted from the corrected active green. Verify with design if/when a Hover spec is added. (components/ui/vertical-tabs.tsx:31-32)

- **Deprecated cxportal-purple ramp has no successor token.** The old cxportal-purple color ramp is deprecated post-rebrand with no successor defined. app/system/status/page.tsx's "sandbox" category badge still uses hardcoded hex (#f0ebf8/#4a1a6b) as a result, and several --raw-cxportal-purple-* tokens in app/globals.css sit unused (tied to a "Former Pronetx Blue mode" that was never built). Needs a design decision: pick a successor token, or remove the dead purple tokens/mode reference. (app/system/status/page.tsx:56-57; app/globals.css:79)

- **Sidebar logo mark is still a placeholder.** Pronetx "P" shape pending the real Caylent-rebrand logo asset from the user. (components/layout/Sidebar.tsx:501)

- **Agent Status Summary table virtualization is a stand-in.** Row "virtualization" is a simple scroll-offset calc on fixed-height rows, not real virtualization. Swap for @tanstack/react-virtual before shipping to production. (app/wfm/reporting/agent-status-summary/AgentTable.tsx:3-6)

- **Campaigns Email TEMPLATE_VARIABLES is placeholder mock data.** Standing in for the real variable list pending the Connect integration. Confirm the final variable set once that integration lands. (app/sandbox/campaigns-email/_mock/templates.ts:25)

- **Module Action Modals field labels were inferred, not Figma-confirmed.** (Enable Module / Set Manual Deploy / Download CF Template) — the design context fetch fell outside a prior session's budget; fields were inferred from each modal's alert+input+toggle shape and the row kebab's 3 actions. Needs a Figma pass to confirm actual field labels/copy. (components/access-management/ModuleActionModals.tsx:9-12)

- **Task Queue Visibility v2 prototype is missing three DS primitives.** No DS Radio at region level (role="radio" composed manually in table cells), no DS StickyBar (inline position:sticky), no reusable numbered-slot component (StackedStepSection is prototype-local). Promote to components/ once a second consumer appears. (app/open-inventory/task-queue-visibility-v2/page.tsx:38-44)

- **AdherenceBadge `@deprecated` marker may be premature.** All 4 live call sites still use the "deprecated" `adherence` prop; zero use the "recommended" `state` prop. Migrate call sites, or reconsider the deprecation until adopters exist. (components/wfm/AdherenceBadge.tsx:9)

- **combobox.mdx and drawer.mdx describe components that don't exist yet.** Both docs are `status: stable` but there is no live Combobox or Drawer component anywhere in the tree — visiting either doc route 404s today. Confirm: build the components, or mark the docs as not-yet-built / remove them. (content/components/combobox.mdx; content/components/drawer.mdx)

- **breadcrumb.mdx: 14+ inline breadcrumb call sites not yet migrated to the `Breadcrumb` component.** Real backlog item, out of scope for a quick fix — needs its own migration pass. (content/components/breadcrumb.mdx:13)

- **`lib/tokens.ts`'s 11 unused named exports** (`raw`, `semantic`, `context`, `scale`, `borderWidth`, `borderRadius`, `fontFamily`, `fontWeight`, `textSize`, `colors`, `SpacingUnit`). Zero current importers, but read as an intentionally-exposed public API surface mirroring the Figma variable collections 1:1. Keep-or-prune decision needed — not deleted in the 2026-09-10 codebase audit pending that call. (lib/tokens.ts)

- **`nav-item.tsx` / `nt-menu.tsx` are duplicated, not dead.** `components/layout/Sidebar.tsx` hand-rolls its own nav markup instead of consuming `NavMenuItem`/`NavSubItem`/`NavMenuItemCollapsed` (or `nt-menu`'s components once that redesign ships). Both files are live via the DS docs/registry but unused by the real product sidebar. The fix is a real refactor of `Sidebar.tsx` onto these primitives, not a deletion — tracked here as a backlog item. (components/layout/Sidebar.tsx; components/ui/nav-item.tsx; components/ui/nt-menu.tsx)

- **`docs/email_campaigns/figma_styles_02_sep.json` provenance comment is stale.** `app/foundations/colors/semantic-tokens.ts:2` cites this Sep-2 export as its source; the current canonical export is root-level `figma_styles.json` (dated 2026-09-10). Update the provenance comment, or confirm the Sep-2 files are intentionally kept as historical snapshots. (app/foundations/colors/semantic-tokens.ts:2)

---

## Resolved (2026-09-10, for reference)

- ~~**Instance Card — no token matches Figma's border colors** (#aab0b8/#eff1f3).~~ Resolved: Default → Neutral-300 (#adadad, already correct); Disabled → Neutral-100 (#efefef), `--border-color-surface-active-secondary-disabled` repointed accordingly. Also applied to `FilterRail.tsx`, `lib/component-registry.ts` codegen snippets, and `assign/_data.ts`'s "Logged Off" status color (all former #eff1f3/#aab0b8 mentions).
- ~~**`--surface-overlay` matches a pre-rebrand Pronetx-blue hex with no figma_styles.json ground truth.**~~ Resolved: confirmed as Surface/Overlay → Caylent Green 900 (#030901) at 70% opacity.
- ~~**Alpha-0 surface variants have no direct Context-collection citation.**~~ Resolved: kept as 0%-opacity mixes of their already-correct mapped tokens (Neutral/0, Content Action/Disabled/50), now expressed via `color-mix()` referencing the named token instead of an unlabeled raw rgba tuple.
