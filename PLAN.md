# CxPortal Interactive Design System

## Context
Build a standalone interactive design system website for the CxPortal SaaS product. The Figma file (`exoHhvasbJSziVGakV8Y0r`) is the source of truth for all tokens and component specs. The site is a **living system** — it grows alongside CxPortal, never frozen. It has two distinct modes:

1. **Documentation** — canonical reference for stable tokens and components
2. **Sandbox** — a shared space to build, test, and validate new components/features with devs and stakeholders before they graduate into the documented system

The design system tokens and components are always the starting point for anything built in the Sandbox.

Root folder: `/Users/rodrigo.seoane/local-sites/pronetx/project_portal/`

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Mirrors CxPortal's React stack; layout nesting maps to sidebar nav |
| Styling | Tailwind CSS v4 + Shadcn/ui | Exact match to CxPortal's stack |
| Language | TypeScript (strict) | — |
| Component playground | `react-live` | In-browser JSX, no iframe, can import local tokens/components directly |
| Docs content | MDX via `next-mdx-remote/rsc` | Docs live in-repo, versioned, reviewed like code |
| Syntax highlighting | `rehype-pretty-code` + Shiki | Same highlighter as Shadcn's docs site |
| Icons | `@phosphor-icons/react` | Confirmed in Figma file |
| Font | Mona Sans (self-hosted variable font) | Confirmed in Figma design tokens |
| Color utils | `color2k` | Lightweight, no chroma-js |

---

## Design Tokens (from Figma)

**Colors**
- Primary: `#4285f4`
- Text: primary `#021920`, secondary `#7a828c`, on-dark `#eff1f3`
- Surfaces: section `#ffffff`, display/panel `#eff1f3`, nav `#050326`, form field `#ffffff`, zebra row `#f8f8f8`
- Status:
  - Success 100: `#ddf4d2` · Success 200: `#b5e89c`
  - Warning 100: `#fbeed8` · Warning 200: `#f7ddb1`
  - Error 100: `#fbc6d4` · Error 200: `#f792ac`
  - Info 100: `#d6e2f5` · Info 200: `#a4beea`

**Typography** — Mona Sans (variable font), 4 weights used: 300 / 400 / 600 / 800

| Style | Size | Line Height | Weights available |
|---|---|---|---|
| H1 | 28px | 34px | 400 |
| H2 | 24px | 30px | 400 |
| H3 | 20px | 28px | 400 |
| H4 | 18px | 24px | 400 |
| H5 | 18px | 24px | 400 |
| H6 | 16px | 24px | 400 |
| Body XL | 18px | 28px | 300, 400, 600, 800 |
| Body LG | 16px | 24px | 300, 400, 600, 800 |
| Body MD | 14px | 20px | 300, 400, 600, 800 |
| Body SM | 12px | 20px | 300, 400, 600, 800 |
| Body XS | 10px | 16px | 300, 400, 600, 800 |
| Caption Regular | 10px | 12px | 600 (4px letter-spacing) |
| Caption Large | 12px | 16px | 600 (4px letter-spacing) |
| Caption Small | 8px | 12px | 600 (4px letter-spacing) |

**Spacing** — Tailwind-based 4px unit system. Full scale (rem units × 4px):
`0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96`
(i.e. 1 unit = 4px → scale/4 = 16px, scale/8 = 32px, etc.)

**Border Radius:** xs:2px · sm:4px · md:8px · lg:16px · round:64px

---

## Project Structure

```
project_portal/
├── app/
│   ├── layout.tsx                    # Root layout: sidebar + topbar shell
│   ├── page.tsx                      # Overview / redirect
│   ├── foundations/
│   │   ├── colors/page.tsx
│   │   ├── typography/page.tsx
│   │   ├── spacing/page.tsx
│   │   ├── border-radius/page.tsx
│   │   └── icons/page.tsx
│   ├── components/
│   │   ├── layout.tsx
│   │   └── [slug]/page.tsx           # Dynamic component doc pages
│   └── sandbox/
│       ├── layout.tsx                # Sandbox shell (minimal chrome, share button)
│       ├── page.tsx                  # Sandbox index: list of experiments
│       └── [experiment]/page.tsx     # Individual experiment/prototype page
├── components/
│   ├── ui/                           # Shadcn-generated (do not edit)
│   ├── ds/                           # Design system display components
│   │   ├── TokenSwatch.tsx
│   │   ├── TypographyScale.tsx
│   │   ├── SpacingGrid.tsx
│   │   ├── RadiusDemo.tsx
│   │   ├── ComponentPreview.tsx      # react-live playground wrapper
│   │   ├── PropControls.tsx          # Interactive knobs
│   │   ├── CodeBlock.tsx
│   │   └── DosDonts.tsx
│   ├── sandbox/
│   │   ├── SandboxShell.tsx          # Full-screen preview wrapper
│   │   ├── SandboxEditor.tsx         # Live code editor panel
│   │   ├── SandboxToolbar.tsx        # Share, reset, DS token picker
│   │   └── ExperimentCard.tsx        # Card on sandbox index page
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── mdx/
│       └── MDXComponents.tsx         # MDX component registry
├── content/
│   ├── components/
│   │   └── *.mdx                     # One MDX file per component
│   └── sandbox/
│       └── *.mdx                     # One MDX file per experiment (description, status, links)
├── lib/
│   ├── tokens.ts                     # SINGLE SOURCE OF TRUTH for all tokens
│   ├── component-registry.ts         # slug → component import + propSchema
│   ├── sandbox-registry.ts           # experiment slug → metadata + default code
│   └── mdx.ts                        # next-mdx-remote loader helpers
├── styles/
│   └── globals.css                   # Tailwind v4 @theme block + CSS vars
└── public/
    ├── fonts/MonaSans/
    └── figma-screenshots/            # Static PNGs per component
```

---

## Critical Files

- `lib/tokens.ts` — typed token objects; everything derives from this; create first
- `styles/globals.css` — `@theme` block mapping tokens → CSS vars → Tailwind utilities
- `components/ds/ComponentPreview.tsx` — react-live wrapper with PropControls; core interactive feature
- `lib/component-registry.ts` — drives both the playground and sidebar nav
- `lib/sandbox-registry.ts` — drives sandbox index and experiment routing
- `components/sandbox/SandboxShell.tsx` — the full-screen canvas for building/testing new work
- `content/components/button.mdx` — reference MDX template for all component docs

---

## Implementation Roadmap

### Phase 1 — Scaffold & Token Foundation ✅
**Milestone:** Running app at `localhost:3400` with correct brand colors, Mona Sans, and shell layout.

1. `npx create-next-app@latest . --typescript --tailwind --app`
2. `npx shadcn@latest init`
3. Create `lib/tokens.ts` with all Figma token values (typed, as const)
4. Configure `app/globals.css` with Tailwind v4 `@theme` block
5. Self-host Mona Sans variable font in `public/fonts/MonaSans/`
6. Build `Sidebar.tsx` and `TopBar.tsx` (nav color `#050326`)
7. Wire `app/layout.tsx`

### Phase 2 — Design Tokens Explorer ✅
**Milestone:** All `/foundations/*` pages render, accurate to Figma.

- `TokenSwatch.tsx` — swatch card with hex, CSS var name, copy button
- `TypographyScale.tsx` — live preview row per type style
- `SpacingGrid.tsx` — visual ruler per spacing value
- `RadiusDemo.tsx` — five boxes per radius token
- Icons page — searchable Phosphor icon grid

### Phase 3 — Component Playground Infrastructure ✅
**Milestone:** Button page has a fully working interactive playground.

- Install `react-live`
- Build `ComponentPreview.tsx` (code + scope + propSchema → live preview + copy)
- Build `PropControls.tsx` (renders select/boolean/text controls from propSchema)
- Create `lib/component-registry.ts`
- Implement Button as the reference: 4 variants × 3 sizes × 4 states

### Phase 4 — MDX Documentation System ✅
**Milestone:** `/components/button` renders full docs from MDX with embedded playground.

- Install `next-mdx-remote`, `rehype-pretty-code`, `shiki`
- Build `lib/mdx.ts` with `getComponentDoc(slug)`
- Build `MDXComponents.tsx` (maps `<ComponentPreview>`, `<TokenSwatch>`, `<DosDonts>`, etc.)
- Build `DosDonts.tsx`
- Write `content/components/button.mdx` (Overview, When to Use, Anatomy, Variants, Accessibility, Do/Don't, Code)
- Wire `app/components/[slug]/page.tsx`

**Also completed:** Colors page redesigned to match Figma Mapped/Light spec — horizontal swatch cards (4px radius, 36×36 color square, hex copy chip), 4 sections × 16 sub-groups, full-width responsive flex-wrap layout.

### Phase 5 — Core Component Set ✅
**Milestone:** All stable components fully documented and interactive.

**Stable (MDX + playground complete)**

| Priority | Component | Slug |
|---|---|---|
| 1 | Button | `button` |
| 2 | Input / Field | `input` |
| 3 | Select / Dropdown | `select` |
| 4 | Checkbox & Radio | `checkbox` |
| 5 | Navigation | `navigation` |
| 6 | Table | `table` |
| 7 | Chips & Tags | `chips` |
| 8 | Tabs (Horizontal) | `tabs` |
| 9 | Vertical Tabs | `vertical-tabs` |
| 10 | Modal | `modal` |
| 11 | Message Box | `message-box` |
| 12 | Switch | `switch` |
| 13 | Pagination | `pagination` |
| 14 | Loading | `loading` |
| 15 | Toast Notifications | `toast` |

### Phase 5b — WIP Components ✅
**Milestone:** All WIP components promoted to Stable — playground, MDX docs, Do/Don't, and accessibility notes complete.

| Component | Slug | Completed |
|---|---|---|
| Tooltip | `tooltip` | Apr 13, 2026 |
| Stats Cards | `stats-cards` | Apr 13, 2026 |
| Inline Context Data | `inline-context-data` | Apr 13, 2026 |
| Clickable Card | `clickable-card` | Apr 13, 2026 |
| Stepper | `stepper` | Apr 13, 2026 |

### Phase 5c — Charts
**Milestone:** All chart types documented with interactive playground and MDX docs.

| Component | Slug | Status |
|---|---|---|
| Area Chart | `area` | WIP |
| Bar Chart | `bar` | WIP |
| Line Chart | `line` | WIP |
| Pie Chart | `pie` | WIP |
| Radial Chart | `radial` | WIP |

> Charts live at `/charts/[slug]` — separate section in sidebar, distinct from `/components`.

### Phase 6 — Sandbox Space
**Milestone:** A shareable, design-system-aware workspace for new experiments.

The Sandbox is a separate area (`/sandbox`) where new components and features are built and validated **before** they graduate into the documented design system. It is always grounded in the existing design tokens and components.

**Architecture:**
- Each experiment is a named entry in `lib/sandbox-registry.ts` with metadata (title, status, author, description, created date) and a default code string
- `SandboxShell.tsx` renders a full-screen split: live code editor on the left, preview canvas on the right
- The react-live scope in the Sandbox automatically injects **all design system tokens and Shadcn components** — experiments can only build with what's in the DS
- A **DS Token Picker** panel (inside `SandboxToolbar.tsx`) lets the builder browse and insert token values directly into the code, reinforcing DS-first building
- A **Share** button generates a shareable URL with the experiment slug (and optionally encodes the current code state as a base64 URL param for ad-hoc sharing without persistence)
- Experiment status labels: `Draft` / `In Review` / `Validated` / `Graduated` — when status becomes Graduated, the component moves to the documented system

**Sidebar navigation group:** `Sandbox` sits as a distinct top-level section, visually separated from Foundations and Components, to signal it is a work-in-progress space.

### Phase 7 — Living System Infrastructure
**Milestone:** The system has clear conventions for evolving over time.

- **Contribution guide page** (`/contributing`) — explains the lifecycle: Sandbox → Review → Graduated (documented component)
- **What's New page** (`/changelog`) — a manually-maintained MDX file listing additions, updates, and deprecations with dates
- **Component status dashboard** — a table view of all components and their current status (Stable / WIP / Deprecated), auto-generated from `component-registry.ts`
- **Figma sync workflow docs** — internal page explaining how to re-run the token extraction process when Figma variables change
- Sidebar shows status badges on all entries so stakeholders always know what is stable vs in-progress

### Phase 8 — Polish & Navigation
- Sidebar with grouped navigation (Foundations / Global Components / CxAssist / Charts / **Sandbox**)
- Component status badges (Stable / WIP / Deprecated) from `component-registry.ts`
- Client-side search across components, tokens, AND sandbox experiments
- "Last updated" dates and Figma link per component

---

## Key Architectural Decisions

1. **react-live over Sandpack** — Sandpack requires a bundler worker and can't import local tokens. react-live compiles in-browser; scope is passed explicitly.

2. **MDX in-repo over headless CMS** — Docs and component code are authored by the same people; PRs = doc reviews. No second source of truth.

3. **Manual token sync, not automated** — Run `mcp__Figma__get_variable_defs` deliberately when tokens are stable, diff against `tokens.ts`, commit. No build-time Figma API calls (avoids rate limits and build fragility).

4. **Shadcn customization via CSS vars only** — Never edit `components/ui/` files. Apply CxPortal styles through the CSS variable theming mechanism in `globals.css`. This makes it easy to compare against the CxPortal repo when access is granted.

5. **Static Figma screenshots** — Use `mcp__Figma__get_screenshot` per component node → store as `public/figma-screenshots/{component}.png`. No live Figma iframes (requires auth, breaks in incognito).

6. **Sandbox is DS-first by design, not by convention** — The react-live scope for the Sandbox only exposes design system tokens and Shadcn components. Builders cannot import arbitrary CSS or break-out styles; they must work within the system. This enforces DS consistency without policing it manually.

7. **Experiment lifecycle is explicit** — Each sandbox entry has a `status` field. Graduating a component to the documented system means: writing its MDX doc, adding it to `component-registry.ts`, and removing it from the sandbox index. The Sandbox is not a graveyard — stale experiments should be archived or deleted.

---

## Figma Integration Workflow

- **Token extraction:** `mcp__Figma__get_variable_defs` → manual review → `lib/tokens.ts`
- **Component anatomy:** `mcp__Figma__get_metadata` per component node before building propSchema
- **Component screenshots:** `mcp__Figma__get_screenshot` per usage/principles frame → `public/figma-screenshots/`
- **Ongoing sync:** deliberate PR-based process, not automated

---

## Verification

- `npm run dev` → `localhost:3400` shows correct brand shell
- `/foundations/colors` → all color swatches match Figma values
- `/foundations/typography` → Mona Sans renders at correct scale
- `/components/button` → playground updates live when variant/size/disabled toggles change
- `/components/button` → MDX docs render with syntax-highlighted code, Do/Don't blocks
- `/sandbox` → shows experiment index with status badges
- `/sandbox/[experiment]` → full-screen editor/preview split, DS tokens available in scope, Share URL works
- Build passes: `npm run build` with no type errors
