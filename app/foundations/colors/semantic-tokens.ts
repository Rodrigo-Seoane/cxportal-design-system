// ─── Semantic Collection ──────────────────────────────────────────────────────
// Source: Figma export (docs/email_campaigns/figma_styles_02_sep.json → collections.Semantic).
// Single-brand token catalog — Caylent Green. Figma's Semantic collection no
// longer models Context/Theme modes (CxCentral/CxPortal/Cases × Light/Dark
// was removed in favor of two brand modes, Caylent Green / Former Pronetx
// Blue); this app hard-cuts to Caylent Green with no runtime switching.

export type ColorToken = {
  name: string  // Human label, e.g. "Neutral/0"
  token: string // CSS-var-style slug, e.g. "neutral-0"
  hex: string
}

export type ColorGroup = {
  title: string
  description?: string
  tokens: ColorToken[]
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export const SEMANTIC_GROUPS: ColorGroup[] = [
  {
    title: 'Neutral',
    description: 'Base greys — page surfaces, borders, and body text.',
    tokens: [
      { name: 'Neutral/0', token: 'neutral-0', hex: '#ffffff' },
      { name: 'Neutral/50', token: 'neutral-50', hex: '#f8f8f8' },
      { name: 'Neutral/100', token: 'neutral-100', hex: '#efefef' },
      { name: 'Neutral/200', token: 'neutral-200', hex: '#cdcdcd' },
      { name: 'Neutral/300', token: 'neutral-300', hex: '#adadad' },
      { name: 'Neutral/400', token: 'neutral-400', hex: '#8d8d8d' },
      { name: 'Neutral/500', token: 'neutral-500', hex: '#6f6f6f' },
      { name: 'Neutral/600', token: 'neutral-600', hex: '#525252' },
      { name: 'Neutral/700', token: 'neutral-700', hex: '#373737' },
      { name: 'Neutral/750', token: 'neutral-750', hex: '#2a2a2a' },
      { name: 'Neutral/800', token: 'neutral-800', hex: '#1d1d1d' },
      { name: 'Neutral/900', token: 'neutral-900', hex: '#1d1d1d' },
    ],
  },

  {
    title: 'Content Action / Primary',
    description: 'Primary brand action color — Caylent Green.',
    tokens: [
      { name: 'Primary/50', token: 'content-action-primary-50', hex: '#fbfcf2' },
      { name: 'Primary/100', token: 'content-action-primary-100', hex: '#d0ecc1' },
      { name: 'Primary/200', token: 'content-action-primary-200', hex: '#97ca6f' },
      { name: 'Primary/300', token: 'content-action-primary-300', hex: '#629944' },
      { name: 'Primary/Default', token: 'content-action-primary-default', hex: '#3a8015' },
      { name: 'Primary/500', token: 'content-action-primary-500', hex: '#366618' },
      { name: 'Primary/600', token: 'content-action-primary-600', hex: '#204704' },
      { name: 'Primary/700', token: 'content-action-primary-700', hex: '#123200' },
      { name: 'Primary/750', token: 'content-action-primary-750', hex: '#0e2800' },
      { name: 'Primary/800', token: 'content-action-primary-800', hex: '#081902' },
      { name: 'Primary/900', token: 'content-action-primary-900', hex: '#030901' },
    ],
  },

  {
    title: 'Content Action / Secondary',
    description: 'Secondary action ramp — the neutral scale used for secondary buttons, chips, and quieter accents.',
    tokens: [
      { name: 'Secondary/0', token: 'content-action-secondary-0', hex: '#ffffff' },
      { name: 'Secondary/50', token: 'content-action-secondary-50', hex: '#f8f8f8' },
      { name: 'Secondary/100', token: 'content-action-secondary-100', hex: '#efefef' },
      { name: 'Secondary/200', token: 'content-action-secondary-200', hex: '#cdcdcd' },
      { name: 'Secondary/300', token: 'content-action-secondary-300', hex: '#adadad' },
      { name: 'Secondary/Default', token: 'content-action-secondary-default', hex: '#8d8d8d' },
      { name: 'Secondary/500', token: 'content-action-secondary-500', hex: '#6f6f6f' },
      { name: 'Secondary/600', token: 'content-action-secondary-600', hex: '#525252' },
      { name: 'Secondary/700', token: 'content-action-secondary-700', hex: '#373737' },
      { name: 'Secondary/750', token: 'content-action-secondary-750', hex: '#2a2a2a' },
      { name: 'Secondary/800', token: 'content-action-secondary-800', hex: '#1d1d1d' },
      { name: 'Secondary/900', token: 'content-action-secondary-900', hex: '#101010' },
    ],
  },

  {
    title: 'Content Action / Disabled',
    description: 'Muted variants of the primary ramp for disabled controls.',
    tokens: [
      { name: 'Disabled/50', token: 'content-action-disabled-50', hex: '#f9fbf7' },
      { name: 'Disabled/100', token: 'content-action-disabled-100', hex: '#f1f5ed' },
      { name: 'Disabled/200', token: 'content-action-disabled-200', hex: '#d2e0c8' },
      { name: 'Disabled/300', token: 'content-action-disabled-300', hex: '#cfd7c2' },
      { name: 'Disabled/Default', token: 'content-action-disabled-default', hex: '#c4cdba' },
      { name: 'Disabled/500', token: 'content-action-disabled-500', hex: '#b7beac' },
      { name: 'Disabled/600', token: 'content-action-disabled-600', hex: '#8f9785' },
      { name: 'Disabled/700', token: 'content-action-disabled-700', hex: '#6a7260' },
      { name: 'Disabled/750', token: 'content-action-disabled-750', hex: '#4f5746' },
      { name: 'Disabled/800', token: 'content-action-disabled-800', hex: '#373d2f' },
      { name: 'Disabled/900', token: 'content-action-disabled-900', hex: '#0b0f06' },
    ],
  },

  {
    title: 'Success',
    description: 'Positive / confirmation state.',
    tokens: [
      { name: 'Success/50', token: 'success-50', hex: '#f3fbee' },
      { name: 'Success/100', token: 'success-100', hex: '#ddf4d2' },
      { name: 'Success/200', token: 'success-200', hex: '#b5e89c' },
      { name: 'Success/300', token: 'success-300', hex: '#87d95e' },
      { name: 'Success/Default', token: 'success-default', hex: '#67d034' },
      { name: 'Success/500', token: 'success-500', hex: '#4b9924' },
      { name: 'Success/600', token: 'success-600', hex: '#244a11' },
      { name: 'Success/700', token: 'success-700', hex: '#0c1906' },
    ],
  },

  {
    title: 'Error',
    description: 'Destructive / failure state.',
    tokens: [
      { name: 'Error/50', token: 'error-50', hex: '#fef1f4' },
      { name: 'Error/100', token: 'error-100', hex: '#fbc6d4' },
      { name: 'Error/200', token: 'error-200', hex: '#f792ac' },
      { name: 'Error/300', token: 'error-300', hex: '#f3547d' },
      { name: 'Error/Default', token: 'error-default', hex: '#ef2056' },
      { name: 'Error/500', token: 'error-500', hex: '#ab0c36' },
      { name: 'Error/600', token: 'error-600', hex: '#690821' },
      { name: 'Error/700', token: 'error-700', hex: '#130106' },
    ],
  },

  {
    title: 'Info',
    description: 'Informational messages, tags, and neutral highlights.',
    tokens: [
      { name: 'Info/50', token: 'info-50', hex: '#eef3fb' },
      { name: 'Info/100', token: 'info-100', hex: '#d6e2f5' },
      { name: 'Info/200', token: 'info-200', hex: '#a4beea' },
      { name: 'Info/300', token: 'info-300', hex: '#5a89d8' },
      { name: 'Info/Default', token: 'info-default', hex: '#2859ab' },
      { name: 'Info/500', token: 'info-500', hex: '#1f4584' },
      { name: 'Info/600', token: 'info-600', hex: '#11274a' },
      { name: 'Info/700', token: 'info-700', hex: '#060d19' },
    ],
  },

  {
    title: 'Warning',
    description: 'Caution and pending state.',
    tokens: [
      { name: 'Warning/50', token: 'warning-50', hex: '#fdf8ef' },
      { name: 'Warning/100', token: 'warning-100', hex: '#fbeed8' },
      { name: 'Warning/200', token: 'warning-200', hex: '#f7ddb1' },
      { name: 'Warning/300', token: 'warning-300', hex: '#f1c780' },
      { name: 'Warning/Default', token: 'warning-default', hex: '#eaa93c' },
      { name: 'Warning/500', token: 'warning-500', hex: '#c79033' },
      { name: 'Warning/600', token: 'warning-600', hex: '#815d21' },
      { name: 'Warning/700', token: 'warning-700', hex: '#2f220c' },
    ],
  },

  {
    title: 'Navigation',
    description: 'Vertical navigation surface.',
    tokens: [
      { name: 'Navigation Bar', token: 'navigation-bar', hex: '#050326' },
    ],
  },
]
