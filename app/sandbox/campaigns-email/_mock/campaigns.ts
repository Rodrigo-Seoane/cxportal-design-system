export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type CampaignChannel = 'email' | 'sms' | 'voice'

export interface Campaign {
  id:           string
  name:         string
  componentId:  string
  groupId:      string
  channel:      CampaignChannel
  status:       CampaignStatus
  senderId:     string
  templateId:   string
  listIds:      string[]
  topicId:      string | null
  /** Recipient count at time of send (or estimated for scheduled/draft) */
  recipientCount: number
  scheduledAt:  string | null  // ISO date
  sentAt:       string | null  // ISO date
  createdAt:    string         // ISO date
  createdBy:    string
}

export const CAMPAIGNS: Campaign[] = [
  {
    id:             'camp-1',
    name:           '2026 COLA Notification — Retirees',
    componentId:    'rsc',
    groupId:        'rsc-g1',
    channel:        'email',
    status:         'sent',
    senderId:       'sender-1',
    templateId:     'tmpl-1',
    listIds:        ['list-2', 'list-9'],
    topicId:        'topic-1',
    recipientCount: 50_900_000,
    scheduledAt:    '2026-01-05T08:00:00Z',
    sentAt:         '2026-01-05T08:14:22Z',
    createdAt:      '2025-12-20T10:00:00Z',
    createdBy:      'J. Martinez',
  },
  {
    id:             'camp-2',
    name:           'Medicare Part B Premium Notice 2026',
    componentId:    'mcc',
    groupId:        'mcc-g2',
    channel:        'email',
    status:         'sent',
    senderId:       'sender-4',
    templateId:     'tmpl-2',
    listIds:        ['list-1'],
    topicId:        'topic-2',
    recipientCount: 62_400_000,
    scheduledAt:    '2025-10-01T08:00:00Z',
    sentAt:         '2025-10-01T08:22:10Z',
    createdAt:      '2025-09-25T09:00:00Z',
    createdBy:      'R. Chen',
  },
  {
    id:             'camp-3',
    name:           'SSI COLA — April Payment Update',
    componentId:    'dsc',
    groupId:        'dsc-g2',
    channel:        'email',
    status:         'sending',
    senderId:       'sender-3',
    templateId:     'tmpl-3',
    listIds:        ['list-4'],
    topicId:        'topic-3',
    recipientCount: 7_500_000,
    scheduledAt:    '2026-05-08T09:00:00Z',
    sentAt:         null,
    createdAt:      '2026-05-01T13:00:00Z',
    createdBy:      'D. Thompson',
  },
  {
    id:             'camp-4',
    name:           'Medicare IEP — May Cohort',
    componentId:    'mcc',
    groupId:        'mcc-g1',
    channel:        'email',
    status:         'scheduled',
    senderId:       'sender-4',
    templateId:     'tmpl-4',
    listIds:        ['list-1'],
    topicId:        'topic-5',
    recipientCount: 4_200_000,
    scheduledAt:    '2026-05-15T08:00:00Z',
    sentAt:         null,
    createdAt:      '2026-05-03T11:00:00Z',
    createdBy:      'R. Chen',
  },
  {
    id:             'camp-5',
    name:           'Field Appointment Reminders — Week 19',
    componentId:    'foc',
    groupId:        'foc-g1',
    channel:        'email',
    status:         'scheduled',
    senderId:       'sender-1',
    templateId:     'tmpl-7',
    listIds:        ['list-6'],
    topicId:        'topic-7',
    recipientCount: 12_400,
    scheduledAt:    '2026-05-13T07:00:00Z',
    sentAt:         null,
    createdAt:      '2026-05-08T16:00:00Z',
    createdBy:      'S. Garcia',
  },
  {
    id:             'camp-6',
    name:           'CDR Notification — 2024 Cohort Wave 1',
    componentId:    'dsc',
    groupId:        'dsc-g3',
    channel:        'email',
    status:         'draft',
    senderId:       'sender-3',
    templateId:     'tmpl-3',
    listIds:        ['list-7'],
    topicId:        'topic-3',
    recipientCount: 350_000,
    scheduledAt:    null,
    sentAt:         null,
    createdAt:      '2026-05-06T14:00:00Z',
    createdBy:      'D. Thompson',
  },
  {
    id:             'camp-7',
    name:           'Retirement Planning — Near-Retirement Outreach',
    componentId:    'rsc',
    groupId:        'rsc-g3',
    channel:        'email',
    status:         'draft',
    senderId:       'sender-2',
    templateId:     'tmpl-6',
    listIds:        ['list-5'],
    topicId:        'topic-6',
    recipientCount: 12_300_000,
    scheduledAt:    null,
    sentAt:         null,
    createdAt:      '2026-05-07T09:30:00Z',
    createdBy:      'J. Martinez',
  },
  {
    id:             'camp-8',
    name:           'Ticket to Work — Spring Enrollment Push',
    componentId:    'dsc',
    groupId:        'dsc-g4',
    channel:        'email',
    status:         'paused',
    senderId:       'sender-8',
    templateId:     'tmpl-5',
    listIds:        ['list-8'],
    topicId:        'topic-4',
    recipientCount: 185_000,
    scheduledAt:    '2026-04-20T09:00:00Z',
    sentAt:         null,
    createdAt:      '2026-04-15T10:00:00Z',
    createdBy:      'M. Patel',
  },
]
