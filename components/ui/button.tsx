import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── CxPortal Button Variants ─────────────────────────────────────────────
// Source: Figma nodes 8-1643 (Regular) · 8-1934 (Small) · 420-6941 (Extra Small)
//         8-1645 (icons Regular) · 420-7038 (icons Extra Small)
//
// Variants:  primary | secondary | form-controls | text | destructive |
//            secondary-destructive | text-destructive | colored-bg
// Sizes:     regular (48px) | sm (36px) | xs (24px)
//            icon-regular (48×48) | icon-sm (36×36) | icon-xs (24×24)
// States:    default · hover · active · disabled
// ──────────────────────────────────────────────────────────────────────────

// Each variant's disabled state is tinted to match its own color family per
// Figma — there is no shared neutral disabled wash across variants.

const primaryClasses = [
  'bg-[var(--content-action-primary-default)] border-[var(--content-action-primary-300)] text-[var(--text-on-action-primary)]',
  'hover:bg-[var(--content-action-primary-500)] hover:border-[var(--content-action-primary-500)]',
  'active:bg-[var(--content-action-primary-default)] active:border-[var(--content-action-primary-300)]',
  'disabled:bg-[var(--surface-action-primary-disabled)] disabled:border-[var(--border-color-surface-active-primary-disabled)] disabled:text-[var(--text-on-action-primary)]',
].join(' ')

const secondaryClasses = [
  'bg-[var(--surface-action-secondary-default)] border-[var(--content-action-primary-300)] text-[var(--content-action-primary-default)]',
  'hover:bg-[var(--surface-action-secondary-hover)] hover:border-[var(--content-action-primary-500)] hover:text-[var(--text-form-field-hover)]',
  'active:bg-[var(--surface-action-secondary-default)] active:border-[var(--content-action-primary-300)] active:text-[var(--content-action-primary-default)]',
  'disabled:bg-[var(--surface-action-secondary-disabled)] disabled:border-[var(--border-color-surface-active-secondary-disabled)] disabled:text-[var(--text-on-action-disabled)]',
].join(' ')

// Only Text has no background tint on hover/active in Figma — just a text-color shift.
const textClasses = [
  'bg-transparent border-transparent text-[var(--content-action-primary-default)] font-semibold',
  'hover:text-[var(--text-form-field-hover)]',
  'active:text-[var(--content-action-primary-default)]',
  'disabled:bg-transparent disabled:border-transparent disabled:text-[var(--text-on-action-disabled)]',
].join(' ')

const secondaryDestructiveClasses = [
  'bg-[var(--surface-action-secondary-default)] border-[var(--border-color-accent-error-light)] text-[var(--text-error)]',
  'hover:bg-[var(--surface-action-secondary-hover)] hover:border-[var(--border-color-accent-error-light)] hover:text-[var(--error-200)]',
  'active:bg-[var(--surface-action-secondary-default)] active:border-[var(--border-color-accent-error-light)] active:text-[var(--text-error)]',
  'disabled:bg-[var(--surface-action-secondary-default)] disabled:border-[var(--error-100)] disabled:text-[var(--error-100)]',
].join(' ')

// Only Text Destructive: no background tint on hover/active, matching Only Text.
const textDestructiveClasses = [
  'bg-transparent border-transparent text-[var(--text-error)] font-semibold',
  'hover:text-[var(--error-600)]',
  'active:text-[var(--text-error)]',
  'disabled:bg-transparent disabled:border-transparent disabled:text-[var(--error-100)]',
].join(' ')

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'border',
    'font-sans whitespace-nowrap select-none',
    'transition-colors duration-150',
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--content-action-primary-600)]/50 focus-visible:ring-offset-1',
    'disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // ── Primary ─────────────────────────────────────────────────────
        primary: primaryClasses,

        // ── Secondary ───────────────────────────────────────────────────
        secondary: secondaryClasses,

        // ── Form Controls ────────────────────────────────────────────────
        // Active shares Default's bg/border but Hover's text color, per Figma.
        'form-controls': [
          'bg-[var(--surface-action-terciary-default)] border-[var(--border-color-surface-active-secondary-default)] text-[var(--neutral-800)]',
          'hover:bg-[var(--surface-action-terciary-hover)] hover:border-[var(--border-color-surface-active-secondary-hover)] hover:text-[var(--text-on-action-secondary)]',
          'active:bg-[var(--surface-action-terciary-default)] active:border-[var(--border-color-surface-active-secondary-default)] active:text-[var(--text-on-action-secondary)]',
          'focus-visible:border-[var(--content-action-primary-default)]',
          'disabled:bg-[var(--surface-action-terciary-disabled)] disabled:border-[var(--border-color-surface-active-terciary-disabled)] disabled:text-[var(--text-on-action-disabled)]',
        ].join(' '),

        // ── Text ────────────────────────────────────────────────────────
        text: textClasses,

        // ── Destructive (Primary Destructive) ────────────────────────────
        // Default/Active share the same solid-red look; Hover darkens further.
        destructive: [
          'bg-[var(--surface-action-destructive-default)] border-[var(--border-color-accent-error-dark)] text-[var(--text-on-action-primary)]',
          'hover:bg-[var(--surface-action-destructive-hover)] hover:border-[var(--border-color-accent-error-dark-hover)]',
          'active:bg-[var(--surface-action-destructive-default)] active:border-[var(--border-color-accent-error-dark)]',
          'focus-visible:ring-[var(--error-500)]/50',
          'disabled:bg-[var(--error-200)] disabled:border-[var(--error-300)] disabled:text-[var(--text-on-action-primary)]',
        ].join(' '),

        // ── Secondary Destructive ─────────────────────────────────────────
        'secondary-destructive': secondaryDestructiveClasses,

        // ── Only Text Destructive ─────────────────────────────────────────
        'text-destructive': textDestructiveClasses,

        // ── Colored Background ───────────────────────────────────────────
        // For use on non-white surfaces (hero banners, colored cards). No border.
        'colored-bg': [
          'bg-[var(--surface-action-secondary-default)] border-transparent text-[var(--content-action-primary-default)]',
          'hover:bg-[var(--surface-action-secondary-hover)] hover:border-transparent hover:text-[var(--text-form-field-hover)]',
          'active:bg-[var(--surface-action-secondary-default)] active:border-transparent active:text-[var(--content-action-primary-default)]',
          'focus-visible:ring-[var(--content-action-primary-600)]/50',
          'disabled:bg-[var(--surface-disabled)] disabled:border-transparent disabled:text-[var(--text-on-action-disabled)]',
        ].join(' '),

        // ── CxCentral variants ────────────────────────────────────────────
        // Figma's Semantic collection no longer models a distinct CxCentral
        // product identity (Context modes were removed in the Caylent
        // rebrand) — these collapse onto the same Content Action/Primary
        // tokens as the main variants above. Kept as separate variant keys
        // for API compatibility with existing Access Management call sites.
        'primary-central': primaryClasses,
        'secondary-central': secondaryClasses,
        'text-central': textClasses,
      },

      size: {
        // ── Text + label sizes ───────────────────────────────────────────

        // Regular — 48px · Body MD (14px/20px) · 12px padding · 8px icon gap
        regular: [
          'h-12 p-3 gap-2 rounded-[8px]',
          'text-sm leading-5',
          "[&_svg:not([class*='size-'])]:size-6",
        ].join(' '),

        // Small — 32px · Body SM (12px/20px) · 8px padding · 8px icon gap
        sm: [
          'h-8 p-2 gap-2 rounded-[8px]',
          'text-xs leading-5',
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(' '),

        // Extra Small — 24px · Body XS (10px/16px) · 8px/4px padding · 8px icon gap
        xs: [
          'h-6 px-2 py-1 gap-2 rounded-[4px]',
          'text-[10px] leading-4',
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(' '),

        // ── Icon-only sizes (square, no label) ───────────────────────────
        // Figma: regular → radius 8px · sm/xs → radius 4px

        // Icon Regular — 48×48 · icon 24px · radius 8px
        'icon-regular': [
          'size-12 p-0 rounded-[8px]',
          "[&_svg:not([class*='size-'])]:size-6",
        ].join(' '),

        // Icon Small — 36×36 · icon 18px · radius 4px
        'icon-sm': [
          'size-9 p-0 rounded-[4px]',
          "[&_svg:not([class*='size-'])]:size-[18px]",
        ].join(' '),

        // Icon XSmall — 24×24 · icon 16px · radius 4px
        'icon-xs': [
          'size-6 p-0 rounded-[4px]',
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'regular',
    },
  }
)

export type ButtonVariant = 'primary' | 'secondary' | 'form-controls' | 'text' | 'destructive' | 'secondary-destructive' | 'text-destructive' | 'colored-bg' | 'primary-central' | 'secondary-central' | 'text-central'
export type ButtonSize = 'regular' | 'sm' | 'xs' | 'icon-regular' | 'icon-sm' | 'icon-xs'

function Button({
  className,
  variant = 'primary',
  size = 'regular',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
