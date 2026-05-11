import type { Meta, StoryObj } from '@storybook/react'
import { PageTitle } from './page-title'
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'

const meta: Meta<typeof PageTitle> = {
  title: 'UI/PageTitle',
  component: PageTitle,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant:  { control: 'select', options: ['default', 'with-chip', 'with-kb-details'] },
    title:    { control: 'text' },
    subtitle: { control: 'text' },
    chip:     { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof PageTitle>

// ── Sample actions ────────────────────────────────────────────────────────────

const SampleActions = () => (
  <>
    <button style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: 8, borderRadius: 8, border: 'none',
      background: 'transparent', cursor: 'pointer',
    }}>
      <PencilSimpleIcon size={16} weight="thin" color="#3264b8" />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#3264b8', letterSpacing: '0.24px' }}>Edit List</span>
    </button>
    <button style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: 8, borderRadius: 8, border: 'none',
      background: 'transparent', cursor: 'pointer',
    }}>
      <TrashIcon size={16} weight="thin" color="#3264b8" />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#3264b8', letterSpacing: '0.24px' }}>Delete List</span>
    </button>
  </>
)

// ── Stories ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title:    'Northeast Quarter',
    subtitle: 'Master list for Northeast Quarter',
    variant:  'default',
    actions:  <SampleActions />,
  },
}

export const WithChip: Story = {
  args: {
    title:    'Northeast Quarter',
    subtitle: 'Master list for Northeast Quarter',
    variant:  'with-chip',
    chip:     'Current',
    actions:  <SampleActions />,
  },
}

export const WithKbDetails: Story = {
  args: {
    title:       'Northeast Quarter',
    subtitle:    'Master list for Northeast Quarter',
    variant:     'with-kb-details',
    chip:        'Current',
    association: 'Guide Delete My Account',
    version:     'v 1.7',
    dateCreated: '11/04/2025',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#f0f0f0' }}>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        variant="default"
        actions={<SampleActions />}
      />
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        variant="with-chip"
        chip="Current"
        actions={<SampleActions />}
      />
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        variant="with-kb-details"
        chip="Current"
        association="Guide Delete My Account"
        version="v 1.7"
        dateCreated="11/04/2025"
      />
    </div>
  ),
}
