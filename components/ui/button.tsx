import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ─── CxPortal Button Variants ─────────────────────────────────────────────
// Source: Figma node 7-1306 (text) · 8-1645 / 8-1999 / 420-7038 (icon-only)
//
// Variants:  primary | secondary | form-controls | text
// Sizes:     regular (48px) | sm (36px) | xs (24px)
//            icon-regular (48×48) | icon-sm (36×36) | icon-xs (24×24)
// States:    default · hover · active · disabled
// ──────────────────────────────────────────────────────────────────────────

// Disabled triad — identical across every variant (flat neutral/disabled wash).
const disabledClasses = 'disabled:bg-[var(--content-action-disabled-100)] disabled:border-[var(--content-action-disabled-300)] disabled:text-[var(--content-action-disabled-700)]'

const primaryClasses = [
  'bg-[var(--content-action-primary-600)] border-[var(--content-action-primary-700)] text-[var(--text-on-action-primary)]',
  'hover:bg-[var(--content-action-primary-700)] hover:border-[var(--content-action-primary-700)]',
  'active:bg-[var(--content-action-primary-800)] active:border-[var(--content-action-primary-800)]',
  disabledClasses,
].join(' ')

const secondaryClasses = [
  'bg-transparent border-[var(--content-action-primary-default)] text-[var(--content-action-primary-default)]',
  'hover:bg-[var(--neutral-300)]/20',
  'active:bg-[var(--neutral-300)]/30 active:border-[var(--content-action-primary-600)]',
  disabledClasses,
].join(' ')

const textClasses = [
  'bg-transparent border-transparent text-[var(--content-action-primary-default)] font-semibold',
  'hover:bg-[var(--content-action-primary-100)]',
  'active:bg-[var(--content-action-primary-200)]',
  'disabled:bg-transparent disabled:border-transparent disabled:text-[var(--content-action-disabled-700)]',
].join(' ')

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-[8px] border',
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
        'form-controls': [
          'bg-[var(--neutral-100)] border-[var(--neutral-300)] text-[var(--text-body-primary)]',
          'hover:bg-[var(--neutral-200)] hover:border-[var(--neutral-400)]',
          'active:bg-[var(--neutral-300)] active:border-[var(--neutral-400)]',
          'focus-visible:border-[var(--content-action-primary-600)]',
          disabledClasses,
        ].join(' '),

        // ── Text ────────────────────────────────────────────────────────
        text: textClasses,

        // ── Destructive ──────────────────────────────────────────────────
        // Default/Active: Error/500 bg · Error/600 border · On Action/Primary text
        // Hover: reverses to Error/300 bg · Error/200 border · dark text for WCAG AA
        destructive: [
          'bg-[var(--error-500)] border-[var(--error-600)] text-[var(--text-on-action-primary)]',
          'hover:bg-[var(--error-300)] hover:border-[var(--error-200)] hover:text-[var(--text-body-primary)]',
          'active:bg-[var(--error-500)] active:border-[var(--error-600)] active:text-[var(--text-on-action-primary)]',
          'focus-visible:ring-[var(--error-500)]/50',
          disabledClasses,
        ].join(' '),

        // ── Colored Background ───────────────────────────────────────────
        // For use on non-white surfaces (hero banners, colored cards). Small only.
        'colored-bg': [
          'bg-[var(--neutral-0)] border-[var(--content-action-primary-600)] text-[var(--content-action-primary-default)]',
          'hover:bg-[var(--content-action-primary-600)] hover:border-[var(--content-action-primary-600)] hover:text-[var(--text-on-action-primary)]',
          'active:bg-[var(--neutral-50)] active:border-[var(--neutral-300)] active:text-[var(--content-action-primary-default)]',
          'focus-visible:ring-[var(--content-action-primary-600)]/50',
          disabledClasses,
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

        // Regular — 48px · Body MD (14px/20px) · 8px icon gap
        regular: [
          'h-12 px-5 gap-2',
          'text-sm leading-5',
          "[&_svg:not([class*='size-'])]:size-5",
        ].join(' '),

        // Small — 36px · Body SM (12px/20px) · 6px icon gap
        sm: [
          'h-9 px-4 gap-1.5',
          'text-xs leading-5',
          "[&_svg:not([class*='size-'])]:size-4",
        ].join(' '),

        // Extra Small — 24px · Body XS (10px/16px) · 4px icon gap
        xs: [
          'h-6 px-3 gap-1',
          'text-[10px] leading-4',
          "[&_svg:not([class*='size-'])]:size-3.5",
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

export type ButtonVariant = 'primary' | 'secondary' | 'form-controls' | 'text' | 'destructive' | 'colored-bg' | 'primary-central' | 'secondary-central' | 'text-central'
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
