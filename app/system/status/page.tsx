'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { registry } from '@/lib/component-registry'
import { getExperiments } from '@/lib/sandbox-registry'

// ── Data ─────────────────────────────────────────────────────────────────────

type Category = 'component' | 'chart' | 'sandbox'
type Status   = 'stable' | 'wip' | 'deprecated' | 'in-review' | 'validated'

type Entry = {
  name:     string
  category: Category
  status:   Status
  href:     string
}

const CHART_ENTRIES: Entry[] = [
  { name: 'Full Size Chart', category: 'chart', status: 'stable', href: '/charts/full-size' },
  { name: 'Graph Cards',     category: 'chart', status: 'stable', href: '/charts/graph-cards' },
]

function buildEntries(): Entry[] {
  const components: Entry[] = Object.values(registry).map(c => ({
    name:     c.title,
    category: 'component',
    status:   c.status as Status,
    href:     `/components/${c.slug}`,
  }))

  const sandbox: Entry[] = getExperiments().map(e => ({
    name:     e.title,
    category: 'sandbox',
    status:   e.status === 'In Review' ? 'in-review'
            : e.status === 'Validated' ? 'validated'
            : 'wip',
    href:     e.href,
  }))

  return [...components, ...CHART_ENTRIES, ...sandbox]
}

// ── Badge styles ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<Status, { label: string; bg: string; color: string }> = {
  stable:     { label: 'Stable',     bg: 'var(--color-success-100)', color: '#1a6b1a' },
  wip:        { label: 'WIP',        bg: 'var(--color-warning-100)', color: '#7a4a00' },
  deprecated: { label: 'Deprecated', bg: 'var(--color-error-100)',   color: '#8b1a2a' },
  'in-review':{ label: 'In Review',  bg: 'var(--color-info-100)',    color: '#1a3e6b' },
  validated:  { label: 'Validated',  bg: 'var(--color-success-200)', color: '#0e4d0e' },
}

const CATEGORY_BADGE: Record<Category, { label: string; bg: string; color: string }> = {
  component: { label: 'Component', bg: '#eff1f3', color: '#3a4a5a' },
  chart:     { label: 'Chart',     bg: '#e8eef8', color: '#1a3e6b' },
  sandbox:   { label: 'Sandbox',   bg: '#f0ebf8', color: '#4a1a6b' },
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11, fontWeight: 600, lineHeight: '16px',
      padding: '2px 7px', borderRadius: 4,
      background: bg, color,
    }}>
      {label}
    </span>
  )
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

type FilterTab = 'all' | Category
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'component', label: 'Components' },
  { key: 'chart',     label: 'Charts' },
  { key: 'sandbox',   label: 'Sandbox' },
]

// ── Summary chips ─────────────────────────────────────────────────────────────

function SummaryChips({ entries }: { entries: Entry[] }) {
  const counts: Partial<Record<Status, number>> = {}
  for (const e of entries) counts[e.status] = (counts[e.status] ?? 0) + 1

  const displayed: Status[] = ['stable', 'wip', 'in-review', 'validated', 'deprecated']

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {displayed.map(s => {
        const n = counts[s]
        if (!n) return null
        const { label, bg, color } = STATUS_BADGE[s]
        return (
          <span key={s} style={{
            fontSize: 12, fontWeight: 600,
            padding: '3px 10px', borderRadius: 20,
            background: bg, color,
          }}>
            {n} {label}
          </span>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const allEntries = buildEntries()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const filtered = activeTab === 'all'
    ? allEntries
    : allEntries.filter(e => e.category === activeTab)

  return (
    <>
      <TopBar title="Component Status" figmaUpdated="Apr 14, 2026" />
      <main className="flex-1 px-8 py-10" style={{ maxWidth: 960 }}>

        {/* Header */}
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, maxWidth: 600 }}>
          Live view of all components, charts, and sandbox experiments — pulled directly from the registry.
        </p>

        {/* Summary */}
        <SummaryChips entries={allEntries} />

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 2, marginTop: 28, marginBottom: 20,
          borderBottom: '1px solid var(--color-border, #e2e5e9)',
        }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '6px 14px',
                fontSize: 13, fontWeight: activeTab === t.key ? 600 : 400,
                color: activeTab === t.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 100ms ease, border-color 100ms ease',
              }}
            >
              {t.label}
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 400,
                color: 'var(--color-text-secondary)',
              }}>
                {activeTab === t.key || t.key === 'all'
                  ? (t.key === 'all' ? allEntries.length : allEntries.filter(e => e.category === t.key).length)
                  : allEntries.filter(e => e.category === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--color-surface-section)',
          borderRadius: 8,
          border: '1px solid var(--color-border, #e2e5e9)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 120px 100px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--color-border, #e2e5e9)',
            background: '#f8f8f8',
          }}>
            {['Name', 'Category', 'Status', ''].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((entry, i) => {
            const statusBadge   = STATUS_BADGE[entry.status]
            const categoryBadge = CATEGORY_BADGE[entry.category]
            return (
              <div
                key={`${entry.category}-${entry.href}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 120px 100px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border, #e2e5e9)' : 'none',
                  background: i % 2 === 1 ? '#f8f8f8' : 'var(--color-surface-section)',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-primary)' }}>
                  {entry.name}
                </span>
                <Badge label={categoryBadge.label} bg={categoryBadge.bg} color={categoryBadge.color} />
                <Badge label={statusBadge.label} bg={statusBadge.bg} color={statusBadge.color} />
                <Link
                  href={entry.href}
                  style={{
                    fontSize: 12, color: 'var(--color-primary)',
                    textDecoration: 'none', fontWeight: 500,
                  }}
                >
                  View →
                </Link>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 14 }}>
              No entries in this category.
            </div>
          )}
        </div>
      </main>
    </>
  )
}
