'use client'

// Canonical landing — auto-routes to supervisor default scope (sg-triage-day).
// In production this redirect would be driven by the authenticated user's RBAC profile.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SupervisorScorecardIndex() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/wfm/reporting/supervisor-scorecard/sg-triage-day')
  }, [router])

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', fontSize: 14, color: '#7a828c',
    }}>
      Loading your scorecard…
    </div>
  )
}

export const dynamic = 'force-dynamic'
