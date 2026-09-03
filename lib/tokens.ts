// CxPortal Design System Tokens
// Source of truth — Figma file exoHhvasbJSziVGakV8Y0r
// Regenerated 2026-09-02 from figma-export.json (_sync-state v13, Caylent Green mode).
//
// Values reference CSS variables defined in app/globals.css.
// Update globals.css → this file's `var(--…)` refs cascade automatically.
// The `raw` block below is the only place hex literals live — for foundations
// swatch display only. Components should never consume `raw` directly.

// ═══════════════════════════════════════════════════════════════════════════
// Raw palette (private — foundations page only, do not use in components)
// ═══════════════════════════════════════════════════════════════════════════

export const raw = {
  pronetxGreys: {
    0:   '#ffffff',
    50:  '#f8f8f8',
    100: '#efefef',
    200: '#cdcdcd',
    300: '#adadad',
    400: '#8d8d8d',
    500: '#6f6f6f',
    600: '#525252',
    700: '#373737',
    750: '#2a2a2a',
    800: '#1d1d1d',
    900: '#101010',
  },
  cxportalPurple: {
    50:      '#fcfdff',
    100:     '#f8f9ff',
    200:     '#e5e9ff',
    300:     '#d6d7ff',
    default: '#b2a3ff',
    500:     '#917aff',
    600:     '#8565f2',
    700:     '#7950e5',
    750:     '#6530b9',
    800:     '#51078f',
    900:     '#1b0028',
  },
  blue: {
    50:      '#eef3fb',
    100:     '#d6e2f5',
    200:     '#a4beea',
    300:     '#5a89d8',
    default: '#2859ab',
    500:     '#1f4584',
    600:     '#11274a',
    700:     '#060d19',
  },
  green: {
    50:      '#f3fbee',
    100:     '#ddf4d2',
    200:     '#b5e89c',
    300:     '#87d95e',
    default: '#67d034',
    500:     '#4b9924',
    600:     '#244a11',
    700:     '#0c1906',
  },
  red: {
    50:      '#fef1f4',
    100:     '#fbc6d4',
    200:     '#f792ac',
    300:     '#f3547d',
    default: '#ef2056',
    500:     '#ab0c36',
    600:     '#690821',
    700:     '#130106',
  },
  golden: {
    50:      '#fdf8ef',
    100:     '#fbeed8',
    200:     '#f7ddb1',
    300:     '#f1c780',
    default: '#eaa93c',
    500:     '#c79033',
    600:     '#815d21',
    700:     '#2f220c',
  },
  teal: {
    50:      '#e7f6f6',
    100:     '#cfeced',
    200:     '#86d1d3',
    300:     '#3eb5b9',
    default: '#0ea2a7',
    500:     '#0b8286',
    600:     '#075154',
    700:     '#032021',
    750:     '#010f0f',
    800:     '#000303',
  },
  caylentGreen: {
    50:      '#fbfcf2',
    100:     '#d0ecc1',
    200:     '#97ca6f',
    300:     '#629944',
    default: '#3a8015',
    500:     '#366618',
    600:     '#204704',
    700:     '#123200',
    750:     '#0e2800',
    800:     '#081902',
    900:     '#030901',
  },
  disabledGreen: {
    50:      '#f9fbf7',
    100:     '#f1f5ed',
    200:     '#d2e0c8',
    300:     '#cfd7c2',
    default: '#c4cdba',
    500:     '#b7beac',
    600:     '#8f9785',
    700:     '#6a7260',
    750:     '#4f5746',
    800:     '#373d2f',
    900:     '#0b0f06',
  },
  navigationBlue: '#050326', // legacy nav, unaliased in Figma — kept for reference
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Semantic layer (Figma "Semantic" collection) — CxPortal/Light defaults
// Values are CSS var() refs so multi-mode switching in globals.css cascades.
// ═══════════════════════════════════════════════════════════════════════════

export const semantic = {
  neutral: {
    0:   'var(--neutral-0)',
    50:  'var(--neutral-50)',
    100: 'var(--neutral-100)',
    200: 'var(--neutral-200)',
    300: 'var(--neutral-300)',
    400: 'var(--neutral-400)',
    500: 'var(--neutral-500)',
    600: 'var(--neutral-600)',
    700: 'var(--neutral-700)',
    750: 'var(--neutral-750)',
    800: 'var(--neutral-800)',
    900: 'var(--neutral-900)',
  },
  contentAction: {
    primary: {
      50:      'var(--content-action-primary-50)',
      100:     'var(--content-action-primary-100)',
      200:     'var(--content-action-primary-200)',
      300:     'var(--content-action-primary-300)',
      default: 'var(--content-action-primary-default)',
      500:     'var(--content-action-primary-500)',
      600:     'var(--content-action-primary-600)',
      700:     'var(--content-action-primary-700)',
      750:     'var(--content-action-primary-750)',
      800:     'var(--content-action-primary-800)',
      900:     'var(--content-action-primary-900)',
    },
    secondary: {
      0:       'var(--content-action-secondary-0)',
      50:      'var(--content-action-secondary-50)',
      100:     'var(--content-action-secondary-100)',
      200:     'var(--content-action-secondary-200)',
      300:     'var(--content-action-secondary-300)',
      default: 'var(--content-action-secondary-default)',
      500:     'var(--content-action-secondary-500)',
      600:     'var(--content-action-secondary-600)',
      700:     'var(--content-action-secondary-700)',
      750:     'var(--content-action-secondary-750)',
      800:     'var(--content-action-secondary-800)',
      900:     'var(--content-action-secondary-900)',
    },
    disabled: {
      50:      'var(--content-action-disabled-50)',
      100:     'var(--content-action-disabled-100)',
      200:     'var(--content-action-disabled-200)',
      300:     'var(--content-action-disabled-300)',
      default: 'var(--content-action-disabled-default)',
      500:     'var(--content-action-disabled-500)',
      600:     'var(--content-action-disabled-600)',
      700:     'var(--content-action-disabled-700)',
      750:     'var(--content-action-disabled-750)',
      800:     'var(--content-action-disabled-800)',
      900:     'var(--content-action-disabled-900)',
    },
  },
  success: {
    50:      'var(--success-50)',
    100:     'var(--success-100)',
    200:     'var(--success-200)',
    300:     'var(--success-300)',
    default: 'var(--success-default)',
    500:     'var(--success-500)',
    600:     'var(--success-600)',
    700:     'var(--success-700)',
  },
  warning: {
    50:      'var(--warning-50)',
    100:     'var(--warning-100)',
    200:     'var(--warning-200)',
    300:     'var(--warning-300)',
    default: 'var(--warning-default)',
    500:     'var(--warning-500)',
    600:     'var(--warning-600)',
    700:     'var(--warning-700)',
  },
  error: {
    50:      'var(--error-50)',
    100:     'var(--error-100)',
    200:     'var(--error-200)',
    300:     'var(--error-300)',
    default: 'var(--error-default)',
    500:     'var(--error-500)',
    600:     'var(--error-600)',
    700:     'var(--error-700)',
  },
  info: {
    50:      'var(--info-50)',
    100:     'var(--info-100)',
    200:     'var(--info-200)',
    300:     'var(--info-300)',
    default: 'var(--info-default)',
    500:     'var(--info-500)',
    600:     'var(--info-600)',
    700:     'var(--info-700)',
  },
  navigationBar: 'var(--navigation-bar)',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Context layer (Figma "Context" collection) — aliases into semantic tokens.
// Prefer these over direct semantic access — they carry role intent.
// ═══════════════════════════════════════════════════════════════════════════

export const context = {
  text: {
    body: {
      primary:       'var(--text-body-primary)',
      secondary:     'var(--text-body-secondary)',
      onDarkSurface: 'var(--text-body-on-dark-surface)',
    },
    action:      'var(--text-action)',
    success:     'var(--text-success)',
    info:        'var(--text-info)',
    warning:     'var(--text-warning)',
    error:       'var(--text-error)',
    destructive: 'var(--text-destructive)',
    onAction: {
      primary:     'var(--text-on-action-primary)',
      secondary:   'var(--text-on-action-secondary)',
      transparent: 'var(--text-on-action-transparent)',
      disabled:    'var(--text-on-action-disabled)',
    },
    formField: {
      placeholder: 'var(--text-form-field-placeholder)',
      hover:       'var(--text-form-field-hover)',
      focus:       'var(--text-form-field-focus)',
      disabled:    'var(--text-form-field-disabled)',
    },
  },
  icon: {
    action:      'var(--icon-action)',
    success:     'var(--icon-success)',
    info:        'var(--icon-info)',
    warning:     'var(--icon-warning)',
    error:       'var(--icon-error)',
    destructive: 'var(--icon-destructive)',
    body: {
      primary:       'var(--icon-body-primary)',
      secondary:     'var(--icon-body-secondary)',
      onDarkSurface: 'var(--icon-body-on-dark-surface)',
    },
    onAction: {
      primary:     'var(--icon-on-action-primary)',
      secondary:   'var(--icon-on-action-secondary)',
      transparent: 'var(--icon-on-action-transparent)',
      disabled:    'var(--icon-on-action-disabled)',
    },
    formField: {
      placeholder: 'var(--icon-form-field-placeholder)',
      hover:       'var(--icon-form-field-hover)',
      focus:       'var(--icon-form-field-focus)',
      disabled:    'var(--icon-form-field-disabled)',
    },
  },
  surface: {
    mainPanel:       'var(--surface-main-panel)',
    sectionBg:       'var(--surface-section-bg)',
    sectionGroupBg:  'var(--surface-section-group-bg)',
    formField:       'var(--surface-form-field)',
    formGroup:       'var(--surface-form-group)',
    verticalNav:     'var(--surface-vertical-nav)',
    overlay:         'var(--surface-overlay)',
    disabled:        'var(--surface-disabled)',
    action: {
      primary: {
        default:  'var(--surface-action-primary-default)',
        hover:    'var(--surface-action-primary-hover)',
        disabled: 'var(--surface-action-primary-disabled)',
      },
      secondary: {
        default:  'var(--surface-action-secondary-default)',
        hover:    'var(--surface-action-secondary-hover)',
        disabled: 'var(--surface-action-secondary-disabled)',
      },
      terciary: {
        default:  'var(--surface-action-terciary-default)',
        hover:    'var(--surface-action-terciary-hover)',
        disabled: 'var(--surface-action-terciary-disabled)',
      },
      destructive: {
        default:  'var(--surface-action-destructive-default)',
        hover:    'var(--surface-action-destructive-hover)',
        disabled: 'var(--surface-action-destructive-disabled)',
      },
      empty: 'var(--surface-action-empty)',
    },
    accent: {
      success: {
        light: 'var(--surface-accent-success-light)',
        dark:  'var(--surface-accent-success-dark)',
        hover: 'var(--surface-accent-success-hover)',
      },
      info: {
        light: 'var(--surface-accent-info-light)',
        dark:  'var(--surface-accent-info-dark)',
        hover: 'var(--surface-accent-info-hover)',
      },
      warning: {
        light: 'var(--surface-accent-warning-light)',
        dark:  'var(--surface-accent-warning-dark)',
        hover: 'var(--surface-accent-warning-hover)',
      },
      error: {
        light: 'var(--surface-accent-error-light)',
        dark:  'var(--surface-accent-error-dark)',
        hover: 'var(--surface-accent-error-hover)',
      },
    },
    table: {
      activeRow:            'var(--surface-table-active-row)',
      tableTitleBackground: 'var(--surface-table-table-title-background)',
      zebraRow:             'var(--surface-table-zebra-row)',
      checkboxActive:       'var(--surface-table-checkbox-active)',
    },
  },
  borderColor: {
    neutralLight: 'var(--border-color-neutral-light)',
    neutralDark:  'var(--border-color-neutral-dark)',
    disabled:     'var(--border-color-disabled)',
    surfaceActive: {
      primary: {
        default:  'var(--border-color-surface-active-primary-default)',
        hover:    'var(--border-color-surface-active-primary-hover)',
        disabled: 'var(--border-color-surface-active-primary-disabled)',
      },
      secondary: {
        default:  'var(--border-color-surface-active-secondary-default)',
        hover:    'var(--border-color-surface-active-secondary-hover)',
        disabled: 'var(--border-color-surface-active-secondary-disabled)',
      },
      terciary: {
        default:  'var(--border-color-surface-active-terciary-default)',
        hover:    'var(--border-color-surface-active-terciary-hover)',
        disabled: 'var(--border-color-surface-active-terciary-disabled)',
      },
    },
    accent: {
      success: {
        light: 'var(--border-color-accent-success-light)',
        dark:  'var(--border-color-accent-success-dark)',
        hover: 'var(--border-color-accent-success-hover)',
      },
      info: {
        light: 'var(--border-color-accent-info-light)',
        dark:  'var(--border-color-accent-info-dark)',
        hover: 'var(--border-color-accent-info-hover)',
      },
      warning: {
        light: 'var(--border-color-accent-warning-light)',
        dark:  'var(--border-color-accent-warning-dark)',
        hover: 'var(--border-color-accent-warning-hover)',
      },
      error: {
        light:     'var(--border-color-accent-error-light)',
        dark:      'var(--border-color-accent-error-dark)',
        darkHover: 'var(--border-color-accent-error-dark-hover)',
      },
    },
    formFields: {
      default: 'var(--border-color-form-fields-default)',
      hover:   'var(--border-color-form-fields-hover)',
      focus:   'var(--border-color-form-fields-focus)',
    },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Scale (spacing) — Figma "Scale/*". Values in px.
// ═══════════════════════════════════════════════════════════════════════════

export const scale = {
  0:      0,
  '0-25': 1,
  '0-5':  2,
  1:      4,
  2:      8,
  3:      12,
  4:      16,
  5:      20,
  6:      24,
  7:      28,
  8:      32,
  9:      36,
  10:     40,
  12:     48,
  16:     64,
  20:     80,
  30:     120,
} as const

// Legacy — flat numeric array of Figma Scale/* values (in px)
export const spacing = [
  0, 1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 64, 80, 120,
] as const

export type SpacingUnit = (typeof spacing)[number]

// ═══════════════════════════════════════════════════════════════════════════
// Border width & radius — reference CSS vars.
// ═══════════════════════════════════════════════════════════════════════════

export const borderWidth = {
  none: 'var(--border-width-none)', // 0
  xs:   'var(--border-width-xs)',   // 1
  sm:   'var(--border-width-sm)',   // 1  (Figma alias to Scale/0.25)
  md:   'var(--border-width-md)',   // 2
  lg:   'var(--border-width-lg)',   // 4
} as const

export const borderRadius = {
  none:  'var(--border-radius-none)',  // 0
  xs:    'var(--border-radius-xs)',    // 2
  sm:    'var(--border-radius-sm)',    // 4
  md:    'var(--border-radius-md)',    // 8
  lg:    'var(--border-radius-lg)',    // 16
  round: 'var(--border-radius-round)', // 64
} as const

// Legacy alias — prefer `borderRadius` above for new code
export const radii = borderRadius

// ═══════════════════════════════════════════════════════════════════════════
// Typography — Roboto everywhere. Numeric sizes/line-heights match Figma.
// ═══════════════════════════════════════════════════════════════════════════

export const fontFamily = {
  heading: 'var(--font-family-heading)',
  body:    'var(--font-family-body)',
  caption: 'var(--font-family-caption)',
  email: {
    heading: 'var(--font-family-email-heading)', // Lora
    body:    'var(--font-family-email-body)',    // Source Sans Pro
    caption: 'var(--font-family-email-caption)', // Source Sans Pro
  },
} as const

export const fontWeight = {
  light:     300,
  regular:   400,
  semibold:  600,
  extrabold: 800,
} as const

// Full type ramp matching Figma "Text Size/*" variables.
// Sizes and line-heights are numeric px (Figma stores px).
export const textSize = {
  heading: {
    h1: { size: 28, lineHeight: 34, paragraphSpacing: 16 },
    h2: { size: 24, lineHeight: 30, paragraphSpacing: 16 },
    h3: { size: 20, lineHeight: 28, paragraphSpacing: 12 },
    h4: { size: 18, lineHeight: 24, paragraphSpacing: 12 },
    h5: { size: 16, lineHeight: 24, paragraphSpacing:  8 },
  },
  paragraph: {
    xl:      { size: 18, lineHeight: 28, paragraphSpacing: 12 },
    lg:      { size: 16, lineHeight: 24, paragraphSpacing: 12 },
    regular: { size: 14, lineHeight: 20, paragraphSpacing: 12 },
    sm:      { size: 12, lineHeight: 20, paragraphSpacing: 12 },
    xs:      { size: 10, lineHeight: 16, paragraphSpacing: 12 },
  },
  caption: {
    large:   { size: 12, lineHeight: 16, paragraphSpacing: 0 },
    regular: { size: 10, lineHeight: 12, paragraphSpacing: 0 },
    small:   { size:  8, lineHeight: 12, paragraphSpacing: 0 },
  },
} as const

// Legacy typography surface — kept for existing consumers (TypographyScale.tsx)
export const typography = {
  fontFamily: 'var(--font-family-body), Roboto, system-ui, sans-serif',
  weights: {
    light:     fontWeight.light,
    regular:   fontWeight.regular,
    semibold:  fontWeight.semibold,
    extrabold: fontWeight.extrabold,
  },
  headings: [
    { name: 'H1', size: 28, lineHeight: 34, weight: 400 },
    { name: 'H2', size: 24, lineHeight: 30, weight: 400 },
    { name: 'H3', size: 20, lineHeight: 28, weight: 400 },
    { name: 'H4', size: 18, lineHeight: 24, weight: 400 },
    { name: 'H5', size: 16, lineHeight: 24, weight: 400 },
  ] as const,
  body: [
    { name: 'Body XL', size: 18, lineHeight: 28, weights: [300, 400, 600, 800] as const },
    { name: 'Body LG', size: 16, lineHeight: 24, weights: [300, 400, 600, 800] as const },
    { name: 'Body MD', size: 14, lineHeight: 20, weights: [300, 400, 600, 800] as const },
    { name: 'Body SM', size: 12, lineHeight: 20, weights: [300, 400, 600, 800] as const },
    { name: 'Body XS', size: 10, lineHeight: 16, weights: [300, 400, 600, 800] as const },
  ] as const,
  captions: [
    { name: 'Caption Large',   size: 12, lineHeight: 16, weight: 600, letterSpacing: '4px' },
    { name: 'Caption Regular', size: 10, lineHeight: 12, weight: 600, letterSpacing: '4px' },
    { name: 'Caption Small',   size:  8, lineHeight: 12, weight: 600, letterSpacing: '4px' },
  ] as const,
} as const

// ═══════════════════════════════════════════════════════════════════════════
// Legacy flat surface — backward compat for components still importing the
// original shape. All values now reference the new tokens; nothing hard-hex.
// Prefer `context.*` / `semantic.*` for new code.
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  primary: 'var(--content-action-primary-600)',

  text: {
    primary:     'var(--text-body-primary)',
    secondary:   'var(--text-body-secondary)',
    onDark:      'var(--icon-body-on-dark-surface)',
    placeholder: 'var(--text-form-field-placeholder)',
  },

  surface: {
    section:   'var(--surface-section-bg)',
    display:   'var(--neutral-100)',
    panel:     'var(--surface-main-panel)',
    nav:       'var(--surface-vertical-nav)',
    formField: 'var(--surface-form-field)',
    zebraRow:  'var(--surface-table-zebra-row)',
  },

  status: {
    success100: 'var(--success-100)',
    success200: 'var(--success-200)',
    warning100: 'var(--warning-100)',
    warning200: 'var(--warning-200)',
    error100:   'var(--error-100)',
    error200:   'var(--error-200)',
    info100:    'var(--info-100)',
    info200:    'var(--info-200)',
  },

  interactive: {
    primaryLight:   'var(--content-action-primary-500)',
    primaryDark:    'var(--content-action-primary-700)',
    borderStrong:   'var(--neutral-300)',
    borderDisabled: 'var(--neutral-200)',
  },
} as const
