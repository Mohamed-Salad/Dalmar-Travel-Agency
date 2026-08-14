import { Link } from "react-router-dom"
import { Plane, Percent, Languages, type LucideIcon } from "lucide-react"
import { SiteHeader } from "@/components/ui/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stat } from "@/components/ui/stat"

const REGIONS = [
  {
    name: "Africa",
    desc: "Most of what we book — Mogadishu to Nairobi, Hargeisa, Addis Ababa, and every major hub across the continent.",
  },
  {
    name: "Middle East",
    desc: "Dubai, Jeddah, Doha, Istanbul, and the rest of the region.",
  },
]

const SERVICES: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Plane,
    title: "Flights, our only focus",
    desc: "We don't do hotels or car rentals — every hour goes into finding you the best route home.",
  },
  {
    icon: Percent,
    title: "Discounted Travelport rates",
    desc: "Industry pricing most travelers can't access on their own, passed straight to you.",
  },
  {
    icon: Languages,
    title: "Somali & English, either way",
    desc: "Talk to your agent in whichever language is easiest — nothing gets lost between you and your ticket.",
  },
]

/** A departure-board row, not another icon-circle card — Schiphol's own
 * pictograms sit in square panels, not soft circles. */
function ServiceRow({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 py-5 border-t border-dashed border-border first:border-t-0">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

/** Section boundary: a flight path, not an unexplained color band. */
function FlightDivider() {
  return (
    <div className="mx-auto max-w-6xl px-6 flex items-center gap-4 py-2" aria-hidden="true">
      <div className="flex-1 border-t border-dashed border-border" />
      <Plane className="size-4 shrink-0 -rotate-45 text-primary" />
      <div className="flex-1 border-t border-dashed border-border" />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="theme-schiphol dot-field bg-background text-foreground">
      <SiteHeader variant="marketing" />

      {/* Hero — tarmac black */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--primary), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.95] tracking-tight max-w-3xl">
            Book your flight home.
          </h1>
          <p className="mt-6 max-w-lg text-on-ink/80 text-base leading-relaxed">
            Discounted fares across Africa and the Middle East, found by an agent who
            knows the route — not a search engine.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link to="/inquiry">Start an inquiry</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-on-ink/20 bg-transparent text-on-ink hover:bg-on-ink/10">
              <a href="#routes">See routes we fly</a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <Badge
                key={r.name}
                variant="outline"
                className="font-mono text-xs h-6 px-2.5 uppercase tracking-wider bg-transparent border-on-ink/15 text-on-ink"
              >
                {r.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>
      <FlightDivider />

      {/* Trust — paper band, stat kept small/secondary, not the lead element */}
      <section id="trust" className="mx-auto max-w-6xl px-6 py-16">
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
          For over a decade, Dalmar Travel has booked flights for the Somali community —
          complex family itineraries, tight last-minute departures, and everything in
          between.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Stat value="10+" label="Years serving the community" size="sm" />
          <p className="max-w-xs text-sm font-medium text-foreground">
            Every reservation is confirmed by a person who picks up the phone — not a
            chatbot.
          </p>
        </div>
      </section>
      <FlightDivider />

      {/* Services — a departure-board row list, not an icon-circle grid */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          Why book with Dalmar
        </h2>
        <div className="max-w-2xl">
          {SERVICES.map((s) => (
            <ServiceRow key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Routes we fly — broad regions, not an enumerated (and implicitly limited) list */}
      <section id="routes" className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          Routes we fly
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {REGIONS.map((region) => (
            <div key={region.name}>
              <h3 className="font-display text-xl font-bold text-primary">{region.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{region.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <FlightDivider />

      {/* WhatsApp CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Need instant support?</h3>
              <p className="text-sm text-muted-foreground mt-1">Message an agent directly on WhatsApp.</p>
            </div>
            <Button
              asChild
              className="bg-[#25D366] text-white hover:bg-[#25D366]/90 focus-visible:ring-[#25D366]/50"
            >
              <a
                href="https://wa.me/447000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp us
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer — text wordmark only */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-display font-bold">Dalmar Travel</div>
            <p className="text-sm text-muted-foreground mt-1">Discounted airfare, 10+ years serving the community.</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/inquiry" className="hover:text-foreground transition-colors">Make an inquiry</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Agent login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
