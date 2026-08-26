// ─── Semantic Collection ──────────────────────────────────────────────────────
// Source: Figma export (figma-export.json → collections.Semantic).
// Each token carries its resolved hex per context × theme mode.
// Contexts: CxCentral, CxPortal, Cases. Themes: Light, Dark.

export const CONTEXTS = ['CxCentral', 'CxPortal', 'Cases'] as const
export const THEMES   = ['Light', 'Dark'] as const

export type Context = (typeof CONTEXTS)[number]
export type Theme   = (typeof THEMES)[number]
export type ModeKey = `${Context}/${Theme}`

export type ColorToken = {
  name: string  // Human label, e.g. "Neutral/0"
  token: string // CSS-var-style slug, e.g. "neutral-0"
  values: Partial<Record<ModeKey, string>>
}

export type ColorGroup = {
  title: string
  description?: string
  tokens: ColorToken[]
}

// Shorthand builder for tokens whose value is identical across every mode.
const uniform = (name: string, token: string, hex: string): ColorToken => ({
  name,
  token,
  values: {
    'CxCentral/Light': hex,
    'CxCentral/Dark':  hex,
    'CxPortal/Light':  hex,
    'CxPortal/Dark':   hex,
    'Cases/Light':     hex,
    'Cases/Dark':      hex,
  },
})

// ─── Groups ───────────────────────────────────────────────────────────────────

export const SEMANTIC_GROUPS: ColorGroup[] = [
  // ── Neutral ─────────────────────────────────────────────────────────────
  {
    title: 'Neutral',
    description: 'Base greys — page surfaces, borders, and body text. Inverts per theme.',
    tokens: [
      {
        name: 'Neutral/0', token: 'neutral-0',
        values: {
          'CxCentral/Light': '#ffffff', 'CxCentral/Dark': '#101010',
          'CxPortal/Light':  '#ffffff', 'CxPortal/Dark':  '#101010',
          'Cases/Light':     '#ffffff', 'Cases/Dark':     '#101010',
        },
      },
      {
        name: 'Neutral/50', token: 'neutral-50',
        values: {
          'CxCentral/Light': '#f8f8f8', 'CxCentral/Dark': '#1d1d1d',
          'CxPortal/Light':  '#f8f8f8', 'CxPortal/Dark':  '#1d1d1d',
          'Cases/Light':     '#f8f8f8', 'Cases/Dark':     '#1d1d1d',
        },
      },
      {
        name: 'Neutral/100', token: 'neutral-100',
        values: {
          'CxCentral/Light': '#efefef', 'CxCentral/Dark': '#2a2a2a',
          'CxPortal/Light':  '#efefef', 'CxPortal/Dark':  '#2a2a2a',
          'Cases/Light':     '#efefef', 'Cases/Dark':     '#2a2a2a',
        },
      },
      {
        name: 'Neutral/200', token: 'neutral-200',
        values: {
          'CxCentral/Light': '#cdcdcd', 'CxCentral/Dark': '#373737',
          'CxPortal/Light':  '#cdcdcd', 'CxPortal/Dark':  '#373737',
          'Cases/Light':     '#cdcdcd', 'Cases/Dark':     '#373737',
        },
      },
      {
        name: 'Neutral/300', token: 'neutral-300',
        values: {
          'CxCentral/Light': '#adadad', 'CxCentral/Dark': '#525252',
          'CxPortal/Light':  '#adadad', 'CxPortal/Dark':  '#525252',
          'Cases/Light':     '#adadad', 'Cases/Dark':     '#525252',
        },
      },
      {
        name: 'Neutral/400', token: 'neutral-400',
        values: {
          'CxCentral/Light': '#8d8d8d', 'CxCentral/Dark': '#6f6f6f',
          'CxPortal/Light':  '#8d8d8d', 'CxPortal/Dark':  '#6f6f6f',
          'Cases/Light':     '#8d8d8d', 'Cases/Dark':     '#6f6f6f',
        },
      },
      {
        name: 'Neutral/500', token: 'neutral-500',
        values: {
          'CxCentral/Light': '#6f6f6f', 'CxCentral/Dark': '#8d8d8d',
          'CxPortal/Light':  '#6f6f6f', 'CxPortal/Dark':  '#8d8d8d',
          'Cases/Light':     '#6f6f6f', 'Cases/Dark':     '#8d8d8d',
        },
      },
      {
        name: 'Neutral/600', token: 'neutral-600',
        values: {
          'CxCentral/Light': '#525252', 'CxCentral/Dark': '#adadad',
          'CxPortal/Light':  '#525252', 'CxPortal/Dark':  '#adadad',
          'Cases/Light':     '#525252', 'Cases/Dark':     '#adadad',
        },
      },
      {
        name: 'Neutral/700', token: 'neutral-700',
        values: {
          'CxCentral/Light': '#373737', 'CxCentral/Dark': '#cdcdcd',
          'CxPortal/Light':  '#373737', 'CxPortal/Dark':  '#cdcdcd',
          'Cases/Light':     '#373737', 'Cases/Dark':     '#cdcdcd',
        },
      },
      {
        name: 'Neutral/750', token: 'neutral-750',
        values: {
          'CxCentral/Light': '#2a2a2a', 'CxCentral/Dark': '#efefef',
          'CxPortal/Light':  '#2a2a2a', 'CxPortal/Dark':  '#efefef',
          'Cases/Light':     '#2a2a2a', 'Cases/Dark':     '#efefef',
        },
      },
      {
        name: 'Neutral/800', token: 'neutral-800',
        values: {
          'CxCentral/Light': '#1d1d1d', 'CxCentral/Dark': '#f8f8f8',
          'CxPortal/Light':  '#1d1d1d', 'CxPortal/Dark':  '#f8f8f8',
          'Cases/Light':     '#1d1d1d', 'Cases/Dark':     '#f8f8f8',
        },
      },
      {
        name: 'Neutral/900', token: 'neutral-900',
        values: {
          'CxCentral/Light': '#1d1d1d', 'CxCentral/Dark': '#ffffff',
          'CxPortal/Light':  '#101010', 'CxPortal/Dark':  '#ffffff',
          'Cases/Light':     '#1d1d1d', 'Cases/Dark':     '#ffffff',
        },
      },
    ],
  },

  // ── Content Action / Primary ────────────────────────────────────────────
  {
    title: 'Content Action / Primary',
    description: 'Primary action colors. Each context has its own brand ramp — Caylent Green (CxCentral, Cases) and CxPortal Purple (CxPortal). Ramps invert between Light and Dark.',
    tokens: [
      {
        name: 'Primary/50', token: 'content-action-primary-50',
        values: {
          'CxCentral/Light': '#fbfcf2', 'CxCentral/Dark': '#000f09',
          'CxPortal/Light':  '#fcfdff', 'CxPortal/Dark':  '#1b0028',
          'Cases/Light':     '#fbfcf2', 'Cases/Dark':     '#000f09',
        },
      },
      {
        name: 'Primary/100', token: 'content-action-primary-100',
        values: {
          'CxCentral/Light': '#e8f7da', 'CxCentral/Dark': '#00270e',
          'CxPortal/Light':  '#f8f9ff', 'CxPortal/Dark':  '#51078f',
          'Cases/Light':     '#e8f7da', 'Cases/Dark':     '#00270e',
        },
      },
      {
        name: 'Primary/200', token: 'content-action-primary-200',
        values: {
          'CxCentral/Light': '#c2ecaa', 'CxCentral/Dark': '#0d3310',
          'CxPortal/Light':  '#e5e9ff', 'CxPortal/Dark':  '#6530b9',
          'Cases/Light':     '#c2ecaa', 'Cases/Dark':     '#0d3310',
        },
      },
      {
        name: 'Primary/300', token: 'content-action-primary-300',
        values: {
          'CxCentral/Light': '#97ca6f', 'CxCentral/Dark': '#1c3f13',
          'CxPortal/Light':  '#d6d7ff', 'CxPortal/Dark':  '#7950e5',
          'Cases/Light':     '#97ca6f', 'Cases/Dark':     '#1c3f13',
        },
      },
      {
        name: 'Primary/Default', token: 'content-action-primary-default',
        values: {
          'CxCentral/Light': '#6a9949', 'CxCentral/Dark': '#395718',
          'CxPortal/Light':  '#b2a3ff', 'CxPortal/Dark':  '#8565f2',
          'Cases/Light':     '#6a9949', 'Cases/Dark':     '#395718',
        },
      },
      {
        name: 'Primary/500', token: 'content-action-primary-500',
        values: {
          'CxCentral/Light': '#5f7a34', 'CxCentral/Dark': '#5f7a34',
          'CxPortal/Light':  '#917aff', 'CxPortal/Dark':  '#917aff',
          'Cases/Light':     '#5f7a34', 'Cases/Dark':     '#5f7a34',
        },
      },
      {
        name: 'Primary/600', token: 'content-action-primary-600',
        values: {
          'CxCentral/Light': '#395718', 'CxCentral/Dark': '#6a9949',
          'CxPortal/Light':  '#8565f2', 'CxPortal/Dark':  '#b2a3ff',
          'Cases/Light':     '#395718', 'Cases/Dark':     '#6a9949',
        },
      },
      {
        name: 'Primary/700', token: 'content-action-primary-700',
        values: {
          'CxCentral/Light': '#1c3f13', 'CxCentral/Dark': '#97ca6f',
          'CxPortal/Light':  '#7950e5', 'CxPortal/Dark':  '#d6d7ff',
          'Cases/Light':     '#1c3f13', 'Cases/Dark':     '#97ca6f',
        },
      },
      {
        name: 'Primary/750', token: 'content-action-primary-750',
        values: {
          'CxCentral/Light': '#0d3310', 'CxCentral/Dark': '#c2ecaa',
          'CxPortal/Light':  '#6530b9', 'CxPortal/Dark':  '#e5e9ff',
          'Cases/Light':     '#0d3310', 'Cases/Dark':     '#c2ecaa',
        },
      },
      {
        name: 'Primary/800', token: 'content-action-primary-800',
        values: {
          'CxCentral/Light': '#00270e', 'CxCentral/Dark': '#e8f7da',
          'CxPortal/Light':  '#51078f', 'CxPortal/Dark':  '#f8f9ff',
          'Cases/Light':     '#00270e', 'Cases/Dark':     '#e8f7da',
        },
      },
      {
        name: 'Primary/900', token: 'content-action-primary-900',
        values: {
          'CxCentral/Light': '#000f09', 'CxCentral/Dark': '#fbfcf2',
          'CxPortal/Light':  '#1b0028', 'CxPortal/Dark':  '#fcfdff',
          'Cases/Light':     '#000f09', 'Cases/Dark':     '#fbfcf2',
        },
      },
    ],
  },

  // ── Content Action / Secondary ──────────────────────────────────────────
  {
    title: 'Content Action / Secondary',
    description: 'Secondary action ramp — the neutral scale used for secondary buttons, chips, and quieter accents.',
    tokens: [
      {
        name: 'Secondary/0', token: 'content-action-secondary-0',
        values: {
          'CxCentral/Light': '#ffffff', 'CxCentral/Dark': '#101010',
          'CxPortal/Light':  '#ffffff', 'CxPortal/Dark':  '#101010',
          'Cases/Light':     '#ffffff', 'Cases/Dark':     '#101010',
        },
      },
      {
        name: 'Secondary/50', token: 'content-action-secondary-50',
        values: {
          'CxCentral/Light': '#f8f8f8', 'CxCentral/Dark': '#1d1d1d',
          'CxPortal/Light':  '#f8f8f8', 'CxPortal/Dark':  '#1d1d1d',
          'Cases/Light':     '#f8f8f8', 'Cases/Dark':     '#1d1d1d',
        },
      },
      {
        name: 'Secondary/100', token: 'content-action-secondary-100',
        values: {
          'CxCentral/Light': '#efefef', 'CxCentral/Dark': '#2a2a2a',
          'CxPortal/Light':  '#efefef', 'CxPortal/Dark':  '#2a2a2a',
          'Cases/Light':     '#efefef', 'Cases/Dark':     '#2a2a2a',
        },
      },
      {
        name: 'Secondary/200', token: 'content-action-secondary-200',
        values: {
          'CxCentral/Light': '#cdcdcd', 'CxCentral/Dark': '#373737',
          'CxPortal/Light':  '#cdcdcd', 'CxPortal/Dark':  '#373737',
          'Cases/Light':     '#cdcdcd', 'Cases/Dark':     '#373737',
        },
      },
      {
        name: 'Secondary/300', token: 'content-action-secondary-300',
        values: {
          'CxCentral/Light': '#adadad', 'CxCentral/Dark': '#525252',
          'CxPortal/Light':  '#adadad', 'CxPortal/Dark':  '#525252',
          'Cases/Light':     '#adadad', 'Cases/Dark':     '#525252',
        },
      },
      {
        name: 'Secondary/Default', token: 'content-action-secondary-default',
        values: {
          'CxCentral/Light': '#8d8d8d', 'CxCentral/Dark': '#6f6f6f',
          'CxPortal/Light':  '#8d8d8d', 'CxPortal/Dark':  '#6f6f6f',
          'Cases/Light':     '#8d8d8d', 'Cases/Dark':     '#6f6f6f',
        },
      },
      {
        name: 'Secondary/500', token: 'content-action-secondary-500',
        values: {
          'CxCentral/Light': '#6f6f6f', 'CxCentral/Dark': '#8d8d8d',
          'CxPortal/Light':  '#6f6f6f', 'CxPortal/Dark':  '#8d8d8d',
          'Cases/Light':     '#6f6f6f', 'Cases/Dark':     '#8d8d8d',
        },
      },
      {
        name: 'Secondary/600', token: 'content-action-secondary-600',
        values: {
          'CxCentral/Light': '#525252', 'CxCentral/Dark': '#adadad',
          'CxPortal/Light':  '#525252', 'CxPortal/Dark':  '#adadad',
          'Cases/Light':     '#525252', 'Cases/Dark':     '#adadad',
        },
      },
      {
        name: 'Secondary/700', token: 'content-action-secondary-700',
        values: {
          'CxCentral/Light': '#373737', 'CxCentral/Dark': '#cdcdcd',
          'CxPortal/Light':  '#373737', 'CxPortal/Dark':  '#cdcdcd',
          'Cases/Light':     '#373737', 'Cases/Dark':     '#cdcdcd',
        },
      },
      {
        name: 'Secondary/750', token: 'content-action-secondary-750',
        values: {
          'CxCentral/Light': '#2a2a2a', 'CxCentral/Dark': '#efefef',
          'CxPortal/Light':  '#2a2a2a', 'CxPortal/Dark':  '#efefef',
          'Cases/Light':     '#2a2a2a', 'Cases/Dark':     '#efefef',
        },
      },
      {
        name: 'Secondary/800', token: 'content-action-secondary-800',
        values: {
          'CxCentral/Light': '#1d1d1d', 'CxCentral/Dark': '#f8f8f8',
          'CxPortal/Light':  '#1d1d1d', 'CxPortal/Dark':  '#f8f8f8',
          'Cases/Light':     '#1d1d1d', 'Cases/Dark':     '#f8f8f8',
        },
      },
      {
        name: 'Secondary/900', token: 'content-action-secondary-900',
        values: {
          'CxCentral/Light': '#101010', 'CxCentral/Dark': '#ffffff',
          'CxPortal/Light':  '#101010', 'CxPortal/Dark':  '#ffffff',
          'Cases/Light':     '#101010', 'Cases/Dark':     '#ffffff',
        },
      },
    ],
  },

  // ── Content Action / Disabled ───────────────────────────────────────────
  {
    title: 'Content Action / Disabled',
    description: 'Muted variants of the primary ramp for disabled controls. Cases still uses the raw Caylent ramp; CxCentral / CxPortal use their own desaturated tint.',
    tokens: [
      {
        name: 'Disabled/50', token: 'content-action-disabled-50',
        values: {
          'CxCentral/Light': '#f9fbf7', 'CxCentral/Dark': '#0b0f06',
          'CxPortal/Light':  '#f9fbf7', 'CxPortal/Dark':  '#0b0f06',
          'Cases/Light':     '#fbfcf2', 'Cases/Dark':     '#000f09',
        },
      },
      {
        name: 'Disabled/100', token: 'content-action-disabled-100',
        values: {
          'CxCentral/Light': '#f1f5ed', 'CxCentral/Dark': '#373d2f',
          'CxPortal/Light':  '#f1f5ed', 'CxPortal/Dark':  '#373d2f',
          'Cases/Light':     '#e8f7da', 'Cases/Dark':     '#00270e',
        },
      },
      {
        name: 'Disabled/200', token: 'content-action-disabled-200',
        values: {
          'CxCentral/Light': '#d2e0c8', 'CxCentral/Dark': '#4f5746',
          'CxPortal/Light':  '#d2e0c8', 'CxPortal/Dark':  '#4f5746',
          'Cases/Light':     '#c2ecaa', 'Cases/Dark':     '#0d3310',
        },
      },
      {
        name: 'Disabled/300', token: 'content-action-disabled-300',
        values: {
          'CxCentral/Light': '#cfd7c2', 'CxCentral/Dark': '#6a7260',
          'CxPortal/Light':  '#cfd7c2', 'CxPortal/Dark':  '#6a7260',
          'Cases/Light':     '#97ca6f', 'Cases/Dark':     '#1c3f13',
        },
      },
      {
        name: 'Disabled/Default', token: 'content-action-disabled-default',
        values: {
          'CxCentral/Light': '#c4cdba', 'CxCentral/Dark': '#8f9785',
          'CxPortal/Light':  '#c4cdba', 'CxPortal/Dark':  '#8f9785',
          'Cases/Light':     '#6a9949', 'Cases/Dark':     '#395718',
        },
      },
      {
        name: 'Disabled/500', token: 'content-action-disabled-500',
        values: {
          'CxCentral/Light': '#b7beac', 'CxCentral/Dark': '#b7beac',
          'CxPortal/Light':  '#b7beac', 'CxPortal/Dark':  '#b7beac',
          'Cases/Light':     '#5f7a34', 'Cases/Dark':     '#5f7a34',
        },
      },
      {
        name: 'Disabled/600', token: 'content-action-disabled-600',
        values: {
          'CxCentral/Light': '#8f9785', 'CxCentral/Dark': '#c4cdba',
          'CxPortal/Light':  '#8f9785', 'CxPortal/Dark':  '#c4cdba',
          'Cases/Light':     '#395718', 'Cases/Dark':     '#6a9949',
        },
      },
      {
        name: 'Disabled/700', token: 'content-action-disabled-700',
        values: {
          'CxCentral/Light': '#6a7260', 'CxCentral/Dark': '#cfd7c2',
          'CxPortal/Light':  '#6a7260', 'CxPortal/Dark':  '#cfd7c2',
          'Cases/Light':     '#1c3f13', 'Cases/Dark':     '#97ca6f',
        },
      },
      {
        name: 'Disabled/750', token: 'content-action-disabled-750',
        values: {
          'CxCentral/Light': '#4f5746', 'CxCentral/Dark': '#d2e0c8',
          'CxPortal/Light':  '#4f5746', 'CxPortal/Dark':  '#d2e0c8',
          'Cases/Light':     '#0d3310', 'Cases/Dark':     '#c2ecaa',
        },
      },
      {
        name: 'Disabled/800', token: 'content-action-disabled-800',
        values: {
          'CxCentral/Light': '#373d2f', 'CxCentral/Dark': '#f1f5ed',
          'CxPortal/Light':  '#373d2f', 'CxPortal/Dark':  '#f1f5ed',
          'Cases/Light':     '#00270e', 'Cases/Dark':     '#e8f7da',
        },
      },
      {
        name: 'Disabled/900', token: 'content-action-disabled-900',
        values: {
          'CxCentral/Light': '#0b0f06', 'CxCentral/Dark': '#f9fbf7',
          'CxPortal/Light':  '#0b0f06', 'CxPortal/Dark':  '#f9fbf7',
          'Cases/Light':     '#000f09', 'Cases/Dark':     '#fbfcf2',
        },
      },
    ],
  },

  // ── Success / Error / Info / Warning are context-agnostic ──────────────
  {
    title: 'Success',
    description: 'Positive / confirmation state. Same ramp across every context and theme.',
    tokens: [
      uniform('Success/50',      'success-50',      '#f3fbee'),
      uniform('Success/100',     'success-100',     '#ddf4d2'),
      uniform('Success/200',     'success-200',     '#b5e89c'),
      uniform('Success/300',     'success-300',     '#87d95e'),
      uniform('Success/Default', 'success-default', '#67d034'),
      uniform('Success/500',     'success-500',     '#4b9924'),
      uniform('Success/600',     'success-600',     '#244a11'),
      uniform('Success/700',     'success-700',     '#0c1906'),
    ],
  },

  {
    title: 'Error',
    description: 'Destructive / failure state.',
    tokens: [
      uniform('Error/50',      'error-50',      '#fef1f4'),
      uniform('Error/100',     'error-100',     '#fbc6d4'),
      uniform('Error/200',     'error-200',     '#f792ac'),
      uniform('Error/300',     'error-300',     '#f3547d'),
      uniform('Error/Default', 'error-default', '#ef2056'),
      uniform('Error/500',     'error-500',     '#ab0c36'),
      uniform('Error/600',     'error-600',     '#690821'),
      uniform('Error/700',     'error-700',     '#130106'),
    ],
  },

  {
    title: 'Info',
    description: 'Informational messages, tags, and neutral highlights.',
    tokens: [
      uniform('Info/50',      'info-50',      '#eef3fb'),
      uniform('Info/100',     'info-100',     '#d6e2f5'),
      uniform('Info/200',     'info-200',     '#a4beea'),
      uniform('Info/300',     'info-300',     '#5a89d8'),
      uniform('Info/Default', 'info-default', '#2859ab'),
      uniform('Info/500',     'info-500',     '#1f4584'),
      uniform('Info/600',     'info-600',     '#11274a'),
      uniform('Info/700',     'info-700',     '#060d19'),
    ],
  },

  {
    title: 'Warning',
    description: 'Caution and pending state.',
    tokens: [
      uniform('Warning/50',      'warning-50',      '#fdf8ef'),
      uniform('Warning/100',     'warning-100',     '#fbeed8'),
      uniform('Warning/200',     'warning-200',     '#f7ddb1'),
      uniform('Warning/300',     'warning-300',     '#f1c780'),
      uniform('Warning/Default', 'warning-default', '#eaa93c'),
      uniform('Warning/500',     'warning-500',     '#c79033'),
      uniform('Warning/600',     'warning-600',     '#815d21'),
      uniform('Warning/700',     'warning-700',     '#2f220c'),
    ],
  },

  // ── Navigation ─────────────────────────────────────────────────────────
  {
    title: 'Navigation',
    description: 'Vertical navigation surface. Context-specific brand tone in Light, unified dark surface in Dark.',
    tokens: [
      {
        name: 'Navigation Bar', token: 'navigation-bar',
        values: {
          // CxCentral/Light is absent in the Figma export — fall back to the CxPortal Light value visually.
          'CxCentral/Light': '#1b0028', 'CxCentral/Dark': '#1d1d1d',
          'CxPortal/Light':  '#1b0028', 'CxPortal/Dark':  '#1d1d1d',
          'Cases/Light':     '#000f09', 'Cases/Dark':     '#1d1d1d',
        },
      },
    ],
  },
]
