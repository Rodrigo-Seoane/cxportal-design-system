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

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-[8px] border',
    'font-sans whitespace-nowrap select-none',
    'transition-colors duration-150',
    'outline-none',
    'focus-visible:ring-2 focus-visible:ring-[#4285f4]/50 focus-visible:ring-offset-1',
    'disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        // ── Primary ─────────────────────────────────────────────────────
        primary: [
          'bg-[#4285f4] border-[#689df6] text-[#eff1f3]',
          'hover:bg-[#689df6] hover:border-[#689df6]',
          'active:bg-[#3264b8] active:border-[#3264b8]',
          'disabled:bg-[#eff1f3] disabled:border-[#d9dce0] disabled:text-[#aab0b8]',
        ].join(' '),

        // ── Secondary ───────────────────────────────────────────────────
        secondary: [
          'bg-transparent border-[#689df6] text-[#3264b8]',
          'hover:bg-[#aab0b8]/20',
          'active:bg-[#aab0b8]/30 active:border-[#3264b8]',
          'disabled:bg-[#eff1f3] disabled:border-[#d9dce0] disabled:text-[#aab0b8]',
        ].join(' '),

        // ── Form Controls ────────────────────────────────────────────────
        'form-controls': [
          'bg-[#eff1f3] border-[#aab0b8] text-[#021920]',
          'hover:bg-[#e2e5e8] hover:border-[#7a828c]',
          'active:bg-[#d4d8dc] active:border-[#7a828c]',
          'focus-visible:border-[#4285f4]',
          'disabled:bg-[#eff1f3] disabled:border-[#d9dce0] disabled:text-[#aab0b8]',
        ].join(' '),

        // ── Text ────────────────────────────────────────────────────────
        text: [
          'bg-transparent border-transparent text-[#3264b8] font-semibold',
          'hover:bg-[#eef3fd]',
          'active:bg-[#dce8fb]',
          'disabled:bg-transparent disabled:border-transparent disabled:text-[#aab0b8]',
        ].join(' '),
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

export type ButtonVariant = 'primary' | 'secondary' | 'form-controls' | 'text'
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
