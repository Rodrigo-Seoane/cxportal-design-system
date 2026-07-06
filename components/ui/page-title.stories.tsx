import type { Meta, StoryObj } from '@storybook/react'
import { PageTitle } from './page-title'
import {
  PencilSimpleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  SignpostIcon,
} from '@phosphor-icons/react'

const meta: Meta<typeof PageTitle> = {
  title: 'UI/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Page-level header showing the resource title, optional subtitle, optional chip, and a composable right-side actions slot. Consumers pass buttons, search bars, tabs, or any layout into the actions prop.',
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

type Story = StoryObj<typeof PageTitle>

// ── Reusable action patterns ─────────────────────────────────────────────────

function GhostButton({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button style={{
      display:    'flex',
      alignItems: 'center',
      gap:        8,
      padding:    8,
      borderRadius: 8,
      border:     'none',
      background: 'transparent',
      cursor:     'pointer',
    }}>
      {icon}
      <span style={{
        fontSize:      12,
        fontWeight:    600,
        color:         '#3264b8',
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
      icon={<PencilSimpleIcon size={16} weight="thin" color="#3264b8" />}
      label="Edit List"
    />
    <GhostButton
      icon={<TrashIcon size={16} weight="thin" color="#3264b8" />}
      label="Delete List"
    />
  </>
)

const OneButtonAction = ({ label = 'Edit List' }: { label?: string }) => (
  <GhostButton
    icon={
      label === 'Delete List'
        ? <TrashIcon size={16} weight="thin" color="#3264b8" />
        : <PencilSimpleIcon size={16} weight="thin" color="#3264b8" />
    }
    label={label}
  />
)

const DfcHeaderActions = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    {/* Search input */}
    <div style={{
      display:      'flex',
      alignItems:   'center',
      justifyContent: 'space-between',
      width:        240,
      height:       24,
      padding:      8,
      border:       '1px solid #d9dce0',
      borderRadius: 4,
      background:   'white',
    }}>
      <span style={{ fontSize: 12, color: '#7a828c' }}>Search</span>
      <MagnifyingGlassIcon size={16} color="#7a828c" />
    </div>
    {/* Path Tester button */}
    <button style={{
      display:      'flex',
      alignItems:   'center',
      gap:          8,
      padding:      '4px 8px',
      border:       '1px solid #689df6',
      borderRadius: 4,
      background:   'white',
      cursor:       'pointer',
    }}>
      <SignpostIcon size={16} weight="thin" color="#3d5459" />
      <span style={{ fontSize: 10, color: '#3d5459' }}>Path Tester</span>
    </button>
    {/* Role tabs */}
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          4,
      padding:      4,
      borderRadius: 4,
      background:   '#eff1f3',
    }}>
      <span style={{
        padding:      '4px 12px',
        borderRadius: 4,
        background:   'white',
        border:       '1px solid #689df6',
        fontSize:     10,
        fontWeight:   600,
        color:        '#4285f4',
        letterSpacing:'0.4px',
      }}>
        Admin
      </span>
      <span style={{ padding: '4px 12px', fontSize: 10, fontWeight: 600, color: '#021920', letterSpacing: '0.4px' }}>
        Business User
      </span>
      <span style={{ padding: '4px 12px', fontSize: 10, fontWeight: 600, color: '#021920', letterSpacing: '0.4px' }}>
        Reader
      </span>
    </div>
  </div>
)

// ── Individual stories ──────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title:    'Northeast Quarter',
    subtitle: 'Master list for Northeast Quarter',
    actions:  <TwoButtonActions />,
  },
}

export const WithChip: Story = {
  args: {
    title:    'Northeast Quarter',
    subtitle: 'Master list for Northeast Quarter',
    showChip: true,
    chip:     'Current',
    actions:  <TwoButtonActions />,
  },
}

export const DfcHeader: Story = {
  args: {
    title:    'Northeast Quarter',
    subtitle: 'Master list for Northeast Quarter',
    actions:  <DfcHeaderActions />,
  },
}

export const TitleOnly: Story = {
  args: {
    title: 'Northeast Quarter',
  },
}

// ── All Variants (14 property combinations) ─────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize:      12,
      fontWeight:    600,
      letterSpacing: '0.48px',
      textTransform: 'uppercase',
      color:         '#000',
      margin:        '16px 0 0 0',
      padding:       '0 24px',
    }}>
      {children}
    </p>
  )
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#f8f8f8' }}>
      {/* ── Button Controls variants ─────────────────────────── */}

      <SectionLabel>Title + Subtitle + 2 Button Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        actions={<TwoButtonActions />}
      />

      <SectionLabel>Title + 2 Button Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        actions={<TwoButtonActions />}
      />

      <SectionLabel>Title + Subtitle + 1 Button Control</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        actions={<OneButtonAction label="Delete List" />}
      />

      <SectionLabel>Title + 1 Button Control</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        actions={<OneButtonAction />}
      />

      <SectionLabel>Title + Subtitle</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
      />

      <SectionLabel>Only Title</SectionLabel>
      <PageTitle title="Northeast Quarter" />

      {/* ── Chip variants ────────────────────────────────────── */}

      <SectionLabel>Title + Subtitle + Chip + 2 Button Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        showChip
        chip="Current"
        actions={<TwoButtonActions />}
      />

      <SectionLabel>Title + Chip + 2 Button Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        showChip
        chip="Current"
        actions={<TwoButtonActions />}
      />

      <SectionLabel>Title + Subtitle + Chip</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        showChip
        chip="Current"
      />

      <SectionLabel>Title + Chip</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        showChip
        chip="Current"
      />

      {/* ── DFC Header / User Roles Controls variants ────────── */}

      <SectionLabel>Title + Subtitle + User Roles Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        actions={<DfcHeaderActions />}
      />

      <SectionLabel>Title + User Roles Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        actions={<DfcHeaderActions />}
      />

      <SectionLabel>Title + Subtitle + Chip + User Roles Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        subtitle="Master list for Northeast Quarter"
        showChip
        chip="Current"
        actions={<DfcHeaderActions />}
      />

      <SectionLabel>Title + Chip + User Roles Controls</SectionLabel>
      <PageTitle
        title="Northeast Quarter"
        showChip
        chip="Current"
        actions={<DfcHeaderActions />}
      />
    </div>
  ),
}
