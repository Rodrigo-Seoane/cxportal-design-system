'use client'

import { BuildingsIcon, UsersThreeIcon, ShieldCheckIcon, GearIcon } from '@phosphor-icons/react'
import { Tabs, TabList, Tab } from '@/components/ui/tabs'

export type CompanyTabValue = 'instances' | 'users' | 'roles' | 'modules'

const TABS: { value: CompanyTabValue; label: string; Icon: React.ComponentType<{ size: number; weight?: 'regular'; 'aria-hidden'?: boolean }> }[] = [
  { value: 'instances', label: 'Instances', Icon: BuildingsIcon },
  { value: 'users',     label: 'Users',     Icon: UsersThreeIcon },
  { value: 'roles',     label: 'Roles',     Icon: ShieldCheckIcon },
  { value: 'modules',   label: 'Modules',   Icon: GearIcon },
]

export function CompanyTabs({ value, onChange }: { value: CompanyTabValue; onChange: (v: CompanyTabValue) => void }) {
  return (
    <Tabs value={value} onChange={v => onChange(v as CompanyTabValue)} type="minimal">
      <TabList aria-label="Company detail sections">
        {TABS.map(({ value: v, label, Icon }) => (
          <Tab key={v} value={v} icon={<Icon size={14} weight="regular" aria-hidden />}>{label}</Tab>
        ))}
      </TabList>
    </Tabs>
  )
}
