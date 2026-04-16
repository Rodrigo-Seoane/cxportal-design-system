import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'

// ── Types ─────────────────────────────────────────────────────────────────────

type ChangeType = 'added' | 'updated' | 'fixed' | 'deprecated'

type ChangeEntry = {
  type:    ChangeType
  label:   string
  href?:   string
  note?:   string
}

type Release = {
  date:    string
  version?: string
  changes: ChangeEntry[]
}

// ── Badge config ──────────────────────────────────────────────────────────────

const TYPE_BADGE: Record<ChangeType, { label: string; bg: string; color: string }> = {
  added:      { label: 'Added',      bg: 'var(--color-success-100)', color: '#1a6b1a' },
  updated:    { label: 'Updated',    bg: 'var(--color-info-100)',    color: '#1a3e6b' },
  fixed:      { label: 'Fixed',      bg: 'var(--color-warning-100)', color: '#7a4a00' },
  deprecated: { label: 'Deprecated', bg: 'var(--color-error-100)',   color: '#8b1a2a' },
}

// ── Changelog data ────────────────────────────────────────────────────────────

const RELEASES: Release[] = [
  {
    date: 'April 15, 2026',
    changes: [
      { type: 'added',   label: 'Collapsible Filter experiment',   href: '/sandbox/collapsible-filter', note: 'Article table with inline filter panel, tag management, and live pagination.' },
      { type: 'added',   label: 'System section in sidebar',       note: 'New nav group: Component Status, Contributing, Changelog, Figma Sync.' },
      { type: 'added',   label: 'Component Status dashboard',      href: '/system/status',      note: 'Auto-generated from registry — shows all components, charts, and sandbox experiments.' },
      { type: 'added',   label: 'Contributing guide',              href: '/system/contributing', note: 'Documents the Sandbox → In Review → Validated → Stable lifecycle.' },
      { type: 'added',   label: 'Changelog',                       href: '/system/changelog',   note: 'This page.' },
      { type: 'added',   label: 'Figma Sync workflow',             href: '/system/figma-sync',  note: 'Step-by-step process for pulling updated tokens from Figma.' },
    ],
  },
  {
    date: 'April 14, 2026',
    changes: [
      { type: 'added',   label: 'Full Size Chart',   href: '/charts/full-size',   note: 'Bar / Area / Line with multi-series toggles, date range picker, and animated transitions.' },
      { type: 'added',   label: 'Graph Cards',       href: '/charts/graph-cards', note: 'All 22 Figma chart variants across Area, Bar, Line, Pie, and Radial types.' },
      { type: 'added',   label: 'Charts section in sidebar', note: 'New nav group separate from Components.' },
      { type: 'added',   label: 'Date Picker component',     href: '/components/date-picker', note: 'MUI x-date-pickers (community). DS-styled labels and asterisk required indicator.' },
      { type: 'added',   label: 'Sandbox section in sidebar', note: 'Top-level Sandbox group with experiment list and status badges.' },
      { type: 'updated', label: 'TopBar',            note: 'figmaUpdated prop now renders via InlineContextData instead of a plain span.' },
      { type: 'updated', label: 'Select',            note: 'Added required?: boolean prop — renders * before label text in DS style.' },
    ],
  },
  {
    date: 'April 13, 2026',
    changes: [
      { type: 'added',   label: 'Tooltip',              href: '/components/tooltip',            note: 'Hover / focus trigger with 4 placement variants and DS-styled surface.' },
      { type: 'added',   label: 'Stats Cards',          href: '/components/stats-cards',        note: 'Metric display with trend indicator, period label, and icon slot.' },
      { type: 'added',   label: 'Inline Context Data',  href: '/components/inline-context-data',note: 'Compact key–value pair for metadata rows and topbars.' },
      { type: 'added',   label: 'Clickable Card',       href: '/components/clickable-card',     note: 'Vertical and horizontal layouts with hover/active states.' },
      { type: 'added',   label: 'Stepper',              href: '/components/stepper',            note: 'Multi-step flow indicator with completed, active, and pending states.' },
      { type: 'added',   label: 'Login Report experiment', href: '/sandbox/login-report',       note: '4-state report flow: idle → loading → success / error.' },
    ],
  },
  {
    date: 'April 2026 — Phase 5 (Core components)',
    changes: [
      { type: 'added', label: 'Button',               href: '/components/button' },
      { type: 'added', label: 'Input',                href: '/components/input' },
      { type: 'added', label: 'Select',               href: '/components/select' },
      { type: 'added', label: 'Checkbox & Radio',     href: '/components/checkbox' },
      { type: 'added', label: 'Navigation',           href: '/components/navigation' },
      { type: 'added', label: 'Table',                href: '/components/table' },
      { type: 'added', label: 'Chips & Tags',         href: '/components/chips' },
      { type: 'added', label: 'Tabs',                 href: '/components/tabs' },
      { type: 'added', label: 'Vertical Tabs',        href: '/components/vertical-tabs' },
      { type: 'added', label: 'Modal',                href: '/components/modal' },
      { type: 'added', label: 'Message Box',          href: '/components/message-box' },
      { type: 'added', label: 'Switch',               href: '/components/switch' },
      { type: 'added', label: 'Pagination',           href: '/components/pagination' },
      { type: 'added', label: 'Loading',              href: '/components/loading' },
      { type: 'added', label: 'Toast Notifications',  href: '/components/toast' },
      { type: 'added', label: 'Distribution Controls',href: '/components/distribution-controls' },
    ],
  },
  {
    date: 'April 2026 — Phases 1–4 (Foundation)',
    changes: [
      { type: 'added', label: 'Scaffold — Next.js 15, Tailwind v4, Shadcn/ui' },
      { type: 'added', label: 'Design token system (lib/tokens.ts + CSS vars)' },
      { type: 'added', label: 'Mona Sans variable font, brand shell layout' },
      { type: 'added', label: 'Foundations: Colors, Typography, Spacing, Border Radius, Icons' },
      { type: 'added', label: 'Component playground (react-live + PropControls)' },
      { type: 'added', label: 'MDX documentation system (next-mdx-remote + rehype-pretty-code)' },
    ],
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ChangeType }) {
  const { label, bg, color } = TYPE_BADGE[type]
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      fontSize: 10, fontWeight: 700, lineHeight: '14px',
      padding: '2px 6px', borderRadius: 4,
      background: bg, color,
      textTransform: 'uppercase', letterSpacing: '0.04em',
      minWidth: 68, textAlign: 'center',
    }}>
      {label}
    </span>
  )
}

function ReleaseBlock({ release }: { release: Release }) {
  return (
    <div style={{ marginBottom: 48 }}>
      {/* Date header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          {release.date}
        </h2>
        <div style={{ flex: 1, height: 1, background: 'var(--color-border, #e2e5e9)' }} />
      </div>

      {/* Change rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {release.changes.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <TypeBadge type={c.type} />
            <div style={{ flex: 1 }}>
              {c.href ? (
                <Link href={c.href} style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-primary)', textDecoration: 'none' }}>
                  {c.label}
                </Link>
              ) : (
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {c.label}
                </span>
              )}
              {c.note && (
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: 8 }}>
                  — {c.note}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ChangelogPage() {
  return (
    <>
      <TopBar title="Changelog" figmaUpdated="Apr 15, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 800 }}>
        <p style={{ fontSize: 14, lineHeight: '22px', color: 'var(--color-text-secondary)', marginBottom: 40, maxWidth: 600 }}>
          A manually-maintained log of additions, updates, fixes, and deprecations. Add an entry whenever a
          component graduates, a token changes, or a breaking change is made.
        </p>

        {RELEASES.map((r, i) => <ReleaseBlock key={i} release={r} />)}
      </main>
    </>
  )
}
