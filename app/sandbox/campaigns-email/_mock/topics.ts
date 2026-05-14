export type TopicStatus = 'active' | 'paused' | 'archived'

export interface Topic {
  id:                string
  name:              string
  description?:      string
  componentId:       string
  groupId:           string
  status:            TopicStatus
  subscriberCount:   number
  defaultTemplateId: string | null
  defaultSenderId:   string | null
  listIds:           string[]
  openRate:          number   // 0–1
  lastSentAt:        string | null  // ISO date
  createdAt:         string   // ISO date
}

export const TOPICS: Topic[] = [
  {
    id:                'topic-1',
    name:              'Annual COLA Notification',
    componentId:       'rsc',
    groupId:           'rsc-g1',
    status:            'active',
    subscriberCount:   51_000_000,
    defaultTemplateId: 'tmpl-1',
    defaultSenderId:   'sender-1',
    listIds:           ['list-2', 'list-5', 'list-9'],
    openRate:          0.61,
    lastSentAt:        '2026-01-05T08:00:00Z',
    createdAt:         '2022-10-01T09:00:00Z',
  },
  {
    id:                'topic-2',
    name:              'Medicare Annual Notice',
    componentId:       'mcc',
    groupId:           'mcc-g2',
    status:            'active',
    subscriberCount:   62_000_000,
    defaultTemplateId: 'tmpl-2',
    defaultSenderId:   'sender-4',
    listIds:           ['list-1'],
    openRate:          0.55,
    lastSentAt:        '2025-10-01T08:00:00Z',
    createdAt:         '2021-06-15T09:00:00Z',
  },
  {
    id:                'topic-3',
    name:              'Benefit Status Updates',
    componentId:       'dsc',
    groupId:           'dsc-g1',
    status:            'active',
    subscriberCount:   16_000_000,
    defaultTemplateId: 'tmpl-3',
    defaultSenderId:   'sender-3',
    listIds:           ['list-3', 'list-4', 'list-7'],
    openRate:          0.72,
    lastSentAt:        '2026-04-22T10:00:00Z',
    createdAt:         '2023-01-10T09:00:00Z',
  },
  {
    id:                'topic-4',
    name:              'Employment Incentive Updates',
    componentId:       'dsc',
    groupId:           'dsc-g4',
    status:            'active',
    subscriberCount:   200_000,
    defaultTemplateId: 'tmpl-5',
    defaultSenderId:   'sender-8',
    listIds:           ['list-4', 'list-8'],
    openRate:          0.68,
    lastSentAt:        '2026-03-15T09:00:00Z',
    createdAt:         '2024-02-01T09:00:00Z',
  },
  {
    id:                'topic-5',
    name:              'Medicare Initial Enrollment Period',
    componentId:       'mcc',
    groupId:           'mcc-g1',
    status:            'active',
    subscriberCount:   4_200_000,
    defaultTemplateId: 'tmpl-4',
    defaultSenderId:   'sender-4',
    listIds:           ['list-1'],
    openRate:          0.78,
    lastSentAt:        '2026-04-01T08:00:00Z',
    createdAt:         '2022-03-15T09:00:00Z',
  },
  {
    id:                'topic-6',
    name:              'Retirement Planning Reminders',
    componentId:       'rsc',
    groupId:           'rsc-g3',
    status:            'active',
    subscriberCount:   12_000_000,
    defaultTemplateId: 'tmpl-6',
    defaultSenderId:   'sender-2',
    listIds:           ['list-5'],
    openRate:          0.58,
    lastSentAt:        '2026-02-10T09:00:00Z',
    createdAt:         '2023-07-01T09:00:00Z',
  },
  {
    id:                'topic-7',
    name:              'Appointment Reminders',
    componentId:       'foc',
    groupId:           'foc-g1',
    status:            'active',
    subscriberCount:   340_000,
    defaultTemplateId: 'tmpl-7',
    defaultSenderId:   null,
    listIds:           ['list-6'],
    openRate:          0.84,
    lastSentAt:        '2026-05-06T08:00:00Z',
    createdAt:         '2024-09-01T09:00:00Z',
  },
  {
    id:                'topic-8',
    name:              'my Social Security Feature Updates',
    componentId:       'foc',
    groupId:           'foc-g3',
    status:            'paused',
    subscriberCount:   73_000_000,
    defaultTemplateId: null,
    defaultSenderId:   null,
    listIds:           ['list-10'],
    openRate:          0.31,
    lastSentAt:        '2025-11-20T10:00:00Z',
    createdAt:         '2021-01-01T09:00:00Z',
  },
]
