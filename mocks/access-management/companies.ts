export interface CompanySummary {
  id: string
  name: string
  companyId: string
  group: string | null
}

export interface CompanyInstance {
  id: string
  alias: string
  instanceId: string
  region: string
  awsAccountId: string
  arn: string
  group: string | null
}

export type CompanyUserStatus = 'confirmed' | 'invite-expired' | 'disabled'

export interface CompanyUser {
  id: string
  name: string
  email: string
  status: CompanyUserStatus
  roleName: string
  group: string | null
}

export interface CompanyRole {
  id: string
  name: string
  description: string
  group: string | null
}

export type ModuleEnablement = 'verified' | 'not-enabled'

export interface CompanyModule {
  id: string
  name: string
}

// ── Companies index ──────────────────────────────────────────────────────────
// Figma: node 3817-48554 (COMPANY MANAGEMENT/Index)

export const COMPANY_SUMMARIES: CompanySummary[] = [
  { id: 'xi-xian-group', name: 'Xi - Xian Group', companyId: 'Inbound Sales – West',       group: 'Marketplace Tier 1 – Chat' },
  { id: 'sumace',        name: 'Sumace',          companyId: 'Provider Services – East',    group: null },
  { id: 'donquadtech',   name: 'Donquadtech',     companyId: 'Medicaid – Oklahoma',         group: 'Medicare Advantage – Inbound' },
  { id: 'treequote',     name: 'Treequote',       companyId: 'Marketplace – FL',            group: 'Pharmacy Benefits – Voice' },
  { id: 'nam-zim',       name: 'Nam-zim',         companyId: 'Retention – National',        group: 'Outbound – Win-Back Campaign' },
  { id: 'golddex',       name: 'Golddex',         companyId: 'Pharmacy – Central',          group: null },
  { id: 'warephase',     name: 'Warephase',       companyId: 'Medicare Advantage – TX',     group: 'Inbound Sales – Voice' },
  { id: 'toughzap',      name: 'Toughzap',        companyId: 'Outbound Campaigns – West',   group: null },
  { id: 'y-corporation', name: 'Y-corporation',   companyId: 'Retention – AZ',              group: 'Retention – Voice' },
  { id: 'isdom',         name: 'Isdom',           companyId: 'Pharmacy – Central',          group: 'Provider Services – Inbound' },
  { id: 'donware',       name: 'Donware',         companyId: 'FMLA & Specialty – National', group: null },
  { id: 'dambase',       name: 'dambase',         companyId: 'Inbound Sales – West',        group: 'Member Services – Escalation' },
  { id: 'iselectrics',   name: 'Iselectrics',     companyId: 'Behavioral Health – National',group: null },
  { id: 'sunnamplex',    name: 'Sunnamplex',      companyId: 'Member Services – Tier 2',     group: 'Sales – Callback' },
  { id: 'plusstrip',     name: 'Plusstrip',       companyId: 'Inbound Sales – East',        group: null },
  { id: 'lexiqvolax',    name: 'Lexiqvolax',      companyId: 'Outbound Campaigns – West',    group: null },
  { id: 'year-job',      name: 'year-job',        companyId: 'Retention – National',        group: 'FMLA Specialist' },
]

export function getCompanySummary(id: string): CompanySummary | undefined {
  return COMPANY_SUMMARIES.find(c => c.id === id)
}

// ── Company detail ───────────────────────────────────────────────────────────
// Figma: node 3817-50308 (Instances tab) + 3817-51369 (Users/Roles/Modules tabs)
// Shared demo dataset across companies — Figma only mocks a single detail page
// regardless of which company row you click, same pattern as Role/User detail.

const INSTANCES: CompanyInstance[] = [
  { id: 'i1', alias: 'qa-client',      instanceId: '84d4e937-8f7e-4f46-bd07-944f67b8c7b2', region: 'us-west-2', awsAccountId: '1975469', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: 'Group Name 1' },
  { id: 'i2', alias: 'dev-client-srn2',instanceId: '0baecf77-6eb7-4fb6-82d7-c68c59664a47', region: 'us-east-1', awsAccountId: '1975427', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: 'Group Name 1' },
  { id: 'i3', alias: 'qa-client',      instanceId: '35b2c225-7405-4412-8e27-4b070c07638c', region: 'us-east-1', awsAccountId: '1975374', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: 'Group Name 1' },
  { id: 'i4', alias: 'dev-client-srn2',instanceId: '6f0629eb-9b6d-4683-a8f6-3c6d1bb6c2f6', region: 'us-east-1', awsAccountId: '1975364', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: 'Group Name 2' },
  { id: 'i5', alias: 'qa-client',      instanceId: '9f59a1af-d2f4-4f18-94d5-215b067e7e4d', region: 'us-west-2', awsAccountId: '1975371', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: 'Group Name 2' },
  { id: 'i6', alias: 'dev-client-srn2',instanceId: '53dab320-71d5-4d0c-a90e-387c5ed5e0f5', region: 'us-west-2', awsAccountId: '1975469', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: null },
  { id: 'i7', alias: 'dev-client-srn2',instanceId: '6304c8b7-1a0a-4f03-b5d5-8423e44f3f60', region: 'us-east-1', awsAccountId: '1975465', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: null },
  { id: 'i8', alias: 'qa-client',      instanceId: 'd623b11d-82a4-4a20-82b2-1c87927b50c7', region: 'us-west-2', awsAccountId: '1975495', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: null },
  { id: 'i9', alias: 'qa-client',      instanceId: 'a9a728b9-fb8c-44e3-bdcd-6bf54d6c8d6d', region: 'us-east-1', awsAccountId: '1975429', arn: 'arn:aws:connect:us-west-2:396913726154:instance/0', group: null },
]

const USERS: CompanyUser[] = [
  { id: 'u1', name: 'Felicia Reid',   email: 'felicia.reid@pronetx.com',   status: 'disabled',       roleName: 'Test Admin Role 6-Jan-2026', group: null },
  { id: 'u2', name: 'Debbie Baker',   email: 'debbie.baker@pronetx.com',   status: 'confirmed',      roleName: 'Acgr Role',                  group: null },
  { id: 'u3', name: 'Willie Jennings',email: 'willie.jennings@pronetx.com',status: 'invite-expired', roleName: 'Danzig Test',                group: null },
  { id: 'u4', name: 'Kenzi Lawson',   email: 'kenzi.lawson@pronetx.com',   status: 'confirmed',      roleName: 'test',                       group: null },
  { id: 'u5', name: 'Michael Mitc',   email: 'michael.mitc@pronetx.com',   status: 'confirmed',      roleName: 'mehboobtest',                group: null },
  { id: 'u6', name: 'Deanna Curtis',  email: 'deanna.curtis@pronetx.com',  status: 'invite-expired', roleName: 'pronetx admin',              group: null },
  { id: 'u7', name: 'Nathan Roberts', email: 'nathan.roberts@pronetx.com', status: 'invite-expired', roleName: 'pronetx centene tester',     group: null },
  { id: 'u8', name: 'Bill Sanders',   email: 'bill.sanders@pronetx.com',   status: 'confirmed',      roleName: 'Nile test',                  group: null },
  { id: 'u9', name: 'Alma Lawson',    email: 'alma.lawson@pronetx.com',    status: 'disabled',       roleName: 'Campaigns Admin',            group: null },
  { id: 'u10',name: 'Tim Jennings',   email: 'tim.jennings@pronetx.com',   status: 'invite-expired', roleName: 'Mpho Test',                  group: null },
  { id: 'u11',name: 'Debra Holt',     email: 'debra.holt@pronetx.com',     status: 'confirmed',      roleName: 'pronetx superadmin',         group: null },
]

const ROLES: CompanyRole[] = [
  { id: 'r1',  name: 'pronetx superadmin',           description: 'Full administrative access across all company modules', group: null },
  { id: 'r2',  name: 'pronetx centene tester',       description: 'Centene-scoped testing role with limited write access', group: null },
  { id: 'r3',  name: 'Josh Test Role',               description: 'Internal test role',                                    group: null },
  { id: 'r4',  name: 'Role Name',                    description: 'Draft role — description not yet set',                  group: null },
  { id: 'r5',  name: 'Josh Admin Role',               description: 'Admin-level access for internal testing',              group: null },
  { id: 'r6',  name: 'Rodrigo Test',                 description: 'Internal test role',                                    group: null },
  { id: 'r7',  name: 'QA Sam',                       description: 'QA-scoped access role',                                 group: null },
  { id: 'r8',  name: 'Test Admin Role 6-Jan-2026',   description: 'Temporary admin role created for a scheduled test',     group: null },
  { id: 'r9',  name: 'Acgr Role',                    description: 'Access-control governance role',                        group: null },
  { id: 'r10', name: 'Campaigns Admin',              description: 'Manages campaigns and related resources',              group: null },
]

const MODULES: CompanyModule[] = [
  { id: 'bulk-user-management',              name: 'Bulk User Management' },
  { id: 'campaign-management',               name: 'Campaign Management' },
  { id: 'knowledge-management',              name: 'Knowledge Management' },
  { id: 'global-change-request-audit-log',   name: 'Global Change Request & Audit log' },
  { id: 'proficiency-based-routing',         name: 'Proficiency based routing' },
  { id: 'centene-framework',                 name: 'Centene Framework' },
]

export interface CompanyDetail extends CompanySummary {
  liaisonUserId: string
  liaisonName: string
  instances: CompanyInstance[]
  users: CompanyUser[]
  roles: CompanyRole[]
  modules: CompanyModule[]
}

export function getCompanyDetail(id: string): CompanyDetail | undefined {
  const summary = getCompanySummary(id)
  if (!summary) return undefined

  return {
    ...summary,
    liaisonUserId: 'felicia-reid',
    liaisonName: 'Felicia Reid',
    instances: INSTANCES,
    users: USERS,
    roles: ROLES,
    modules: MODULES,
  }
}

/** Deterministic enablement so the same module/instance pair always renders the same status. */
export function getModuleEnablement(moduleId: string, instanceId: string): ModuleEnablement {
  const seed = (moduleId + instanceId).split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return seed % 2 === 0 ? 'verified' : 'not-enabled'
}
