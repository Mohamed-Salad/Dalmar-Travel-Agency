import { Plane } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A runway: two edge lines framing a dashed centerline, with a plane glyph
 * riding it — the app's "flight path" divider motif. `animated` sends the
 * plane traveling the full length on a slow loop (respects
 * prefers-reduced-motion, see index.css); static by default, matching the
 * original LandingPage usage. `delay` (seconds, use negative values) offsets
 * multiple animated dividers on the same page so they don't move in lockstep.
 *
 * Rotation (on the Plane itself) and travel (translate, on its wrapper) are
 * two different elements on purpose — both are CSS `transform`, and putting
 * them on one element means the animation's translate silently overwrites
 * the rotation every frame.
 */
function FlightDivider({
  orientation = "horizontal",
  animated = false,
  delay = 0,
  className,
}: {
  orientation?: "horizontal" | "vertical"
  animated?: boolean
  delay?: number
  className?: string
}) {
  const vertical = orientation === "vertical"
  const edge = vertical ? "border-x border-border" : "border-y border-border"
  const centerline = vertical
    ? "h-full border-l border-dashed border-primary/50"
    : "w-full border-t border-dashed border-primary/50"

  // lucide's Plane glyph is drawn pointing NE (-45deg) by default, so
  // reaching due-East (along a horizontal line) needs +45, and due-South
  // (down a vertical line) needs +135 — not the icon's own -45/+45 tilt
  // canceled out, since rotations compose rather than cancel.
  const plane = (
    <Plane className={cn("size-4 shrink-0 text-primary", vertical ? "rotate-[135deg]" : "rotate-45")} />
  )

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex items-center justify-center",
        edge,
        vertical ? "h-full w-6 flex-col" : "w-full py-1.5",
        className
      )}
    >
      <div className={centerline} />
      {animated ? (
        <div
          className={cn("absolute", vertical ? "left-1/2 fly-vertical" : "top-1/2 fly-horizontal")}
          style={{ animationDelay: `${delay}s` }}
        >
          {plane}
        </div>
      ) : (
        plane
      )}
    </div>
  )
}

export { FlightDivider }
