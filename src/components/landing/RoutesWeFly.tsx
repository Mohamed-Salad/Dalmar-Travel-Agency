import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { RouteChip } from "@/components/ui/route-chip"

const REGIONS = [
  {
    name: "East Africa",
    routes: [
      { from: "MGQ", to: "NBO" },
      { from: "MGQ", to: "HGA" },
      { from: "MGQ", to: "JIB" },
    ],
  },
  {
    name: "Middle East",
    routes: [
      { from: "MGQ", to: "DXB" },
      { from: "MGQ", to: "JED" },
      { from: "MGQ", to: "IST" },
    ],
  },
]

function RoutesWeFly() {
  return (
    <section id="routes" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-display text-2xl font-bold text-foreground mb-10">Routes we fly</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {REGIONS.map((region) => (
          <Card key={region.name} className="border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle className="font-display text-base">{region.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-row flex-wrap gap-2">
              {region.routes.map((r) => (
                <RouteChip key={r.from + r.to} {...r} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

export { RoutesWeFly }
