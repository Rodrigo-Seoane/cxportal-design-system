import { ROLE_SUMMARIES, getRoleDetail, type RoleDetail } from './roles'

export type LoginMethod = 'password' | 'sso'
export type LoginStatus = 'confirmed' | 'invite-expired' | 'not-configured' | 'active'

export interface UserSummary {
  id: string
  name: string
  email: string
  userId: string | null
  loginMethod: LoginMethod
  loginStatus: LoginStatus
  roleId: string
}

export const LOGIN_METHOD_LABEL: Record<LoginMethod, string> = {
  password: 'Password',
  sso:      'SSO',
}

export const LOGIN_STATUS_LABEL: Record<LoginStatus, string> = {
  confirmed:        'Confirmed',
  'invite-expired': 'Invite Expired',
  'not-configured': 'Not Configured',
  active:           'Active',
}

// ── Users index ──────────────────────────────────────────────────────────────
// Figma: node 3130-46022 (USER MANAGEMENT/Index, CxCentral) — Login Method and
// Login Status are two separate columns here (plain text + colored chip),
// there's no User ID column.

export const USER_SUMMARIES: UserSummary[] = [
  { id: 'felicia-reid',   name: 'Felicia Reid',   email: 'felicia.reid@pronetx.com',   userId: null, loginMethod: 'password', loginStatus: 'not-configured', roleId: 'nile-test' },
  { id: 'debbie-baker',   name: 'Debbie Baker',   email: 'debbie.baker@pronetx.com',   userId: null, loginMethod: 'password', loginStatus: 'not-configured', roleId: 'campaigns-user' },
  { id: 'willie-jennings',name: 'Willie Jennings',email: 'willie.jennings@pronetx.com',userId: null, loginMethod: 'password', loginStatus: 'confirmed',      roleId: 'acgr-role' },
  { id: 'kenzi-lawson',   name: 'Kenzi Lawson',   email: 'kenzi.lawson@pronetx.com',   userId: null, loginMethod: 'password', loginStatus: 'invite-expired', roleId: 'bulk-edit-readonly' },
  { id: 'michael-mitc',   name: 'Michael Mitc',   email: 'michael.mitc@pronetx.com',   userId: null, loginMethod: 'password', loginStatus: 'confirmed',      roleId: 'josh-admin-role' },
  { id: 'deanna-curtis',  name: 'Deanna Curtis',  email: 'deanna.curtis@pronetx.com',  userId: null, loginMethod: 'password', loginStatus: 'invite-expired', roleId: 'bulk-edit-readonly' },
  { id: 'nathan-roberts', name: 'Nathan Roberts', email: 'nathan.roberts@pronetx.com', userId: null, loginMethod: 'sso',      loginStatus: 'active',         roleId: 'rodrigo-test' },
  { id: 'bill-sanders',   name: 'Bill Sanders',   email: 'bill.sanders@pronetx.com',   userId: null, loginMethod: 'password', loginStatus: 'confirmed',      roleId: 'qa-josh' },
  { id: 'alma-lawson',    name: 'Alma Lawson',    email: 'alma.lawson@pronetx.com',    userId: null, loginMethod: 'password', loginStatus: 'confirmed',      roleId: 'qa-josh' },
  { id: 'tim-jennings',   name: 'Tim Jennings',   email: 'tim.jennings@pronetx.com',   userId: null, loginMethod: 'password', loginStatus: 'confirmed',      roleId: 'josh-test-role' },
  { id: 'debra-holt',     name: 'Debra Holt',     email: 'debra.holt@pronetx.com',     userId: null, loginMethod: 'password', loginStatus: 'confirmed',      roleId: 'qa-sam' },
  { id: 'jessica-hanson', name: 'Jessica Hanson', email: 'jessica.hanson@pronetx.com', userId: null, loginMethod: 'sso',      loginStatus: 'active',         roleId: 'danzig-test' },
]

export function getUserSummary(id: string): UserSummary | undefined {
  return USER_SUMMARIES.find(u => u.id === id)
}

export function getRoleNameForUser(user: UserSummary): string {
  return ROLE_SUMMARIES.find(r => r.id === user.roleId)?.name ?? user.roleId
}

// ── User detail ──────────────────────────────────────────────────────────────
// Figma: node 3745-81501 (USER MANAGEMENT/User Details) — reuses the exact
// same Instances + Module Permissions panel as the Role detail view.

export interface UserDetail extends UserSummary {
  roleName: string
  instances: RoleDetail['groups']
  ungrouped: string[]
  modules: RoleDetail['modules']
}

export function getUserDetail(id: string): UserDetail | undefined {
  const user = getUserSummary(id)
  if (!user) return undefined

  const roleDetail = getRoleDetail(user.roleId)

  return {
    ...user,
    roleName: getRoleNameForUser(user),
    instances: roleDetail?.groups ?? [],
    ungrouped: roleDetail?.ungrouped ?? [],
    modules: roleDetail?.modules ?? [],
  }
}
