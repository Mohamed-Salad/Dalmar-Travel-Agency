import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PassengerCounter } from '@/components/inquiry/PassengerCounter'
import { FlightDivider } from '@/components/ui/flight-divider'
import { SiteHeader } from '@/components/ui/site-header'
import { cn } from '@/lib/utils'
import { CITIES } from '@/lib/cities'

const LABEL_CLS = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground'
const EYEBROW_CLS = 'font-mono text-sm md:text-base font-bold uppercase tracking-widest text-primary'
const SECTION_CLS = 'flex flex-col gap-4'

type Step = 'form' | 'success'
type Lang = 'en' | 'so'

const PASSENGER_TYPES = [
  { key: 'adults', en: 'Adults', so: 'Waaweyn', sub: '16+', min: 1 },
  { key: 'youth', en: 'Youth', so: 'Dhalinyaro', sub: '12–15', min: 0 },
  { key: 'children', en: 'Children', so: 'Carruur', sub: '2–11', min: 0 },
  { key: 'infants', en: 'Infants', so: 'Ilmo yar', sub: '0–2', min: 0 },
] as const

export default function InquiryPage() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOneWay, setIsOneWay] = useState(false)
  const [lang, setLang] = useState<Lang>('en')

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    departure_city: '', destination_city: '',
    earliest_departure: '', latest_departure: '',
    earliest_return: '', latest_return: '',
    notes: '',
  })
  const [passengers, setPassengers] = useState({ adults: 1, youth: 0, children: 0, infants: 0 })

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const totalPax = passengers.adults + passengers.youth + passengers.children + passengers.infants

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const customerId = crypto.randomUUID()
      const { error: cErr } = await supabase
        .from('customers')
        .insert({ id: customerId, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null })
      if (cErr) throw cErr

      // Strip the "(CODE)" suffix if the customer picked a suggestion from the
      // datalist — keeps stored city names consistent with QuotePage's format
      // (agents shouldn't see "Mogadishu (MGQ)" on some rows and "Mogadishu" on
      // others depending on which form the request came in through).
      const cleanCity = (v: string) => v.replace(/\s*\(.*?\)\s*$/, '').trim() || v.trim()

      const { error: rErr } = await supabase.from('booking_requests').insert({
        customer_id: customerId,
        departure_city: cleanCity(form.departure_city),
        destination_city: cleanCity(form.destination_city),
        earliest_departure: form.earliest_departure,
        latest_departure: form.latest_departure,
        earliest_return: isOneWay ? null : form.earliest_return || null,
        latest_return: isOneWay ? null : form.latest_return || null,
        notes: form.notes.trim() || null,
        adults: passengers.adults, youth: passengers.youth,
        children: passengers.children, infants: passengers.infants,
      })
      if (rErr) throw rErr
      setStep('success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="theme-schiphol dot-field min-h-screen flex flex-col items-center justify-center px-6 bg-background text-foreground">
        <Card className="max-w-md w-full text-center p-4">
          <CardContent className="items-center">
            <h1 className="font-display text-xl font-bold text-foreground mb-2">
              {lang === 'en' ? 'Inquiry submitted' : 'Codsi La Diray!'}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === 'en'
                ? 'One of our agents will review your request and contact you shortly on the number you provided.'
                : 'Mid ka mid ah wakiiladeenna ayaa dib kugu soo wici doona lambarka aad bixisay.'}
            </p>
            <Button asChild>
              <Link to="/">{lang === 'en' ? 'Back to home' : 'Ku Noqo Bogga Hore'}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="theme-schiphol dot-field min-h-screen bg-background text-foreground">
      <SiteHeader variant="minimal" />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl font-bold leading-[1.05] tracking-tight text-foreground max-w-2xl">
          {lang === 'en' ? 'Request your travel quote' : 'Codsiga Qiimaha Safarkaaga'}
        </h1>
        <p className="text-base text-muted-foreground mt-4 mb-12 max-w-lg">
          {lang === 'en'
            ? 'Fill out the form below and our agents will find the best rates for your journey.'
            : 'Buuxi foomka hoose, wakiiladeenuna waxay helayaan qiimaha ugu fiican safarkaaga.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Ticket: stub (language + how it works) + coupon (the fields), split by a perforation */}
          <Card className="pt-0 overflow-hidden">
            <FlightDivider animated />
            <div className="grid grid-cols-1 md:grid-cols-[240px_12px_1fr]">
              {/* Stub */}
              <div className="flex flex-col gap-6 px-6 py-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Language</span>
                  <div className="flex rounded-md border border-border overflow-hidden">
                    {(['en', 'so'] as Lang[]).map((l) => (
                      <button key={l} type="button" onClick={() => setLang(l)}
                        className={`px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        {l === 'en' ? 'EN' : 'SO'}
                      </button>
                    ))}
                  </div>
                </div>
                <FlightDivider />
                <div className="flex flex-col gap-3">
                  <p className="font-display text-sm font-semibold text-foreground">
                    {lang === 'en' ? 'How it works' : 'Sida Loo Shaqeeyo'}
                  </p>
                  {[
                    lang === 'en' ? 'Submit your request' : 'Dir codsigaaga',
                    lang === 'en' ? 'We find best fares' : 'Waxaan helaa qiimo fiican',
                    lang === 'en' ? 'Agent calls you back' : 'Wakiil ku soo wacaa',
                  ].map((text, i) => (
                    <div key={text} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-primary">0{i + 1}</span>
                      <span className="text-sm text-muted-foreground">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <FlightDivider orientation="vertical" animated className="hidden md:block justify-self-center" />
              <FlightDivider animated className="md:hidden" />

              {/* Coupon */}
              <div className="flex flex-col gap-6 px-6 py-8 md:px-8 md:py-10">
                {/* Contact */}
                <div className={SECTION_CLS}>
                  <p className={EYEBROW_CLS}>{lang === 'en' ? 'Contact' : 'Xiriirka'}</p>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="name" className={LABEL_CLS}>{lang === 'en' ? 'Full name' : 'Magacaaga Buuxa'}</Label>
                    <Input id="name" required autoComplete="name" variant="underline" value={form.name} onChange={set('name')}
                      placeholder={lang === 'en' ? 'e.g. Faadumo Warsame' : 'Tusaale: Faadumo Warsame'} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="phone" className={LABEL_CLS}>{lang === 'en' ? 'Phone / WhatsApp' : 'Telefoon'}</Label>
                      <Input id="phone" required type="tel" autoComplete="tel" variant="underline" value={form.phone} onChange={set('phone')} placeholder="+252 ..." />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="email" className={LABEL_CLS}>{lang === 'en' ? 'Email (optional)' : 'Email (ikhtiyaari)'}</Label>
                      <Input id="email" type="email" autoComplete="email" variant="underline" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                    </div>
                  </div>
                </div>

                <FlightDivider />

                {/* Route */}
                <div className={SECTION_CLS}>
                  <p className={EYEBROW_CLS}>{lang === 'en' ? 'Route' : 'Waddada'}</p>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { field: 'departure_city' as const, en: 'Flying from', so: 'Ka Duulaya', ph: 'e.g. London (LHR)' },
                      { field: 'destination_city' as const, en: 'Flying to', so: 'U Duulaya', ph: 'e.g. Mogadishu (MGQ)' },
                    ].map(({ field, en, so, ph }) => (
                      <div key={field} className="flex flex-col gap-1.5">
                        <Label htmlFor={field} className={LABEL_CLS}>{lang === 'en' ? en : so}</Label>
                        <Input id={field} required variant="underline" className="font-mono" value={form[field]} onChange={set(field)}
                          list={`${field}-list`} placeholder={ph} />
                        <datalist id={`${field}-list`}>{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                      </div>
                    ))}
                  </div>
                </div>

                <FlightDivider />

                {/* Passengers */}
                <div className={SECTION_CLS}>
                  <div className="flex items-center justify-between">
                    <p className={EYEBROW_CLS}>{lang === 'en' ? 'Passengers' : 'Rakaabka'}</p>
                    <span className="text-xs font-medium text-muted-foreground">
                      {totalPax} {lang === 'en' ? 'total' : 'wadarta'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {PASSENGER_TYPES.map(({ key, en, so, sub, min }) => (
                      <PassengerCounter key={key} label={lang === 'en' ? en : so} sub={sub}
                        value={passengers[key]} min={min}
                        onChange={(next) => setPassengers((p) => ({ ...p, [key]: next }))} />
                    ))}
                  </div>
                </div>

                <FlightDivider />

                {/* Dates */}
                <div className={SECTION_CLS}>
                  <div className="flex items-center justify-between">
                    <p className={EYEBROW_CLS}>{lang === 'en' ? 'Travel dates' : 'Taariikhaha Safarka'}</p>
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input type="checkbox" checked={isOneWay} onChange={(e) => setIsOneWay(e.target.checked)} />
                      {lang === 'en' ? 'One-way trip' : 'Hal Taraf'}
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {lang === 'en' ? 'Departure window' : 'Muddada Baxitaanka'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['earliest_departure', 'latest_departure'] as const).map((f, i) => (
                          <Input key={f} required type="date" variant="underline" className="font-mono" value={form[f]} onChange={set(f)}
                            min={new Date().toISOString().split('T')[0]}
                            aria-label={i === 0 ? 'Earliest' : 'Latest'} />
                        ))}
                      </div>
                    </div>
                    {!isOneWay && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {lang === 'en' ? 'Return window' : 'Muddada Noqoshada'}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(['earliest_return', 'latest_return'] as const).map((f, i) => (
                            <Input key={f} type="date" variant="underline" className="font-mono" value={form[f]} onChange={set(f)}
                              min={form.earliest_departure || new Date().toISOString().split('T')[0]}
                              aria-label={i === 0 ? 'Earliest' : 'Latest'} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <FlightDivider />

                {/* Notes */}
                <div className={cn(SECTION_CLS, 'gap-1.5')}>
                  <Label htmlFor="notes" className={LABEL_CLS}>{lang === 'en' ? 'Additional notes (optional)' : 'Faallo Dheeraad Ah'}</Label>
                  <Textarea id="notes" variant="underline" value={form.notes} onChange={set('notes')} rows={3}
                    placeholder={lang === 'en' ? 'e.g. Prefer morning flights, specific airline...' : 'Tusaale: Dulimaadka subaxda...'} />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </Card>

          <Card className="text-center py-12">
            <CardContent>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                {lang === 'en' ? 'Ready to find your flight?' : 'Ma diyaar baad u tahay?'}
              </h3>
              <p className="text-base text-muted-foreground max-w-md mx-auto mb-8">
                {lang === 'en'
                  ? 'Once you submit, our agents search all available airlines and contact you via WhatsApp within 2 hours.'
                  : 'Markaad dirto, wakiiladeenna ayaa raadinaya dhamaan dulimaadyada oo kuugu soo wacaya 2 saac gudahood.'}
              </p>
              <Button type="submit" size="lg" disabled={loading}>
                {loading
                  ? (lang === 'en' ? 'Submitting...' : 'La dirayo...')
                  : (lang === 'en' ? 'Submit quote request' : 'Dir Codsiga Qiimaha')}
              </Button>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  )
}
