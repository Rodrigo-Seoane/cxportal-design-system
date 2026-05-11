'use client'

import { ArrowRightIcon, WarningIcon } from '@phosphor-icons/react'
import { DrillOutLink } from '@/components/wfm/DrillOutLink'
import type { ShiftTrade, ShiftExchange } from '@/mocks/wfm/store'

// ── Shared status badge ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'approved' | 'pending' | 'rejected' }) {
  const styles: Record<string, React.CSSProperties> = {
    approved: { background: '#ddf4d2', color: '#1a6b1a' },
    pending:  { background: '#fbeed8', color: '#7a4a00' },
    rejected: { background: '#fce4e4', color: '#8b1a2a' },
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
    <div style={{ background: '#ffffff', border: '1px solid #e2e5e8', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #eff1f3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Triangle = shift-trade marker (matches chart) */}
          <svg width="12" height="12" aria-hidden="true">
            <polygon points="6,1 0,11 12,11" fill="#4285f4" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#021920', fontFamily: 'var(--font-sans)' }}>
            Shift Trades
          </span>
          <span style={{
            fontSize: 11, background: '#f0f4fb', color: '#1a3561',
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
        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: '#7a828c', fontFamily: 'var(--font-sans)' }}>
          No shift trades in this period
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['Date', 'Original', 'Traded', 'Hrs', 'Counterparty', 'Status'].map(h => (
                <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#7a828c', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map(t => (
              <tr key={t.id} style={{ borderTop: '1px solid #eff1f3' }}>
                <td style={{ padding: '9px 12px', color: '#021920', whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                <td style={{ padding: '9px 12px', color: '#4b535e', whiteSpace: 'nowrap' }}>{t.originalShift}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#4b535e' }}>
                    <ArrowRightIcon size={12} aria-hidden="true" />
                    {t.tradedShift}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: t.hoursVariance === 0 ? '#7a828c' : t.hoursVariance > 0 ? '#1a6b1a' : '#ef2056', fontWeight: 600 }}>
                  {t.hoursVariance > 0 ? `+${t.hoursVariance}h` : t.hoursVariance < 0 ? `${t.hoursVariance}h` : '+0h'}
                  {t.laborOverride && (
                    <WarningIcon size={12} color="#c97000" weight="fill" style={{ marginLeft: 4 }} aria-label="Labor rule override" />
                  )}
                </td>
                <td style={{ padding: '9px 12px', color: '#4b535e' }}>{t.counterpartyName}</td>
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
    <div style={{ background: '#ffffff', border: '1px solid #e2e5e8', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderBottom: '1px solid #eff1f3',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Square = shift-exchange marker (matches chart) */}
          <svg width="12" height="12" aria-hidden="true">
            <rect x="1" y="1" width="10" height="10" fill="#7c3aed" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#021920', fontFamily: 'var(--font-sans)' }}>
            Shift Exchanges
          </span>
          <span style={{
            fontSize: 11, background: '#f3f0fb', color: '#4a1a8b',
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
        <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: '#7a828c', fontFamily: 'var(--font-sans)' }}>
          No shift exchanges in this period
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['Date', 'Original', 'Exchanged', 'Counterparty', 'Status'].map(h => (
                <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#7a828c', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exchanges.map(ex => (
              <tr key={ex.id} style={{ borderTop: '1px solid #eff1f3' }}>
                <td style={{ padding: '9px 12px', color: '#021920', whiteSpace: 'nowrap' }}>{fmtDate(ex.date)}</td>
                <td style={{ padding: '9px 12px', color: '#4b535e', whiteSpace: 'nowrap' }}>{ex.originalShift}</td>
                <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#4b535e' }}>
                    <ArrowRightIcon size={12} aria-hidden="true" />
                    {ex.exchangedShift}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', color: '#4b535e' }}>{ex.counterpartyName}</td>
                <td style={{ padding: '9px 12px' }}><StatusBadge status={ex.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
