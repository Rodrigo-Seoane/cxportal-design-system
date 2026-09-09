import type { Meta, StoryObj } from '@storybook/react'
import { PageTitle } from './page-title'
import {
  PencilSimpleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DownloadIcon,
  UploadIcon,
  MegaphoneSimpleIcon,
  SignpostIcon,
  CaretDownIcon,
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

const OneButtonAction = ({ label = 'Edit List' }: { label?: string }) => (
  <GhostButton
    icon={
      label === 'Delete List'
        ? <TrashIcon size={16} weight="thin" color="var(--content-action-primary-default)" />
        : <PencilSimpleIcon size={16} weight="thin" color="var(--content-action-primary-default)" />
    }
    label={label}
  />
)

// Matches Figma's "Title Controls" component, type="User Roles": a search
// field, four icon-only utility buttons (Download/Upload/Megaphone/Signpost),
// and a Role label + dropdown field -- not the fabricated "Path Tester" +
// segmented tabs this story previously showed, which had no Figma backing.
function IconOnlyButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button style={{
      display:      'flex',
      alignItems:   'center',
      height:       24,
      padding:      '4px 8px',
      border:       '1px solid var(--border-color-form-fields-default)',
      borderRadius: 4,
      background:   'var(--surface-action-secondary-default)',
      cursor:       'pointer',
    }}>
      {icon}
    </button>
  )
}

const DfcHeaderActions = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    {/* Search DFC */}
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-between',
      width:          227,
      height:         24,
      padding:        8,
      border:         '1px solid var(--border-color-form-fields-default)',
      borderRadius:   4,
      background:     'var(--surface-action-secondary-default)',
    }}>
      <span style={{ fontSize: 12, color: 'var(--text-form-field-placeholder)' }}>Search</span>
      <MagnifyingGlassIcon size={16} color="var(--text-form-field-placeholder)" />
    </div>

    {/* Utility icon buttons */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconOnlyButton icon={<DownloadIcon size={16} weight="regular" color="var(--neutral-800)" />} />
      <IconOnlyButton icon={<UploadIcon size={16} weight="regular" color="var(--neutral-800)" />} />
      <IconOnlyButton icon={<MegaphoneSimpleIcon size={16} weight="regular" color="var(--neutral-800)" />} />
      <IconOnlyButton icon={<SignpostIcon size={16} weight="regular" color="var(--neutral-800)" />} />
    </div>

    {/* Role field */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 150 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-form-field-focus)', whiteSpace: 'nowrap' }}>
        Role
      </span>
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        flex:           1,
        height:         24,
        padding:        8,
        border:         '1px solid var(--border-color-form-fields-default)',
        borderRadius:   4,
        background:     'var(--surface-action-secondary-default)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-form-field-placeholder)' }}>Admin</span>
        <CaretDownIcon size={16} color="var(--text-form-field-placeholder)" />
      </div>
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
      color:         'var(--text-body-primary)',
      margin:        '16px 0 0 0',
      padding:       '0 24px',
    }}>
      {children}
    </p>
  )
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--neutral-50)' }}>
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
