'use client'

import { useMemo, useState } from 'react'
import { PlusIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabList, Tab } from '@/components/ui/tabs'
import { RoleFilters } from '@/components/access-management/RoleFilters'
import { RolesTable } from '@/components/access-management/RolesTable'
import { AddRoleModal } from '@/components/access-management/AddRoleModal'
import { DeleteRoleModal } from '@/components/access-management/DeleteRoleModal'
import { ROLE_SUMMARIES, PERMISSION_LEVELS, type RoleSummary, type PermissionLevel } from '@/mocks/access-management/roles'

const QUICK_FILTERS = ['All', ...PERMISSION_LEVELS] as const

export default function RolesIndexPage() {
  const [roles, setRoles] = useState<RoleSummary[]>(ROLE_SUMMARIES)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<string>('All')
  const [selectedLevels, setSelectedLevels] = useState<PermissionLevel[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<RoleSummary | null>(null)

  const handleQuickFilter = (value: string) => {
    setQuickFilter(value)
    setSelectedLevels(value === 'All' ? [] : [value as PermissionLevel])
  }

  const handleLevelsChange = (levels: PermissionLevel[]) => {
    setSelectedLevels(levels)
    setQuickFilter(levels.length === 1 ? levels[0] : 'All')
  }

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (search && !role.name.toLowerCase().includes(search.toLowerCase())) return false
      if (selectedLevels.length && !selectedLevels.includes(role.permissionLevel)) return false
      return true
    })
  }, [roles, search, selectedLevels])

  const handleCreateRole = (name: string, description: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setRoles(prev => [
      { id: id || `role-${prev.length + 1}`, name, permissionLevel: 'None', entities: 0, instances: 0, users: 0 },
      ...prev,
    ])
    setAddOpen(false)
    void description // captured for parity with the Figma form; not surfaced in the table yet
  }

  const handleConfirmDelete = () => {
    if (!roleToDelete) return
    setRoles(prev => prev.filter(r => r.id !== roleToDelete.id))
    setRoleToDelete(null)
  }

  return (
    <main style={{ display: 'flex', padding: '16px 16px 16px 0', gap: 0 }}>
      <RoleFilters selectedLevels={selectedLevels} onChange={handleLevelsChange} />

      <div style={{ flex: 1, minWidth: 0, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400, lineHeight: '30px', color: '#021920' }}>
            Roles ({filteredRoles.length})
          </h2>
          <Button variant="primary-central" size="xs" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} weight="bold" aria-hidden="true" />
            Add New Role
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>Search</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 39, padding: '0 8px', border: '1px solid #d9dce0', borderRadius: 8, background: '#ffffff', width: 214 }}>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search roles"
                aria-label="Search roles"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#021920', fontFamily: 'var(--font-sans)' }}
              />
              <MagnifyingGlassIcon size={16} color="#7a828c" weight="regular" aria-hidden="true" />
            </div>
          </div>

          <Tabs value={quickFilter} onChange={handleQuickFilter} type="minimal">
            <TabList aria-label="Filter roles by permission level" style={{ marginTop: 20 }}>
              {QUICK_FILTERS.map(f => (
                <Tab key={f} value={f}>{f}</Tab>
              ))}
            </TabList>
          </Tabs>
        </div>

        <RolesTable roles={filteredRoles} onDeleteRole={setRoleToDelete} />
      </div>

      <AddRoleModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={handleCreateRole} />
      <DeleteRoleModal
        open={roleToDelete !== null}
        roleName={roleToDelete?.name ?? null}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  )
}
