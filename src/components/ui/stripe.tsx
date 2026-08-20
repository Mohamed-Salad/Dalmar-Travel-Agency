import { cn } from "@/lib/utils"

const VARIANTS = {
  "card-top": { size: "6px", tile: "14px", hole: "2.5px" },
  divider: { size: "12px", tile: "20px", hole: "4px" },
  section: { size: "3px", tile: "10px", hole: "1.5px" },
} as const

/**
 * Single-color die-cut perforation — the page's one signature motif, a row
 * of punched-out circular holes like a ticket stub tear line. `card-top`
 * sits atop a Card; `divider` marks a boundary between major regions
 * (works vertically too, for a stub/coupon split); `section` is a subtler
 * version for dividing fields within a form.
 */
function Stripe({
  variant = "card-top",
  orientation = "horizontal",
  className,
}: {
  variant?: keyof typeof VARIANTS
  orientation?: "horizontal" | "vertical"
  className?: string
}) {
  const { size, tile, hole } = VARIANTS[variant]
  const vertical = orientation === "vertical"
  const mask = `radial-gradient(circle at center, transparent 0 ${hole}, black calc(${hole} + 1px) 100%)`
  return (
    <div
      data-slot="stripe"
      data-variant={variant}
      data-orientation={orientation}
      className={cn(vertical ? "h-full" : "w-full", className)}
      style={{
        [vertical ? "width" : "height"]: size,
        background: "var(--primary)",
        maskImage: mask,
        maskSize: vertical ? `100% ${tile}` : `${tile} 100%`,
        maskRepeat: vertical ? "repeat-y" : "repeat-x",
        maskPosition: "center",
        WebkitMaskImage: mask,
        WebkitMaskSize: vertical ? `100% ${tile}` : `${tile} 100%`,
        WebkitMaskRepeat: vertical ? "repeat-y" : "repeat-x",
        WebkitMaskPosition: "center",
      }}
    />
  )
}

export { Stripe }
