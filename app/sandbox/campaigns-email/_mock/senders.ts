export type SenderStatus = 'verified' | 'pending' | 'failed' | 'expired'

export interface SenderIdentity {
  id:           string
  email:        string
  displayName:  string
  componentId:  string
  groupId:      string
  status:       SenderStatus
  lastVerified: string | null  // ISO date
  addedAt:      string         // ISO date
}

export const SENDERS: SenderIdentity[] = [
  {
    id:           'sender-1',
    email:        'noreply@benefits.ssa.gov',
    displayName:  'Social Security Administration',
    componentId:  'rsc',
    groupId:      'rsc-g1',
    status:       'verified',
    lastVerified: '2026-04-01T10:00:00Z',
    addedAt:      '2025-11-15T09:00:00Z',
  },
  {
    id:           'sender-2',
    email:        'retirement@ssa.gov',
    displayName:  'SSA Retirement Services',
    componentId:  'rsc',
    groupId:      'rsc-g1',
    status:       'verified',
    lastVerified: '2026-03-20T14:30:00Z',
    addedAt:      '2025-10-01T09:00:00Z',
  },
  {
    id:           'sender-3',
    email:        'disability@ssa.gov',
    displayName:  'SSA Disability Services',
    componentId:  'dsc',
    groupId:      'dsc-g1',
    status:       'verified',
    lastVerified: '2026-04-10T11:00:00Z',
    addedAt:      '2025-09-15T09:00:00Z',
  },
  {
    id:           'sender-4',
    email:        'medicare@ssa.gov',
    displayName:  'SSA Medicare Coordination',
    componentId:  'mcc',
    groupId:      'mcc-g1',
    status:       'verified',
    lastVerified: '2026-02-28T09:00:00Z',
    addedAt:      '2025-08-01T09:00:00Z',
  },
  {
    id:           'sender-5',
    email:        'fieldops@ssa.gov',
    displayName:  'SSA Field Operations',
    componentId:  'foc',
    groupId:      'foc-g1',
    status:       'pending',
    lastVerified: null,
    addedAt:      '2026-05-05T13:00:00Z',
  },
  {
    id:           'sender-6',
    email:        'hearings@ssa.gov',
    displayName:  'SSA Hearing Operations',
    componentId:  'hoc',
    groupId:      'hoc-g1',
    status:       'failed',
    lastVerified: null,
    addedAt:      '2026-04-28T10:00:00Z',
  },
  {
    id:           'sender-7',
    email:        'outreach@ssa.gov',
    displayName:  'SSA Public Outreach',
    componentId:  'oc',
    groupId:      'oc-g1',
    status:       'expired',
    lastVerified: '2025-11-01T09:00:00Z',
    addedAt:      '2025-05-10T09:00:00Z',
  },
  {
    id:           'sender-8',
    email:        'tig@ssa.gov',
    displayName:  'SSA Ticket to Work',
    componentId:  'dsc',
    groupId:      'dsc-g4',
    status:       'verified',
    lastVerified: '2026-04-15T08:00:00Z',
    addedAt:      '2025-12-01T09:00:00Z',
  },
]
