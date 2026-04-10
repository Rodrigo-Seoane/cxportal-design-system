'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SpinnerGapIcon } from '@phosphor-icons/react'

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  skeletonBg:   '#eff1f3',  // Neutral-100
  spinnerColor: '#4285f4',  // primary blue
} as const

// ── Skeleton ───────────────────────────────────────────────────────────────────

/**
 * Maps typographic scale names to their line-height values (px).
 * Use these as skeleton heights so placeholder lines match real text rhythm.
 */
const TEXT_HEIGHT: Record<string, number> = {
  caption:  12,
  'body-sm': 14,
  body:     16,
  h3:       20,
  h2:       24,
  h1:       28,
}

export interface SkeletonProps {
  /**
   * `rect`   — rectangle (cards, images, buttons). Default border-radius: 8px.
   * `circle` — circle (avatars, icons, status indicators). border-radius: 50%.
   * `text`   — narrow rectangle (text lines). Default border-radius: 4px.
   */
  variant?: 'rect' | 'circle' | 'text'
  width?: number | string
  height?: number | string
  /**
   * For `text` variant: sets height to match a typographic scale step.
   * One of: caption | body-sm | body | h3 | h2 | h1
   */
  textSize?: keyof typeof TEXT_HEIGHT
  /** Override computed border-radius. */
  radius?: number | string
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  textSize,
  radius,
  className,
  style,
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion()

  // Resolve height
  const resolvedHeight =
    height ??
    (variant === 'text' && textSize
      ? TEXT_HEIGHT[textSize]
      : variant === 'circle'
      ? (typeof width === 'number' ? width : 40)
      : 16)

  // Resolve border-radius
  const resolvedRadius =
    radius ??
    (variant === 'circle' ? '50%' : variant === 'text' ? 4 : 8)

  // Resolve width — circles need explicit width = height
  const resolvedWidth =
    width ??
    (variant === 'circle' ? resolvedHeight : '100%')

  return (
    <motion.div
      aria-hidden="true"
      className={className}
      style={{
        background: T.skeletonBg,
        borderRadius: resolvedRadius,
        width: resolvedWidth,
        height: resolvedHeight,
        flexShrink: 0,
        ...style,
      }}
      animate={prefersReducedMotion ? {} : { opacity: [1, 0.4, 1] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1],
      }}
    />
  )
}

// ── Spinner ────────────────────────────────────────────────────────────────────

const SPINNER_SIZES = {
  xs: { px: 12, stroke: 1.5 },
  sm: { px: 16, stroke: 2   },
  md: { px: 24, stroke: 2.5 },
  lg: { px: 32, stroke: 3   },
  xl: { px: 48, stroke: 4   },
} as const

export type SpinnerSize = keyof typeof SPINNER_SIZES

export interface SpinnerProps {
  /** xs → Inputs/Selects · sm → Buttons/Inline · md → Default · lg → Section · xl → Full page */
  size?: SpinnerSize
  /** Override spinner arc colour. Defaults to primary blue. */
  color?: string
  /** Accessible label announced to screen readers. Default: "Loading". */
  label?: string
  className?: string
  style?: React.CSSProperties
}

export function Spinner({
  size = 'md',
  color = T.spinnerColor,
  label = 'Loading',
  className,
  style,
}: SpinnerProps) {
  const prefersReducedMotion = useReducedMotion()
  const { px } = SPINNER_SIZES[size]

  return (
    <motion.span
      role="status"
      aria-label={label}
      className={className}
      style={{ display: 'inline-flex', flexShrink: 0, ...style }}
      animate={prefersReducedMotion ? {} : { rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <SpinnerGapIcon size={px} color={color} weight="bold" />
    </motion.span>
  )
}
