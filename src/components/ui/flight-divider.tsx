import { Plane } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Dashed line + a plane glyph — the app's "flight path" divider motif.
 * `animated` sends the plane traveling the full length of the line on a
 * slow loop (respects prefers-reduced-motion, see index.css); static by
 * default, matching the original LandingPage usage.
 */
function FlightDivider({
  orientation = "horizontal",
  animated = false,
  className,
}: {
  orientation?: "horizontal" | "vertical"
  animated?: boolean
  className?: string
}) {
  const vertical = orientation === "vertical"
  const line = vertical ? "flex-1 border-l border-dashed border-border" : "flex-1 border-t border-dashed border-border"

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex items-center justify-center",
        vertical ? "h-full w-4 flex-col" : "w-full py-2",
        className
      )}
    >
      <div className={line} />
      <Plane
        className={cn(
          "size-4 shrink-0 text-primary",
          vertical ? "rotate-45" : "-rotate-45",
          animated && (vertical ? "absolute top-1/2 fly-vertical" : "absolute left-1/2 fly-horizontal")
        )}
      />
      <div className={line} />
    </div>
  )
}

export { FlightDivider }
