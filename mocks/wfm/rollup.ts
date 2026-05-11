'use client'

/**
 * Rollup selectors for PRDENG-2663 — Supervisor Scorecard.
 *
 * Rollup strategy:
 *   By Staffing Group — weighted average of agent adherence % weighted by scheduled time.
 *     Sample: first 15 agents per group (full 200-agent rollup would have the same distribution
 *     since generateAgentHistory is seeded by agentId, not position).
 *   By Forecast Group — roll up across child staffing groups using the same weighting.
 *   By Queue — agents are approximated by mapping queue name to forecast group; agents serving
 *     multiple queues are counted once per queue. The page surfaces a de-dup footnote.
 *   Time values — formatted as h/m at display time, not inside selectors.
 *   Percentages — rounded at display time, not inside selectors.
 */

import {
  AGENT_BANK, STAFFING_GROUPS, FORECAST_GROUPS, QUEUES,
  generateAgentHistory, generateShiftTrades, generateTimeOff,
  seededRandExport,
} from './store'
import type { Agent, DailyAdherencePoint } from './store'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RollupKpi {
  adherencePct: number
  adherentMin: number
  scheduledMin: number
  nonAdherentMin: number
  agentCount: number
  outOfAdherenceCount: number
  late: number
  earlyOut: number
  offActivity: number
}

export interface PeerScope {
  id: string
  label: string
  parentLabel: string
  adherencePct: number
  agentCount: number
  outOfAdherenceCount: number
  isCurrentScope: boolean
}

export type ScheduleStatus = 'published' | 'reviewed' | 'generated' | 'not-started'

export interface WeekReadiness {
  weekLabel: string
  weekStartIso: string
  status: ScheduleStatus
  agentsCoveredPct: number
  agentCount: number
}

export interface AgentListRow {
  agent: Agent
  adherencePct: number
  outDays: number
  scheduledH: number
  timeOffDays: number
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const SAMPLE = 15

function getAgentsForSG(sgId: string): Agent[] {
  return AGENT_BANK.filter(a => a.staffingGroupId === sgId).slice(0, SAMPLE)
}

function getAgentsForFG(fgId: string): Agent[] {
  const sgIds = new Set(STAFFING_GROUPS.filter(sg => sg.forecastGroupId === fgId).map(sg => sg.id))
  return AGENT_BANK.filter(a => sgIds.has(a.staffingGroupId)).slice(0, SAMPLE)
}

// Queue → FG mapping by name convention (mock only; real mapping lives in Connect routing config)
function queueToFGId(queueId: string): string {
  if (queueId.includes('triage'))  return 'fg-triage'
  if (queueId.includes('bh'))      return 'fg-bh'
  if (queueId.includes('pharm'))   return 'fg-pharmacy'
  if (queueId.includes('member'))  return 'fg-member'
  if (queueId.includes('provider'))return 'fg-provider'
  if (queueId.includes('care'))    return 'fg-care'
  return 'fg-triage'
}

export function getAgentsForScope(scopeId: string): Agent[] {
  if (scopeId.startsWith('sg-')) return getAgentsForSG(scopeId)
  if (scopeId.startsWith('fg-')) return getAgentsForFG(scopeId)
  return getAgentsForFG(queueToFGId(scopeId))
}

export function getScopeLabel(scopeId: string): string {
  if (scopeId.startsWith('sg-')) return STAFFING_GROUPS.find(s => s.id === scopeId)?.label ?? scopeId
  if (scopeId.startsWith('fg-')) return FORECAST_GROUPS.find(f => f.id === scopeId)?.label ?? scopeId
  return QUEUES.find(q => q.id === scopeId)?.label ?? scopeId
}

export function getScopeTypeLabel(scopeId: string): string {
  if (scopeId.startsWith('sg-')) return 'Staffing Group'
  if (scopeId.startsWith('fg-')) return 'Forecast Group'
  return 'Queue'
}

export function getScopeParentLabel(scopeId: string): string {
  if (scopeId.startsWith('sg-')) {
    const sg = STAFFING_GROUPS.find(s => s.id === scopeId)
    return FORECAST_GROUPS.find(f => f.id === sg?.forecastGroupId)?.label ?? ''
  }
  if (scopeId.startsWith('fg-')) return 'All Forecast Groups'
  return FORECAST_GROUPS.find(f => f.id === queueToFGId(scopeId))?.label ?? ''
}

// Navigate scope type: returns the best target scopeId when switching rollup dimension
export function switchScopeTo(currentId: string, targetType: 'staffing-group' | 'forecast-group' | 'queue'): string {
  if (targetType === 'forecast-group') {
    if (currentId.startsWith('sg-')) {
      const sg = STAFFING_GROUPS.find(s => s.id === currentId)
      return sg?.forecastGroupId ?? 'fg-triage'
    }
    if (currentId.startsWith('q-')) return queueToFGId(currentId)
    return currentId
  }
  if (targetType === 'staffing-group') {
    if (currentId.startsWith('fg-')) {
      return STAFFING_GROUPS.find(sg => sg.forecastGroupId === currentId)?.id ?? 'sg-triage-day'
    }
    if (currentId.startsWith('q-')) {
      const fgId = queueToFGId(currentId)
      return STAFFING_GROUPS.find(sg => sg.forecastGroupId === fgId)?.id ?? 'sg-triage-day'
    }
    return currentId
  }
  if (targetType === 'queue') {
    const fgId = currentId.startsWith('fg-') ? currentId
      : currentId.startsWith('sg-') ? (STAFFING_GROUPS.find(s => s.id === currentId)?.forecastGroupId ?? 'fg-triage')
      : queueToFGId(currentId)
    const q = QUEUES.find(q => queueToFGId(q.id) === fgId)
    return q?.id ?? 'q-triage-main'
  }
  return currentId
}

function computeRollup(agents: Agent[], range: { from: string; to: string }): RollupKpi {
  let adherentMin = 0, scheduledMin = 0, nonAdherentMin = 0

  agents.forEach(agent => {
    generateAgentHistory(agent.id, 90)
      .filter(p => p.date >= range.from && p.date <= range.to)
      .forEach(p => {
        adherentMin    += p.adherentMin
        scheduledMin   += p.scheduledMin
        nonAdherentMin += p.nonAdherentMin
      })
  })

  const adherencePct = scheduledMin > 0 ? (adherentMin / scheduledMin) * 100 : 0
  const outOfAdherenceCount = agents.filter(a => a.adherence === 'out').length
  const late = Math.round(nonAdherentMin * 0.40)
  const earlyOut = Math.round(nonAdherentMin * 0.25)

  return {
    adherencePct, adherentMin, scheduledMin, nonAdherentMin,
    agentCount: agents.length, outOfAdherenceCount,
    late, earlyOut, offActivity: nonAdherentMin - late - earlyOut,
  }
}

// ── Exported selectors ────────────────────────────────────────────────────────

export function selectRollupForScope(scopeId: string, range: { from: string; to: string }): RollupKpi {
  return computeRollup(getAgentsForScope(scopeId), range)
}

export function selectRollupSeriesForScope(scopeId: string, range: { from: string; to: string }): DailyAdherencePoint[] {
  const agents = getAgentsForScope(scopeId)
  const byDate: Record<string, { adherentMin: number; scheduledMin: number; nonAdherentMin: number }> = {}

  agents.forEach(agent => {
    generateAgentHistory(agent.id, 90)
      .filter(p => p.date >= range.from && p.date <= range.to)
      .forEach(p => {
        byDate[p.date] ??= { adherentMin: 0, scheduledMin: 0, nonAdherentMin: 0 }
        byDate[p.date].adherentMin    += p.adherentMin
        byDate[p.date].scheduledMin   += p.scheduledMin
        byDate[p.date].nonAdherentMin += p.nonAdherentMin
      })
  })

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date,
      adherencePct: v.scheduledMin > 0 ? Math.round((v.adherentMin / v.scheduledMin) * 100) : 0,
      adherentMin: v.adherentMin,
      scheduledMin: v.scheduledMin,
      nonAdherentMin: v.nonAdherentMin,
    }))
}

export function selectPeerScopesForScope(scopeId: string, range: { from: string; to: string }): PeerScope[] {
  if (scopeId.startsWith('sg-')) {
    const sg = STAFFING_GROUPS.find(s => s.id === scopeId)
    if (!sg) return []
    const peers = STAFFING_GROUPS.filter(s => s.forecastGroupId === sg.forecastGroupId)
    if (peers.length <= 1) return []
    return peers.map(peer => {
      const kpi = computeRollup(getAgentsForSG(peer.id), range)
      return {
        id: peer.id, label: peer.label,
        parentLabel: FORECAST_GROUPS.find(f => f.id === peer.forecastGroupId)?.label ?? '',
        adherencePct: kpi.adherencePct,
        agentCount: kpi.agentCount,
        outOfAdherenceCount: kpi.outOfAdherenceCount,
        isCurrentScope: peer.id === scopeId,
      }
    })
  }

  if (scopeId.startsWith('fg-')) {
    return FORECAST_GROUPS.map(fg => {
      const kpi = computeRollup(getAgentsForFG(fg.id), range)
      return {
        id: fg.id, label: fg.label, parentLabel: 'All Forecast Groups',
        adherencePct: kpi.adherencePct,
        agentCount: kpi.agentCount,
        outOfAdherenceCount: kpi.outOfAdherenceCount,
        isCurrentScope: fg.id === scopeId,
      }
    })
  }

  // Queue scope has no defined peer comparison
  return []
}

export function selectAgentListForScope(scopeId: string, range: { from: string; to: string }): AgentListRow[] {
  return getAgentsForScope(scopeId).map(agent => {
    const history = generateAgentHistory(agent.id, 90).filter(p => p.date >= range.from && p.date <= range.to)
    const adherencePct = history.length
      ? history.reduce((s, p) => s + p.adherencePct, 0) / history.length
      : 0
    const outDays = history.filter(p => p.adherencePct < 95).length
    const scheduledH = history.reduce((s, p) => s + p.scheduledMin, 0) / 60
    const timeOffDays = generateTimeOff(agent.id).filter(t => t.date >= range.from && t.date <= range.to && t.status === 'approved').length
    return { agent, adherencePct, outDays, scheduledH, timeOffDays }
  })
}

// ── Schedule readiness (deterministic per scope) ───────────────────────────────

export function selectScheduleReadinessForScope(scopeId: string, weeksAhead = 18): WeekReadiness[] {
  const rand = seededRandExport(scopeId + 'sched')

  // Monday of current week (2026-05-08 is Friday → Monday = May 4)
  const today = new Date('2026-05-08')
  const daysFromMonday = (today.getDay() + 6) % 7  // Mon=0 … Sun=6
  const monday = new Date(today)
  monday.setDate(monday.getDate() - daysFromMonday)

  return Array.from({ length: weeksAhead }, (_, i) => {
    const ws = new Date(monday)
    ws.setDate(ws.getDate() + i * 7)
    const we = new Date(ws); we.setDate(we.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    let status: ScheduleStatus
    if (i === 0) status = 'published'
    else if (i === 1) status = rand() < 0.75 ? 'published' : 'reviewed'
    else if (i < 4)   status = rand() < 0.35 ? 'published' : rand() < 0.5 ? 'reviewed' : rand() < 0.55 ? 'generated' : 'not-started'
    else               status = rand() < 0.15 ? 'published' : rand() < 0.25 ? 'reviewed' : rand() < 0.35 ? 'generated' : 'not-started'

    return {
      weekLabel: `${fmt(ws)}–${fmt(we)}`,
      weekStartIso: ws.toISOString().split('T')[0],
      status,
      agentsCoveredPct: status === 'not-started' ? 0 : Math.round(rand() * 12 + 85),
      agentCount: 12 + Math.floor(rand() * 6),
    }
  })
}
