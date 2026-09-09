import type { Meta, StoryObj } from '@storybook/react'
import {
  NTMenuHomeItem,
  NTMenuModuleItem,
  NTMenuSubItem,
  NTMenuGroup,
  NTMenuItemCollapsed,
} from './nt-menu'

const LightBg = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--surface-section-group-bg)', padding: 16, display: 'inline-flex', flexDirection: 'column', gap: 8, borderRadius: 8 }}>
    {children}
  </div>
)

const meta: Meta<typeof NTMenuModuleItem> = {
  title: 'UI/NTMenu',
  component: NTMenuModuleItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The in-progress redesign of the left/vertical nav — light theme, rounded pill rows, drop shadows, tree connector lines. Not yet wired in as the live sidebar; buildable and testable here ahead of that swap.',
      },
    },
  },
  decorators: [(Story) => <LightBg><Story /></LightBg>],
}
export default meta

type Story = StoryObj<typeof NTMenuModuleItem>

export const HomeStates: Story = {
  render: () => (
    <LightBg>
      <NTMenuHomeItem state="default" />
      <NTMenuHomeItem state="hover" />
      <NTMenuHomeItem state="active" />
    </LightBg>
  ),
  decorators: [],
}

export const HomeBreadcrumb: Story = {
  render: () => (
    <LightBg>
      <NTMenuHomeItem ancestor="Admin" />
    </LightBg>
  ),
  decorators: [],
}

export const ModuleStates: Story = {
  render: () => (
    <LightBg>
      <NTMenuModuleItem label="Module Name" state="default" />
      <NTMenuModuleItem label="Module Name" state="hover" />
      <NTMenuModuleItem label="Module Name" state="active" isOpen />
    </LightBg>
  ),
  decorators: [],
}

export const SubItemStates: Story = {
  render: () => (
    <LightBg>
      <NTMenuSubItem label="Module Sub Item" state="default" />
      <NTMenuSubItem label="Module Sub Item" state="hover" />
      <NTMenuSubItem label="Module Sub Item" state="active" />
    </LightBg>
  ),
  decorators: [],
}

export const GroupCollapsed: Story = {
  render: () => (
    <LightBg>
      <NTMenuGroup label="Module Name" />
    </LightBg>
  ),
  decorators: [],
}

export const GroupWithSubItems: Story = {
  render: () => (
    <LightBg>
      <NTMenuGroup label="Module Name" open>
        <NTMenuSubItem label="Module Sub Item" state="active" />
        <NTMenuSubItem label="Module Sub Item" />
        <NTMenuSubItem label="Module Sub Item" />
      </NTMenuGroup>
    </LightBg>
  ),
  decorators: [],
}

export const CollapsedStates: Story = {
  render: () => (
    <LightBg>
      <div style={{ display: 'flex', gap: 8 }}>
        <NTMenuItemCollapsed state="default" />
        <NTMenuItemCollapsed state="hover" />
        <NTMenuItemCollapsed state="active" />
      </div>
    </LightBg>
  ),
  decorators: [],
}

export const FullExample: Story = {
  render: () => (
    <LightBg>
      <NTMenuHomeItem state="active" />
      <NTMenuGroup label="Global Permissions" open>
        <NTMenuSubItem label="Roles" state="active" />
        <NTMenuSubItem label="Users" />
        <NTMenuSubItem label="Companies" />
      </NTMenuGroup>
      <NTMenuModuleItem label="Campaigns" />
      <NTMenuModuleItem label="Knowledge Management" />
    </LightBg>
  ),
  decorators: [],
}
