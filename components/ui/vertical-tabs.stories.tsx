import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { VerticalTab, VerticalTabGroup } from './vertical-tabs'
import { Shield, Bell, User, Lock, CreditCard } from '@phosphor-icons/react'

const meta: Meta = {
  title: 'UI/VerticalTabs',
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 200 }}><Story /></div>],
}
export default meta

type Story = StoryObj

const TABS = [
  { label: 'Account', icon: <User size={16} /> },
  { label: 'Security', icon: <Shield size={16} /> },
  { label: 'Notifications', icon: <Bell size={16} /> },
  { label: 'Privacy', icon: <Lock size={16} /> },
  { label: 'Billing', icon: <CreditCard size={16} /> },
]

export const Default: Story = {
  render: () => {
    const [active, setActive] = useState('Account')
    return (
      <VerticalTabGroup>
        {TABS.map(({ label, icon }) => (
          <VerticalTab
            key={label}
            label={label}
            icon={icon}
            active={active === label}
            onClick={() => setActive(label)}
          />
        ))}
      </VerticalTabGroup>
    )
  },
}

export const WithDisabled: Story = {
  render: () => (
    <VerticalTabGroup>
      <VerticalTab label="Account" icon={<User size={16} />} active />
      <VerticalTab label="Security" icon={<Shield size={16} />} />
      <VerticalTab label="Billing" icon={<CreditCard size={16} />} disabled />
    </VerticalTabGroup>
  ),
}

export const WithoutIcons: Story = {
  render: () => {
    const [active, setActive] = useState('General')
    const labels = ['General', 'Appearance', 'Keyboard', 'Advanced']
    return (
      <VerticalTabGroup>
        {labels.map((label) => (
          <VerticalTab
            key={label}
            label={label}
            active={active === label}
            onClick={() => setActive(label)}
          />
        ))}
      </VerticalTabGroup>
    )
  },
}
