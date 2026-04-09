// CxPortal Design System Tokens
// Source of truth — extracted from Figma: exoHhvasbJSziVGakV8Y0r
// Update this file deliberately when Figma variables change (manual sync, not automated)

export const colors = {
  primary: '#4285f4',

  text: {
    primary: '#021920',
    secondary: '#7a828c',
    onDark: '#eff1f3',
    placeholder: '#7a828c',
  },

  surface: {
    section: '#ffffff',
    display: '#eff1f3',
    panel: '#eff1f3',
    nav: '#050326',
    formField: '#ffffff',
    zebraRow: '#f8f8f8',
  },

  status: {
    success100: '#ddf4d2',
    success200: '#b5e89c',
    warning100: '#fbeed8',
    warning200: '#f7ddb1',
    error100: '#fbc6d4',
    error200: '#f792ac',
    info100: '#d6e2f5',
    info200: '#a4beea',
  },

  // Interactive state colors — extracted from button/component specs in Figma
  interactive: {
    primaryLight: '#689df6',   // Primary hover bg · primary & secondary border
    primaryDark: '#3264b8',    // Secondary & text button text color · primary active bg
    borderStrong: '#aab0b8',   // Form-controls border · secondary hover bg base
    borderDisabled: '#d9dce0', // Disabled border for all variants
  },
} as const

// Full Tailwind 4px-unit spacing scale
// 1 unit = 4px → value in px = unit × 4
export const spacing = [
  0, 0.25, 0.5, 0.75,
  1, 1.25, 1.5, 1.75,
  2, 2.5, 3, 3.5,
  4, 5, 6, 7, 8, 9, 10,
  12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48,
  52, 56, 60, 64, 72, 80, 96,
] as const

export type SpacingUnit = (typeof spacing)[number]

export const radii = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  round: '64px',
} as const

// Typography — Mona Sans variable font
// Weights: 300 (Light) | 400 (Regular) | 600 (SemiBold) | 800 (ExtraBold)
export const typography = {
  fontFamily: 'Mona Sans, system-ui, sans-serif',
  weights: {
    light: 300,
    regular: 400,
    semibold: 600,
    extrabold: 800,
  },
  headings: [
    { name: 'H1', size: 28, lineHeight: 34, weight: 400 },
    { name: 'H2', size: 24, lineHeight: 30, weight: 400 },
    { name: 'H3', size: 20, lineHeight: 28, weight: 400 },
    { name: 'H4', size: 18, lineHeight: 24, weight: 400 },
    { name: 'H5', size: 18, lineHeight: 24, weight: 400 },
    { name: 'H6', size: 16, lineHeight: 24, weight: 400 },
  ] as const,
  body: [
    { name: 'Body XL', size: 18, lineHeight: 28, weights: [300, 400, 600, 800] },
    { name: 'Body LG', size: 16, lineHeight: 24, weights: [300, 400, 600, 800] },
    { name: 'Body MD', size: 14, lineHeight: 20, weights: [300, 400, 600, 800] },
    { name: 'Body SM', size: 12, lineHeight: 20, weights: [300, 400, 600, 800] },
    { name: 'Body XS', size: 10, lineHeight: 16, weights: [300, 400, 600, 800] },
  ] as const,
  captions: [
    { name: 'Caption Large', size: 12, lineHeight: 16, weight: 600, letterSpacing: '4px' },
    { name: 'Caption Regular', size: 10, lineHeight: 12, weight: 600, letterSpacing: '4px' },
    { name: 'Caption Small', size: 8, lineHeight: 12, weight: 600, letterSpacing: '4px' },
  ] as const,
} as const
