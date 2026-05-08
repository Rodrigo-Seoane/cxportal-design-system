'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { HouseIcon, CaretRightIcon } from '@phosphor-icons/react'

function AgentStatusSummaryInner() {
  const params = useSearchParams()
  return (
    <div style={{ padding: 40, fontFamily: 'var(--font-sans)', maxWidth: 600 }}>
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 24 }}>
        <HouseIcon size={14} color="#7a828c" weight="regular" />
        <span style={{ fontSize: 12, color: '#7a828c' }}>Reporting</span>
        <CaretRightIcon size={12} color="#aab0b8" weight="regular" />
        <Link href={`/wfm/reporting/real-time-workforce?${params.toString()}`} style={{ fontSize: 12, color: '#4285f4', textDecoration: 'none' }}>
          Real-Time Workforce
        </Link>
        <CaretRightIcon size={12} color="#aab0b8" weight="regular" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>Agent Status Summary</span>
      </nav>

      <h1 style={{ fontSize: 24, fontWeight: 400, color: '#021920', marginBottom: 12 }}>Agent Status Summary</h1>

      <div style={{ padding: '16px 20px', background: '#fbeed8', border: '1px solid #f7ddb1', borderRadius: 8, marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#7a4a00', fontWeight: 600 }}>Prototype stub — PRDENG-2661</p>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7a4a00' }}>
          This route is the navigation target from agent rows in the Real-Time Workforce Dashboard.
          Full implementation is the next prototype in the series.
        </p>
      </div>

      {params.toString() && (
        <div style={{ padding: '12px 16px', background: '#f8f8f8', borderRadius: 6, fontSize: 12, color: '#7a828c', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          Filter context received: {decodeURIComponent(params.toString())}
        </div>
      )}
    </div>
  )
}

export default function AgentStatusSummaryPage() {
  return <Suspense><AgentStatusSummaryInner /></Suspense>
}
