'use client'

import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface UIStore {
  activeAccountId:    string
  setActiveAccountId: (id: string) => void
}

const UIStoreCtx = createContext<UIStore>({
  activeAccountId:    'ssa-rsc',
  setActiveAccountId: () => {},
})

export function UIStoreProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [activeAccountId, setActiveAccountId] = useState('ssa-rsc')
  return React.createElement(
    UIStoreCtx.Provider,
    { value: { activeAccountId, setActiveAccountId } },
    children
  )
}

export function useUIStore(): UIStore {
  return useContext(UIStoreCtx)
}
