export type PermissionLevel = 'Admin' | 'Creator' | 'Editor' | 'Viewer' | 'None'

export interface RoleSummary {
  id: string
  name: string
  permissionLevel: PermissionLevel
  entities: number
  instances: number
  users: number
}

export interface InstanceGroup {
  name: string
  instances: string[]
}

export interface PermissionModule {
  id: string
  name: string
  description: string
  /** Grid layout renders options in a 3-column grid instead of a single row. */
  layout?: 'row' | 'grid'
  options: string[]
  selected: string
  infoAlert?: { message: string; linkLabel: string }
}

export interface RoleDetail {
  id: string
  name: string
  permissionLevel: PermissionLevel
  activeUsers: number
  groups: InstanceGroup[]
  ungrouped: string[]
  modules: PermissionModule[]
}

// ── Roles index ────────────────────────────────────────────────────────────────
// Figma: node 3745-79426 (ROLE MANAGEMENT/Index)

export const ROLE_SUMMARIES: RoleSummary[] = [
  { id: 'acgr-role',                    name: 'Acgr Role',                    permissionLevel: 'Admin',  entities: 536, instances: 10, users: 267400 },
  { id: 'bulk-edit-readonly',           name: 'Bulk Edit Readonly',           permissionLevel: 'Viewer', entities: 426, instances: 19, users: 487441 },
  { id: 'campaigns-admin',              name: 'Campaigns Admin',              permissionLevel: 'Admin',  entities: 196, instances: 7,  users: 558612 },
  { id: 'campaigns-user',               name: 'Campaigns User',               permissionLevel: 'Editor', entities: 540, instances: 11, users: 653518 },
  { id: 'danzig-test',                  name: 'Danzig Test',                  permissionLevel: 'Creator', entities: 561, instances: 15, users: 651535 },
  { id: 'josh-admin-role',              name: 'Josh Admin Role',              permissionLevel: 'Admin',  entities: 423, instances: 17, users: 449003 },
  { id: 'josh-test-role',               name: 'Josh Test Role',               permissionLevel: 'Editor', entities: 536, instances: 10, users: 267400 },
  { id: 'knowledge-management-reader',  name: 'Knowledge Management Reader',  permissionLevel: 'Viewer', entities: 426, instances: 19, users: 487441 },
  { id: 'mpho-centene-test',            name: 'Mpho Centene Test',            permissionLevel: 'Creator', entities: 196, instances: 7,  users: 558612 },
  { id: 'mpho-test',                    name: 'Mpho Test',                    permissionLevel: 'Editor', entities: 540, instances: 11, users: 653518 },
  { id: 'nile-test',                    name: 'Nile test',                    permissionLevel: 'Viewer', entities: 561, instances: 15, users: 651535 },
  { id: 'qa-access-management-admin',   name: 'QA Access Management Admin',   permissionLevel: 'Admin',  entities: 423, instances: 17, users: 449003 },
  { id: 'qa-access-management-none',    name: 'QA Access Management None',    permissionLevel: 'None',   entities: 536, instances: 10, users: 267400 },
  { id: 'qa-access-management-reader',  name: 'QA Access Management Reader',  permissionLevel: 'Viewer', entities: 426, instances: 19, users: 487441 },
  { id: 'qa-josh',                      name: 'QA Josh',                      permissionLevel: 'Creator', entities: 196, instances: 7,  users: 558612 },
  { id: 'qa-sam',                       name: 'QA Sam',                       permissionLevel: 'Editor', entities: 540, instances: 11, users: 653518 },
  { id: 'rebeccas-test-role',           name: "Rebecca's test role",          permissionLevel: 'Creator', entities: 561, instances: 15, users: 651535 },
  { id: 'rodrigo-test',                 name: 'Rodrigo Test',                 permissionLevel: 'Admin',  entities: 423, instances: 17, users: 449003 },
]

export const PERMISSION_LEVELS: PermissionLevel[] = ['Admin', 'Creator', 'Editor', 'Viewer', 'None']

// ── Role detail ──────────────────────────────────────────────────────────────────
// Figma: node 3745-79920 (ROLE MANAGEMENT/Role - Detailed View)
// Instance groups and module permissions are shared demo data across roles —
// only name / permission level / active users vary per role.

const INSTANCE_GROUPS: InstanceGroup[] = [
  { name: 'Group Name 1', instances: ['adherencesim-east', 'adherencesim01', 'customer-build-centene'] },
  { name: 'Group Name 2', instances: ['dev johntest', 'master', 'qa client'] },
]

const UNGROUPED_INSTANCES = ['qa client east1', 'qa-cft-testing', 'qa-cft-testing-east']

const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'bulk-user-management',
    name: 'Bulk User Management',
    description: 'Allows bulk changes for agents',
    options: ['Bulk User Management Admin', 'Bulk User Management Reader', 'None'],
    selected: 'Bulk User Management Reader',
  },
  {
    id: 'campaign-management',
    name: 'Campaign Management',
    description: 'Manage campaigns and related resources',
    options: ['User', 'Admin', 'None'],
    selected: 'Admin',
  },
  {
    id: 'knowledge-management',
    name: 'Knowledge Management',
    description: 'Manage knowledge bases, entities, and apps with Amazon Q in Connect',
    options: ['Reader', 'Admin', 'None'],
    selected: 'None',
  },
  {
    id: 'global-change-request-audit-log',
    name: 'Global Change Request & Audit log',
    description: 'Track and manage global change requests and audit logs',
    options: ['Admin', 'None'],
    selected: 'Admin',
  },
  {
    id: 'proficiency-based-routing',
    name: 'Proficiency based routing',
    description: 'Manage predefined attributes, values, agent routing models',
    options: ['Reader', 'Admin', 'Business User', 'None'],
    selected: 'Business User',
    infoAlert: {
      message: 'Dynamic Flow Configurator permissions are managed in the module. To change this role’s access, open it in Dynamic Flow Configurator Permissions.',
      linkLabel: 'Manage in Dynamic Flow Configurator Permissions',
    },
  },
  {
    id: 'centene-framework',
    name: 'Centene Framework',
    description: 'Manage and access modules in the Contone Framework',
    layout: 'grid',
    options: [
      'Contone Admin', 'Contone Business User', 'Contone Business Limited',
      'Contone Prompts', 'Contone Manager', 'Contone Read Only',
      'Contone Dashboard Viewer', 'Contone Bulk Editor', 'None',
    ],
    selected: 'Contone Manager',
  },
]

export function getRoleSummary(id: string): RoleSummary | undefined {
  return ROLE_SUMMARIES.find(r => r.id === id)
}

export function getRoleDetail(id: string): RoleDetail | undefined {
  const summary = getRoleSummary(id)
  if (!summary) return undefined

  return {
    id: summary.id,
    name: summary.name,
    permissionLevel: summary.permissionLevel,
    activeUsers: summary.users,
    groups: INSTANCE_GROUPS,
    ungrouped: UNGROUPED_INSTANCES,
    modules: PERMISSION_MODULES.map(m => ({ ...m })),
  }
}
