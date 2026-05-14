'use client'

import { useState, useRef, useEffect } from 'react'
import {
  PlusIcon,
  DotsThreeIcon,
  ArrowClockwiseIcon,
  TrashIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/loading'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { MessageBox } from '@/components/ui/message-box'
import { SENDERS } from '../_mock/senders'
import type { SenderIdentity } from '../_mock/senders'
import { COMPONENTS } from '../_mock/groups'
import { SenderIdentityStatus } from '../_components/SenderIdentityStatus'
import { AddSenderModal } from './AddSenderModal'
import { useRole, canEdit, canDelete } from '../_context/RoleContext'

type PageState = 'loading' | 'empty' | 'data' | 'expired'

const COMPONENT_MAP = Object.fromEntries(COMPONENTS.map(c => [c.id, c]))

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Row actions popover ───────────────────────────────────────────────────────

function RowActions({ sender, onRemove, onResend, editable, deletable }: {
  sender:    SenderIdentity
  onRemove:  (id: string) => void
  onResend:  (id: string) => void
  editable:  boolean
  deletable: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!editable && !deletable) return null

  const canResend = editable && sender.status !== 'verified'

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        aria-label="Row actions"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
          background: open ? 'var(--color-surface-display)' : 'transparent',
          transition: 'background 100ms ease',
        }}
      >
        <DotsThreeIcon size={16} weight="bold" color="var(--color-text-secondary)" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 32, zIndex: 20,
          background: 'var(--color-surface-section)',
          border: '1px solid var(--color-border)',
          borderRadius: 8, boxShadow: '0 4px 16px rgba(2,25,32,0.12)',
          minWidth: 180, padding: '4px 0',
        }}>
          {canResend && (
            <button onClick={() => { onResend(sender.id); setOpen(false) }}
              style={menuItemStyle}>
              <ArrowClockwiseIcon size={14} />
              {sender.status === 'verified' ? 'Resend verification' : 'Retry verification'}
            </button>
          )}
          {deletable && (
            <button onClick={() => { onRemove(sender.id); setOpen(false) }}
              style={{ ...menuItemStyle, color: '#8b1a2a' }}>
              <TrashIcon size={14} />
              Remove sender
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', padding: '8px 14px',
  fontSize: 13, fontWeight: 400, lineHeight: '20px',
  color: 'var(--color-text-primary)',
  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SendersPage() {
  const [pageState, setPageState] = useState<PageState>('data')
  const [senders, setSenders]     = useState<SenderIdentity[]>(SENDERS)
  const [modalOpen, setModalOpen] = useState(false)
  const { role } = useRole()

  const visibleSenders =
    pageState === 'empty'   ? [] :
    pageState === 'expired' ? senders.filter(s => s.status === 'expired' || s.status === 'failed') :
    senders

  function handleAdd(s: SenderIdentity) {
    setSenders(prev => [s, ...prev])
    setPageState('data')
  }

  function handleRemove(id: string) { setSenders(prev => prev.filter(s => s.id !== id)) }

  function handleResend(id: string) {
    setSenders(prev => prev.map(s => s.id === id ? { ...s, status: 'pending' as const } : s))
  }

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheckIcon size={20} color="var(--color-text-secondary)" />
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Sender Identities
          </h2>
        </div>
        {canEdit(role) && (
          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <PlusIcon size={14} /> Add sender
          </Button>
        )}
      </div>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Verified sender email addresses used in campaign From fields. Each sender must pass
        domain verification before it can be used in a campaign.
      </p>

      {/* ── Dev force-state bar ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
        padding: '8px 12px', borderRadius: 8,
        background: 'var(--color-surface-display)', border: '1px dashed var(--color-border)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: 4 }}>
          DEV
        </span>
        {(['data', 'loading', 'empty', 'expired'] as PageState[]).map(s => (
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

      {/* ── Expired error banner ──────────────────────────────────────── */}
      {pageState === 'expired' && (
        <div style={{ marginBottom: 20 }}>
          <MessageBox
            type="error"
            size="block"
            title="Verification expired"
            message="The senders below have expired or failed verification and cannot be used in campaigns. Retry verification or remove them to keep your sender list clean."
          />
        </div>
      )}

      {/* ── Loading state ─────────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 8px',
              borderBottom: '1px solid var(--color-border)' }}>
              <Skeleton width={200} height={14} />
              <Skeleton width={160} height={14} />
              <Skeleton width={140} height={14} />
              <Skeleton width={80}  height={20} radius={6} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div style={{
          padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10,
        }}>
          <ShieldCheckIcon size={32} color="var(--color-text-secondary)" style={{ marginBottom: 12 }} />
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No sender identities yet
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Add a verified .gov email address to start sending campaigns.
            A confirmation link will be sent to the address to complete verification.
          </p>
          {canEdit(role) && (
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
              <PlusIcon size={14} /> Add your first sender
            </Button>
          )}
        </div>
      )}

      {/* ── Data table ────────────────────────────────────────────────── */}
      {(pageState === 'data' || pageState === 'expired') && visibleSenders.length > 0 && (
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead style={{ paddingLeft: 16 }}>Email</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Verified</TableHead>
              <TableHead style={{ width: 40 }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleSenders.map(sender => (
              <TableRow key={sender.id}>
                <TableCell style={{ paddingLeft: 16 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{sender.email}</span>
                </TableCell>
                <TableCell>{sender.displayName}</TableCell>
                <TableCell variant="secondary">
                  {COMPONENT_MAP[sender.componentId]
                    ? `${COMPONENT_MAP[sender.componentId].shortCode} — ${COMPONENT_MAP[sender.componentId].name}`
                    : sender.componentId}
                </TableCell>
                <TableCell>
                  <SenderIdentityStatus status={sender.status} />
                </TableCell>
                <TableCell variant="secondary">{formatDate(sender.lastVerified)}</TableCell>
                <TableCell align="center">
                  <RowActions sender={sender} onRemove={handleRemove} onResend={handleResend}
                  editable={canEdit(role)} deletable={canDelete(role)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AddSenderModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
