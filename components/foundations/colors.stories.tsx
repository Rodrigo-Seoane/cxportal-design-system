import type { Meta, StoryObj } from '@storybook/react'
import { TokenSwatch } from '@/components/ds/TokenSwatch'

// ── Token data (mirrors app/foundations/colors/page.tsx) ─────────────────────

type Swatch   = { name: string; hex: string; cssVar: string }
type SubGroup = { caption: string; swatches: Swatch[] }
type Section  = { title: string; description: string; groups: SubGroup[] }

const sections: Section[] = [
  {
    title: 'Text Tokens',
    description: 'Text colors for body copy, actions, and semantic states.',
    groups: [
      {
        caption: 'Text / Body',
        swatches: [
          { name: 'Primary',         hex: '#021920', cssVar: '--color-text-body-primary' },
          { name: 'Secondary',       hex: '#7a828c', cssVar: '--color-text-body-secondary' },
          { name: 'On Dark Surface', hex: '#eff1f3', cssVar: '--color-text-body-on-dark' },
        ],
      },
      {
        caption: 'Text / States',
        swatches: [
          { name: 'Action',  hex: '#4285f4', cssVar: '--color-text-action' },
          { name: 'Success', hex: '#67d034', cssVar: '--color-text-success' },
          { name: 'Info',    hex: '#2859ab', cssVar: '--color-text-info' },
          { name: 'Warning', hex: '#eaa93c', cssVar: '--color-text-warning' },
          { name: 'Error',   hex: '#ef2056', cssVar: '--color-text-error' },
        ],
      },
      {
        caption: 'Text / On Action',
        swatches: [
          { name: 'Primary',     hex: '#eff1f3', cssVar: '--color-text-on-action-primary' },
          { name: 'Secondary',   hex: '#021920', cssVar: '--color-text-on-action-secondary' },
          { name: 'Transparent', hex: '#3264b8', cssVar: '--color-text-on-action-transparent' },
        ],
      },
      {
        caption: 'Text / Form Field',
        swatches: [
          { name: 'Placeholder', hex: '#7a828c', cssVar: '--color-text-form-placeholder' },
          { name: 'Hover',       hex: '#689df6', cssVar: '--color-text-form-hover' },
          { name: 'Focus',       hex: '#4b535e', cssVar: '--color-text-form-focus' },
          { name: 'Disabled',    hex: '#aab0b8', cssVar: '--color-text-form-disabled' },
        ],
      },
    ],
  },
  {
    title: 'Icon Tokens',
    description: 'Icon colors mirror text tokens and include breadcrumb and form-field states.',
    groups: [
      {
        caption: 'Icon / Body',
        swatches: [
          { name: 'Primary',         hex: '#021920', cssVar: '--color-icon-body-primary' },
          { name: 'Secondary',       hex: '#7a828c', cssVar: '--color-icon-body-secondary' },
          { name: 'On Dark Surface', hex: '#eff1f3', cssVar: '--color-icon-body-on-dark' },
        ],
      },
      {
        caption: 'Icon / States',
        swatches: [
          { name: 'Action',  hex: '#4285f4', cssVar: '--color-icon-action' },
          { name: 'Success', hex: '#87d95e', cssVar: '--color-icon-success' },
          { name: 'Info',    hex: '#2859ab', cssVar: '--color-icon-info' },
          { name: 'Warning', hex: '#eaa93c', cssVar: '--color-icon-warning' },
          { name: 'Error',   hex: '#ef2056', cssVar: '--color-icon-error' },
        ],
      },
      {
        caption: 'Icon / On Action',
        swatches: [
          { name: 'Primary',     hex: '#eff1f3', cssVar: '--color-icon-on-action-primary' },
          { name: 'Secondary',   hex: '#021920', cssVar: '--color-icon-on-action-secondary' },
          { name: 'Transparent', hex: '#3264b8', cssVar: '--color-icon-on-action-transparent' },
        ],
      },
      {
        caption: 'Icon / Form Field',
        swatches: [
          { name: 'Placeholder', hex: '#7a828c', cssVar: '--color-icon-form-placeholder' },
          { name: 'Hover',       hex: '#689df6', cssVar: '--color-icon-form-hover' },
          { name: 'Focus',       hex: '#4b535e', cssVar: '--color-icon-form-focus' },
          { name: 'Disabled',    hex: '#aab0b8', cssVar: '--color-icon-form-disabled' },
        ],
      },
    ],
  },
  {
    title: 'Surface Tokens',
    description: 'Background fills for panels, forms, overlays, and interactive elements.',
    groups: [
      {
        caption: 'Surface / Base',
        swatches: [
          { name: 'Main Panel',       hex: '#eff1f3', cssVar: '--color-surface-main-panel' },
          { name: 'Section',          hex: '#ffffff', cssVar: '--color-surface-section' },
          { name: 'Form Field',       hex: '#ffffff', cssVar: '--color-surface-form-field' },
          { name: 'Form Group',       hex: '#d9dce0', cssVar: '--color-surface-form-group' },
          { name: 'Section Display',  hex: '#eff1f3', cssVar: '--color-surface-section-display' },
          { name: 'Disabled',         hex: '#eff1f3', cssVar: '--color-surface-disabled' },
        ],
      },
      {
        caption: 'Surface / Messages',
        swatches: [
          { name: 'Success', hex: '#f3fbee', cssVar: '--color-surface-message-success' },
          { name: 'Error',   hex: '#fef1f4', cssVar: '--color-surface-message-error' },
          { name: 'Info',    hex: '#eef3fb', cssVar: '--color-surface-message-info' },
          { name: 'Warning', hex: '#fdf8ef', cssVar: '--color-surface-message-warning' },
        ],
      },
      {
        caption: 'Surface / Navigation',
        swatches: [
          { name: 'Vertical Nav', hex: '#050326',               cssVar: '--color-surface-nav' },
          { name: 'Overlay',      hex: 'rgba(8, 17, 31, 0.7)',  cssVar: '--color-surface-overlay' },
        ],
      },
      {
        caption: 'Surface / Actions',
        swatches: [
          { name: 'Primary',         hex: '#4285f4',                cssVar: '--color-surface-action-primary' },
          { name: 'Secondary',       hex: '#eff1f3',                cssVar: '--color-surface-action-secondary' },
          { name: 'Empty',           hex: 'rgba(255, 255, 255, 0)', cssVar: '--color-surface-action-empty' },
          { name: 'Hover Primary',   hex: '#689df6',                cssVar: '--color-surface-action-hover-primary' },
          { name: 'Hover Secondary', hex: '#aab0b8',                cssVar: '--color-surface-action-hover-secondary' },
        ],
      },
      {
        caption: 'Surface / Table',
        swatches: [
          { name: 'Active Row', hex: '#d9e7fd', cssVar: '--color-surface-table-active' },
          { name: 'Zebra Row',  hex: '#f8f8f8', cssVar: '--color-surface-table-zebra' },
          { name: 'Checkbox',   hex: '#4285f4', cssVar: '--color-surface-table-checkbox' },
        ],
      },
    ],
  },
  {
    title: 'Border Color Tokens',
    description: 'Stroke colors for containers, form fields, and semantic message borders.',
    groups: [
      {
        caption: 'Border / Base',
        swatches: [
          { name: 'Neutral',  hex: '#eff1f3', cssVar: '--color-border-neutral' },
          { name: 'Bold',     hex: '#323840', cssVar: '--color-border-bold' },
          { name: 'Disabled', hex: '#d9dce0', cssVar: '--color-border-disabled' },
        ],
      },
      {
        caption: 'Border / Active',
        swatches: [
          { name: 'Surface Active · Primary',   hex: '#689df6', cssVar: '--color-border-surface-active-primary' },
          { name: 'Surface Active · Secondary', hex: '#aab0b8', cssVar: '--color-border-surface-active-secondary' },
        ],
      },
      {
        caption: 'Border / Messages',
        swatches: [
          { name: 'Success', hex: '#b5e89c', cssVar: '--color-border-message-success' },
          { name: 'Error',   hex: '#f792ac', cssVar: '--color-border-message-error' },
          { name: 'Info',    hex: '#a4beea', cssVar: '--color-border-message-info' },
          { name: 'Warning', hex: '#f7ddb1', cssVar: '--color-border-message-warning' },
        ],
      },
      {
        caption: 'Border / Form Fields',
        swatches: [
          { name: 'Default', hex: '#d9dce0', cssVar: '--color-border-form-default' },
          { name: 'Hover',   hex: '#a0c2f9', cssVar: '--color-border-form-hover' },
          { name: 'Focus',   hex: '#4285f4', cssVar: '--color-border-form-focus' },
        ],
      },
    ],
  },
]

// ── Story ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj

export const AllTokens: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {sections.map((section, si) => (
        <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {si > 0 && (
            <div style={{ height: 2, backgroundColor: '#d9dce0', width: '100%' }} />
          )}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 400, color: '#021920', marginBottom: 4 }}>
              {section.title}
            </h3>
            <p style={{ fontSize: 14, color: '#7a828c' }}>{section.description}</p>
          </div>
          {section.groups.map((group) => (
            <div key={group.caption} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.48px', textTransform: 'uppercase', color: '#021920' }}>
                {group.caption}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.swatches.map((s) => (
                  <TokenSwatch key={s.cssVar} {...s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}
