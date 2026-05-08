'use client'

import { ArrowSquareOutIcon } from '@phosphor-icons/react'
import { useCurrentUser } from '@/mocks/wfm/store'
import type { Role } from '@/mocks/wfm/store'

export type FCSReport =
  | 'schedule-adherence'
  | 'schedule-publication'
  | 'intraday-management'
  | 'queue-agent-performance'
  | 'calendar'

interface FCSParams {
  agentId?: string
  forecastGroupId?: string
  staffingGroupId?: string
  queueId?: string
  from?: string
  to?: string
}

export interface DrillOutLinkProps {
  report: FCSReport
  params?: FCSParams
  label?: string
  requiredRole?: Role
}

function buildUrl(report: FCSReport, params: FCSParams): string {
  const base = `https://connect.example.com/fcs/${report}`
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v) })
  const q = qs.toString()
  return q ? `${base}?${q}` : base
}

const ROLE_RANK: Record<Role, number> = { supervisor: 0, 'wfm-lead': 1, admin: 2 }

export function DrillOutLink({ report, params = {}, label = 'View report', requiredRole }: DrillOutLinkProps) {
  const { role } = useCurrentUser()

  if (requiredRole && ROLE_RANK[role] < ROLE_RANK[requiredRole]) return null

  return (
    <a
      href={buildUrl(report, params)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:          4,
        color:       '#4285f4',
        fontSize:     12,
        fontWeight:   500,
        lineHeight:  '20px',
        textDecoration: 'none',
        whiteSpace:  'nowrap',
      }}
      onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline' }}
      onMouseOut={e  => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none' }}
    >
      {label}
      <ArrowSquareOutIcon size={12} weight="regular" aria-hidden="true" />
    </a>
  )
}
