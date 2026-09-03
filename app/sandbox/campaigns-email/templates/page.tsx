'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/loading'
import { MessageBox } from '@/components/ui/message-box'
import { TEMPLATES } from '../_mock/templates'
import type { TemplateStatus } from '../_mock/templates'
import { TOPICS } from '../_mock/topics'
import { ACCOUNTS } from '../_mock/accounts'
import { CAMPAIGN_GROUPS } from '../_mock/groups'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const GROUP_ACCOUNT_MAP = Object.fromEntries(
  ACCOUNTS.flatMap(a => a.campaignGroupIds.map(gid => [gid, a.name]))
)

const TOPIC_MAP = Object.fromEntries(TOPICS.map(t => [t.id, t.name]))

const STATUS_CONFIG: Record<TemplateStatus, { label: string; bg: string; color: string }> = {
  published: { label: 'Published', bg: 'var(--color-success-100)',     color: 'var(--text-success)'                     },
  draft:     { label: 'Draft',     bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  archived:  { label: 'Archived',  bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
}

type PageState = 'data' | 'loading' | 'empty' | 'error'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router                      = useRouter()
  const [search,    setSearch]      = useState('')
  const [visible,   setVisible]     = useState(10)
  const [pageState, setPageState]   = useState<PageState>('data')

  const filtered = useMemo(() => {
    if (!search) return TEMPLATES
    const q = search.toLowerCase()
    return TEMPLATES.filter(t => t.name.toLowerCase().includes(q))
  }, [search])

  useEffect(() => { setVisible(10) }, [search])

  const rows = filtered.slice(0, visible)

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: '32px' }}>
        Email Templates
      </h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Reusable email templates scoped to a campaign group. Each template supports versioning and
        Connect-style variable placeholders.
      </p>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Templates ({TEMPLATES.length})
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon size={14} color="var(--color-text-secondary)"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates…"
              style={{
                padding: '7px 10px 7px 30px', borderRadius: 8, width: 220, boxSizing: 'border-box',
                border: '1px solid var(--color-border)', fontSize: 13, outline: 'none',
                background: 'var(--color-surface-section)', color: 'var(--color-text-primary)',
              }}
            />
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push('/sandbox/campaigns-email/templates/new')}>
            <PlusIcon size={14} /> Add New Template
          </Button>
        </div>
      </div>

      {/* ── Dev state switcher ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
        padding: '8px 12px', borderRadius: 8,
        background: 'var(--color-surface-display)', border: '1px dashed var(--color-border)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: 4 }}>DEV</span>
        {(['data', 'loading', 'empty', 'error'] as PageState[]).map(s => (
          <button key={s} onClick={() => setPageState(s)} style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
            border: '1px solid',
            background:  pageState === s ? 'var(--color-primary)' : 'transparent',
            color:       pageState === s ? 'var(--neutral-0)' : 'var(--color-text-secondary)',
            borderColor: pageState === s ? 'var(--color-primary)' : 'var(--color-border)',
            cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {pageState === 'error' && (
        <div role="alert" style={{ marginBottom: 16 }}>
          <MessageBox type="error" size="block" title="Failed to load templates"
            message="There was a problem fetching your templates. Please refresh the page." />
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
              <Skeleton width={180} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={100} height={14} />
              <Skeleton width={40}  height={14} />
              <Skeleton width={64}  height={20} radius={4} />
              <Skeleton width={80}  height={14} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div style={{ padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No email templates
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Create reusable templates scoped to a campaign group to speed up your sends.
          </p>
          <Button variant="primary" size="sm"
            onClick={() => router.push('/sandbox/campaigns-email/templates/new')}>
            <PlusIcon size={14} /> Add Your First Template
          </Button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      {(pageState === 'data' || pageState === 'error') && (<>
      <Table size="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Template Name</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Edit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(tmpl => {
            const accountName = GROUP_ACCOUNT_MAP[tmpl.groupId] ?? '—'
            const topicName   = tmpl.topicId ? (TOPIC_MAP[tmpl.topicId] ?? '—') : '—'
            const st          = STATUS_CONFIG[tmpl.status]

            return (
              <TableRow key={tmpl.id}>
                <TableCell>
                  <Link
                    href={`/sandbox/campaigns-email/templates/${tmpl.id}`}
                    style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
                  >
                    {tmpl.name}
                  </Link>
                </TableCell>
                <TableCell variant="secondary">{accountName}</TableCell>
                <TableCell variant="secondary">{topicName}</TableCell>
                <TableCell>
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                    v{tmpl.latestVersion}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                    background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </TableCell>
                <TableCell variant="secondary">{fmtDate(tmpl.lastEditedAt)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {visible < filtered.length && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setVisible(v => v + 10)}
            style={{
              padding: '8px 24px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
              color: 'var(--color-text-primary)',
            }}
          >
            Load More ({filtered.length - visible} remaining)
          </button>
        </div>
      )}

      {rows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)', fontSize: 13 }}>
          {search ? 'No templates match your search.' : 'No email templates yet.'}
        </div>
      )}
      </>)}
    </div>
  )
}
