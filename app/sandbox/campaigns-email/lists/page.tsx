'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, ArrowsClockwiseIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Toaster, toast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/loading'
import { MessageBox } from '@/components/ui/message-box'
import { LISTS } from '../_mock/lists'
import type { ContactList, ListChannel, ListStatus } from '../_mock/lists'
import { CAMPAIGN_GROUPS } from '../_mock/groups'
import { UploadModal } from './_components/UploadModal'
import { useRole, canEdit } from '../_context/RoleContext'

const GROUP_MAP = Object.fromEntries(CAMPAIGN_GROUPS.map(g => [g.id, g.name]))

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

const STATUS_CONFIG: Record<ListStatus, { label: string; bg: string; color: string }> = {
  active:   { label: 'Active',   bg: 'var(--color-success-100)',     color: '#1a6b1a'                       },
  updating: { label: 'Updating', bg: 'var(--color-warning-100)',     color: '#7a4a00'                       },
  archived: { label: 'Archived', bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)'   },
}

const TYPE_CONFIG: Record<ListChannel, { label: string; bg: string; color: string }> = {
  email: { label: 'Email',        bg: '#d6e2f5', color: '#2859ab' },
  phone: { label: 'Phone',        bg: '#ddf4d2', color: '#4b9924' },
  both:  { label: 'Email + Phone',bg: '#fbeed8', color: '#c79033' },
}

function StatusChip({ status }: { status: ListStatus }) {
  const { label, bg, color } = STATUS_CONFIG[status]
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: bg, color }}>
      {label}
    </span>
  )
}

function TypeChip({ channel }: { channel: ListChannel }) {
  const { label, bg, color } = TYPE_CONFIG[channel]
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: bg, color }}>
      {label}
    </span>
  )
}

type PageState = 'data' | 'loading' | 'empty' | 'error'

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ListsPage() {
  const { role }                          = useRole()
  const [lists, setLists]                 = useState<ContactList[]>(LISTS)
  const [search, setSearch]               = useState('')
  const [visible, setVisible]             = useState(10)
  const [modalOpen, setModalOpen]         = useState(false)
  const [editList, setEditList]           = useState<ContactList | null>(null)
  const [pageState, setPageState]         = useState<PageState>('data')

  const filtered = useMemo(() => {
    if (!search) return lists
    const q = search.toLowerCase()
    return lists.filter(l => l.name.toLowerCase().includes(q))
  }, [lists, search])

  useEffect(() => { setVisible(10) }, [search])

  const rows = filtered.slice(0, visible)

  function handleAdd(newList: ContactList) {
    setLists(prev => [newList, ...prev])
    toast.success('List imported successfully')
  }

  function openNew() { setEditList(null); setModalOpen(true) }
  function openEdit(list: ContactList) { setEditList(list); setModalOpen(true) }

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: '32px' }}>
        Recipient Lists
      </h1>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
        Segmented recipient groups used in campaign sends. Each list contains contact records with
        email addresses, phone numbers, or both.
      </p>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Lists ({lists.length})
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <MagnifyingGlassIcon size={14} color="var(--color-text-secondary)"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search lists…"
              style={{
                padding: '7px 10px 7px 30px', borderRadius: 8, width: 220, boxSizing: 'border-box',
                border: '1px solid var(--color-border)', fontSize: 13, outline: 'none',
                background: 'var(--color-surface-section)', color: 'var(--color-text-primary)',
              }}
            />
          </div>
          {canEdit(role) && (
            <Button variant="primary" size="sm" onClick={openNew}>
              <PlusIcon size={14} /> New List
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
            color:       pageState === s ? '#fff' : 'var(--color-text-secondary)',
            borderColor: pageState === s ? 'var(--color-primary)' : 'var(--color-border)',
            cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {pageState === 'error' && (
        <div role="alert" style={{ marginBottom: 16 }}>
          <MessageBox type="error" size="block" title="Failed to load lists"
            message="There was a problem fetching your lists. Please refresh the page." />
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
              <Skeleton width={64}  height={20} radius={4} />
              <Skeleton width={60}  height={14} />
              <Skeleton width={80}  height={20} radius={4} />
              <Skeleton width={50}  height={14} />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {pageState === 'empty' && (
        <div style={{ padding: '56px 24px', textAlign: 'center',
          border: '1px dashed var(--color-border)', borderRadius: 10 }}>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No recipient lists
          </p>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' }}>
            Import your first list to start sending campaigns to your audience.
          </p>
          {canEdit(role) && (
            <Button variant="primary" size="sm" onClick={openNew}>
              <PlusIcon size={14} /> Import a List
            </Button>
          )}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      {(pageState === 'data' || pageState === 'error') && (<>
      <Table size="compact">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Campaign Group</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Topics</TableHead>
            <TableHead>Type</TableHead>
            <TableHead align="right">Records</TableHead>
            {canEdit(role) && <TableHead style={{ width: 120 }} />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(list => (
            <TableRow key={list.id}>
              <TableCell>
                <Link
                  href={`/sandbox/campaigns-email/lists/${list.id}`}
                  style={{ color: 'var(--color-primary)', fontWeight: 500, fontSize: 13, textDecoration: 'none' }}
                >
                  {list.name}
                </Link>
              </TableCell>
              <TableCell variant="secondary">{GROUP_MAP[list.groupId] ?? '—'}</TableCell>
              <TableCell><StatusChip status={list.status} /></TableCell>
              <TableCell variant="secondary">
                {list.topicIds.length === 0
                  ? <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>—</span>
                  : `${list.topicIds.length} topic${list.topicIds.length > 1 ? 's' : ''}`
                }
              </TableCell>
              <TableCell><TypeChip channel={list.channel} /></TableCell>
              <TableCell align="right">
                <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                  {fmtCount(list.recipientCount)}
                </span>
              </TableCell>
              {canEdit(role) && (
                <TableCell align="center">
                  <button
                    onClick={() => openEdit(list)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <ArrowsClockwiseIcon size={12} /> Update List
                  </button>
                </TableCell>
              )}
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
          {search ? 'No lists match your search.' : 'No recipient lists yet.'}
        </div>
      )}
      </>)}

      <UploadModal open={modalOpen} editList={editList} onClose={() => setModalOpen(false)} onAdd={handleAdd} />
      <Toaster position="top-right" />
    </div>
  )
}
