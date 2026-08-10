import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** A flight-manifest-style route code, e.g. "MGQ -> DXB". Real content, not a decorative icon. */
function RouteChip({ from, to, className }: { from: string; to: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-mono text-xs h-6 px-2.5 gap-1.5", className)}>
      {from}
      <span className="text-muted-foreground">→</span>
      {to}
    </Badge>
  )
}

export { RouteChip }
