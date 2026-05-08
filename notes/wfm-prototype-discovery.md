# WFM Prototype Discovery — PRDENG-2660

## 1. Project Foundations

- **Next.js version**: 16.2.2 — App Router (confirmed, `app/layout.tsx`)
- **Package manager**: npm (`package-lock.json` present)
- **TypeScript**: strict mode (`tsconfig.json`)
- **CSS approach**: Tailwind v4 with `@theme inline` mapping CSS vars to Tailwind tokens

---

## 2. Design System Location

### Tokens
All design tokens live in `app/globals.css` under two blocks:
- `:root {}` — CSS custom properties (`--color-primary`, `--radius-md`, etc.)
- `@theme inline {}` — maps those vars into Tailwind's `color-*`, `radius-*` utilities

No separate token file. Tokens are used via `style={{ color: 'var(--color-text-primary)' }}` or Tailwind classes like `text-text-primary`.

### Component library
- **Location**: `components/ui/` — all custom-built (no shadcn components installed)
- **Icons**: `@phosphor-icons/react` (exclusively used, weight="thin"|"regular"|"fill")
- **Animation**: `framer-motion` v12

---

## 3. Existing UI Primitives — Import Paths

| Primitive | Path | Notes |
|-----------|------|-------|
| Button | `@/components/ui/button` | Variants: primary, secondary, ghost |
| Input | `@/components/ui/input` | Sizes: regular, small |
| Select / multi-select | `@/components/ui/select` | Has `multiSelect`, `searchable`, `size` props |
| Date Picker | `@/components/ui/date-picker` | Single date; no range picker — GAP |
| Checkbox | `@/components/ui/checkbox` | Standalone + inside Table |
| Chip (dismissible) | `@/components/ui/chip` | `ChipProps.onDismiss` for filter chips |
| Tag (pill) | `@/components/ui/chip` | Neutral pill, no semantic color |
| Modal | `@/components/ui/modal` | `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter` |
| Table | `@/components/ui/table` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCheckboxCell` |
| Tabs | `@/components/ui/tabs` | Horizontal tabs |
| Vertical Tabs | `@/components/ui/vertical-tabs` | — |
| Tooltip | `@/components/ui/tooltip` | Hover-based, 4 placements |
| Skeleton | `@/components/ui/loading` | `Skeleton` component (rect/circle/text variants) |
| Spinner | `@/components/ui/loading` | `Spinner` component |
| MessageBox (Alert/Banner) | `@/components/ui/message-box` | info/success/warning/error variants, inline |
| Toast | `@/components/ui/toast` | Notifications |
| StatCard | `@/components/ui/stats-cards` | Closest to KpiTile; lacks threshold band + sparkline |
| Switch | `@/components/ui/switch` | Toggle |
| Pagination | `@/components/ui/pagination` | — |
| NavItem | `@/components/ui/nav-item` | — |
| TopBar | `@/components/ui/top-bar` | Page top bar / header strip |
| PageTitle | `@/components/ui/page-title` | Page title + breadcrumb |
| Stepper | `@/components/ui/stepper` | Multi-step wizard UI |

### Chart library
- **Recharts v3** — already in `components/charts/GraphCard.tsx`
- Chart types: area, bar, line, pie, radial
- Wrappable sparkline: `LineChart` with `ResponsiveContainer` (no standalone sparkline — will build minimal one in KpiTile)

### App shell
- **Sidebar**: `components/layout/Sidebar.tsx` — collapsible nav, fixed left rail, 240px expanded / 64px collapsed
- **App layout**: `app/layout.tsx` — `<Sidebar />` + content div with `marginLeft: var(--sidebar-w)`
- No top bar / page header in the root layout; each page handles its own header

---

## 4. Routing Pattern

- App Router, file-based routes under `app/`
- No route groups `(groupName)/` — flat nesting: `app/sandbox/login-report/page.tsx`
- Sub-routes live as sibling directories with their own `page.tsx`
- WFM target: `app/wfm/reporting/real-time-workforce/page.tsx`
- Sibling stubs will be: `agent-status-summary/`, `agent-scorecard/[agentId]/`, `supervisor-scorecard/[scope]/`

---

## 5. Existing Patterns

| Concern | Pattern |
|---------|---------|
| Mock data / fixtures | None — data is inline in component files |
| State management | Local `useState`/`useReducer` only — **no Zustand, no React Query, no Context** |
| Data fetching wrapper | None — no SWR, no TanStack Query |
| RBAC / auth hooks | **None** — will build `useCurrentUser()` from scratch |
| Keyboard hooks | None — will use simple `useEffect` listener |
| Naming — files | PascalCase.tsx for components, camelCase.ts for utils |
| Naming — exports | Named exports (no default exports) |
| Co-location | Stories colocated (`button.stories.tsx`); no test files seen |

---

## 6. Gaps — Components Not in Repo

These must be built for this prototype family, placed under `components/wfm/`:

| Component | Notes |
|-----------|-------|
| `<HierarchyFilter />` | Cascading multi-select; URL sync; time-range presets |
| `<KpiTile />` | Threshold band, sparkline, stale/loading/unknown/empty states, pulse |
| `<StatusPill />` | Agent status with AUX mapping support |
| `<ActivityPill />` | Productive / Non-Productive / Time Off |
| `<AdherenceBadge />` | Out-of-adherence indicator |
| `<DegradedSourceBanner />` | Top-of-page cached-as-of banner |
| `<DrillOutLink />` | External FCS report link, role-gated |
| `<Flyout />` | Right-rail flyout (no drawer primitive exists) |
| `<AlertConfigFlyout />` | Alert list + create/edit form |
| `<MetricTrendFlyout />` | Per-metric trend chart in right flyout |
| `<RoleSwitcher />` | Dev tool — header dropdown |
| `<ForceStateTool />` | Dev tool — force state popover |
| `useCurrentUser()` | Hook — role + default scope |
| `mocks/wfm/store.ts` | React Context store + mock generators |

---

## Addendum — PRDENG-2662: Chart Library Decision

**Decision**: Use Recharts v3 (already in repo at `recharts@^3.8.1`).

**Rationale**: Recharts is already used in `components/charts/GraphCard.tsx` and in `KpiTile.tsx` (for sparklines). Introducing a second chart library would split chart rendering patterns and increase bundle size unnecessarily.

**Wrapper**: `AdherenceTrendChart` built at `components/wfm/charts/AdherenceTrendChart.tsx`. This is the shared component that PRDENG-2663 will reuse for team-level rollup.

**What the wrapper handles**:
- Maps design-system tokens to chart colors
- All 5 states (loading/data/empty/error/stale)
- `prefers-reduced-motion` via Framer Motion's `useReducedMotion`
- Grace-period band via Recharts `ReferenceArea`
- Event markers via custom `dot` prop function (circle/triangle/square shapes)
- Tabular toggle for screen-reader alternative
- Keyboard navigation (Tab to enter, arrows to navigate, Enter to open flyout)

**Not added**: No second chart library. No Recharts upgrade required.

---

Primitives that **exist but need extension**:
- `StatCard` → `KpiTile` is a net-new component (different enough not to extend)
- `Chip` → used for filter chips (dismissible variant already exists)
- `Modal` → `Flyout` reuses the same panel/portal pattern but anchored right
- `MessageBox` → used for inline error states inside panels
