'use client'

import { createContext, useContext, useState } from 'react'

export type Role = 'admin' | 'supervisor' | 'agent'

export const ROLES: { id: Role; label: string }[] = [
  { id: 'admin',      label: 'Admin'      },
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'agent',      label: 'Agent'      },
]

interface RoleCtxValue {
  role:    Role
  setRole: (r: Role) => void
}

const RoleCtx = createContext<RoleCtxValue>({ role: 'admin', setRole: () => {} })

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('admin')
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>
}

export function useRole() { return useContext(RoleCtx) }

export function canEdit(role: Role)   { return role === 'admin' || role === 'supervisor' }
export function canDelete(role: Role) { return role === 'admin' }
