'use client'

import { Suspense } from 'react'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ArrowLeftIcon, HouseIcon, CaretRightIcon } from '@phosphor-icons/react'
import Link from 'next/link'

import { AGENT_BANK } from '@/mocks/wfm/store'

function AgentScorecardInner() {
  const { agentId } = useParams<{ agentId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const agent = AGENT_BANK.find(a => a.id === agentId)

  // Preserve filter context when navigating back
  const backHref = `/wfm/reporting/agent-status-summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-display)', fontFamily: 'var(--font-sans)' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '0 24px', height: 64,
        background: '#ffffff', borderBottom: '1px solid #e2e5e8',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
          <HouseIcon size={14} color="#7a828c" weight="regular" aria-hidden="true" />
          <span style={{ fontSize: 12, color: '#7a828c' }}>Reporting</span>
          <CaretRightIcon size={12} color="#aab0b8" weight="regular" aria-hidden="true" />
          <Link href={backHref} style={{ fontSize: 12, color: '#7a828c', textDecoration: 'none' }}>
            Agent Status Summary
          </Link>
          <CaretRightIcon size={12} color="#aab0b8" weight="regular" aria-hidden="true" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#021920', whiteSpace: 'nowrap' }}>
            {agent?.name ?? agentId}
          </span>
        </nav>

        <Link
          href={backHref}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 6, border: '1px solid #d9dce0',
            background: '#ffffff', fontSize: 13, fontWeight: 500,
            color: '#021920', fontFamily: 'var(--font-sans)', textDecoration: 'none',
            minHeight: 44,
          }}
        >
          <ArrowLeftIcon size={14} weight="regular" aria-hidden="true" />
          Back to summary
        </Link>
      </header>

      {/* ── Stub content ─────────────────────────────────────────────────── */}
      <main style={{ padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          background: '#ffffff', borderRadius: 8, border: '1px solid #e2e5e8',
          padding: '48px 40px', maxWidth: 560, width: '100%', textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: '#f0f4fb', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
            fontSize: 28,
          }}>
            📋
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#021920' }}>
            Agent Scorecard
          </h1>

          {agent && (
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#3a4a54' }}>
              {agent.name}
            </p>
          )}

          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#7a828c', lineHeight: '20px' }}>
            This page will show historical adherence, activity breakdown, schedule compliance,
            and performance trends for this agent.
            <br /><br />
            Scope: <strong>PRDENG-2662 — Agent Scorecard</strong>
          </p>

          {agent && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              background: '#f8f9fa', borderRadius: 6, padding: 16,
              textAlign: 'left', fontSize: 13,
            }}>
              <div>
                <span style={{ color: '#7a828c', display: 'block', marginBottom: 2 }}>Agent ID</span>
                <span style={{ color: '#021920', fontWeight: 500 }}>{agent.id}</span>
              </div>
              <div>
                <span style={{ color: '#7a828c', display: 'block', marginBottom: 2 }}>Status</span>
                <span style={{ color: '#021920', fontWeight: 500 }}>{agent.status}</span>
              </div>
              <div>
                <span style={{ color: '#7a828c', display: 'block', marginBottom: 2 }}>Adherence</span>
                <span style={{ color: '#021920', fontWeight: 500 }}>{agent.adherence === 'out' ? 'Out of adherence' : 'In adherence'}</span>
              </div>
              <div>
                <span style={{ color: '#7a828c', display: 'block', marginBottom: 2 }}>Staffing group</span>
                <span style={{ color: '#021920', fontWeight: 500 }}>{agent.staffingGroupId}</span>
              </div>
            </div>
          )}

          {!agent && (
            <p style={{ fontSize: 13, color: '#ef2056', marginTop: 16 }}>
              Agent not found in mock data bank — agent ID: <code>{agentId}</code>
            </p>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AgentScorecardPage() {
  return <Suspense><AgentScorecardInner /></Suspense>
}

export const dynamic = 'force-dynamic'
