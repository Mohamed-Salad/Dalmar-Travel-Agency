import { Button } from "@/components/ui/button"

function PassengerCounter({
  label,
  sub,
  value,
  min,
  onChange,
}: {
  label: string
  sub: string
  value: number
  min: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="icon-sm"
          disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </Button>
        <span className="w-4 text-center text-sm font-medium text-foreground">{value}</span>
        <Button type="button" size="icon-sm" onClick={() => onChange(value + 1)}>
          +
        </Button>
      </div>
    </div>
  )
}

export { PassengerCounter }
