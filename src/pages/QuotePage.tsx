import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { CITIES } from '../lib/cities';
import { parseQuickCapture } from '../lib/quoteCapture';
import { PassengerCounter } from '@/components/inquiry/PassengerCounter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlaneTakeoff, PlaneLanding, Phone, CheckCircle2, AlertCircle, ShieldCheck, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

type Lang = 'en' | 'so';
const L: Record<string, Record<Lang, string>> = {
  title:      { en: 'Request Your Travel Quote',                               so: 'Codsiga Qiimaha Safarkaaga' },
  subtitle:   { en: 'Fill out the form and agents will find the best rates.',  so: 'Buuxi foomka, wakiiladeenuna waxay helayaan qiimaha ugu fiican.' },
  phone:      { en: 'Phone / WhatsApp',                                        so: 'Telefoon / WhatsApp' },
  email:      { en: 'Email Address',                                           so: 'Ciwaanka Emailka' },
  from:       { en: 'Departure City',                                          so: 'Magaalada Kaxaynta' },
  to:         { en: 'Destination City',                                        so: 'Magaalada Aadista' },
  earlyDep:   { en: 'Earliest Departure',                                      so: 'Taariikhda Ugu Horreysa' },
  lateDep:    { en: 'Latest Departure',                                        so: 'Taariikhda Ugu Dambeeysa' },
  earlyRet:   { en: 'Earliest Return',                                         so: 'Taariikhda Noqoshada Ugu Horreysa' },
  lateRet:    { en: 'Latest Return',                                           so: 'Taariikhda Noqoshada Ugu Dambeeysa' },
  adults:     { en: 'Adults',                                                  so: 'Waaweyn' },
  youth:      { en: 'Youth',                                                   so: 'Dhalinyaro' },
  children:   { en: 'Children',                                                so: 'Carruur' },
  infants:    { en: 'Infants',                                                 so: 'Ilmo yar' },
  oneway:     { en: 'One Way',                                                 so: 'Hal Taraf' },
  return:     { en: 'Return',                                                  so: 'Noqosho' },
  submit:     { en: 'Submit Quote Request',                                    so: 'Dir Codsiga Qiimaha' },
  submitting: { en: 'Submitting…',                                             so: 'La dirayo…' },
  notes:      { en: 'Additional Notes',                                        so: 'Faallo Dheeraad Ah' },
};

function tr(key: string, lang: Lang) { return L[key]?.[lang] ?? key; }

const PASSENGER_TYPES = [
  { key: 'adults', sub: '16+' },
  { key: 'youth', sub: '12–15' },
  { key: 'children', sub: '2–11' },
  { key: 'infants', sub: '0–2' },
] as const;

const LABEL_CLS = 'text-xs font-semibold uppercase tracking-wide text-muted-foreground';
const AUTO_FILLED_CLS = 'border-l-2 border-l-primary pl-2';

export default function QuotePage() {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('');
  const [lang, setLang] = useState<Lang>('en');
  const [tripType, setTripType] = useState<'oneway' | 'return'>('return');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [earlyDep, setEarlyDep] = useState('');
  const [lateDep, setLateDep] = useState('');
  const [earlyRet, setEarlyRet] = useState('');
  const [lateRet, setLateRet] = useState('');
  const [adults, setAdults] = useState(1);
  const [youth, setYouth] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [notes, setNotes] = useState('');

  const [captureText, setCaptureText] = useState('');
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set());

  function clearMark(key: string) {
    setAutoFilled((s) => {
      if (!s.has(key)) return s;
      const next = new Set(s);
      next.delete(key);
      return next;
    });
  }

  function handleFillForm() {
    const result = parseQuickCapture(captureText, {
      customerNameAlreadySet: customerName.trim() !== '',
    });
    const f = result.fields;
    if (f.customerName !== undefined) setCustomerName(String(f.customerName));
    if (f.phone !== undefined) setPhone(String(f.phone));
    if (f.from !== undefined) setFrom(String(f.from));
    if (f.to !== undefined) setTo(String(f.to));
    if (f.earlyDep !== undefined) setEarlyDep(String(f.earlyDep));
    if (f.lateDep !== undefined) setLateDep(String(f.lateDep));
    if (f.earlyRet !== undefined) setEarlyRet(String(f.earlyRet));
    if (f.lateRet !== undefined) setLateRet(String(f.lateRet));
    if (f.adults !== undefined) setAdults(Number(f.adults));
    if (f.youth !== undefined) setYouth(Number(f.youth));
    if (f.children !== undefined) setChildren(Number(f.children));
    if (f.infants !== undefined) setInfants(Number(f.infants));
    if (f.tripType !== undefined) setTripType(f.tripType as 'oneway' | 'return');
    if (result.leftoverLines.length) {
      setNotes((prev) => (prev ? `${prev}\n${result.leftoverLines.join('\n')}` : result.leftoverLines.join('\n')));
    }
    setAutoFilled(result.matched);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('agents').select('name').eq('id', user.id).single().then(({ data }) => {
        if (data) setAgentName(data.name);
      });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let customerId: string | null = null;

    const { data: existing, error: lookupError } = await supabase
      .from('customers').select('id').eq('phone', phone).maybeSingle();

    if (lookupError) {
      setSubmitting(false);
      setError(`Couldn't look up customer: ${lookupError.message}`);
      return;
    }

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCust, error: insertCustError } = await supabase
        .from('customers')
        .insert({ name: customerName || 'Unknown', phone: phone || '0000000000', email: email || null })
        .select('id').single();
      if (insertCustError) {
        setSubmitting(false);
        setError(`Couldn't create customer: ${insertCustError.message}`);
        return;
      }
      if (newCust) customerId = newCust.id;
    }

    if (!customerId) {
      setSubmitting(false);
      setError("Couldn't determine a customer for this request.");
      return;
    }

    const fromCity = from.replace(/\s*\(.*?\)/, '').trim();
    const toCity = to.replace(/\s*\(.*?\)/, '').trim();
    const { error: insertReqError } = await supabase.from('booking_requests').insert({
      customer_id: customerId,
      departure_city: fromCity || from,
      destination_city: toCity || to,
      earliest_departure: earlyDep,
      latest_departure: lateDep || earlyDep,
      earliest_return: tripType === 'return' ? earlyRet || null : null,
      latest_return: tripType === 'return' ? lateRet || null : null,
      adults, youth, children, infants,
      notes: notes || null,
    });

    if (insertReqError) {
      setSubmitting(false);
      setError(`Couldn't create booking request: ${insertReqError.message}`);
      return;
    }

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 2500);
  }

  const passengerValues = { adults, youth, children, infants };
  const passengerSetters = { adults: setAdults, youth: setYouth, children: setChildren, infants: setInfants };

  return (
    <AppShell agentName={agentName}>
      <div className="mx-auto max-w-4xl">
        {/* Header + language toggle */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">{tr('title', lang)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{tr('subtitle', lang)}</p>
          </div>
          <div className="flex overflow-hidden rounded-md border border-border">
            {(['en', 'so'] as Lang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold uppercase transition-colors',
                  lang === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}>
                {l === 'en' ? 'English' : 'Soomaali'}
              </button>
            ))}
          </div>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-600">
            <CheckCircle2 className="size-5" />
            Quote request submitted! Redirecting to dashboard…
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive">
            <AlertCircle className="size-5" />
            {error}
          </div>
        )}

        {/* Quick Capture */}
        <Card className="mb-6">
          <CardContent className="space-y-3">
            <Label className={LABEL_CLS}>Quick Capture — one note per line</Label>
            <Textarea
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              rows={4}
              placeholder={'Maryan Warsame\n0615123456\nMogadishu to Nairobi\n10-15 Sept\n2A 1Y'}
            />
            <Button type="button" onClick={handleFillForm}>Fill Form</Button>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-6">
              {/* Trip type */}
              <div className="flex gap-3">
                {(['oneway', 'return'] as const).map((type) => (
                  <Button key={type} type="button" variant={tripType === type ? 'default' : 'outline'}
                    onClick={() => setTripType(type)}>
                    {type === 'oneway' ? <PlaneTakeoff className="size-4" /> : <Repeat className="size-4" />}
                    {tr(type, lang)}
                  </Button>
                ))}
              </div>

              {/* Customer info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>Customer Name</Label>
                  <Input value={customerName} onChange={(e) => { setCustomerName(e.target.value); clearMark('customerName'); }}
                    placeholder="Full name" autoComplete="name"
                    className={autoFilled.has('customerName') ? AUTO_FILLED_CLS : undefined} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>{tr('phone', lang)}</Label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={phone} onChange={(e) => { setPhone(e.target.value); clearMark('phone'); }}
                      placeholder="+252 …" type="tel" autoComplete="tel"
                      className={cn('pl-8', autoFilled.has('phone') && AUTO_FILLED_CLS)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>{tr('email', lang)}</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" autoComplete="email" />
                </div>
              </div>

              {/* Route */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>{tr('from', lang)}</Label>
                  <div className="relative">
                    <PlaneTakeoff className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={from} onChange={(e) => { setFrom(e.target.value); clearMark('from'); }}
                      list="cities-from" placeholder="From where?" required
                      className={cn('pl-8', autoFilled.has('from') && AUTO_FILLED_CLS)} />
                    <datalist id="cities-from">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>{tr('to', lang)}</Label>
                  <div className="relative">
                    <PlaneLanding className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={to} onChange={(e) => { setTo(e.target.value); clearMark('to'); }}
                      list="cities-to" placeholder="To where?" required
                      className={cn('pl-8', autoFilled.has('to') && AUTO_FILLED_CLS)} />
                    <datalist id="cities-to">{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                  </div>
                </div>
              </div>

              {/* Departure dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>{tr('earlyDep', lang)}</Label>
                  <Input type="date" value={earlyDep} onChange={(e) => { setEarlyDep(e.target.value); clearMark('earlyDep'); }} required
                    className={autoFilled.has('earlyDep') ? AUTO_FILLED_CLS : undefined} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className={LABEL_CLS}>{tr('lateDep', lang)}</Label>
                  <Input type="date" value={lateDep} onChange={(e) => { setLateDep(e.target.value); clearMark('lateDep'); }}
                    className={autoFilled.has('lateDep') ? AUTO_FILLED_CLS : undefined} />
                </div>
              </div>

              {/* Return dates */}
              {tripType === 'return' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className={LABEL_CLS}>{tr('earlyRet', lang)}</Label>
                    <Input type="date" value={earlyRet} onChange={(e) => { setEarlyRet(e.target.value); clearMark('earlyRet'); }}
                      className={autoFilled.has('earlyRet') ? AUTO_FILLED_CLS : undefined} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className={LABEL_CLS}>{tr('lateRet', lang)}</Label>
                    <Input type="date" value={lateRet} onChange={(e) => { setLateRet(e.target.value); clearMark('lateRet'); }}
                      className={autoFilled.has('lateRet') ? AUTO_FILLED_CLS : undefined} />
                  </div>
                </div>
              )}

              {/* Passengers */}
              <div>
                <Label className={cn(LABEL_CLS, 'mb-3 block')}>Passengers</Label>
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                  {PASSENGER_TYPES.map(({ key, sub }) => (
                    <PassengerCounter key={key} label={tr(key, lang)} sub={sub} min={0}
                      value={passengerValues[key]}
                      onChange={(v) => { passengerSetters[key](v); clearMark(key); }} />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <Label className={LABEL_CLS}>{tr('notes', lang)}</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  placeholder="Any special requests or additional info…" />
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" disabled={submitting || !earlyDep || !from || !to} className="w-full">
                {submitting ? tr('submitting', lang) : tr('submit', lang)}
              </Button>

              <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Your data is secure and will only be used to provide the travel quotation.
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </AppShell>
  );
}
