import { useState } from "react"
import { Link } from "react-router-dom"
import { Plane, Percent, Languages, type LucideIcon } from "lucide-react"
import { SiteHeader } from "@/components/ui/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Stat } from "@/components/ui/stat"
import { FlightDivider } from "@/components/ui/flight-divider"

type Lang = "en" | "so"
const L: Record<string, Record<Lang, string>> = {
  heroTitle:      { en: "Book your flight home.",                                                                          so: "Duulimaadkaaga guriga la aado, dalab." },
  heroSubtitle:   { en: "Discounted fares across Africa and the Middle East, found by an agent who knows the route — not a search engine.", so: "Qiimo dhimis ah oo loo duulo Afrika iyo Bariga Dhexe, uu helo wakiil aqoon u leh jidka — ma aha nidaam raadin oo otomaatig ah." },
  startInquiry:   { en: "Start an inquiry",                                                                                 so: "Bilow codsiga" },
  seeRoutes:      { en: "See routes we fly",                                                                                so: "Eeg jidadka aan duulno" },
  trustBody:      { en: "For over a decade, Dalmar Travel has booked flights for the Somali community — complex family itineraries, tight last-minute departures, and everything in between.", so: "In ka badan toban sano, Dalmar Travel wuxuu u qabsaday duulimaadyo bulshada Soomaalida — jadwallada qoyska ee adag, baxitaannada dhakhsaha ah ee daqiiqadda ugu dambeysa, iyo wax kasta oo u dhexeeya." },
  trustStat:      { en: "Years serving the community",                                                                     so: "Sannadood oo bulshada u adeegayay" },
  trustNote:      { en: "Every reservation is confirmed by a person who picks up the phone — not a chatbot.",               so: "Dalabkasta waxaa xaqiijiya qof ka jawaaba taleefanka — ma aha chatbot." },
  servicesTitle:  { en: "Why book with Dalmar",                                                                            so: "Maxaad Dalmar ugu dalban lahayd" },
  svc1Title:      { en: "Flights, our only focus",                                                                         so: "Duulimaad, waa waxa aan ku takhasusnahay" },
  svc1Desc:       { en: "We don't do hotels or car rentals — every hour goes into finding you the best route home.",       so: "Ma qabanno hoteel ama kirada gaadhi — saacad walba waxaa loo huray inaan kuu helno jidka ugu fiican ee guriga." },
  svc2Title:      { en: "Discounted Travelport rates",                                                                     so: "Qiimo dhimis Travelport" },
  svc2Desc:       { en: "Industry pricing most travelers can't access on their own, passed straight to you.",              so: "Qiimaha warshadaha ee dad badan aysan gaari karin iyaga keligood, oo si toos ah kuugu gudbiya." },
  svc3Title:      { en: "Somali & English, either way",                                                                    so: "Soomaali iyo Ingiriisi, midkastaba" },
  svc3Desc:       { en: "Talk to your agent in whichever language is easiest — nothing gets lost between you and your ticket.", so: "Kula hadal wakiilkaaga luuqadda kuu fudud — waxba ma lumayaan adiga iyo tigidhkaaga dhexdiisa." },
  routesTitle:    { en: "Routes we fly",                                                                                    so: "Jidadka aan duulno" },
  whatsappTitle:  { en: "Need instant support?",                                                                            so: "Ma u baahan tahay caawimaad degdeg ah?" },
  whatsappBody:   { en: "Message an agent directly on WhatsApp.",                                                           so: "Toos ula xiriir wakiil WhatsApp." },
  whatsappBtn:    { en: "WhatsApp us",                                                                                      so: "Nagala soo xiriir WhatsApp" },
  footerTagline:  { en: "Discounted airfare, 10+ years serving the community.",                                             so: "Qiimo duulimaad oo dhimis ah, in ka badan 10 sano oo bulshada u adeegaya." },
}
function tr(key: string, lang: Lang) { return L[key]?.[lang] ?? key }

const REGIONS: Record<Lang, { name: string; desc: string }[]> = {
  en: [
    { name: "Africa", desc: "Most of what we book — Mogadishu to Nairobi, Hargeisa, Addis Ababa, and every major hub across the continent." },
    { name: "Middle East", desc: "Dubai, Jeddah, Doha, Istanbul, and the rest of the region." },
  ],
  so: [
    { name: "Afrika", desc: "Inta badan ee aan dalabno — Muqdisho ilaa Nairobi, Hargeysa, Addis Ababa, iyo dekedaha waaweyn ee qaaradda oo dhan." },
    { name: "Bariga Dhexe", desc: "Dubai, Jeddah, Doha, Istanbul, iyo gobolka intiisa kale." },
  ],
}

function getServices(lang: Lang): { icon: LucideIcon; title: string; desc: string }[] {
  return [
    { icon: Plane, title: tr("svc1Title", lang), desc: tr("svc1Desc", lang) },
    { icon: Percent, title: tr("svc2Title", lang), desc: tr("svc2Desc", lang) },
    { icon: Languages, title: tr("svc3Title", lang), desc: tr("svc3Desc", lang) },
  ]
}

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
export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en")
  const services = getServices(lang)
  const regions = REGIONS[lang]

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
          <div className="mb-6 flex">
            <div className="flex rounded-md overflow-hidden border border-on-ink/20">
              {(["en", "so"] as Lang[]).map((l) => (
                <button key={l} type="button" onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-on-ink/60 hover:text-on-ink"}`}>
                  {l === "en" ? "English" : "Soomaali"}
                </button>
              ))}
            </div>
          </div>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-[0.95] tracking-tight">
            {tr("heroTitle", lang)}
          </h1>
          <p className="mt-6 max-w-lg text-on-ink/80 text-base leading-relaxed">
            {tr("heroSubtitle", lang)}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link to="/inquiry">{tr("startInquiry", lang)}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-on-ink/20 bg-transparent text-on-ink hover:bg-on-ink/10">
              <a href="#routes">{tr("seeRoutes", lang)}</a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {regions.map((r) => (
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
      <FlightDivider className="mx-auto max-w-6xl px-6" />

      {/* Trust — paper band, stat kept small/secondary, not the lead element */}
      <section id="trust" className="mx-auto max-w-6xl px-6 py-16">
        <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
          {tr("trustBody", lang)}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-4">
          <Stat value="10+" label={tr("trustStat", lang)} size="sm" />
          <p className="max-w-xs text-sm font-medium text-foreground">
            {tr("trustNote", lang)}
          </p>
        </div>
      </section>
      <FlightDivider className="mx-auto max-w-6xl px-6" />

      {/* Services — a departure-board row list, not an icon-circle grid */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
          {tr("servicesTitle", lang)}
        </h2>
        <div className="max-w-2xl">
          {services.map((s) => (
            <ServiceRow key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* Routes we fly — broad regions, not an enumerated (and implicitly limited) list */}
      <section id="routes" className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
          {tr("routesTitle", lang)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {regions.map((region) => (
            <div key={region.name}>
              <h3 className="font-display text-xl font-bold text-primary">{region.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{region.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <FlightDivider className="mx-auto max-w-6xl px-6" />

      {/* WhatsApp CTA */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Card>
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">{tr("whatsappTitle", lang)}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tr("whatsappBody", lang)}</p>
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
                {tr("whatsappBtn", lang)}
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
            <p className="text-sm text-muted-foreground mt-1">{tr("footerTagline", lang)}</p>
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
