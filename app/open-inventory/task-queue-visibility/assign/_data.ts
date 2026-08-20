// ── Guided Assignment Builder — mock fixture data ───────────────────────────
// Deterministic, seeded fixtures (no Math.random()/Date.now()) so SSR and the
// client always render the same rows — same LCG formula as
// mocks/open-inventory/taxonomy.ts's seededRandFrom, reused here for
// consistency with the rest of Open Inventory.
import { seededRandFrom } from '@/mocks/open-inventory/taxonomy'

// ── Types ────────────────────────────────────────────────────────────────

export type Priority = 'red' | 'yellow' | 'green'

export interface Queue {
  id: string
  name: string
  openTasks: number
  totalTasks: number
  priority: Priority
}

export type TaskStatus = 'Unassigned' | 'Active' | 'Pended'

export interface Task {
  id: string
  taskName: string
  description: string
  queueId: string
  lineCount: number
  status: TaskStatus
  statusTime: string
  pendedReason?: string
  assignedWorkerLabel?: string
  tat: string
  sla: string
  provider: string
  diagnosisCode: string
  procCode: string
}

export type WorkerStatus = 'Available' | 'On Call' | 'Break' | 'Logged Off'

export interface Worker {
  id: string
  status: WorkerStatus
  nextStatusAt: string
  scheduledActivity: string
  shiftStart: string
  shiftEnd: string
  inProcessCount: number
  pendingCount: number
  /** Queue names this worker is proficient for — drives the eligibility rule. */
  eligibleFor: string[]
}

export interface AssignmentLogEntry {
  id: string
  taskLabel: string
  queueName: string
  workerId: string
  timestamp: string
}

// ── Fixture pools ────────────────────────────────────────────────────────

const STATE_CODES = ['AL', 'AZ', 'DE', 'FL', 'GA', 'KY', 'MS', 'NC', 'NJ', 'NV', 'SC', 'TN', 'TX', 'VT', 'VA']

const TASK_DESCRIPTIONS = [
  'Research outpatient cardiology referral',
  'Finalize stress echo precert',
  'Process afib ablation request',
  'Review inpatient rehab extension',
  'Verify home health recertification',
  'Process durable medical equipment request',
  'Finalize spinal fusion precert',
  'Review behavioral health IOP extension',
  'Process orthopedic surgery request',
  'Verify skilled nursing facility stay',
  'Finalize cardiac catheterization precert',
  'Review advanced imaging request',
  'Process wound care supply request',
  'Finalize hip replacement precert',
]

const PROVIDERS = [
  'Dr. Sarah Chen, MD', 'Dr. Michael Ortiz, MD', 'Dr. Priya Nair, DO', 'Dr. James Whitfield, MD',
  'Dr. Elena Vasquez, MD', 'Dr. Robert Kim, MD', 'Dr. Amara Okafor, DO', 'Dr. Thomas Reilly, MD',
]

const DIAGNOSIS_CODES = ['I25.10', 'I48.91', 'M54.5', 'J44.9', 'E11.9', 'M17.11', 'I50.9', 'G89.29', 'M75.100', 'I63.9']
const PROC_CODES = ['93454', '93000', '27447', '29881', '97110', 'J1745', '93306', '99213', '20610', '72148']
const PENDED_REASONS = ['Awaiting clinical documentation', 'Pending MD review', 'Awaiting provider callback', 'Awaiting member consent']
const SCHEDULED_ACTIVITIES = ['Work', 'Break', 'Lunch', 'Training', '—']

// ── RNG helpers ──────────────────────────────────────────────────────────

type Rand = () => number

function randInt(rand: Rand, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

function pick<T>(rand: Rand, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]
}

function weightedPick<T>(rand: Rand, options: { value: T; weight: number }[]): T {
  const total = options.reduce((a, o) => a + o.weight, 0)
  let r = rand() * total
  for (const o of options) {
    r -= o.weight
    if (r <= 0) return o.value
  }
  return options[options.length - 1].value
}

function formatDuration(rand: Rand, maxHours: number): string {
  return `${randInt(rand, 0, maxHours)}:${String(randInt(rand, 0, 59)).padStart(2, '0')}`
}

function formatClock(rand: Rand): string {
  return `${String(randInt(rand, 0, 23)).padStart(2, '0')}:${String(randInt(rand, 0, 59)).padStart(2, '0')}`
}

// ── Queues ───────────────────────────────────────────────────────────────

function pickPriority(rand: Rand): Priority {
  return weightedPick(rand, [
    { value: 'green', weight: 60 },
    { value: 'yellow', weight: 28 },
    { value: 'red', weight: 12 },
  ])
}

function buildQueues(): Queue[] {
  return STATE_CODES.map(code => {
    const rand = seededRandFrom(`tqv-queue-${code}`)
    const totalTasks = randInt(rand, 6, 14)
    const openTasks = randInt(rand, Math.max(1, totalTasks - 6), totalTasks)
    return { id: `queue-${code}`, name: `Corr_Duals_${code}`, openTasks, totalTasks, priority: pickPriority(rand) }
  })
}

export const QUEUES: Queue[] = buildQueues()

// ── Tasks ────────────────────────────────────────────────────────────────

function pickTaskStatus(rand: Rand): TaskStatus {
  return weightedPick(rand, [
    { value: 'Unassigned', weight: 45 },
    { value: 'Active', weight: 35 },
    { value: 'Pended', weight: 20 },
  ])
}

function buildTasksForQueue(queue: Queue): Task[] {
  const rand = seededRandFrom(`tqv-tasks-${queue.id}`)
  return Array.from({ length: queue.totalTasks }, () => {
    const status = pickTaskStatus(rand)
    return {
      id: `Auth-${randInt(rand, 1000, 9999)}`,
      taskName: `Task-${String(randInt(rand, 1000, 99999)).padStart(5, '0')}`,
      description: pick(rand, TASK_DESCRIPTIONS),
      queueId: queue.id,
      lineCount: randInt(rand, 1, 20),
      status,
      statusTime: formatDuration(rand, 6),
      pendedReason: status === 'Pended' ? pick(rand, PENDED_REASONS) : undefined,
      assignedWorkerLabel: status === 'Active' ? `Worker ${String(randInt(rand, 760, 779)).padStart(5, '0')}` : undefined,
      tat: formatDuration(rand, 4),
      sla: formatDuration(rand, 1),
      provider: pick(rand, PROVIDERS),
      diagnosisCode: pick(rand, DIAGNOSIS_CODES),
      procCode: pick(rand, PROC_CODES),
    }
  })
}

export const TASKS: Task[] = QUEUES.flatMap(buildTasksForQueue)

export function tasksForQueue(queueId: string): Task[] {
  return TASKS.filter(t => t.queueId === queueId)
}

// ── Workers ──────────────────────────────────────────────────────────────

function pickWorkerStatus(rand: Rand): WorkerStatus {
  return weightedPick(rand, [
    { value: 'Available', weight: 40 },
    { value: 'On Call', weight: 25 },
    { value: 'Break', weight: 20 },
    { value: 'Logged Off', weight: 15 },
  ])
}

function pickEligibleQueues(rand: Rand, count: number): string[] {
  const chosen = new Set<string>()
  while (chosen.size < count) chosen.add(pick(rand, QUEUES).name)
  return Array.from(chosen)
}

const WORKER_IDS = Array.from({ length: 18 }, (_, i) => `Worker ${String(760 + i).padStart(5, '0')}`)

function buildWorkers(): Worker[] {
  return WORKER_IDS.map(id => {
    const rand = seededRandFrom(`tqv-worker-${id}`)
    return {
      id,
      status: pickWorkerStatus(rand),
      nextStatusAt: formatClock(rand),
      scheduledActivity: pick(rand, SCHEDULED_ACTIVITIES),
      shiftStart: formatClock(rand),
      shiftEnd: formatClock(rand),
      inProcessCount: randInt(rand, 0, 12),
      pendingCount: randInt(rand, 0, 3),
      eligibleFor: pickEligibleQueues(rand, randInt(rand, 2, 5)),
    }
  })
}

export const WORKERS: Worker[] = buildWorkers()

export function isEligible(worker: Worker, queueName: string): boolean {
  return worker.eligibleFor.includes(queueName)
}

// ── Shared display tokens ────────────────────────────────────────────────

export const PRIORITY_COLOR: Record<Priority, string> = {
  red: '#ef2056', yellow: '#eaa93c', green: '#67d034',
}

export const TASK_STATUS_CHIP: Record<TaskStatus, 'error' | 'warning' | 'success' | 'info'> = {
  Unassigned: 'warning', Active: 'success', Pended: 'error',
}

export const WORKER_STATUS_COLOR: Record<WorkerStatus, string> = {
  'Available': '#67d034', 'On Call': '#eaa93c', 'Break': '#7a828c', 'Logged Off': '#aab0b8',
}
