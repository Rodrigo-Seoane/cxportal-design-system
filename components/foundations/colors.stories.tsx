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
          { name: 'Primary',         hex: '#1d1d1d', cssVar: '--text-body-primary' },
          { name: 'Secondary',       hex: '#8d8d8d', cssVar: '--text-body-secondary' },
          { name: 'On Dark Surface', hex: '#efefef', cssVar: '--text-body-on-dark-surface' },
        ],
      },
      {
        caption: 'Text / States',
        swatches: [
          { name: 'Action',  hex: '#3a8015', cssVar: '--text-action' },
          { name: 'Success', hex: '#67d034', cssVar: '--text-success' },
          { name: 'Info',    hex: '#2859ab', cssVar: '--text-info' },
          { name: 'Warning', hex: '#eaa93c', cssVar: '--text-warning' },
          { name: 'Error',   hex: '#ef2056', cssVar: '--text-error' },
        ],
      },
      {
        caption: 'Text / On Action',
        swatches: [
          { name: 'Primary',     hex: '#f8f8f8', cssVar: '--text-on-action-primary' },
          { name: 'Secondary',   hex: '#1d1d1d', cssVar: '--text-on-action-secondary' },
          { name: 'Transparent', hex: '#3a8015', cssVar: '--text-on-action-transparent' },
        ],
      },
      {
        caption: 'Text / Form Field',
        swatches: [
          { name: 'Placeholder', hex: '#8d8d8d', cssVar: '--text-form-field-placeholder' },
          { name: 'Hover',       hex: '#366618', cssVar: '--text-form-field-hover' },
          { name: 'Focus',       hex: '#1d1d1d', cssVar: '--text-form-field-focus' },
          { name: 'Disabled',    hex: '#adadad', cssVar: '--text-form-field-disabled' },
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
          { name: 'Primary',         hex: '#1d1d1d', cssVar: '--icon-body-primary' },
          { name: 'Secondary',       hex: '#8d8d8d', cssVar: '--icon-body-secondary' },
          { name: 'On Dark Surface', hex: '#efefef', cssVar: '--icon-body-on-dark-surface' },
        ],
      },
      {
        caption: 'Icon / States',
        swatches: [
          { name: 'Action',  hex: '#3a8015', cssVar: '--icon-action' },
          { name: 'Success', hex: '#87d95e', cssVar: '--icon-success' },
          { name: 'Info',    hex: '#2859ab', cssVar: '--icon-info' },
          { name: 'Warning', hex: '#eaa93c', cssVar: '--icon-warning' },
          { name: 'Error',   hex: '#ef2056', cssVar: '--icon-error' },
        ],
      },
      {
        caption: 'Icon / On Action',
        swatches: [
          { name: 'Primary',     hex: '#efefef', cssVar: '--icon-on-action-primary' },
          { name: 'Secondary',   hex: '#1d1d1d', cssVar: '--icon-on-action-secondary' },
          { name: 'Transparent', hex: '#366618', cssVar: '--icon-on-action-transparent' },
        ],
      },
      {
        caption: 'Icon / Form Field',
        swatches: [
          { name: 'Placeholder', hex: '#8d8d8d', cssVar: '--icon-form-field-placeholder' },
          { name: 'Hover',       hex: '#366618', cssVar: '--icon-form-field-hover' },
          { name: 'Focus',       hex: '#6f6f6f', cssVar: '--icon-form-field-focus' },
          { name: 'Disabled',    hex: '#8d8d8d', cssVar: '--icon-form-field-disabled' },
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
          { name: 'Main Panel',       hex: '#efefef', cssVar: '--color-surface-main-panel' },
          { name: 'Section',          hex: '#ffffff', cssVar: '--color-surface-section' },
          { name: 'Form Field',       hex: '#ffffff', cssVar: '--color-surface-form-field' },
          { name: 'Form Group',       hex: '#f8f8f8', cssVar: '--color-surface-form-group' },
          { name: 'Section Display',  hex: '#efefef', cssVar: '--color-surface-section-display' },
          { name: 'Disabled',         hex: '#f1f5ed', cssVar: '--color-surface-disabled' },
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
          { name: 'Primary',         hex: '#3a8015',                cssVar: '--surface-action-primary-default' },
          { name: 'Secondary',       hex: '#ffffff',                cssVar: '--surface-action-secondary-default' },
          { name: 'Empty',           hex: 'rgba(255, 255, 255, 0)', cssVar: '--surface-action-empty' },
          { name: 'Hover Primary',   hex: '#366618',                cssVar: '--surface-action-primary-hover' },
          { name: 'Hover Secondary', hex: '#f8f8f8',                cssVar: '--surface-action-secondary-hover' },
        ],
      },
      {
        caption: 'Surface / Table',
        swatches: [
          { name: 'Active Row', hex: '#d0ecc1', cssVar: '--color-surface-table-active' },
          { name: 'Zebra Row',  hex: '#f8f8f8', cssVar: '--color-surface-table-zebra' },
          { name: 'Checkbox',   hex: '#366618', cssVar: '--color-surface-table-checkbox' },
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
          { name: 'Neutral',  hex: '#efefef', cssVar: '--color-border-neutral' },
          { name: 'Bold',     hex: '#525252', cssVar: '--color-border-bold' },
          { name: 'Disabled', hex: '#cdcdcd', cssVar: '--color-border-disabled' },
        ],
      },
      {
        caption: 'Border / Active',
        swatches: [
          { name: 'Surface Active · Primary',   hex: '#3a8015', cssVar: '--color-border-surface-active-primary' },
          { name: 'Surface Active · Secondary', hex: '#adadad', cssVar: '--color-border-surface-active-secondary' },
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
          { name: 'Default', hex: '#cdcdcd', cssVar: '--color-border-form-default' },
          { name: 'Hover',   hex: '#3a8015', cssVar: '--color-border-form-hover' },
          { name: 'Focus',   hex: '#3a8015', cssVar: '--color-border-form-focus' },
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
            <div style={{ height: 2, backgroundColor: 'var(--neutral-200)', width: '100%' }} />
          )}
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 400, color: 'var(--text-body-primary)', marginBottom: 4 }}>
              {section.title}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-body-secondary)' }}>{section.description}</p>
          </div>
          {section.groups.map((group) => (
            <div key={group.caption} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.48px', textTransform: 'uppercase', color: 'var(--text-body-primary)' }}>
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
