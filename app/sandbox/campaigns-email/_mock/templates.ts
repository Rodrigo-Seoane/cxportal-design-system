export type TemplateStatus = 'published' | 'draft' | 'archived'

export interface TemplateVersion {
  version:   number
  status:    TemplateStatus
  createdAt: string   // ISO date
  createdBy: string
}

export interface EmailTemplate {
  id:              string
  name:            string
  componentId:     string
  groupId:         string
  topicId:         string | null
  status:          TemplateStatus
  latestVersion:   number
  lastEditedAt:    string   // ISO date
  lastEditedBy:    string
  versions:        TemplateVersion[]
  subjectLine:     string
  bodyHtml:        string
}

// Available variable placeholders (list pending from Connect integration)
export const TEMPLATE_VARIABLES = [
  { key: '{{recipient.firstName}}',   label: 'Recipient first name' },
  { key: '{{recipient.lastName}}',    label: 'Recipient last name' },
  { key: '{{recipient.email}}',       label: 'Recipient email' },
  { key: '{{topic.name}}',            label: 'Topic name' },
  { key: '{{campaign.name}}',         label: 'Campaign name' },
  { key: '{{unsubscribe.url}}',       label: 'Unsubscribe link' },
  { key: '{{sender.displayName}}',    label: 'Sender display name' },
  { key: '{{benefit.amount}}',        label: 'Benefit amount (USD)' },
  { key: '{{benefit.effectiveDate}}', label: 'Effective date' },
  { key: '{{office.name}}',           label: 'Field office name' },
  { key: '{{office.phone}}',          label: 'Field office phone' },
]

export const TEMPLATES: EmailTemplate[] = [
  {
    id:            'tmpl-1',
    name:          'Annual COLA Notification — English',
    componentId:   'rsc',
    groupId:       'rsc-g1',
    topicId:       'topic-1',
    status:        'published',
    latestVersion: 3,
    lastEditedAt:  '2025-12-10T11:00:00Z',
    lastEditedBy:  'J. Martinez',
    subjectLine:   'Your Social Security benefit amount is changing in {{benefit.effectiveDate}}',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>Your monthly Social Security benefit amount will change to <strong>{{benefit.amount}}</strong> effective {{benefit.effectiveDate}} due to the annual cost-of-living adjustment (COLA).</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'archived',  createdAt: '2023-11-01T09:00:00Z', createdBy: 'A. Johnson' },
      { version: 2, status: 'archived',  createdAt: '2024-11-15T10:00:00Z', createdBy: 'J. Martinez' },
      { version: 3, status: 'published', createdAt: '2025-12-10T11:00:00Z', createdBy: 'J. Martinez' },
    ],
  },
  {
    id:            'tmpl-2',
    name:          'Medicare Annual Notice — Part B Premium',
    componentId:   'mcc',
    groupId:       'mcc-g2',
    topicId:       'topic-2',
    status:        'published',
    latestVersion: 2,
    lastEditedAt:  '2025-09-20T09:00:00Z',
    lastEditedBy:  'R. Chen',
    subjectLine:   'Your Medicare Part B Premium for {{benefit.effectiveDate}}',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>Your Medicare Part B premium for {{benefit.effectiveDate}} will be <strong>{{benefit.amount}}</strong> per month.</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'archived',  createdAt: '2024-09-01T09:00:00Z', createdBy: 'K. Williams' },
      { version: 2, status: 'published', createdAt: '2025-09-20T09:00:00Z', createdBy: 'R. Chen' },
    ],
  },
  {
    id:            'tmpl-3',
    name:          'SSDI Application Decision Notice',
    componentId:   'dsc',
    groupId:       'dsc-g1',
    topicId:       'topic-3',
    status:        'published',
    latestVersion: 1,
    lastEditedAt:  '2026-01-15T10:00:00Z',
    lastEditedBy:  'D. Thompson',
    subjectLine:   'Decision on your Social Security Disability application',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>We have made a decision on your disability application. Please log in to your my Social Security account or contact your local field office for details.</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'published', createdAt: '2026-01-15T10:00:00Z', createdBy: 'D. Thompson' },
    ],
  },
  {
    id:            'tmpl-4',
    name:          'Medicare IEP Reminder — 3 Months Before 65',
    componentId:   'mcc',
    groupId:       'mcc-g1',
    topicId:       'topic-5',
    status:        'published',
    latestVersion: 2,
    lastEditedAt:  '2026-02-28T14:00:00Z',
    lastEditedBy:  'R. Chen',
    subjectLine:   'Your Medicare enrollment window opens soon',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>Your Initial Enrollment Period (IEP) for Medicare is opening soon. Enrolling on time helps you avoid late enrollment penalties.</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'archived',  createdAt: '2024-06-01T09:00:00Z', createdBy: 'K. Williams' },
      { version: 2, status: 'published', createdAt: '2026-02-28T14:00:00Z', createdBy: 'R. Chen' },
    ],
  },
  {
    id:            'tmpl-5',
    name:          'Ticket to Work — Program Invitation',
    componentId:   'dsc',
    groupId:       'dsc-g4',
    topicId:       'topic-4',
    status:        'published',
    latestVersion: 1,
    lastEditedAt:  '2025-08-10T09:00:00Z',
    lastEditedBy:  'M. Patel',
    subjectLine:   'You may be eligible for the Ticket to Work program',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>The Ticket to Work program can help you return to work while keeping your benefits. Learn more about free employment support services available to you.</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'published', createdAt: '2025-08-10T09:00:00Z', createdBy: 'M. Patel' },
    ],
  },
  {
    id:            'tmpl-6',
    name:          'Retirement Planning Guide — Near-Retirement',
    componentId:   'rsc',
    groupId:       'rsc-g3',
    topicId:       'topic-6',
    status:        'draft',
    latestVersion: 1,
    lastEditedAt:  '2026-04-30T16:00:00Z',
    lastEditedBy:  'J. Martinez',
    subjectLine:   'Planning for retirement? Here\'s what you need to know',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>Retirement is around the corner. Review your estimated benefit, check your earnings record, and learn about your options for claiming Social Security.</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'draft', createdAt: '2026-04-30T16:00:00Z', createdBy: 'J. Martinez' },
    ],
  },
  {
    id:            'tmpl-7',
    name:          'Field Office Appointment Reminder',
    componentId:   'foc',
    groupId:       'foc-g1',
    topicId:       'topic-7',
    status:        'published',
    latestVersion: 2,
    lastEditedAt:  '2026-03-10T08:00:00Z',
    lastEditedBy:  'S. Garcia',
    subjectLine:   'Reminder: Your appointment at {{office.name}} is coming up',
    bodyHtml:      `<p>Dear {{recipient.firstName}},</p>\n<p>This is a reminder of your scheduled appointment at <strong>{{office.name}}</strong>. If you need to reschedule, call {{office.phone}}.</p>\n<p><a href="{{unsubscribe.url}}">Unsubscribe</a></p>`,
    versions: [
      { version: 1, status: 'archived',  createdAt: '2025-09-01T09:00:00Z', createdBy: 'S. Garcia' },
      { version: 2, status: 'published', createdAt: '2026-03-10T08:00:00Z', createdBy: 'S. Garcia' },
    ],
  },
]
