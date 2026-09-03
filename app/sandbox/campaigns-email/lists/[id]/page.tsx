'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { LISTS, MOCK_CONTACTS } from '../../_mock/lists'
import { CAMPAIGN_GROUPS } from '../../_mock/groups'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

const GROUP_MAP = Object.fromEntries(CAMPAIGN_GROUPS.map(g => [g.id, g.name]))

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_CONFIG = {
  active:   { label: 'Active',   bg: 'var(--color-success-100)',     color: 'var(--text-success)'                     },
  updating: { label: 'Updating', bg: 'var(--color-warning-100)',     color: 'var(--text-warning)'                     },
  archived: { label: 'Archived', bg: 'var(--color-surface-display)', color: 'var(--color-text-secondary)' },
}

const TYPE_LABEL = { email: 'Email', phone: 'Phone', both: 'Email + Phone' }

function MetaItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  )
}

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>()
  const list   = LISTS.find(l => l.id === id)

  if (!list) {
    return (
      <div style={{ padding: '48px 36px', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', color: 'var(--color-text-secondary)', fontSize: 13 }}>
          List not found.
        </p>
        <Link href="/sandbox/campaigns-email/lists"
          style={{ color: 'var(--color-primary)', fontSize: 13, textDecoration: 'none' }}>
          ← Back to Recipient Lists
        </Link>
      </div>
    )
  }

  const groupName = GROUP_MAP[list.groupId] ?? '—'
  const status    = STATUS_CONFIG[list.status]

  return (
    <div style={{ padding: '28px 36px', maxWidth: 960 }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
        fontSize: 12, color: 'var(--color-text-secondary)' }}>
        <Link href="/sandbox/campaigns-email/lists"
          style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeftIcon size={12} /> Recipient Lists
        </Link>
        <CaretRightIcon size={12} />
        <span>{list.name}</span>
      </div>

      {/* ── Page header ─────────────────────────────────────────────── */}
      <h1 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: '32px' }}>
        {list.name}
      </h1>

      {/* ── Metadata strip ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 32, flexWrap: 'wrap', padding: '16px 20px',
        borderRadius: 10, border: '1px solid var(--color-border)',
        background: 'var(--color-surface-section)', marginBottom: 28,
      }}>
        <MetaItem label="Campaign Group" value={groupName} />
        <MetaItem label="Status" value={
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: status.bg, color: status.color }}>
            {status.label}
          </span>
        } />
        <MetaItem label="Records" value={fmtCount(list.recipientCount)} />
        <MetaItem label="Type" value={TYPE_LABEL[list.channel]} />
        <MetaItem label="Last Updated" value={fmtDate(list.lastUpdated)} />
      </div>

      {/* ── Contacts table ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 8 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Contact Records
          <span style={{
            marginLeft: 8, fontSize: 12, fontWeight: 400,
            color: 'var(--color-text-secondary)',
          }}>
            showing {MOCK_CONTACTS.length} of {fmtCount(list.recipientCount)}
          </span>
        </h2>
        <Table size="compact">
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_CONTACTS.map(contact => (
              <TableRow key={contact.id}>
                <TableCell>
                  <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{contact.email}</span>
                </TableCell>
                <TableCell>{contact.firstName}</TableCell>
                <TableCell variant="secondary">{contact.lastName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
