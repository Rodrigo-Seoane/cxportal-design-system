'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import {
  HouseIcon, CaretRightIcon, CaretLeftIcon, EnvelopeSimpleIcon,
  UserSquareIcon, UserFocusIcon, KeyIcon, EyeSlashIcon, TrashIcon,
} from '@phosphor-icons/react'
import { InstancePanel } from '@/components/access-management/InstancePanel'
import { ModulePermissionsPanel } from '@/components/access-management/ModulePermissionsPanel'
import { UnsavedChangesModal } from '@/components/access-management/UnsavedChangesModal'
import { EditProfileModal } from '@/components/access-management/EditProfileModal'
import { ChangeRoleModal } from '@/components/access-management/ChangeRoleModal'
import { ConfirmActionModal } from '@/components/access-management/ConfirmActionModal'
import { USER_SUMMARIES, getUserDetail } from '@/mocks/access-management/users'
import type { PermissionModule } from '@/mocks/access-management/roles'

const PROFILE_CONTROLS = [
  { key: 'edit',       label: 'Edit Profile',    Icon: UserSquareIcon, destructive: false },
  { key: 'role',       label: 'Change Role',     Icon: UserFocusIcon,  destructive: false },
  { key: 'password',   label: 'Reset Password',  Icon: KeyIcon,        destructive: false },
  { key: 'deactivate', label: 'Deactivate User', Icon: EyeSlashIcon,   destructive: false },
  { key: 'delete',     label: 'Delete User',     Icon: TrashIcon,      destructive: true },
] as const

export default function UserDetailPage() {
  const params = useParams<{ userId: string }>()
  const router = useRouter()
  const user = getUserDetail(params.userId)

  const [fullName, setFullName] = useState(user?.name ?? '')
  const [roleName, setRoleName] = useState(user?.roleName ?? '')
  const [savedModules, setSavedModules] = useState<PermissionModule[]>(user?.modules ?? [])
  const [modules, setModules] = useState<PermissionModule[]>(user?.modules ?? [])
  const [dirty, setDirty] = useState(false)
  const [activeInstance, setActiveInstance] = useState(user?.instances[0]?.instances[0] ?? user?.ungrouped[0] ?? '')
  const [pendingInstance, setPendingInstance] = useState<string | null>(null)
  const [modal, setModal] = useState<null | 'edit' | 'role' | 'password' | 'deactivate' | 'delete'>(null)

  useEffect(() => {
    const next = getUserDetail(params.userId)
    if (!next) return
    setFullName(next.name)
    setRoleName(next.roleName)
    setSavedModules(next.modules)
    setModules(next.modules)
    setDirty(false)
    setActiveInstance(next.instances[0]?.instances[0] ?? next.ungrouped[0] ?? '')
    setPendingInstance(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.userId])

  if (!user) notFound()

  const index = USER_SUMMARIES.findIndex(u => u.id === user.id)
  const prevUser = index > 0 ? USER_SUMMARIES[index - 1] : null
  const nextUser = index < USER_SUMMARIES.length - 1 ? USER_SUMMARIES[index + 1] : null

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
    if (dirty) setPendingInstance(name)
    else applyInstanceSwitch(name)
  }

  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <main style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => router.push('/access-management/users')} aria-label="Home" style={{ display: 'flex', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          <HouseIcon size={14} color="#7a828c" weight="regular" />
        </button>
        <CaretRightIcon size={12} color="#aab0b8" weight="regular" aria-hidden="true" />
        <button onClick={() => router.push('/access-management/users')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: 12, color: '#7a828c' }}>
          Users
        </button>
        <CaretRightIcon size={12} color="#aab0b8" weight="regular" aria-hidden="true" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#021920' }}>{fullName}</span>
      </nav>

      {/* ── User header ───────────────────────────────────────────────────── */}
      <div style={{ padding: 24, background: '#ffffff', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0b8286', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#eff1f3', flexShrink: 0 }}>
              {initials}
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 400, lineHeight: '30px', color: '#021920' }}>{fullName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, borderLeft: '1px solid #d9dce0', fontSize: 10, color: '#7a828c' }}>
              <EnvelopeSimpleIcon size={16} color="#021920" weight="regular" aria-hidden="true" />
              <span style={{ fontWeight: 600, color: '#021920' }}>Email:</span> {user.email}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              disabled={!prevUser}
              onClick={() => prevUser && router.push(`/access-management/users/${prevUser.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: prevUser ? 'pointer' : 'not-allowed', padding: 0, fontSize: 10, fontWeight: 600, color: prevUser ? '#0b8286' : '#aab0b8' }}
            >
              <CaretLeftIcon size={16} weight="thin" aria-hidden="true" />
              Prev
            </button>
            <span style={{ fontSize: 12 }}>
              <strong style={{ color: '#021920' }}>{index + 1}</strong> <span style={{ color: '#7a828c' }}>of {USER_SUMMARIES.length}</span>
            </span>
            <button
              disabled={!nextUser}
              onClick={() => nextUser && router.push(`/access-management/users/${nextUser.id}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: nextUser ? 'pointer' : 'not-allowed', padding: 0, fontSize: 10, fontWeight: 600, color: nextUser ? '#0b8286' : '#aab0b8' }}
            >
              Next
              <CaretRightIcon size={16} weight="thin" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#021920' }}>
            Profile Controls
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PROFILE_CONTROLS.map(({ key, label, Icon, destructive }) => (
              <button
                key={key}
                onClick={() => setModal(key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none',
                  cursor: 'pointer', padding: 0, fontSize: 10, fontWeight: 600,
                  color: destructive ? '#ef2056' : '#0b8286',
                }}
              >
                <Icon size={16} weight="thin" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Instances + Module Permissions ───────────────────────────────── */}
      <div style={{ display: 'flex', background: '#ffffff', borderRadius: 8 }}>
        <InstancePanel
          groups={user.instances}
          ungrouped={user.ungrouped}
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

      <EditProfileModal
        open={modal === 'edit'}
        email={user.email}
        fullName={fullName}
        onClose={() => setModal(null)}
        onSave={name => { setFullName(name || user.name); setModal(null) }}
      />

      <ChangeRoleModal
        open={modal === 'role'}
        email={user.email}
        currentRoleName={roleName}
        onClose={() => setModal(null)}
        onSave={() => setModal(null)}
      />

      <ConfirmActionModal
        open={modal === 'password'}
        title="Reset Password"
        message={`Send a password reset link to ${user.email}?`}
        confirmLabel="Send Reset Link"
        onClose={() => setModal(null)}
        onConfirm={() => setModal(null)}
      />

      <ConfirmActionModal
        open={modal === 'deactivate'}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${fullName}? They will no longer be able to log in until reactivated.`}
        confirmLabel="Deactivate User"
        destructive
        onClose={() => setModal(null)}
        onConfirm={() => setModal(null)}
      />

      <ConfirmActionModal
        open={modal === 'delete'}
        title="Delete User"
        message={`Are you sure you want to delete ${fullName}? This cannot be undone.`}
        confirmLabel="Delete User"
        destructive
        onClose={() => setModal(null)}
        onConfirm={() => router.push('/access-management/users')}
      />
    </main>
  )
}
