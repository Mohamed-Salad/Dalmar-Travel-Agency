import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Stripe } from "@/components/ui/stripe"
import { RouteChip } from "@/components/ui/route-chip"

const ROUTES = [
  { from: "MGQ", to: "DXB" },
  { from: "NBO", to: "IST" },
  { from: "HGA", to: "JED" },
]

function Hero() {
  return (
    <section className="relative bg-dusk text-on-dusk overflow-hidden">
      <Stripe />
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight max-w-2xl">
          Book your flight home.
        </h1>
        <p className="mt-4 max-w-lg text-on-dusk/80 text-base leading-relaxed">
          Discounted fares to East Africa and the Middle East, found by an agent who
          knows the route — not a search engine.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link to="/inquiry">Start an inquiry</Link>
          </Button>
          <span className="text-sm text-on-dusk/70">10+ years serving the community</span>
        </div>
        <div className="mt-10 flex flex-wrap gap-2">
          {ROUTES.map((r) => (
            <RouteChip key={r.from + r.to} {...r} className="bg-transparent border-white/15 text-on-dusk" />
          ))}
        </div>
      </div>
    </section>
  )
}

export { Hero }
