'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { FunnelIcon, XIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { MetricTile } from './_components/MetricTile'
import { SwitchAccountButton } from './_components/SwitchAccountButton'
import { MessageBox } from '@/components/ui/message-box'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { CAMPAIGNS } from './_mock/campaigns'
import type { CampaignType, CampaignStatus } from './_mock/campaigns'
import { CAMPAIGN_GROUPS } from './_mock/groups'
import { DASHBOARD_METRICS } from './_mock/metrics'

// ── Lookups & chip configs ────────────────────────────────────────────────────

const GROUP_MAP = Object.fromEntries(CAMPAIGN_GROUPS.map(g => [g.id, g.name]))

const TYPE_CHIP: Record<CampaignType, { label: string; bg: string; color: string }> = {
  'voice-survey':       { label: 'Voice Survey',       bg: 'var(--surface-accent-info-light)', color: 'var(--text-info)' },
  'sms-survey':         { label: 'SMS Survey',          bg: 'var(--surface-accent-info-light)', color: 'var(--text-info)' },
  'voice-notification': { label: 'Voice Notification',  bg: 'var(--warning-100)', color: 'var(--text-warning)' },
  'sms-notification':   { label: 'SMS Notification',    bg: 'var(--warning-100)', color: 'var(--text-warning)' },
  'email-campaign':     { label: 'Email Campaign',      bg: 'var(--success-100)', color: 'var(--text-success)' },
}

const STATUS_CHIP: Record<string, { label: string; bg: string; color: string }> = {
  running:     { label: 'Running',     bg: 'var(--info-100)', color: 'var(--text-info)' },
  paused:      { label: 'Paused',      bg: 'var(--warning-100)', color: 'var(--text-warning)' },
  scheduled:   { label: 'Scheduled',   bg: 'var(--success-100)', color: 'var(--text-success)' },
  initialized: { label: 'Initialized', bg: 'var(--neutral-100)', color: 'var(--neutral-700)' },
  failed:      { label: 'Failed',      bg: 'var(--error-100)', color: 'var(--text-error)' },
  completed:   { label: 'Completed',   bg: 'var(--success-100)', color: 'var(--text-success)' },
  // legacy aliases
  sending: { label: 'Running',     bg: 'var(--info-100)', color: 'var(--text-info)' },
  sent:    { label: 'Completed',   bg: 'var(--success-100)', color: 'var(--text-success)' },
  draft:   { label: 'Initialized', bg: 'var(--neutral-100)', color: 'var(--neutral-700)' },
  cancelled:{ label: 'Failed',     bg: 'var(--error-100)', color: 'var(--text-error)' },
}

const KPI = [
  { title: 'Active Campaigns',    format: 'number'  as const, ...DASHBOARD_METRICS.activeCampaigns    },
  { title: 'Messages Sent',       format: 'number'  as const, ...DASHBOARD_METRICS.messagesSent       },
  { title: 'Delivery Rate',       format: 'percent' as const, ...DASHBOARD_METRICS.deliveryRate       },
  { title: 'Survey Responses',    format: 'number'  as const, ...DASHBOARD_METRICS.surveyResponses    },
  { title: 'Voicemail Responses', format: 'percent' as const, ...DASHBOARD_METRICS.voicemailResponses },
]

// ── Tiny badge helper ─────────────────────────────────────────────────────────

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: 10, fontWeight: 600,
      padding: '3px 8px', borderRadius: 6, background: bg, color, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

const SELECT_STYLE: React.CSSProperties = {
  width: '100%', padding: '6px 8px', borderRadius: 6, fontSize: 12,
  border: '1px solid var(--color-border)', background: 'var(--color-surface-section)',
  color: 'var(--color-text-primary)', outline: 'none',
}

export default function DashboardPage() {
  const [search,       setSearch]       = useState('')
  const [visible,      setVisible]      = useState(10)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [filterGroup,  setFilterGroup]  = useState('')
  const [filterType,   setFilterType]   = useState<CampaignType | ''>('')
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | ''>('')

  const filtered = useMemo(() => {
    let r = CAMPAIGNS
    if (search)        r = r.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    if (filterGroup)   r = r.filter(c => c.groupId  === filterGroup)
    if (filterType)    r = r.filter(c => c.type     === filterType)
    if (filterStatus)  r = r.filter(c => c.status   === filterStatus)
    return r
  }, [search, filterGroup, filterType, filterStatus])

  useEffect(() => { setVisible(10) }, [search, filterGroup, filterType, filterStatus])

  const rows = filtered.slice(0, visible)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: '32px' }}>
            Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px', marginTop: 2 }}>
            Track your agencies and campaigns performances
          </p>
        </div>
        <SwitchAccountButton />
      </div>

      {/* ── Info banner ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <MessageBox type="info" size="line" dismissible={false}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: 'var(--text-body-primary)' }}>
            1 sender identity awaiting verification.{' '}
            <Link href="/sandbox/campaigns-email/channels" style={{ color: 'var(--content-action-primary-600)', fontWeight: 600, textDecoration: 'none' }}>
              Review senders →
            </Link>
          </p>
        </MessageBox>
      </div>

      {/* ── Overall Performance ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Overall Performance
          </h2>
          <select defaultValue="7d" style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, border: '1px solid var(--color-border)', background: 'var(--color-surface-section)', color: 'var(--color-text-primary)' }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {KPI.map(k => (
            <MetricTile key={k.title} title={k.title} value={k.value} format={k.format} delta={k.delta} deltaLabel="vs last week" />
          ))}
        </div>
      </div>

      {/* ── Campaigns ────────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Campaigns
          </h2>
          <Link href="/sandbox/campaigns-email/campaigns/new">
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: 'var(--color-primary)', color: 'var(--neutral-0)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              + Create New Campaign
            </button>
          </Link>
        </div>

        {/* Search + filter toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <MagnifyingGlassIcon size={14} color="var(--color-text-secondary)"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search campaigns…"
              style={{
                width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8,
                border: '1px solid var(--color-border)', fontSize: 13,
                background: 'var(--color-surface-section)', color: 'var(--color-text-primary)', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            onClick={() => setFilterOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${filterOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: filterOpen ? 'var(--color-info-100)' : 'var(--color-surface-section)',
              color: filterOpen ? 'var(--color-primary)' : 'var(--color-text-primary)',
              fontSize: 13, fontWeight: 500,
            }}
          >
            <FunnelIcon size={14} weight={filterOpen ? 'fill' : 'regular'} />
            Filters
          </button>
        </div>

        {/* Filter panel + table */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Filter panel */}
          {filterOpen && (
            <div style={{
              width: 250, flexShrink: 0,
              background: 'var(--color-surface-section)',
              border: '1px solid var(--color-border)',
              borderRadius: 8, padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Filters</span>
                <button onClick={() => setFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
                  <XIcon size={16} color="var(--color-text-secondary)" />
                </button>
              </div>

              {[
                {
                  label: 'Campaign Group', value: filterGroup,
                  onChange: (v: string) => setFilterGroup(v),
                  options: [{ value: '', label: 'All Groups' }, ...CAMPAIGN_GROUPS.map(g => ({ value: g.id, label: g.name }))],
                },
                {
                  label: 'Type', value: filterType,
                  onChange: (v: string) => setFilterType(v as CampaignType | ''),
                  options: [
                    { value: '', label: 'All Types' },
                    ...Object.entries(TYPE_CHIP).map(([k, v]) => ({ value: k, label: v.label })),
                  ],
                },
                {
                  label: 'Status', value: filterStatus,
                  onChange: (v: string) => setFilterStatus(v as CampaignStatus | ''),
                  options: [
                    { value: '', label: 'All Statuses' },
                    { value: 'running',     label: 'Running'     },
                    { value: 'paused',      label: 'Paused'      },
                    { value: 'scheduled',   label: 'Scheduled'   },
                    { value: 'initialized', label: 'Initialized' },
                    { value: 'failed',      label: 'Failed'      },
                    { value: 'completed',   label: 'Completed'   },
                  ],
                },
                {
                  label: 'Date Range', value: '',
                  onChange: () => {},
                  options: [{ value: '', label: 'All time' }, { value: '7d', label: 'Last 7 days' }, { value: '30d', label: 'Last 30 days' }],
                },
              ].map(({ label, value, onChange, options }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {label}
                  </label>
                  <select value={value} onChange={e => onChange(e.target.value)} style={SELECT_STYLE}>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Table size="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Campaign Group</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead align="right">Contacts</TableHead>
                  <TableHead align="right">Delivery Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c, i) => {
                  const typeCfg   = c.type ? TYPE_CHIP[c.type] : null
                  const statusCfg = STATUS_CHIP[c.status] ?? { label: c.status, bg: 'var(--neutral-100)', color: 'var(--neutral-700)' }
                  return (
                    <TableRow key={c.id} striped={i % 2 === 1}>
                      <TableCell variant="link">
                        <Link href={`/sandbox/campaigns-email/campaigns/${c.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell variant="secondary">{GROUP_MAP[c.groupId] ?? c.groupId}</TableCell>
                      <TableCell>
                        {typeCfg
                          ? <Badge label={typeCfg.label} bg={typeCfg.bg} color={typeCfg.color} />
                          : <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>—</span>
                        }
                      </TableCell>
                      <TableCell align="right">
                        {c.contacts != null ? c.contacts.toLocaleString() : '—'}
                      </TableCell>
                      <TableCell align="right">
                        {c.deliveryRate ? `${c.deliveryRate.toFixed(1)}%` : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge label={statusCfg.label} bg={statusCfg.bg} color={statusCfg.color} />
                      </TableCell>
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
                No campaigns match your filters.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
