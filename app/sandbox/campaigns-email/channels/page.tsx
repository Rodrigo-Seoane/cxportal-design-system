'use client'

import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import {
  PlusIcon,
  DotsThreeIcon,
  ArrowClockwiseIcon,
  TrashIcon,
  EyeIcon,
  PencilSimpleIcon,
  MagnifyingGlassIcon,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Toaster, toast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/loading'
import { MessageBox } from '@/components/ui/message-box'
import { SENDERS } from '../_mock/senders'
import type { SenderIdentity } from '../_mock/senders'
import { CAMPAIGN_GROUPS } from '../_mock/groups'
import { SenderIdentityStatus } from '../_components/SenderIdentityStatus'
import { AddChannelModal } from './AddChannelModal'
import { useRole, canEdit, canDelete } from '../_context/RoleContext'

const GROUP_MAP = Object.fromEntries(CAMPAIGN_GROUPS.map(g => [g.id, g.name]))

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', padding: '8px 14px',
  fontSize: 13, fontWeight: 400, lineHeight: '20px',
  color: 'var(--color-text-primary)',
  background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
}

// ── RowActions ────────────────────────────────────────────────────────────────

function RowActions({ sender, onViewDetails, onReVerify, onDelete, editable, deletable }: {
  sender:        SenderIdentity
  onViewDetails: () => void
  onReVerify:    () => void
  onDelete:      () => void
  editable:      boolean
  deletable:     boolean
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
          <button onClick={() => { onViewDetails(); setOpen(false) }} style={menuItemStyle}>
            <EyeIcon size={14} /> View Details
          </button>
          {editable && (
            <button onClick={() => { toast.info('Edit sender — coming soon'); setOpen(false) }} style={menuItemStyle}>
              <PencilSimpleIcon size={14} /> Edit Sender
            </button>
          )}
          {editable && sender.status !== 'verified' && (
            <button onClick={() => { onReVerify(); setOpen(false) }} style={menuItemStyle}>
              <ArrowClockwiseIcon size={14} /> Retry Verification
            </button>
          )}
          {deletable && (
            <button onClick={() => { onDelete(); setOpen(false) }} style={{ ...menuItemStyle, color: 'var(--text-destructive)' }}>
              <TrashIcon size={14} /> Remove Sender
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── ViewDetailsModal ──────────────────────────────────────────────────────────

function ViewDetailsModal({ sender, onClose }: { sender: SenderIdentity | null; onClose: () => void }) {
  if (!sender) return null

  const rows: [string, React.ReactNode][] = [
    ['Email',          <code key="email" style={{ fontSize: 12 }}>{sender.email}</code>],
    ['Display Name',   sender.displayName],
    ['Campaign Group', GROUP_MAP[sender.groupId] ?? '—'],
    ['Status',         <SenderIdentityStatus key="status" status={sender.status} />],
    ['Last Verified',  formatDate(sender.lastVerified)],
    ['Added',          formatDate(sender.addedAt)],
  ]

  return (
    <Modal open onClose={onClose} size="medium">
      <ModalHeader onClose={onClose}>Sender Details</ModalHeader>
      <ModalBody>
        <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px 16px', fontSize: 13 }}>
          {rows.map(([label, value]) => (
            <Fragment key={label as string}>
              <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500, margin: 0 }}>{label}</dt>
              <dd style={{ margin: 0 }}>{value}</dd>
            </Fragment>
          ))}
        </dl>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end' }}>
        <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
      </ModalFooter>
    </Modal>
  )
}

// ── ConfirmDeleteModal ────────────────────────────────────────────────────────

function ConfirmDeleteModal({ sender, onClose, onConfirm }: {
  sender:    SenderIdentity | null
  onClose:   () => void
  onConfirm: () => void
}) {
  if (!sender) return null

  return (
    <Modal open onClose={onClose} size="medium">
      <ModalHeader onClose={onClose}>Remove Sender</ModalHeader>
      <ModalBody>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: '20px' }}>
          Remove <strong>{sender.email}</strong> from the sender list? Campaigns using this sender
          will need to be updated before they can send.
        </p>
      </ModalBody>
      <ModalFooter style={{ justifyContent: 'flex-end', gap: 8 }}>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={onConfirm}
          style={{ background: 'var(--surface-action-destructive-default)', borderColor: 'var(--surface-action-destructive-default)' }}>
          Remove
        </Button>
      </ModalFooter>
    </Modal>
  )
}

type PageState = 'data' | 'loading' | 'empty' | 'error'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChannelsPage() {
  const { role }                        = useRole()
  const [senders, setSenders]           = useState<SenderIdentity[]>(SENDERS)
  const [search,  setSearch]            = useState('')
  const [visible, setVisible]           = useState(10)
  const [addOpen, setAddOpen]           = useState(false)
  const [detailSender, setDetailSender] = useState<SenderIdentity | null>(null)
  const [deleteSender, setDeleteSender] = useState<SenderIdentity | null>(null)
  const [pageState, setPageState]       = useState<PageState>('data')

  const filtered = useMemo(() => {
    if (!search) return senders
    const q = search.toLowerCase()
    return senders.filter(s =>
      s.email.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q)
    )
  }, [senders, search])

  useEffect(() => { setVisible(10) }, [search])

  const rows = filtered.slice(0, visible)

  function handleAdd(s: SenderIdentity) { setSenders(prev => [s, ...prev]) }

  function handleReVerify(id: string) {
    setSenders(prev => prev.map(s => s.id === id ? { ...s, status: 'pending' as const } : s))
    toast.info('Verification email sent')
  }

  function handleDelete() {
    if (!deleteSender) return
    setSenders(prev => prev.filter(s => s.id !== deleteSender.id))
    setDeleteSender(null)
  }

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: '32px' }}>
        Sender Identities
      </h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Verified sender email addresses used in campaign From fields. Each sender must pass
        domain verification before it can be used in a campaign.
      </p>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Senders ({senders.length})
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon size={14} color="var(--color-text-secondary)"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search senders…"
              style={{
                padding: '7px 10px 7px 30px', borderRadius: 8, width: 220, boxSizing: 'border-box',
                border: '1px solid var(--color-border)', fontSize: 13, outline: 'none',
                background: 'var(--color-surface-section)', color: 'var(--color-text-primary)',
              }}
            />
          </div>
          {canEdit(role) && (
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon size={14} /> Add New Sender
            </Button>
          )}
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
          <MessageBox type="error" size="block" title="Failed to load sender identities"
            message="There was a problem fetching your senders. Please refresh the page." />
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {pageState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-section)' }}>
              <Skeleton width={200} height={14} />
              <Skeleton width={140} height={14} />
              <Skeleton width={120} height={14} />
              <Skeleton width={72}  height={20} radius={4} />
              <Skeleton width={90}  height={14} />
              <Skeleton width={28}  height={28} radius={6} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div style={{ padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No sender identities
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Add a verified sender email address before you can launch campaigns.
          </p>
          {canEdit(role) && (
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon size={14} /> Add New Sender
            </Button>
          )}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      {(pageState === 'data' || pageState === 'error') && (<>
      <Table size="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead>Campaign Group</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Verified</TableHead>
            <TableHead style={{ width: 40 }} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(sender => (
            <TableRow key={sender.id}>
              <TableCell>
                <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{sender.email}</span>
              </TableCell>
              <TableCell>{sender.displayName}</TableCell>
              <TableCell variant="secondary">{GROUP_MAP[sender.groupId] ?? '—'}</TableCell>
              <TableCell><SenderIdentityStatus status={sender.status} /></TableCell>
              <TableCell variant="secondary">{formatDate(sender.lastVerified)}</TableCell>
              <TableCell align="center">
                <RowActions
                  sender={sender}
                  onViewDetails={() => setDetailSender(sender)}
                  onReVerify={() => handleReVerify(sender.id)}
                  onDelete={() => setDeleteSender(sender)}
                  editable={canEdit(role)}
                  deletable={canDelete(role)}
                />
              </TableCell>
            </TableRow>
          ))}
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
          {search ? 'No senders match your search.' : 'No sender identities yet.'}
        </div>
      )}
      </>)}

      <AddChannelModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
      <ViewDetailsModal sender={detailSender} onClose={() => setDetailSender(null)} />
      <ConfirmDeleteModal sender={deleteSender} onClose={() => setDeleteSender(null)} onConfirm={handleDelete} />
      <Toaster position="top-right" />
    </div>
  )
}
