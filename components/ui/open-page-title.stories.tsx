import type { Meta, StoryObj } from '@storybook/react'
import { OpenPageTitle } from './open-page-title'
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'

const meta: Meta<typeof OpenPageTitle> = {
  title: 'UI/OpenPageTitle',
  component: OpenPageTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Composed page header: Breadcrumb stacked above Page Title, matching Figma\'s "Open Page Title" frame. Thin wrapper over the standalone Breadcrumb and Page Title components -- no new visual logic.',
      },
    },
  },
  argTypes: {
    title:    { control: 'text' },
    subtitle: { control: 'text' },
    chip:     { control: 'text' },
    showChip: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof OpenPageTitle>

function GhostButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button style={{
      display:      'flex',
      alignItems:   'center',
      gap:           8,
      padding:       8,
      borderRadius:  8,
      border:       'none',
      background:   'transparent',
      cursor:       'pointer',
    }}>
      {icon}
      <span style={{
        fontSize:      12,
        fontWeight:    600,
        color:         'var(--content-action-primary-default)',
        letterSpacing: '0.24px',
        whiteSpace:    'nowrap',
      }}>
        {label}
      </span>
    </button>
  )
}

const TwoButtonActions = () => (
  <>
    <GhostButton
      icon={<PencilSimpleIcon size={16} weight="thin" color="var(--content-action-primary-default)" />}
      label="Edit List"
    />
    <GhostButton
      icon={<TrashIcon size={16} weight="thin" color="var(--content-action-primary-default)" />}
      label="Delete List"
    />
  </>
)

const BREADCRUMB_ITEMS = [
  { label: 'Social Security Admin', href: '/accounts/ssa' },
  { label: 'Benefit Status Updates' },
]

export const Default: Story = {
  args: {
    breadcrumbItems: BREADCRUMB_ITEMS,
    homeHref:        '/',
    title:           'Northeast Quarter',
    subtitle:        'Master list for Northeast Quarter',
    actions:         <TwoButtonActions />,
  },
}

export const WithChip: Story = {
  args: {
    breadcrumbItems: BREADCRUMB_ITEMS,
    homeHref:        '/',
    title:           'Northeast Quarter',
    subtitle:        'Master list for Northeast Quarter',
    showChip:        true,
    chip:            'Current',
    actions:         <TwoButtonActions />,
  },
}

export const DeepBreadcrumb: Story = {
  args: {
    breadcrumbItems: [
      { label: 'Social Security Admin', href: '/accounts/ssa' },
      { label: 'Benefit Status Updates', href: '/accounts/ssa/campaign-groups/benefit-status' },
      { label: 'Retirement Planning Reminders', href: '/accounts/ssa/campaign-groups/benefit-status/reminders' },
      { label: 'Send Schedule' },
    ],
    homeHref: '/',
    title:    'Send Schedule',
  },
}

export const TitleOnly: Story = {
  args: {
    breadcrumbItems: BREADCRUMB_ITEMS,
    homeHref:        '/',
    title:           'Northeast Quarter',
  },
}
