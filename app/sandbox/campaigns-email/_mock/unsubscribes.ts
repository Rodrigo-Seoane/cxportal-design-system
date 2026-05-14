export interface UnsubscribeRecord {
  id:             string
  email:          string
  campaignId:     string
  topicId:        string | null
  componentId:    string
  groupId:        string
  unsubscribedAt: string   // ISO date
  /** Grace period = 14 days from unsubscribedAt before hard-suppressed */
  gracePeriodEnds: string  // ISO date
  reason:         'one-click' | 'user-request' | 'complaint' | 'bounce'
}

function gracePeriodEnd(date: string): string {
  const d = new Date(date)
  d.setDate(d.getDate() + 14)
  return d.toISOString()
}

export const UNSUBSCRIBES: UnsubscribeRecord[] = [
  // Recent — still in grace period (seeded relative to 2026-05-08 "today")
  { id: 'u-1',  email: 'beneficiary.0042@example.gov', campaignId: 'camp-3', topicId: 'topic-3', componentId: 'dsc', groupId: 'dsc-g2', unsubscribedAt: '2026-05-08T09:32:00Z', gracePeriodEnds: gracePeriodEnd('2026-05-08T09:32:00Z'), reason: 'one-click' },
  { id: 'u-2',  email: 'j.wilson.ret@gmail.com',       campaignId: 'camp-3', topicId: 'topic-3', componentId: 'dsc', groupId: 'dsc-g2', unsubscribedAt: '2026-05-08T10:14:00Z', gracePeriodEnds: gracePeriodEnd('2026-05-08T10:14:00Z'), reason: 'one-click' },
  { id: 'u-3',  email: 'm.henderson@comcast.net',      campaignId: 'camp-3', topicId: 'topic-3', componentId: 'dsc', groupId: 'dsc-g2', unsubscribedAt: '2026-05-07T14:22:00Z', gracePeriodEnds: gracePeriodEnd('2026-05-07T14:22:00Z'), reason: 'user-request' },
  { id: 'u-4',  email: 'retiree.8824@yahoo.com',       campaignId: 'camp-1', topicId: 'topic-1', componentId: 'rsc', groupId: 'rsc-g1', unsubscribedAt: '2026-05-05T08:00:00Z', gracePeriodEnds: gracePeriodEnd('2026-05-05T08:00:00Z'), reason: 'one-click' },
  { id: 'u-5',  email: 'p.nguyen.55@gmail.com',        campaignId: 'camp-1', topicId: 'topic-1', componentId: 'rsc', groupId: 'rsc-g1', unsubscribedAt: '2026-05-04T16:45:00Z', gracePeriodEnds: gracePeriodEnd('2026-05-04T16:45:00Z'), reason: 'complaint' },

  // Older — outside grace period
  { id: 'u-6',  email: 'beneficiary.1122@aol.com',     campaignId: 'camp-2', topicId: 'topic-2', componentId: 'mcc', groupId: 'mcc-g2', unsubscribedAt: '2025-10-03T11:00:00Z', gracePeriodEnds: '2025-10-17T11:00:00Z', reason: 'one-click' },
  { id: 'u-7',  email: 'e.parker.mcare@outlook.com',   campaignId: 'camp-2', topicId: 'topic-2', componentId: 'mcc', groupId: 'mcc-g2', unsubscribedAt: '2025-10-04T09:30:00Z', gracePeriodEnds: '2025-10-18T09:30:00Z', reason: 'one-click' },
  { id: 'u-8',  email: 't.brooks.ss@hotmail.com',      campaignId: 'camp-2', topicId: 'topic-2', componentId: 'mcc', groupId: 'mcc-g2', unsubscribedAt: '2025-10-05T13:15:00Z', gracePeriodEnds: '2025-10-19T13:15:00Z', reason: 'user-request' },
  { id: 'u-9',  email: 'd.ramirez.64@gmail.com',       campaignId: 'camp-1', topicId: 'topic-1', componentId: 'rsc', groupId: 'rsc-g1', unsubscribedAt: '2026-01-06T10:00:00Z', gracePeriodEnds: '2026-01-20T10:00:00Z', reason: 'one-click' },
  { id: 'u-10', email: 'k.freeman.ssa@icloud.com',     campaignId: 'camp-1', topicId: 'topic-1', componentId: 'rsc', groupId: 'rsc-g1', unsubscribedAt: '2026-01-07T14:00:00Z', gracePeriodEnds: '2026-01-21T14:00:00Z', reason: 'bounce' },
  { id: 'u-11', email: 'v.morrison.ret@yahoo.com',     campaignId: 'camp-1', topicId: 'topic-1', componentId: 'rsc', groupId: 'rsc-g1', unsubscribedAt: '2026-01-08T09:00:00Z', gracePeriodEnds: '2026-01-22T09:00:00Z', reason: 'one-click' },
  { id: 'u-12', email: 'j.tran.disability@gmail.com',  campaignId: 'camp-1', topicId: 'topic-1', componentId: 'rsc', groupId: 'rsc-g1', unsubscribedAt: '2026-02-14T11:30:00Z', gracePeriodEnds: '2026-02-28T11:30:00Z', reason: 'user-request' },
]

export function isInGracePeriod(record: UnsubscribeRecord, asOf = '2026-05-08T12:00:00Z'): boolean {
  return new Date(record.gracePeriodEnds) > new Date(asOf)
}

export function graceDaysRemaining(record: UnsubscribeRecord, asOf = '2026-05-08T12:00:00Z'): number {
  const diff = new Date(record.gracePeriodEnds).getTime() - new Date(asOf).getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
