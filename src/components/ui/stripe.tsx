import { cn } from "@/lib/utils"

const STRIPE_GRADIENT =
  "repeating-linear-gradient(-45deg, var(--primary) 0 10px, var(--destructive) 10px 20px, var(--background) 20px 24px, var(--destructive) 24px 34px, var(--primary) 34px 44px, var(--background) 44px 48px)"

const VARIANTS = {
  "card-top": { height: "6px", tile: "14px", hole: "2.5px" },
  divider: { height: "12px", tile: "20px", hole: "4px" },
} as const

/**
 * The airmail-envelope stripe — the page's one signature motif, cut with a
 * row of perforation holes like a ticket stub. `card-top` sits atop a Card
 * (thin); `divider` marks a section boundary on the page (thicker).
 */
function Stripe({
  variant = "card-top",
  className,
}: {
  variant?: keyof typeof VARIANTS
  className?: string
}) {
  const { height, tile, hole } = VARIANTS[variant]
  const mask = `radial-gradient(circle at center, transparent 0 ${hole}, black calc(${hole} + 1px) 100%)`
  return (
    <div
      data-slot="stripe"
      data-variant={variant}
      className={cn("w-full", className)}
      style={{
        height,
        background: STRIPE_GRADIENT,
        maskImage: mask,
        maskSize: `${tile} 100%`,
        maskRepeat: "repeat-x",
        maskPosition: "center",
        WebkitMaskImage: mask,
        WebkitMaskSize: `${tile} 100%`,
        WebkitMaskRepeat: "repeat-x",
        WebkitMaskPosition: "center",
      }}
    />
  )
}

export { Stripe }
