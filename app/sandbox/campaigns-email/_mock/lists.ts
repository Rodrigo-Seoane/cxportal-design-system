export type ListChannel = 'email' | 'phone' | 'both'
export type ListStatus  = 'active' | 'updating' | 'archived'

export interface ContactList {
  id:             string
  name:           string
  componentId:    string
  groupId:        string
  channel:        ListChannel
  recipientCount: number
  topicIds:       string[]
  status:         ListStatus
  lastUpdated:    string  // ISO date
  createdAt:      string  // ISO date
  /** true = currently used in a sent or in-progress campaign (blocks mid-campaign update) */
  inActiveCampaign: boolean
}

export const LISTS: ContactList[] = [
  {
    id:               'list-1',
    name:             'Medicare Beneficiaries — All Active',
    componentId:      'mcc',
    groupId:          'mcc-g2',
    channel:          'email',
    recipientCount:   62_400_000,
    topicIds:         ['topic-2', 'topic-5'],
    status:           'active',
    lastUpdated:      '2026-04-30T08:00:00Z',
    createdAt:        '2024-01-10T09:00:00Z',
    inActiveCampaign: true,
  },
  {
    id:               'list-2',
    name:             'Retirement Age Recipients — 62–70',
    componentId:      'rsc',
    groupId:          'rsc-g1',
    channel:          'email',
    recipientCount:   44_800_000,
    topicIds:         ['topic-1'],
    status:           'active',
    lastUpdated:      '2026-05-01T10:00:00Z',
    createdAt:        '2024-03-15T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-3',
    name:             'SSDI Active Recipients',
    componentId:      'dsc',
    groupId:          'dsc-g1',
    channel:          'email',
    recipientCount:   8_700_000,
    topicIds:         ['topic-3'],
    status:           'active',
    lastUpdated:      '2026-04-28T14:00:00Z',
    createdAt:        '2024-02-01T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-4',
    name:             'SSI Recipients — National',
    componentId:      'dsc',
    groupId:          'dsc-g2',
    channel:          'both',
    recipientCount:   7_500_000,
    topicIds:         ['topic-3', 'topic-4'],
    status:           'active',
    lastUpdated:      '2026-05-02T09:00:00Z',
    createdAt:        '2024-01-20T09:00:00Z',
    inActiveCampaign: true,
  },
  {
    id:               'list-5',
    name:             'Near-Retirement — Ages 58–61',
    componentId:      'rsc',
    groupId:          'rsc-g3',
    channel:          'email',
    recipientCount:   12_300_000,
    topicIds:         ['topic-1', 'topic-6'],
    status:           'active',
    lastUpdated:      '2026-04-15T11:00:00Z',
    createdAt:        '2025-06-01T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-6',
    name:             'Field Office Appointment Holders',
    componentId:      'foc',
    groupId:          'foc-g1',
    channel:          'email',
    recipientCount:   340_000,
    topicIds:         ['topic-7'],
    status:           'active',
    lastUpdated:      '2026-05-08T07:30:00Z',
    createdAt:        '2025-09-01T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-7',
    name:             'CDR Review — 2024 Cohort',
    componentId:      'dsc',
    groupId:          'dsc-g3',
    channel:          'email',
    recipientCount:   1_200_000,
    topicIds:         ['topic-3'],
    status:           'updating',
    lastUpdated:      '2026-05-07T15:00:00Z',
    createdAt:        '2025-11-10T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-8',
    name:             'Ticket to Work Participants',
    componentId:      'dsc',
    groupId:          'dsc-g4',
    channel:          'email',
    recipientCount:   185_000,
    topicIds:         ['topic-4'],
    status:           'active',
    lastUpdated:      '2026-03-20T12:00:00Z',
    createdAt:        '2025-07-15T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-9',
    name:             'Survivors Benefit Recipients',
    componentId:      'rsc',
    groupId:          'rsc-g2',
    channel:          'email',
    recipientCount:   6_100_000,
    topicIds:         ['topic-1'],
    status:           'active',
    lastUpdated:      '2026-04-25T10:00:00Z',
    createdAt:        '2024-05-01T09:00:00Z',
    inActiveCampaign: false,
  },
  {
    id:               'list-10',
    name:             'my Social Security — Registered Users',
    componentId:      'foc',
    groupId:          'foc-g3',
    channel:          'email',
    recipientCount:   73_000_000,
    topicIds:         ['topic-8'],
    status:           'archived',
    lastUpdated:      '2025-12-31T23:59:00Z',
    createdAt:        '2023-04-01T09:00:00Z',
    inActiveCampaign: false,
  },
]
