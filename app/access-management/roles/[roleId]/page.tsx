'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { InfoIcon } from '@phosphor-icons/react'
import { Breadcrumb } from '@/components/ui/breadcrumbs'
import { Chip } from '@/components/ui/chip'
import { InstancePanel } from '@/components/access-management/InstancePanel'
import { ModulePermissionsPanel } from '@/components/access-management/ModulePermissionsPanel'
import { UnsavedChangesModal } from '@/components/access-management/UnsavedChangesModal'
import { getRoleDetail, type PermissionModule } from '@/mocks/access-management/roles'

export default function RoleDetailPage() {
  const params = useParams<{ roleId: string }>()
  const role = getRoleDetail(params.roleId)

  // `savedModules` is the last-saved baseline for this session (all instances
  // share it in this mock — there's no per-instance permission data to load).
  // Hooks run unconditionally (before the not-found check) so a client-side
  // navigation to an invalid roleId can't change the hook call order.
  const [savedModules, setSavedModules] = useState<PermissionModule[]>(role?.modules ?? [])
  const [modules, setModules] = useState<PermissionModule[]>(role?.modules ?? [])
  const [dirty, setDirty] = useState(false)
  const [activeInstance, setActiveInstance] = useState(role?.groups[0]?.instances[0] ?? role?.ungrouped[0] ?? '')
  const [pendingInstance, setPendingInstance] = useState<string | null>(null)

  // Re-seed local state whenever the route lands on a different role — the
  // page component instance is reused across client-side navigations, so
  // useState's initial value alone won't reset it.
  useEffect(() => {
    const next = getRoleDetail(params.roleId)
    if (!next) return
    setSavedModules(next.modules)
    setModules(next.modules)
    setDirty(false)
    setActiveInstance(next.groups[0]?.instances[0] ?? next.ungrouped[0] ?? '')
    setPendingInstance(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.roleId])

  if (!role) notFound()

  const handleChangeModuleOption = (moduleId: string, option: string) => {
    setModules(prev => prev.map(m => (m.id === moduleId ? { ...m, selected: option } : m)))
    setDirty(true)
  }

  const applyInstanceSwitch = (name: string) => {
    setActiveInstance(name)
    setModules(savedModules)
    setDirty(false)
    setPendingInstance(null)
  }

  const handleSelectInstance = (name: string) => {
    if (name === activeInstance) return
    if (dirty) {
      setPendingInstance(name)
    } else {
      applyInstanceSwitch(name)
    }
  }

  return (
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <Breadcrumb
        homeHref="/"
        items={[
          { label: 'Roles', href: '/access-management/roles' },
          { label: role.name },
        ]}
      />

      {/* ── Role header ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24,
        background: 'var(--surface-main-content)', border: '1px solid var(--border-color-main-content-external)',
        borderRadius: 8, flexWrap: 'wrap', gap: 16,
      }}>
        {/* h2, not h1 -- PageTitle in this route's layout owns the page's <h1> */}
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 400, lineHeight: '34px', color: 'var(--text-body-primary)' }}>{role.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>Permission Level:</span>
            <Chip label={role.permissionLevel} type="info" shade={200} iconLeft={false} iconRight={false} style={{ background: 'var(--neutral-200)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.24px', color: 'var(--text-body-primary)' }}>Number of Active Users:</span>
            <InfoIcon size={12} color="var(--text-body-secondary)" weight="regular" aria-hidden="true" />
            <span style={{ fontSize: 18, lineHeight: '28px', color: 'var(--text-body-primary)' }}>{role.activeUsers.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ── Instances + Module Permissions ───────────────────────────────── */}
      <div style={{
        display: 'flex', background: 'var(--surface-main-content)',
        border: '1px solid var(--border-color-main-content-external)', borderRadius: 8,
      }}>
        <InstancePanel
          groups={role.groups}
          ungrouped={role.ungrouped}
          activeInstance={activeInstance}
          onSelectInstance={handleSelectInstance}
        />
        <ModulePermissionsPanel
          activeInstance={activeInstance}
          modules={modules}
          hasChanges={dirty}
          onChangeModuleOption={handleChangeModuleOption}
          onDiscard={() => { setModules(savedModules); setDirty(false) }}
          onSave={() => { setSavedModules(modules); setDirty(false) }}
        />
      </div>

      <UnsavedChangesModal
        open={pendingInstance !== null}
        targetInstance={pendingInstance}
        onClose={() => setPendingInstance(null)}
        onDismissChanges={() => pendingInstance && applyInstanceSwitch(pendingInstance)}
        onSaveChanges={() => {
          setSavedModules(modules)
          if (pendingInstance) applyInstanceSwitch(pendingInstance)
        }}
      />
    </main>
  )
}
