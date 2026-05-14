// SSA three-level hierarchy: Account → Component → Campaign Group
// SSA operates ~12 components; each component owns campaign groups.

export interface SSAComponent {
  id:          string
  name:        string
  shortCode:   string
  description: string
  groupCount:  number
}

export interface CampaignGroup {
  id:          string
  componentId: string
  name:        string
  description: string
  memberCount: number   // users with access
}

export interface GroupHierarchy extends SSAComponent {
  groups: CampaignGroup[]
}

// ── SSA Components (~12) ──────────────────────────────────────────────────────

export const COMPONENTS: SSAComponent[] = [
  { id: 'rsc', name: 'Retirement Services',          shortCode: 'RSC', description: 'Retirement and survivors benefit programs',   groupCount: 3 },
  { id: 'dsc', name: 'Disability Services',          shortCode: 'DSC', description: 'SSDI and SSI disability programs',            groupCount: 4 },
  { id: 'mcc', name: 'Medicare Coordination',        shortCode: 'MCC', description: 'Medicare enrollment and coordination',        groupCount: 2 },
  { id: 'foc', name: 'Field Operations',             shortCode: 'FOC', description: 'Regional offices and field service centers',  groupCount: 3 },
  { id: 'hoc', name: 'Hearing Operations',           shortCode: 'HOC', description: 'ALJ hearings and appeals processing',         groupCount: 2 },
  { id: 'oc',  name: 'Office of Communications',     shortCode: 'OC',  description: 'Public affairs and outreach',                 groupCount: 2 },
  { id: 'oit', name: 'Office of Information Technology', shortCode: 'OIT', description: 'IT services and digital transformation',  groupCount: 1 },
  { id: 'ohr', name: 'Office of Human Resources',    shortCode: 'OHR', description: 'Workforce management and benefits',          groupCount: 1 },
  { id: 'obfm',name: 'Budget, Finance & Management', shortCode: 'OBFM',description: 'Financial operations and budget oversight',  groupCount: 2 },
  { id: 'oao', name: 'Appellate Operations',         shortCode: 'OAO', description: 'Appeals Council and national review',        groupCount: 2 },
  { id: 'oaro',name: 'Analytics, Review & Oversight',shortCode: 'OARO',description: 'Data analytics and program evaluation',     groupCount: 1 },
  { id: 'oig', name: 'Office of Inspector General',  shortCode: 'OIG', description: 'Investigations, audits, and oversight',     groupCount: 1 },
]

// ── Campaign Groups (keyed by componentId) ────────────────────────────────────

export const CAMPAIGN_GROUPS: CampaignGroup[] = [
  // Retirement Services
  { id: 'rsc-g1',  componentId: 'rsc',  name: 'Retirement Benefits Outreach',   description: 'Annual notices and benefit reminders for retirees',     memberCount: 12 },
  { id: 'rsc-g2',  componentId: 'rsc',  name: 'Survivors Benefit Notifications', description: 'Communications for survivors and dependents',           memberCount: 6  },
  { id: 'rsc-g3',  componentId: 'rsc',  name: 'Early Retirement Campaigns',      description: 'Outreach for near-retirement age beneficiaries',        memberCount: 8  },

  // Disability Services
  { id: 'dsc-g1',  componentId: 'dsc',  name: 'SSDI Application Updates',        description: 'Status and decision notices for SSDI applicants',       memberCount: 14 },
  { id: 'dsc-g2',  componentId: 'dsc',  name: 'SSI Program Notifications',       description: 'Payment and eligibility notices for SSI recipients',    memberCount: 10 },
  { id: 'dsc-g3',  componentId: 'dsc',  name: 'Continuing Disability Reviews',   description: 'CDR scheduling and outcome communications',             memberCount: 7  },
  { id: 'dsc-g4',  componentId: 'dsc',  name: 'Ticket to Work Program',          description: 'Employment support and incentive outreach',             memberCount: 5  },

  // Medicare Coordination
  { id: 'mcc-g1',  componentId: 'mcc',  name: 'Medicare Initial Enrollment',     description: 'IEP reminders and Part A/B enrollment notices',         memberCount: 9  },
  { id: 'mcc-g2',  componentId: 'mcc',  name: 'Medicare Annual Notices',         description: 'IRMAA, COLA, and annual notice campaigns',              memberCount: 11 },

  // Field Operations
  { id: 'foc-g1',  componentId: 'foc',  name: 'Field Office Appointments',       description: 'In-person appointment reminders and scheduling',        memberCount: 20 },
  { id: 'foc-g2',  componentId: 'foc',  name: 'Regional Outreach Events',        description: 'Community events and office open-house notifications',  memberCount: 8  },
  { id: 'foc-g3',  componentId: 'foc',  name: 'Online Services Adoption',        description: 'my Social Security enrollment and feature campaigns',   memberCount: 6  },

  // Hearing Operations
  { id: 'hoc-g1',  componentId: 'hoc',  name: 'Hearing Scheduling Notices',      description: 'ALJ hearing dates and virtual hearing instructions',    memberCount: 7  },
  { id: 'hoc-g2',  componentId: 'hoc',  name: 'Appeals Council Updates',         description: 'AC review status and decision notifications',           memberCount: 5  },

  // Communications
  { id: 'oc-g1',   componentId: 'oc',   name: 'National Awareness Campaigns',    description: 'SSA.gov and public-facing benefit awareness',           memberCount: 4  },
  { id: 'oc-g2',   componentId: 'oc',   name: 'Congressional Affairs',           description: 'Constituent casework and liaison communications',       memberCount: 3  },

  // OIT
  { id: 'oit-g1',  componentId: 'oit',  name: 'System Maintenance Notices',      description: 'Downtime, upgrade, and outage notifications',           memberCount: 6  },

  // OHR
  { id: 'ohr-g1',  componentId: 'ohr',  name: 'Employee Benefits Enrollment',    description: 'Open season and benefits update communications',        memberCount: 5  },

  // OBFM
  { id: 'obfm-g1', componentId: 'obfm', name: 'Budget Cycle Communications',     description: 'Annual budget and spend guidance',                      memberCount: 4  },
  { id: 'obfm-g2', componentId: 'obfm', name: 'Financial Audit Notifications',   description: 'Audit scheduling and document request notices',         memberCount: 3  },

  // OAO
  { id: 'oao-g1',  componentId: 'oao',  name: 'Appeals Backlog Outreach',        description: 'Status updates for long-pending appeals',              memberCount: 6  },
  { id: 'oao-g2',  componentId: 'oao',  name: 'Decision Notice Campaigns',       description: 'Final decision and next-steps communications',          memberCount: 4  },

  // OARO
  { id: 'oaro-g1', componentId: 'oaro', name: 'Program Evaluation Reports',      description: 'Research findings and program performance notices',     memberCount: 3  },

  // OIG
  { id: 'oig-g1',  componentId: 'oig',  name: 'Fraud Awareness Campaigns',       description: 'Scam and identity theft prevention outreach',           memberCount: 4  },
]

// ── Hierarchy (components with their groups inlined) ─────────────────────────

export const GROUP_HIERARCHY: GroupHierarchy[] = COMPONENTS.map(component => ({
  ...component,
  groups: CAMPAIGN_GROUPS.filter(g => g.componentId === component.id),
}))
