import { cn } from "@/lib/utils"

/** A number + label block — trust stats today, dashboard KPIs later. */
function Stat({
  value,
  label,
  size = "default",
  className,
}: {
  value: string
  label: string
  size?: "default" | "sm"
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className={cn("font-mono font-bold text-foreground tabular-nums", size === "sm" ? "text-2xl" : "text-3xl")}>
        {value}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  )
}

export { Stat }
