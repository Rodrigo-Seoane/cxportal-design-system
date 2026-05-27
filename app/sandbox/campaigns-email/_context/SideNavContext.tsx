'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface SideNavCtxValue {
  hideSideNav:    boolean
  setHideSideNav: (v: boolean) => void
}

const SideNavCtx = createContext<SideNavCtxValue>({
  hideSideNav:    false,
  setHideSideNav: () => {},
})

export function SideNavProvider({ children }: { children: ReactNode }) {
  const [hideSideNav, setHideSideNav] = useState(false)
  return <SideNavCtx.Provider value={{ hideSideNav, setHideSideNav }}>{children}</SideNavCtx.Provider>
}

export function useSideNav() { return useContext(SideNavCtx) }
