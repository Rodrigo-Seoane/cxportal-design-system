# CxPortal Design System — Session Guidelines

Use this file to orient any new session. Read it alongside `plan.md` before starting work.

---

## What this project is

A standalone interactive design system website for the CxPortal SaaS product. The Figma file (`exoHhvasbJSziVGakV8Y0r`) is the canonical source of truth for all tokens and component specs. The site has two modes: **Documentation** (stable components) and **Sandbox** (work-in-progress experiments).

Root: `/Users/rodrigo.seoane/local-sites/pronetx/project_portal/`
Dev server: `localhost:3400`

---

## Where we are

Check `plan.md` for the full roadmap. In brief:

- Phases 1–4 complete: scaffold, token explorer, component playground infrastructure, MDX system.
- Phase 5 in progress: stable components are done; WIP components (Tooltip, Stats Cards, Inline Context Data, Clickable Card, Stepper) need playground + docs.
- Phase 5c: Charts section (Area, Bar, Line, Pie, Radial) — all WIP.
- Phase 6+: Sandbox infrastructure, living system, polish.

The sidebar in `components/layout/Sidebar.tsx` is the ground truth for what pages exist and their status (`stable` / `wip`).

---

## Component work — how to build a new component

Each component requires **three deliverables**:

1. **The component** — `components/ui/{slug}.tsx`
2. **Registry entry** — add to `lib/component-registry.ts` (slug, title, description, status, scope, propSchema, generateCode)
3. **MDX documentation** — `content/components/{slug}.mdx`

### References for each component

Always gather two references from Figma before building:

- **Component Figma link** — for the component itself (anatomy, variants, states)
- **Documentation Figma link** — for the documentation frame (usage guidelines, Do/Don't)

Use `mcp__Figma__get_design_context` (nodeId + fileKey) then `mcp__Figma__get_screenshot` for static reference images → save to `public/figma-screenshots/{slug}.png`.

### Agent assignment

- **Component implementation** (`components/ui/`, `lib/component-registry.ts`): use `web-artifacts-builder` agent
- **Sandbox experiments** (`/sandbox`, `lib/sandbox-registry.ts`, `SandboxShell.tsx`): use `ux-strategist-designer` agent
- **MDX documentation** (`content/components/{slug}.mdx`): use `web-artifacts-builder` agent

---

## MDX documentation structure

Every MDX doc follows this structure (see `content/components/button.mdx` as the reference template):

```
## Overview
Brief description of what the component is and when it's used.

## When to Use
Bulleted guidelines — when to use and when not to use.

## Anatomy
Short description of the component's structural parts.

## Variants
Describe all variants, sizes, and states. Use the MDX table primitives.

## Accessibility
Key a11y considerations: keyboard nav, ARIA roles, focus management.

<DosDonts>
  <Do>...</Do>
  <Dont>...</Dont>
</DosDonts>

## Code
Usage example as a fenced code block.
```

**Critical rule:** MDX docs must NEVER embed `<ComponentPreview>` — the playground is always rendered by `app/components/[slug]/page.tsx`, not the MDX. Embedding it in MDX duplicates the playground.

MDX has access to these custom components (registered in `components/mdx/MDXComponents.tsx`):
- `<DosDonts>`, `<Do>`, `<Dont>`
- `<ComponentPreview slug="…" />` — DO NOT USE in MDX (see above)
- `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>`
- `<Chip>`, `<Tag>`
- `<Tabs>`, `<TabList>`, `<Tab>`, `<TabPanel>`

---

## Key files

| File | Purpose |
|---|---|
| `lib/tokens.ts` | Single source of truth for all design tokens |
| `styles/globals.css` | Tailwind v4 `@theme` block + CSS vars |
| `lib/component-registry.ts` | All component entries: slug → scope + propSchema + generateCode |
| `lib/sandbox-registry.ts` | Sandbox experiments metadata |
| `components/ds/ComponentPlayground.tsx` | react-live playground wrapper |
| `components/ds/PropControls.tsx` | Interactive knobs rendered from propSchema |
| `components/layout/Sidebar.tsx` | Nav structure — ground truth for what pages exist |
| `components/mdx/MDXComponents.tsx` | MDX component registry |
| `content/components/button.mdx` | Reference MDX template |

---

## Design tokens (quick reference)

- Primary: `#4285f4`
- Text primary: `#021920` · Secondary: `#7a828c` · On-dark: `#eff1f3`
- Nav bg: `#050326`
- Surfaces: section `#ffffff` · display/panel `#eff1f3`
- Status: success/warning/error/info each have `100` (light bg) and `200` (border/accent) variants
- Font: Mona Sans variable, weights 300/400/600/800
- Border radius: xs:2px · sm:4px · md:8px · lg:16px · round:64px
- Spacing: 4px unit system (Tailwind scale)

---

## Rules to follow

1. **Never edit `components/ui/` files directly** — these are the DS primitives. Style via CSS vars in `globals.css`.
2. **Never embed `<ComponentPreview>` in MDX** — it lives in `page.tsx` only.
3. **Never commit co-authored-by trailers** in commit messages.
4. **Tokens are the starting point for everything** — components, sandbox, docs all derive from `lib/tokens.ts`.
5. **Figma is the source of truth** — check component specs via MCP before writing propSchema.
6. **Read AGENTS.md** — this Next.js version has breaking changes; check `node_modules/next/dist/docs/` before writing routing or layout code.

---

## Sidebar component status

When adding a new component to the sidebar (`components/layout/Sidebar.tsx`), set its `status`:
- `stable` — playground + MDX docs + Do/Don't complete
- `wip` — page exists, docs incomplete
- `deprecated` — kept for reference, not recommended

Charts live under `/charts/[slug]`, not `/components/[slug]`.
Sandbox experiments live under `/sandbox/[experiment]` and are also listed in `lib/sandbox-registry.ts`.
