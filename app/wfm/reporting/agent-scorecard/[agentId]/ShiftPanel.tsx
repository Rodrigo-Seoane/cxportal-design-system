'use client'

import { ArrowRightIcon, WarningIcon } from '@phosphor-icons/react'
import { DrillOutLink } from '@/components/wfm/DrillOutLink'
import type { ShiftTrade, ShiftExchange } from '@/mocks/wfm/store'

// ── Shared status badge ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'approved' | 'pending' | 'rejected' }) {
  const styles: Record<string, React.CSSProperties> = {
    approved: { background: 'var(--success-100)', color: 'var(--success-600)' },
    pending:  { background: 'var(--warning-100)', color: 'var(--text-warning)' },
    rejected: { background: 'var(--error-50)', color: 'var(--text-destructive)' },
  }
  return (
    <span style={{
      ...styles[status],
      fontSize: 11, fontWeight: 600, padding: '2px 7px',
      borderRadius: 64, fontFamily: 'var(--font-sans)',
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Shift Trade Panel ──────────────────────────────────────────────────────────

export function ShiftTradePanel({ trades, agentId }: { trades: ShiftTrade[]; agentId: string }) {
  return (
    <div style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-100)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--neutral-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Triangle = shift-trade marker (matches chart) */}
          <svg width="12" height="12" aria-hidden="true">
            <polygon points="6,1 0,11 12,11" fill="var(--content-action-primary-600)" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)' }}>
            Shift Trades
          </span>
          <span style={{
            fontSize: 11, background: 'var(--content-action-primary-100)', color: 'var(--content-action-primary-700)',
            padding: '1px 7px', borderRadius: 64, fontWeight: 600,
          }}>
            {trades.length}
          </span>
        </div>
        <DrillOutLink
          report="schedule-adherence"
          params={{ agentId }}
          label="View in FCS"
          requiredRole="wfm-lead"
        />
      </div>

      {trades.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)' }}>
          No shift trades in this period
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ background: 'var(--neutral-50)' }}>
              {['Date', 'Original', 'Traded', 'Hrs', 'Counterparty', 'Status'].map(h => (
                <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-body-secondary)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map(t => (
              <tr key={t.id} style={{ borderTop: '1px solid var(--neutral-100)' }}>
                <td style={{ padding: '9px 12px', color: 'var(--text-body-primary)', whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                <td style={{ padding: '9px 12px', color: 'var(--neutral-700)', whiteSpace: 'nowrap' }}>{t.originalShift}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--neutral-700)' }}>
                    <ArrowRightIcon size={12} aria-hidden="true" />
                    {t.tradedShift}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: t.hoursVariance === 0 ? 'var(--text-body-secondary)' : t.hoursVariance > 0 ? 'var(--success-600)' : 'var(--text-error)', fontWeight: 600 }}>
                  {t.hoursVariance > 0 ? `+${t.hoursVariance}h` : t.hoursVariance < 0 ? `${t.hoursVariance}h` : '+0h'}
                  {t.laborOverride && (
                    <WarningIcon size={12} color="var(--text-warning)" weight="fill" style={{ marginLeft: 4 }} aria-label="Labor rule override" />
                  )}
                </td>
                <td style={{ padding: '9px 12px', color: 'var(--neutral-700)' }}>{t.counterpartyName}</td>
                <td style={{ padding: '9px 12px' }}><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ── Shift Exchange Panel ───────────────────────────────────────────────────────

export function ShiftExchangePanel({ exchanges, agentId }: { exchanges: ShiftExchange[]; agentId: string }) {
  return (
    <div style={{ background: 'var(--neutral-0)', border: '1px solid var(--neutral-100)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid var(--neutral-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Square = shift-exchange marker (matches chart) */}
          <svg width="12" height="12" aria-hidden="true">
            <rect x="1" y="1" width="10" height="10" fill="var(--content-action-primary-600)" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-body-primary)', fontFamily: 'var(--font-sans)' }}>
            Shift Exchanges
          </span>
          <span style={{
            fontSize: 11, background: 'var(--content-action-primary-100)', color: 'var(--content-action-primary-700)',
            padding: '1px 7px', borderRadius: 64, fontWeight: 600,
          }}>
            {exchanges.length}
          </span>
        </div>
        <DrillOutLink
          report="schedule-adherence"
          params={{ agentId }}
          label="View in FCS"
          requiredRole="wfm-lead"
        />
      </div>

      {exchanges.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-body-secondary)', fontFamily: 'var(--font-sans)' }}>
          No shift exchanges in this period
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ background: 'var(--neutral-50)' }}>
              {['Date', 'Original', 'Exchanged', 'Counterparty', 'Status'].map(h => (
                <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-body-secondary)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exchanges.map(ex => (
              <tr key={ex.id} style={{ borderTop: '1px solid var(--neutral-100)' }}>
                <td style={{ padding: '9px 12px', color: 'var(--text-body-primary)', whiteSpace: 'nowrap' }}>{fmtDate(ex.date)}</td>
                <td style={{ padding: '9px 12px', color: 'var(--neutral-700)', whiteSpace: 'nowrap' }}>{ex.originalShift}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--neutral-700)' }}>
                    <ArrowRightIcon size={12} aria-hidden="true" />
                    {ex.exchangedShift}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: 'var(--neutral-700)' }}>{ex.counterpartyName}</td>
                <td style={{ padding: '9px 12px' }}><StatusBadge status={ex.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
