// LOAD-BEARING — refactors require explicit approval
'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Role = 'super-admin' | 'account-admin' | 'editor' | 'viewer'

export const ROLES: { id: Role; label: string }[] = [
  { id: 'super-admin',   label: 'Super Admin'   },
  { id: 'account-admin', label: 'Account Admin' },
  { id: 'editor',        label: 'Editor'        },
  { id: 'viewer',        label: 'Viewer'        },
]

interface RoleCtxValue {
  role:    Role
  setRole: (r: Role) => void
}

const RoleCtx = createContext<RoleCtxValue>({ role: 'super-admin', setRole: () => {} })

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('super-admin')
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>
}

export function useRole() { return useContext(RoleCtx) }

export function canEdit(role: Role): boolean {
  return role === 'super-admin' || role === 'account-admin' || role === 'editor'
}

export function canDelete(role: Role): boolean {
  return role === 'super-admin' || role === 'account-admin'
}
