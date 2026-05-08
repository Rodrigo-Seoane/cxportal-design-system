'use client'

import { createContext, useContext } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export type Role = 'supervisor' | 'wfm-lead' | 'admin'

export type ForceState = 'data' | 'loading' | 'empty' | 'error' | 'partial' | 'degraded'

export type AgentStatusCategory =
  | 'Available' | 'On Call' | 'Aux' | 'Offline' | 'Time Off' | 'Unknown' | 'Pending'

export type ActivityCategory = 'Productive' | 'Non-Productive' | 'Time Off'

export interface ForecastGroup {
  id: string
  label: string
  staffingGroups: StaffingGroup[]
}

export interface StaffingGroup {
  id: string
  label: string
  forecastGroupId: string
}

export interface Agent {
  id: string
  name: string
  staffingGroupId: string
  status: AgentStatusCategory
  statusDuration: string  // e.g. "12m 34s"
  activity: ActivityCategory
  adherence: 'adherent' | 'out'
  auxCode?: string        // raw AUX code if status is Aux
}

export interface Queue {
  id: string
  label: string
  volume: number
  sla: number       // percent
  agentsOnQueue: number
  longestWait: string   // e.g. "4m 12s"
}

export interface KpiValues {
  adherencePct: number
  adherentTime: string
  scheduledTime: string
  nonAdherentTime: string
  agentsAvailable: number
  agentsOutOfAdherence: number
}

export interface KpiDeltas {
  adherencePct: number
  agentsAvailable: number
  agentsOutOfAdherence: number
}

export interface ActiveAlert {
  id: string
  metric: string
  operator: 'below' | 'above'
  threshold: number
  currentValue: number
  scope: string
  triggeredAt: Date
  kpiTileRef?: string   // key of the KPI tile to scroll to
}

export interface WFMStore {
  forecastGroups: ForecastGroup[]
  staffingGroups: StaffingGroup[]
  agents: Agent[]
  queues: Queue[]
  kpiValues: KpiValues
  kpiDeltas: KpiDeltas
  activeAlerts: ActiveAlert[]
  lastUpdated: Date
  forceState: ForceState
  role: Role
  defaultStaffingGroupId: string | null
  setForceState: (s: ForceState) => void
  setRole: (r: Role) => void
}

// ── Mock data generators ───────────────────────────────────────────────────────

export const FORECAST_GROUPS: ForecastGroup[] = [
  { id: 'fg-triage',    label: 'OK — Triage',             staffingGroups: [] },
  { id: 'fg-bh',        label: 'OK — Behavioral Health',  staffingGroups: [] },
  { id: 'fg-pharmacy',  label: 'OK — Pharmacy',           staffingGroups: [] },
  { id: 'fg-member',    label: 'OK — Member Services',    staffingGroups: [] },
  { id: 'fg-provider',  label: 'OK — Provider Services',  staffingGroups: [] },
  { id: 'fg-care',      label: 'OK — Care Mgmt',          staffingGroups: [] },
]

export const STAFFING_GROUPS: StaffingGroup[] = [
  { id: 'sg-triage-day',     label: 'Triage — Day',             forecastGroupId: 'fg-triage' },
  { id: 'sg-triage-eve',     label: 'Triage — Evening',         forecastGroupId: 'fg-triage' },
  { id: 'sg-triage-night',   label: 'Triage — Overnight',       forecastGroupId: 'fg-triage' },
  { id: 'sg-bh-day',         label: 'Behavioral Health — Day',  forecastGroupId: 'fg-bh' },
  { id: 'sg-bh-eve',         label: 'Behavioral Health — Eve',  forecastGroupId: 'fg-bh' },
  { id: 'sg-bh-night',       label: 'Behavioral Health — Night',forecastGroupId: 'fg-bh' },
  { id: 'sg-pharm-day',      label: 'Pharmacy — Day',           forecastGroupId: 'fg-pharmacy' },
  { id: 'sg-pharm-eve',      label: 'Pharmacy — Evening',       forecastGroupId: 'fg-pharmacy' },
  { id: 'sg-pharm-night',    label: 'Pharmacy — Overnight',     forecastGroupId: 'fg-pharmacy' },
  { id: 'sg-member-day',     label: 'Member Services — Day',    forecastGroupId: 'fg-member' },
  { id: 'sg-member-eve',     label: 'Member Services — Eve',    forecastGroupId: 'fg-member' },
  { id: 'sg-member-night',   label: 'Member Services — Night',  forecastGroupId: 'fg-member' },
  { id: 'sg-provider-day',   label: 'Provider Services — Day',  forecastGroupId: 'fg-provider' },
  { id: 'sg-provider-eve',   label: 'Provider Services — Eve',  forecastGroupId: 'fg-provider' },
  { id: 'sg-provider-night', label: 'Provider Services — Night',forecastGroupId: 'fg-provider' },
  { id: 'sg-care-day',       label: 'Care Mgmt — Day',          forecastGroupId: 'fg-care' },
  { id: 'sg-care-eve',       label: 'Care Mgmt — Evening',      forecastGroupId: 'fg-care' },
  { id: 'sg-care-night',     label: 'Care Mgmt — Overnight',    forecastGroupId: 'fg-care' },
]

// Link staffing groups into forecast groups
FORECAST_GROUPS.forEach(fg => {
  fg.staffingGroups = STAFFING_GROUPS.filter(sg => sg.forecastGroupId === fg.id)
})

const FIRST_NAMES = ['Maria','James','Priya','David','Linda','Michael','Sarah','Robert','Emily','Carlos','Angela','Thomas']
const LAST_NAMES  = ['Rodriguez','Johnson','Patel','Williams','Chen','Brown','Davis','Martinez','Wilson','Garcia','Taylor','Lee']
const STATUSES: AgentStatusCategory[] = ['Available','On Call','Aux','Aux','On Call','Offline','Available','Available','Time Off','Unknown']
const ACTIVITIES: ActivityCategory[] = ['Productive','Productive','Non-Productive','Time Off']

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

function generateAgentBank(): Agent[] {
  const agents: Agent[] = []
  let seed = 0
  STAFFING_GROUPS.forEach(sg => {
    for (let i = 0; i < 200; i++) {
      seed++
      const status = STATUSES[seed % STATUSES.length]
      const auxCode = status === 'Aux' ? `AUX-${(seed % 5) + 1}` : undefined
      const isUnmapped = status === 'Aux' && seed % 7 === 0
      agents.push({
        id:              `agent-${sg.id}-${i}`,
        name:            `${FIRST_NAMES[seed % FIRST_NAMES.length]} ${LAST_NAMES[(seed + 3) % LAST_NAMES.length]}`,
        staffingGroupId: sg.id,
        status:          isUnmapped ? 'Pending' : status,
        statusDuration:  formatDuration(randInt(30, 1800)),
        activity:        ACTIVITIES[seed % ACTIVITIES.length],
        adherence:       seed % 5 === 0 ? 'out' : 'adherent',
        auxCode,
      })
    }
  })
  return agents
}

export const AGENT_BANK: Agent[] = generateAgentBank()

export const QUEUES: Queue[] = [
  { id: 'q-triage-main',    label: 'Triage — Main',         volume: 47, sla: 82, agentsOnQueue: 18, longestWait: '4m 12s' },
  { id: 'q-triage-urgent',  label: 'Triage — Urgent',       volume: 12, sla: 94, agentsOnQueue:  6, longestWait: '1m 45s' },
  { id: 'q-bh-crisis',      label: 'Behavioral Health',     volume: 23, sla: 71, agentsOnQueue:  9, longestWait: '7m 03s' },
  { id: 'q-pharm-refill',   label: 'Pharmacy — Refills',    volume: 61, sla: 88, agentsOnQueue: 24, longestWait: '3m 22s' },
  { id: 'q-pharm-consult',  label: 'Pharmacy — Consult',    volume: 19, sla: 79, agentsOnQueue:  8, longestWait: '5m 55s' },
  { id: 'q-member-general', label: 'Member Services — Gen', volume: 84, sla: 76, agentsOnQueue: 31, longestWait: '6m 48s' },
  { id: 'q-member-claims',  label: 'Member Services — Claims', volume: 38, sla: 69, agentsOnQueue: 14, longestWait: '9m 10s' },
  { id: 'q-provider-auth',  label: 'Provider — Auth',       volume: 55, sla: 85, agentsOnQueue: 21, longestWait: '4m 30s' },
  { id: 'q-provider-ref',   label: 'Provider — Referrals',  volume: 29, sla: 91, agentsOnQueue: 12, longestWait: '2m 15s' },
  { id: 'q-care-outreach',  label: 'Care Mgmt — Outreach',  volume: 14, sla: 96, agentsOnQueue:  7, longestWait: '0m 58s' },
  { id: 'q-care-complex',   label: 'Care Mgmt — Complex',   volume:  8, sla: 88, agentsOnQueue:  4, longestWait: '2m 40s' },
  { id: 'q-overflow',       label: 'Overflow',              volume: 33, sla: 62, agentsOnQueue: 11, longestWait: '11m 04s' },
]

export const INITIAL_KPI: KpiValues = {
  adherencePct:        87.4,
  adherentTime:        '6h 12m',
  scheduledTime:       '7h 08m',
  nonAdherentTime:     '0h 56m',
  agentsAvailable:     312,
  agentsOutOfAdherence: 43,
}

export const INITIAL_DELTAS: KpiDeltas = {
  adherencePct:        -1.2,
  agentsAvailable:      18,
  agentsOutOfAdherence:-7,
}

export const INITIAL_ALERTS: ActiveAlert[] = [
  {
    id: 'alert-1',
    metric: 'Adherence %',
    operator: 'below',
    threshold: 90,
    currentValue: 87.4,
    scope: 'OK — Triage',
    triggeredAt: new Date(Date.now() - 8 * 60 * 1000),
    kpiTileRef: 'adherencePct',
  },
  {
    id: 'alert-2',
    metric: 'Agents Out of Adherence Now',
    operator: 'above',
    threshold: 40,
    currentValue: 43,
    scope: 'All Groups',
    triggeredAt: new Date(Date.now() - 23 * 60 * 1000),
    kpiTileRef: 'agentsOutOfAdherence',
  },
]

// ── Default scope per role ────────────────────────────────────────────────────

export const DEFAULT_SCOPE: Record<Role, string | null> = {
  'supervisor':  'sg-triage-day',
  'wfm-lead':    null,
  'admin':       null,
}

// ── Sparkline data (last 60 data points — one per minute) ─────────────────────

export function generateSparkline(baseValue: number, variance: number, count = 60) {
  const points: { t: number; v: number }[] = []
  let v = baseValue
  for (let i = 0; i < count; i++) {
    v += (Math.random() - 0.5) * variance
    v = Math.max(0, Math.min(100, v))
    points.push({ t: i, v: Math.round(v * 10) / 10 })
  }
  return points
}

// ── Status event stream ────────────────────────────────────────────────────────
// Production contract fields: agentId, newStatus, timestamp, auxCode
// These map to the Connect agent event stream payload (PRDENG-2657 data contract)

export interface StatusEvent {
  agentId: string
  newStatus: AgentStatusCategory
  timestamp: Date
  auxCode?: string
}

type StatusEventHandler = (event: StatusEvent) => void

const statusEventListeners = new Map<string, Set<StatusEventHandler>>()
let statusEventInterval: ReturnType<typeof setInterval> | null = null

export function subscribeToStatusEvents(agentIds: string[], handler: StatusEventHandler): () => void {
  const key = agentIds.slice(0, 5).join(',') + agentIds.length
  if (!statusEventListeners.has(key)) statusEventListeners.set(key, new Set())
  statusEventListeners.get(key)!.add(handler)

  // Start global interval if not running
  if (!statusEventInterval && agentIds.length > 0) {
    statusEventInterval = setInterval(() => {
      const allAgents = AGENT_BANK
      const pool = agentIds.length > 0
        ? agentIds.map(id => allAgents.find(a => a.id === id)).filter(Boolean) as Agent[]
        : allAgents.slice(0, 50)

      if (pool.length === 0) return
      const agent = pool[Math.floor(Math.random() * Math.min(pool.length, 20))]
      if (!agent) return

      const statuses: AgentStatusCategory[] = ['Available', 'On Call', 'Aux', 'Offline']
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)]

      const event: StatusEvent = {
        agentId:   agent.id,
        newStatus,
        timestamp: new Date(),
        auxCode:   newStatus === 'Aux' ? `AUX-${Math.floor(Math.random() * 5) + 1}` : undefined,
      }

      statusEventListeners.forEach(listeners =>
        listeners.forEach(h => h(event))
      )
    }, 8000)
  }

  return () => {
    statusEventListeners.get(key)?.delete(handler)
    if (statusEventListeners.get(key)?.size === 0) statusEventListeners.delete(key)
    if (statusEventListeners.size === 0 && statusEventInterval) {
      clearInterval(statusEventInterval)
      statusEventInterval = null
    }
  }
}

// ── Saved views ────────────────────────────────────────────────────────────────

export interface SavedView {
  id: string
  label: string
  staffingGroupIds: string[]
  forecastGroupIds: string[]
  statusFilter: string[]
  sortField: string
}

export const INITIAL_SAVED_VIEWS: SavedView[] = [
  {
    id:              'sv-my-team-out',
    label:           'My team — out of adherence now',
    staffingGroupIds:['sg-triage-day'],
    forecastGroupIds:[],
    statusFilter:    ['Out of Adherence'],
    sortField:       'adherence',
  },
  {
    id:              'sv-overnight',
    label:           'All overnight nurses',
    staffingGroupIds:['sg-triage-night', 'sg-bh-night', 'sg-pharm-night'],
    forecastGroupIds:[],
    statusFilter:    [],
    sortField:       'name',
  },
  {
    id:              'sv-pending-aux',
    label:           'Agents with Pending AUX codes',
    staffingGroupIds:[],
    forecastGroupIds:[],
    statusFilter:    ['Pending'],
    sortField:       'name',
  },
]

// ── Context ───────────────────────────────────────────────────────────────────

export const WFMContext = createContext<WFMStore | null>(null)

export function useWFMStore(): WFMStore {
  const ctx = useContext(WFMContext)
  if (!ctx) throw new Error('useWFMStore must be used inside WFMStoreProvider')
  return ctx
}

export function useCurrentUser() {
  const store = useWFMStore()
  return {
    role: store.role,
    defaultStaffingGroupId: store.defaultStaffingGroupId,
  }
}
