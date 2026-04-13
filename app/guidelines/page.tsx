'use client'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { CopyButton } from '@/components/ds/CopyButton'
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/tabs'

// ── Section shortcut cards ─────────────────────────────────────────────────────

const SHORTCUTS = [
  {
    title: 'Foundations',
    description: 'Design tokens: colors, typography, spacing, border radius, and icons.',
    href: '/foundations/colors',
    links: [
      { label: 'Colors',      href: '/foundations/colors' },
      { label: 'Typography',  href: '/foundations/typography' },
      { label: 'Spacing',     href: '/foundations/spacing' },
      { label: 'Icons',       href: '/foundations/icons' },
    ],
  },
  {
    title: 'Components',
    description: 'Interactive playground with live prop controls and usage guidelines.',
    href: '/components/button',
    links: [
      { label: 'Button',  href: '/components/button' },
      { label: 'Input',   href: '/components/input' },
      { label: 'Table',   href: '/components/table' },
      { label: 'Modal',   href: '/components/modal' },
    ],
  },
  {
    title: 'Charts',
    description: 'Data visualisation components built on the CxPortal token system.',
    href: '/charts/area',
    links: [
      { label: 'Area',   href: '/charts/area' },
      { label: 'Bar',    href: '/charts/bar' },
      { label: 'Line',   href: '/charts/line' },
      { label: 'Pie',    href: '/charts/pie' },
    ],
  },
  {
    title: 'Sandbox',
    description: 'Build, test, and validate new ideas before they graduate into the system.',
    href: '/sandbox',
    links: [
      { label: 'All Experiments', href: '/sandbox' },
      { label: 'Distribution Controls', href: '/components/distribution-controls' },
    ],
  },
]

// ── Rules ──────────────────────────────────────────────────────────────────────

const RULES: { rule: string; detail: string }[] = [
  {
    rule: 'Tokens are the starting point',
    detail: 'Every component, sandbox experiment, and doc page derives from lib/tokens.ts. Never use raw hex values or hard-coded px sizes in component code — always reference a CSS var or token constant.',
  },
  {
    rule: 'Figma is the source of truth',
    detail: 'Before writing a propSchema or variant list, inspect the component in Figma via the MCP tool. Anatomy, states, and spacing come from the design file, not assumption.',
  },
  {
    rule: 'Never edit components/ui/ files',
    detail: 'These are the DS primitives. Styling is applied exclusively through CSS variables in styles/globals.css. This keeps the component layer clean and comparable to the CxPortal repo.',
  },
  {
    rule: "MDX docs never embed <ComponentPreview>",
    detail: "The playground is rendered by app/components/[slug]/page.tsx. Embedding it inside MDX duplicates it on the page. MDX handles prose, tables, Do/Don't blocks — not the interactive layer.",
  },
  {
    rule: 'Sandbox is DS-first by design',
    detail: 'The react-live scope in every sandbox experiment only exposes design system tokens and components. Experiments must build within the system — they cannot import arbitrary CSS or external libraries.',
  },
  {
    rule: "Stable means: playground + MDX + Do/Don't + a11y",
    detail: 'A component is only marked stable when all four are complete. WIP means the page exists but at least one of these is missing. Do not set status: stable prematurely in the registry.',
  },
  {
    rule: 'Read AGENTS.md before writing Next.js code',
    detail: 'This project uses a Next.js version with breaking changes from training data. Check node_modules/next/dist/docs/ before writing routing, layout, or server-component code.',
  },
  {
    rule: 'No Co-Authored-By trailers in commits',
    detail: 'Keep commit messages clean: one-line feat/fix/chore summary. No Claude attribution trailers.',
  },
]

// ── Git workflow steps ─────────────────────────────────────────────────────────

const GIT_STEPS: { step: string; cmd?: string; note?: string }[] = [
  {
    step: 'Start from a clean main',
    cmd: 'git checkout main && git pull origin main',
  },
  {
    step: 'Create a feature branch',
    cmd: 'git checkout -b feat/[component-name]',
    note: 'Use feat/ prefix for new components, fix/ for bug fixes, docs/ for documentation-only changes. Example: feat/tooltip, feat/sandbox-stepper.',
  },
  {
    step: 'Run the dev server',
    cmd: 'npm run dev',
    note: 'Runs at localhost:3400. Keep it running while you work — the playground hot-reloads.',
  },
  {
    step: 'Build the three deliverables',
    note: '1. components/ui/{slug}.tsx — the component primitive\n2. lib/component-registry.ts — add the registry entry with propSchema and generateCode\n3. content/components/{slug}.mdx — MDX documentation following the button.mdx template',
  },
  {
    step: 'Verify before committing',
    cmd: 'npm run build',
    note: 'Zero TypeScript errors required. Check the playground renders correctly at /components/{slug}.',
  },
  {
    step: 'Commit and push',
    cmd: 'git add components/ui/{slug}.tsx lib/component-registry.ts content/components/{slug}.mdx\ngit commit -m "feat: add {slug} component"\ngit push origin feat/[component-name]',
  },
  {
    step: 'Open a PR targeting main',
    note: 'Title: "feat: add [Component Name] component". Include a screenshot of the playground in the PR description.',
  },
]

// ── Session prompt template ────────────────────────────────────────────────────

const PROMPT_TEMPLATE = `Read @GUIDELINES.md and @plan.md before starting.

We are working on: [component name]

Type: Component | Sandbox experiment

Figma component link: [paste Figma URL]
Figma documentation link: [paste Figma URL]

Status: new (building from scratch) | existing (promoting WIP → Stable)

Additional context:
[any extra notes — related components, edge cases, open design questions]`

// ── Page ───────────────────────────────────────────────────────────────────────

export default function GuidelinesPage() {
  return (
    <>
      <TopBar title="Guidelines" />
      <main className="flex-1 px-8 py-10 max-w-4xl">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            CxPortal Design System
          </h2>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            A living reference for building CxPortal — tokens, components, and a sandbox for new ideas.
            Always grounded in the Figma source of truth.
          </p>
        </div>

        {/* ── Shortcut cards ──────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-4 mb-14">
          {SHORTCUTS.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="block rounded-lg p-5 border transition-shadow hover:shadow-md"
              style={{
                backgroundColor: 'var(--color-surface-section)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                {section.title}
              </h3>
              <p className="text-xs mb-4 leading-5" style={{ color: 'var(--color-text-secondary)' }}>
                {section.description}
              </p>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                      {link.label} →
                    </span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="border-t mb-8" style={{ borderColor: 'var(--color-border)' }} />

        {/* ── Guidelines section title ─────────────────────────────────── */}
        <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Guidelines
        </h2>

        {/* ── Tabbed sections ─────────────────────────────────────────── */}
        <Tabs defaultValue="session">
          <TabList aria-label="Guidelines sections" className="mb-8">
            <Tab value="session">Starting a New Session</Tab>
            <Tab value="git">Git Workflow</Tab>
            <Tab value="working">Working with the system</Tab>
          </TabList>

          {/* ── Tab 1: Rules ──────────────────────────────────────────── */}
          <TabPanel value="working">
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Rules that apply to every component, every session. These are non-negotiable — not conventions.
            </p>
            <div className="space-y-3 mb-8">
              {RULES.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg px-5 py-4 border"
                  style={{
                    backgroundColor: 'var(--color-surface-section)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {item.rule}
                  </p>
                  <p className="text-sm leading-6" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </TabPanel>

          {/* ── Tab 2: Session prompt ─────────────────────────────────── */}
          <TabPanel value="session">
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Use this prompt at the beginning of every session where you are building a component or
              sandbox experiment. It loads the guidelines and plan, and gives Claude the Figma references
              it needs before writing a single line of code.
            </p>

            <div
              className="rounded-lg border overflow-hidden mb-4"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{
                  backgroundColor: 'var(--color-surface-display)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Session Start Prompt
                </span>
                <CopyButton text={PROMPT_TEMPLATE} label="Copy prompt" />
              </div>
              <pre
                className="px-5 py-4 text-sm font-mono leading-7 overflow-x-auto"
                style={{
                  backgroundColor: 'var(--color-surface-nav)',
                  color: 'var(--color-text-on-dark)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {PROMPT_TEMPLATE}
              </pre>
            </div>

            <div
              className="rounded-lg px-5 py-4 text-sm mb-8"
              style={{
                backgroundColor: 'var(--color-info-100)',
                color: 'var(--color-text-primary)',
              }}
            >
              <strong>Tip:</strong> Always provide both Figma links — the component link (anatomy,
              variants, states) and the documentation link (usage guidelines, Do/Don&apos;t frames).
              Claude uses the component link to derive the propSchema and the documentation link for
              MDX copy.
            </div>
          </TabPanel>

          {/* ── Tab 3: Git workflow ───────────────────────────────────── */}
          <TabPanel value="git">
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Every component and sandbox experiment is developed on its own branch and merged to main via PR.
            </p>

            <ol className="space-y-0 mb-8">
              {GIT_STEPS.map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        backgroundColor: 'var(--color-primary)',
                        color: '#fff',
                        marginTop: 16,
                      }}
                    >
                      {i + 1}
                    </div>
                    {i < GIT_STEPS.length - 1 && (
                      <div style={{ width: 1, flex: 1, backgroundColor: 'var(--color-border)', marginTop: 4 }} />
                    )}
                  </div>

                  <div className="pb-6 flex-1 min-w-0" style={{ paddingTop: 12 }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {item.step}
                    </p>
                    {item.cmd && (
                      <pre
                        className="rounded-md px-4 py-3 text-xs font-mono mb-2 overflow-x-auto"
                        style={{
                          backgroundColor: 'var(--color-surface-nav)',
                          color: 'var(--color-text-on-dark)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {item.cmd}
                      </pre>
                    )}
                    {item.note && (
                      <p className="text-sm leading-6" style={{ color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
                        {item.note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </TabPanel>
        </Tabs>

        {/* ── Lifecycle note ───────────────────────────────────────────── */}
        <div
          className="rounded-lg px-5 py-4 text-sm border"
          style={{
            backgroundColor: 'var(--color-surface-section)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          <strong style={{ color: 'var(--color-text-primary)' }}>Living system lifecycle: </strong>
          Build in Sandbox → validate with team → graduate to Components.
          When a component graduates: write its MDX doc, add it to{' '}
          <code style={{ fontSize: 12 }}>lib/component-registry.ts</code>, update its sidebar status to{' '}
          <code style={{ fontSize: 12 }}>stable</code>, and remove it from the sandbox index.
        </div>
      </main>
    </>
  )
}
