import type { Meta, StoryObj } from '@storybook/react'
import {
  SelectionAllIcon,
  BookOpenTextIcon,
  BrainIcon,
  HeadsetIcon,
  StackPlusIcon,
  FlowArrowIcon,
  FileCodeIcon,
  MegaphoneIcon,
  ListChecksIcon,
} from '@phosphor-icons/react'
import { NavMenuItem, NavSubItem, NavMenuItemCollapsed } from './nav-item'

// ── Background wrappers ───────────────────────────────────────────────────────

const NavBg = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#050326', display: 'inline-flex', flexDirection: 'column', borderRadius: 6 }}>
    {children}
  </div>
)

const LightBg = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#ffffff', display: 'inline-flex', flexDirection: 'column', borderRadius: 6, border: '1px solid #eff1f3' }}>
    {children}
  </div>
)

// ── NavMenuItem meta ──────────────────────────────────────────────────────────

const menuMeta: Meta<typeof NavMenuItem> = {
  title: 'UI/NavMenuItem',
  component: NavMenuItem,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  decorators: [(Story) => <NavBg><Story /></NavBg>],
  argTypes: {
    state:    { control: 'select', options: ['default', 'hover', 'active', 'disabled'] },
    label:    { control: 'text' },
    isOpen:   { control: 'boolean' },
    darkMode: { control: 'boolean' },
  },
}
export default menuMeta

type MenuStory = StoryObj<typeof NavMenuItem>

export const MenuDefault: MenuStory = {
  args: { label: 'Campaigns', icon: <MegaphoneIcon size={20} weight="thin" />, state: 'default' },
}

export const MenuHover: MenuStory = {
  args: { label: 'Campaigns', icon: <MegaphoneIcon size={20} weight="thin" />, state: 'hover' },
}

export const MenuActive: MenuStory = {
  args: { label: 'Campaigns', icon: <MegaphoneIcon size={20} weight="thin" />, state: 'active', isOpen: true },
}

export const MenuDisabled: MenuStory = {
  args: { label: 'Campaigns', icon: <MegaphoneIcon size={20} weight="thin" />, state: 'disabled' },
}

export const AllMenuStates: MenuStory = {
  render: () => (
    <NavBg>
      <NavMenuItem label="Centene Framework"  icon={<SelectionAllIcon size={20} weight="thin" />} state="default"  />
      <NavMenuItem label="Knowledge Management" icon={<BrainIcon       size={20} weight="thin" />} state="hover"   />
      <NavMenuItem label="Campaigns"          icon={<MegaphoneIcon    size={20} weight="thin" />} state="active"  isOpen />
      <NavMenuItem label="Change Management"  icon={<ListChecksIcon   size={20} weight="thin" />} state="disabled" />
    </NavBg>
  ),
  decorators: [],
}

// ── NavSubItem states ─────────────────────────────────────────────────────────

export const SubDefault: StoryObj = {
  render: () => (
    <NavBg>
      <NavSubItem label="Queue Availability" state="default" />
    </NavBg>
  ),
  decorators: [],
}

export const SubHover: StoryObj = {
  render: () => (
    <NavBg>
      <NavSubItem label="Queue Availability" state="hover" />
    </NavBg>
  ),
  decorators: [],
}

export const SubActive: StoryObj = {
  render: () => (
    <NavBg>
      <NavSubItem label="Queue Availability" state="active" />
    </NavBg>
  ),
  decorators: [],
}

export const SubDisabled: StoryObj = {
  render: () => (
    <NavBg>
      <NavSubItem label="Queue Availability" state="disabled" />
    </NavBg>
  ),
  decorators: [],
}

export const AllSubStates: StoryObj = {
  render: () => (
    <NavBg>
      <NavSubItem label="Queue Availability"  state="default"  />
      <NavSubItem label="Transfer Points"     state="hover"    />
      <NavSubItem label="Prompts"             state="active"   />
      <NavSubItem label="Change Requests"     state="disabled" />
    </NavBg>
  ),
  decorators: [],
}

export const FullGroupExample: StoryObj = {
  render: () => (
    <NavBg>
      <NavMenuItem label="Knowledge Management" icon={<BrainIcon size={20} weight="thin" />} state="active" isOpen />
      <NavSubItem label="Knowledge Bases"    state="active"  />
      <NavSubItem label="Add New Document"   state="default" />
      <NavSubItem label="Folders"            state="default" />
      <NavSubItem label="Tags"               state="default" />
    </NavBg>
  ),
  decorators: [],
  parameters: { layout: 'centered' },
}

// ── Light mode (CxCentral) ────────────────────────────────────────────────────

export const LightModeDefault: StoryObj = {
  render: () => (
    <LightBg>
      <NavMenuItem label="Q in Connect"       icon={<BookOpenTextIcon size={20} weight="thin" />} state="default"  darkMode={false} />
      <NavMenuItem label="Knowledge Management" icon={<BrainIcon       size={20} weight="thin" />} state="hover"    darkMode={false} />
      <NavMenuItem label="Campaigns"          icon={<MegaphoneIcon    size={20} weight="thin" />} state="active"   darkMode={false} isOpen />
      <NavMenuItem label="Change Management"  icon={<ListChecksIcon   size={20} weight="thin" />} state="disabled" darkMode={false} />
    </LightBg>
  ),
  decorators: [],
  parameters: { layout: 'centered', backgrounds: { default: 'light' } },
}

export const LightModeGroup: StoryObj = {
  render: () => (
    <LightBg>
      <NavMenuItem label="Knowledge Management" icon={<BrainIcon size={20} weight="thin" />} state="active" isOpen darkMode={false} />
      <NavSubItem label="Knowledge Bases"    state="active"  darkMode={false} />
      <NavSubItem label="Add New Document"   state="default" darkMode={false} />
      <NavSubItem label="Folders"            state="hover"   darkMode={false} />
      <NavSubItem label="Tags"               state="disabled" darkMode={false} />
    </LightBg>
  ),
  decorators: [],
  parameters: { layout: 'centered', backgrounds: { default: 'light' } },
}

// ── Collapsed states (NavMenuItemCollapsed) ───────────────────────────────────

export const CollapsedStates: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      {/* Dark */}
      <NavBg>
        <NavMenuItemCollapsed icon={<SelectionAllIcon size={20} weight="thin" />} state="default"  />
        <NavMenuItemCollapsed icon={<BrainIcon        size={20} weight="thin" />} state="hover"    />
        <NavMenuItemCollapsed icon={<MegaphoneIcon    size={20} weight="thin" />} state="active"   />
        <NavMenuItemCollapsed icon={<ListChecksIcon   size={20} weight="thin" />} state="disabled" />
      </NavBg>
      {/* Light */}
      <LightBg>
        <NavMenuItemCollapsed icon={<SelectionAllIcon size={20} weight="thin" />} state="default"  darkMode={false} />
        <NavMenuItemCollapsed icon={<BrainIcon        size={20} weight="thin" />} state="hover"    darkMode={false} />
        <NavMenuItemCollapsed icon={<MegaphoneIcon    size={20} weight="thin" />} state="active"   darkMode={false} />
        <NavMenuItemCollapsed icon={<ListChecksIcon   size={20} weight="thin" />} state="disabled" darkMode={false} />
      </LightBg>
    </div>
  ),
  decorators: [],
  parameters: { layout: 'centered' },
}

// ── All modules (from Figma 203:14455) ────────────────────────────────────────

export const AllModules: StoryObj = {
  render: () => (
    <NavBg>
      <NavMenuItem label="Centene Framework"   icon={<SelectionAllIcon size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Q in Connect"        icon={<BookOpenTextIcon size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Knowledge Management" icon={<BrainIcon       size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Proficiency Routing" icon={<HeadsetIcon      size={20} weight="thin" />} state="default" />
      <NavMenuItem label="ACGR"                icon={<StackPlusIcon    size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Bulk Edit"           icon={<FlowArrowIcon    size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Insights"            icon={<FlowArrowIcon    size={20} weight="thin" />} state="default" />
      <NavMenuItem label="DFC"                 icon={<FileCodeIcon     size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Campaigns"           icon={<MegaphoneIcon    size={20} weight="thin" />} state="default" />
      <NavMenuItem label="Change Management"   icon={<ListChecksIcon   size={20} weight="thin" />} state="default" />
    </NavBg>
  ),
  decorators: [],
  parameters: { layout: 'centered' },
}
