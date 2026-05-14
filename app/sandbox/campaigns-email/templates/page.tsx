'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileTextIcon, PlusIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { TEMPLATES }  from '../_mock/templates'
import { TOPICS }     from '../_mock/topics'
import { COMPONENTS } from '../_mock/groups'
import { useRole, canEdit } from '../_context/RoleContext'
import type { TemplateStatus } from '../_mock/templates'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLE: Record<TemplateStatus, { bg: string; color: string }> = {
  published: { bg: 'var(--color-success-100)', color: '#1a6b1a'                        },
  draft:     { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
  archived:  { bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
}

type PageState = 'data' | 'loading' | 'empty'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const { role } = useRole()
  const [pageState, setPageState] = useState<PageState>('data')

  return (
    <div style={{ padding: '28px 36px' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileTextIcon size={20} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Templates
          </h2>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' }}>
            {TEMPLATES.length}
          </span>
        </div>
        {canEdit(role)
          ? <Button variant="primary" size="sm"><PlusIcon size={14} /> New template</Button>
          : <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Templates are managed by Supervisors.
            </span>
        }
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Reusable email templates scoped to a campaign group. Each template supports versioning and
        Connect-style variable placeholders.
      </p>

      {/* ── Dev state switcher ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
        padding: '8px 12px', borderRadius: 8,
        background: 'var(--color-surface-display)', border: '1px dashed var(--color-border)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: 4 }}>DEV</span>
        {(['data', 'loading', 'empty'] as PageState[]).map(s => (
          <button key={s} onClick={() => setPageState(s)}
            style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
              border: '1px solid',
              background:   pageState === s ? 'var(--color-primary)' : 'transparent',
              color:        pageState === s ? '#fff' : 'var(--color-text-secondary)',
              borderColor:  pageState === s ? 'var(--color-primary)' : 'var(--color-border)',
              cursor: 'pointer',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* ── Loading state ────────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px',
              borderBottom: '1px solid var(--color-border)',
              background: 'var(--color-surface-section)' }}>
              <Skeleton width={200} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={80}  height={14} />
              <Skeleton width={36}  height={14} />
              <Skeleton width={64}  height={20} radius={4} />
              <Skeleton width={100} height={14} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div style={{ padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <FileTextIcon size={32} color="var(--color-text-secondary)" style={{ marginBottom: 12 }} />
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No templates yet
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Create a template to define the HTML content and subject line for your campaigns.
          </p>
          {canEdit(role) && (
            <Button variant="primary" size="sm">
              <PlusIcon size={14} /> Create your first template
            </Button>
          )}
        </div>
      )}

      {/* ── Data table ───────────────────────────────────────────────── */}
      {pageState === 'data' && (
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 16 }}>Name</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Component</TableHead>
              <TableHead align="right">Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Edited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TEMPLATES.map(tmpl => {
              const topic     = tmpl.topicId ? TOPICS.find(t => t.id === tmpl.topicId) : null
              const component = COMPONENTS.find(c => c.id === tmpl.componentId)
              const st        = STATUS_STYLE[tmpl.status]

              return (
                <TableRow key={tmpl.id}>
                  <TableCell style={{ paddingLeft: 16 }}>
                    <Link
                      href={`/sandbox/campaigns-email/templates/${tmpl.id}`}
                      style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
                    >
                      {tmpl.name}
                    </Link>
                  </TableCell>
                  <TableCell variant="secondary">
                    {topic?.name ?? <span style={{ color: 'var(--color-text-secondary)' }}>—</span>}
                  </TableCell>
                  <TableCell variant="secondary">
                    {component?.shortCode ?? tmpl.componentId}
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                      v{tmpl.latestVersion}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                      background: st.bg, color: st.color }}>
                      {tmpl.status}
                    </span>
                  </TableCell>
                  <TableCell variant="secondary">
                    <span title={tmpl.lastEditedBy}>{fmtDate(tmpl.lastEditedAt)}</span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}

    </div>
  )
}
