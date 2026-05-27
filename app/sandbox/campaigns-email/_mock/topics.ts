export interface Topic {
  id:                string
  name:              string
  componentId:       string
  groupId:           string
  subscriberCount:   number
  defaultTemplateId: string | null
  defaultSenderId:   string | null
  defaultListId:     string | null
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
    subscriberCount:   51_000_000,
    defaultTemplateId: 'tmpl-1',
    defaultSenderId:   'sender-1',
    defaultListId:     'list-2',
    openRate:          0.61,
    lastSentAt:        '2026-01-05T08:00:00Z',
    createdAt:         '2022-10-01T09:00:00Z',
  },
  {
    id:                'topic-2',
    name:              'Medicare Annual Notice',
    componentId:       'mcc',
    groupId:           'mcc-g2',
    subscriberCount:   62_000_000,
    defaultTemplateId: 'tmpl-2',
    defaultSenderId:   null,
    defaultListId:     'list-1',
    openRate:          0.55,
    lastSentAt:        '2025-10-01T08:00:00Z',
    createdAt:         '2021-06-15T09:00:00Z',
  },
  {
    id:                'topic-3',
    name:              'Benefit Status Updates',
    componentId:       'dsc',
    groupId:           'dsc-g1',
    subscriberCount:   16_000_000,
    defaultTemplateId: 'tmpl-3',
    defaultSenderId:   'sender-3',
    defaultListId:     'list-3',
    openRate:          0.72,
    lastSentAt:        '2026-04-22T10:00:00Z',
    createdAt:         '2023-01-10T09:00:00Z',
  },
  {
    id:                'topic-4',
    name:              'Employment Incentive Updates',
    componentId:       'dsc',
    groupId:           'dsc-g4',
    subscriberCount:   200_000,
    defaultTemplateId: 'tmpl-5',
    defaultSenderId:   'sender-8',
    defaultListId:     'list-8',
    openRate:          0.68,
    lastSentAt:        '2026-03-15T09:00:00Z',
    createdAt:         '2024-02-01T09:00:00Z',
  },
  {
    id:                'topic-5',
    name:              'Medicare Initial Enrollment Period',
    componentId:       'mcc',
    groupId:           'mcc-g1',
    subscriberCount:   4_200_000,
    defaultTemplateId: 'tmpl-4',
    defaultSenderId:   'sender-4',
    defaultListId:     null,
    openRate:          0.78,
    lastSentAt:        '2026-04-01T08:00:00Z',
    createdAt:         '2022-03-15T09:00:00Z',
  },
  {
    id:                'topic-6',
    name:              'Retirement Planning Reminders',
    componentId:       'rsc',
    groupId:           'rsc-g3',
    subscriberCount:   12_000_000,
    defaultTemplateId: 'tmpl-6',
    defaultSenderId:   null,
    defaultListId:     'list-5',
    openRate:          0.58,
    lastSentAt:        '2026-02-10T09:00:00Z',
    createdAt:         '2023-07-01T09:00:00Z',
  },
  {
    id:                'topic-7',
    name:              'Appointment Reminders',
    componentId:       'foc',
    groupId:           'foc-g1',
    subscriberCount:   340_000,
    defaultTemplateId: 'tmpl-7',
    defaultSenderId:   null,
    defaultListId:     'list-6',
    openRate:          0.84,
    lastSentAt:        '2026-05-06T08:00:00Z',
    createdAt:         '2024-09-01T09:00:00Z',
  },
  {
    id:                'topic-8',
    name:              'my Social Security Feature Updates',
    componentId:       'foc',
    groupId:           'foc-g3',
    subscriberCount:   73_000_000,
    defaultTemplateId: null,
    defaultSenderId:   null,
    defaultListId:     'list-10',
    openRate:          0.31,
    lastSentAt:        '2025-11-20T10:00:00Z',
    createdAt:         '2021-01-01T09:00:00Z',
  },
]
