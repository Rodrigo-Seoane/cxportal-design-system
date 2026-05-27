export type CampaignStatus =
  | 'running' | 'paused' | 'scheduled' | 'initialized' | 'failed' | 'completed'
  | 'draft' | 'sending' | 'sent' | 'cancelled'  // legacy — kept for backward compat

export type CampaignType =
  | 'voice-survey' | 'sms-survey' | 'voice-notification' | 'sms-notification' | 'email-campaign'

export type CampaignChannel = 'email' | 'sms' | 'voice'

export interface Campaign {
  id:             string
  name:           string
  componentId:    string
  groupId:        string
  channel:        CampaignChannel
  status:         CampaignStatus
  /** Campaign type for display (more granular than channel). Optional for backward compat. */
  type?:          CampaignType
  /** Display contact count (may differ from recipientCount). Optional for backward compat. */
  contacts?:      number
  /** Delivery rate 0–100. Optional for backward compat. */
  deliveryRate?:  number
  senderId:       string
  templateId:     string
  listIds:        string[]
  topicId:        string | null
  /** Recipient count at time of send (or estimated for scheduled/draft) */
  recipientCount: number
  scheduledAt:    string | null  // ISO date
  sentAt:         string | null  // ISO date
  createdAt:      string         // ISO date
  createdBy:      string
}

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1', name: '2026 COLA Notification — Retirees',
    componentId: 'rsc', groupId: 'rsc-g1', channel: 'email',
    type: 'email-campaign', status: 'completed',
    contacts: 48_500, deliveryRate: 97.7,
    senderId: 'sender-1', templateId: 'tmpl-1',
    listIds: ['list-2', 'list-9'], topicId: 'topic-1',
    recipientCount: 50_900_000,
    scheduledAt: '2026-01-05T08:00:00Z', sentAt: '2026-01-05T08:14:22Z',
    createdAt: '2025-12-20T10:00:00Z', createdBy: 'J. Martinez',
  },
  {
    id: 'camp-2', name: 'Medicare Part B Premium Notice 2026',
    componentId: 'mcc', groupId: 'mcc-g2', channel: 'email',
    type: 'email-campaign', status: 'completed',
    contacts: 61_800, deliveryRate: 97.9,
    senderId: 'sender-4', templateId: 'tmpl-2',
    listIds: ['list-1'], topicId: 'topic-2',
    recipientCount: 62_400_000,
    scheduledAt: '2025-10-01T08:00:00Z', sentAt: '2025-10-01T08:22:10Z',
    createdAt: '2025-09-25T09:00:00Z', createdBy: 'R. Chen',
  },
  {
    id: 'camp-3', name: 'SSI COLA — April Payment Update',
    componentId: 'dsc', groupId: 'dsc-g2', channel: 'email',
    type: 'email-campaign', status: 'running',
    contacts: 7_400, deliveryRate: 88.2,
    senderId: 'sender-3', templateId: 'tmpl-3',
    listIds: ['list-4'], topicId: 'topic-3',
    recipientCount: 7_500_000,
    scheduledAt: '2026-05-08T09:00:00Z', sentAt: null,
    createdAt: '2026-05-01T13:00:00Z', createdBy: 'D. Thompson',
  },
  {
    id: 'camp-4', name: 'Medicare IEP — May Cohort',
    componentId: 'mcc', groupId: 'mcc-g1', channel: 'email',
    type: 'email-campaign', status: 'scheduled',
    contacts: 4_100, deliveryRate: 0,
    senderId: 'sender-4', templateId: 'tmpl-4',
    listIds: ['list-1'], topicId: 'topic-5',
    recipientCount: 4_200_000,
    scheduledAt: '2026-05-15T08:00:00Z', sentAt: null,
    createdAt: '2026-05-03T11:00:00Z', createdBy: 'R. Chen',
  },
  {
    id: 'camp-5', name: 'Field Appointment Reminders — Week 19',
    componentId: 'foc', groupId: 'foc-g1', channel: 'email',
    type: 'email-campaign', status: 'scheduled',
    contacts: 12_400, deliveryRate: 0,
    senderId: 'sender-1', templateId: 'tmpl-7',
    listIds: ['list-6'], topicId: 'topic-7',
    recipientCount: 12_400,
    scheduledAt: '2026-05-13T07:00:00Z', sentAt: null,
    createdAt: '2026-05-08T16:00:00Z', createdBy: 'S. Garcia',
  },
  {
    id: 'camp-6', name: 'CDR Notification — 2024 Cohort Wave 1',
    componentId: 'dsc', groupId: 'dsc-g3', channel: 'email',
    type: 'email-campaign', status: 'initialized',
    contacts: 340_000, deliveryRate: 0,
    senderId: 'sender-3', templateId: 'tmpl-3',
    listIds: ['list-7'], topicId: 'topic-3',
    recipientCount: 350_000,
    scheduledAt: null, sentAt: null,
    createdAt: '2026-05-06T14:00:00Z', createdBy: 'D. Thompson',
  },
  {
    id: 'camp-7', name: 'Retirement Planning — Near-Retirement Outreach',
    componentId: 'rsc', groupId: 'rsc-g3', channel: 'email',
    type: 'email-campaign', status: 'initialized',
    contacts: 12_100, deliveryRate: 0,
    senderId: 'sender-2', templateId: 'tmpl-6',
    listIds: ['list-5'], topicId: 'topic-6',
    recipientCount: 12_300_000,
    scheduledAt: null, sentAt: null,
    createdAt: '2026-05-07T09:30:00Z', createdBy: 'J. Martinez',
  },
  {
    id: 'camp-8', name: 'Ticket to Work — Spring Enrollment Push',
    componentId: 'dsc', groupId: 'dsc-g4', channel: 'email',
    type: 'email-campaign', status: 'paused',
    contacts: 185_000, deliveryRate: 62.3,
    senderId: 'sender-8', templateId: 'tmpl-5',
    listIds: ['list-8'], topicId: 'topic-4',
    recipientCount: 185_000,
    scheduledAt: '2026-04-20T09:00:00Z', sentAt: null,
    createdAt: '2026-04-15T10:00:00Z', createdBy: 'M. Patel',
  },
  {
    id: 'camp-9', name: 'Field Benefits Survey — Region 3',
    componentId: 'foc', groupId: 'foc-g2', channel: 'voice',
    type: 'voice-survey', status: 'failed',
    contacts: 8_200, deliveryRate: 45.2,
    senderId: 'sender-5', templateId: 'tmpl-5',
    listIds: ['list-3'], topicId: 'topic-7',
    recipientCount: 8_200,
    scheduledAt: '2026-04-10T10:00:00Z', sentAt: null,
    createdAt: '2026-04-08T09:00:00Z', createdBy: 'S. Garcia',
  },
  {
    id: 'camp-10', name: 'SSDI Status Update Survey — Wave 2',
    componentId: 'dsc', groupId: 'dsc-g1', channel: 'sms',
    type: 'sms-survey', status: 'running',
    contacts: 5_600, deliveryRate: 88.4,
    senderId: 'sender-6', templateId: 'tmpl-6',
    listIds: ['list-4'], topicId: 'topic-3',
    recipientCount: 5_600,
    scheduledAt: '2026-05-20T08:00:00Z', sentAt: null,
    createdAt: '2026-05-18T11:00:00Z', createdBy: 'D. Thompson',
  },
  {
    id: 'camp-11', name: 'Medicare Annual Notice — Voice Blast',
    componentId: 'mcc', groupId: 'mcc-g2', channel: 'voice',
    type: 'voice-notification', status: 'completed',
    contacts: 21_000, deliveryRate: 99.1,
    senderId: 'sender-7', templateId: 'tmpl-2',
    listIds: ['list-1'], topicId: 'topic-2',
    recipientCount: 21_000,
    scheduledAt: '2026-03-15T09:00:00Z', sentAt: '2026-03-15T09:18:44Z',
    createdAt: '2026-03-10T10:00:00Z', createdBy: 'R. Chen',
  },
  {
    id: 'camp-12', name: 'Survivors Benefit Reminder — SMS',
    componentId: 'rsc', groupId: 'rsc-g2', channel: 'sms',
    type: 'sms-notification', status: 'scheduled',
    contacts: 9_800, deliveryRate: 0,
    senderId: 'sender-2', templateId: 'tmpl-1',
    listIds: ['list-8'], topicId: 'topic-1',
    recipientCount: 9_800,
    scheduledAt: '2026-06-01T08:00:00Z', sentAt: null,
    createdAt: '2026-05-22T14:00:00Z', createdBy: 'J. Martinez',
  },
]
