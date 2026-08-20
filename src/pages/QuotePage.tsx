import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import { CITIES } from '../lib/cities';
import { parseQuickCapture } from '../lib/quoteCapture';

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
  adults:     { en: 'Adults (16+)',                                            so: 'Waaweyn (16+)' },
  youth:      { en: 'Youth (12–15)',                                           so: 'Dhalinyaro (12–15)' },
  children:   { en: 'Children (2–11)',                                         so: 'Carruur (2–11)' },
  infants:    { en: 'Infants (0–2)',                                           so: 'Ilmo yar (0–2)' },
  oneway:     { en: 'One Way',                                                 so: 'Hal Taraf' },
  return:     { en: 'Return',                                                  so: 'Noqosho' },
  submit:     { en: 'Submit Quote Request',                                    so: 'Dir Codsiga Qiimaha' },
  submitting: { en: 'Submitting…',                                             so: 'La dirayo…' },
  notes:      { en: 'Additional Notes',                                        so: 'Faallo Dheeraad Ah' },
};

function tr(key: string, lang: Lang) { return L[key]?.[lang] ?? key; }

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg"
      style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)' }}>
      <span className="text-sm" style={{ color: 'var(--on-surface)' }}>{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ background: 'var(--surface-container)', color: 'var(--on-surface)' }}>−</button>
        <span className="w-5 text-center font-bold" style={{ color: 'var(--primary)' }}>{value}</span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
          style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>+</button>
      </div>
    </div>
  );
}

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

  const inp = {
    background: 'var(--surface)',
    border: '1px solid var(--outline-variant)',
    color: 'var(--on-surface)',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  const lbl: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '4px',
    color: 'var(--on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  return (
    <AppShell agentName={agentName}>
      <div className="max-w-4xl mx-auto">
        {/* Header + Language Toggle */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div>
            <h2 className="text-[32px] font-bold" style={{ color: 'var(--primary)' }}>{tr('title', lang)}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>{tr('subtitle', lang)}</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0"
            style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
            <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--secondary-fixed)' }}>translate</span>
            <div className="flex rounded overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              {(['en', 'so'] as Lang[]).map(l => (
                <button key={l} type="button" onClick={() => setLang(l)}
                  className="px-3 py-1 text-[12px] font-bold uppercase transition-colors"
                  style={{ background: lang === l ? 'var(--secondary-fixed)' : 'transparent', color: lang === l ? 'var(--on-secondary-fixed)' : 'rgba(255,255,255,0.7)' }}>
                  {l === 'en' ? 'English' : 'Soomaali'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Quote request submitted! Redirecting to dashboard…
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3"
            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            {error}
          </div>
        )}

        <div className="glass-card rounded-xl p-6 mb-6 space-y-3">
          <label style={lbl}>Quick Capture — one note per line</label>
          <textarea
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            rows={4}
            placeholder={'Maryan Warsame\n0615123456\nMogadishu to Nairobi\n10-15 Sept\n2A 1Y'}
            style={{ ...inp, resize: 'vertical' }}
          />
          <button
            type="button"
            onClick={handleFillForm}
            className="px-4 py-2 rounded text-sm font-semibold"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            Fill Form
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="glass-card rounded-xl p-6 space-y-6">
            {/* Trip Type */}
            <div className="flex gap-3">
              {(['oneway', 'return'] as const).map(type => (
                <button key={type} type="button" onClick={() => setTripType(type)}
                  className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
                  style={{
                    background: tripType === type ? 'var(--primary)' : 'var(--surface-container-low)',
                    color: tripType === type ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                    border: `1px solid ${tripType === type ? 'var(--primary)' : 'var(--outline-variant)'}`,
                  }}>
                  <span className="material-symbols-outlined text-[16px]">{type === 'oneway' ? 'flight_takeoff' : 'sync_alt'}</span>
                  {tr(type, lang)}
                </button>
              ))}
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label style={lbl}>Customer Name</label>
                <input value={customerName} onChange={e => { setCustomerName(e.target.value); clearMark('customerName'); }} placeholder="Full name" autoComplete="name"
                  style={autoFilled.has('customerName') ? { ...inp, borderLeft: '3px solid var(--primary)' } : inp} />
              </div>
              <div>
                <label style={lbl}>{tr('phone', lang)}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: 'var(--outline)' }}>phone</span>
                  <input value={phone} onChange={e => { setPhone(e.target.value); clearMark('phone'); }} placeholder="+252 …" type="tel" autoComplete="tel"
                    style={autoFilled.has('phone') ? { ...inp, paddingLeft: '36px', borderLeft: '3px solid var(--primary)' } : { ...inp, paddingLeft: '36px' }} />
                </div>
              </div>
              <div>
                <label style={lbl}>{tr('email', lang)}</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" type="email" autoComplete="email" style={inp} />
              </div>
            </div>

            {/* Route */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={lbl}>{tr('from', lang)}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: 'var(--outline)' }}>flight_takeoff</span>
                  <input value={from} onChange={e => { setFrom(e.target.value); clearMark('from'); }} list="cities-from" placeholder="From where?" required
                    style={autoFilled.has('from') ? { ...inp, paddingLeft: '36px', borderLeft: '3px solid var(--primary)' } : { ...inp, paddingLeft: '36px' }} />
                  <datalist id="cities-from">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
              <div>
                <label style={lbl}>{tr('to', lang)}</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: 'var(--outline)' }}>flight_land</span>
                  <input value={to} onChange={e => { setTo(e.target.value); clearMark('to'); }} list="cities-to" placeholder="To where?" required
                    style={autoFilled.has('to') ? { ...inp, paddingLeft: '36px', borderLeft: '3px solid var(--primary)' } : { ...inp, paddingLeft: '36px' }} />
                  <datalist id="cities-to">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
            </div>

            {/* Departure Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={lbl}>{tr('earlyDep', lang)}</label>
                <input type="date" value={earlyDep} onChange={e => { setEarlyDep(e.target.value); clearMark('earlyDep'); }} required
                  style={autoFilled.has('earlyDep') ? { ...inp, borderLeft: '3px solid var(--primary)' } : inp} />
              </div>
              <div>
                <label style={lbl}>{tr('lateDep', lang)}</label>
                <input type="date" value={lateDep} onChange={e => { setLateDep(e.target.value); clearMark('lateDep'); }}
                  style={autoFilled.has('lateDep') ? { ...inp, borderLeft: '3px solid var(--primary)' } : inp} />
              </div>
            </div>

            {/* Return Dates */}
            {tripType === 'return' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={lbl}>{tr('earlyRet', lang)}</label>
                  <input type="date" value={earlyRet} onChange={e => { setEarlyRet(e.target.value); clearMark('earlyRet'); }}
                    style={autoFilled.has('earlyRet') ? { ...inp, borderLeft: '3px solid var(--primary)' } : inp} />
                </div>
                <div>
                  <label style={lbl}>{tr('lateRet', lang)}</label>
                  <input type="date" value={lateRet} onChange={e => { setLateRet(e.target.value); clearMark('lateRet'); }}
                    style={autoFilled.has('lateRet') ? { ...inp, borderLeft: '3px solid var(--primary)' } : inp} />
                </div>
              </div>
            )}

            {/* Passenger Counters */}
            <div>
              <label style={{ ...lbl, marginBottom: '12px' }}>Passengers</label>
              <div className="grid grid-cols-2 gap-3">
                <Counter label={tr('adults', lang)} value={adults} onChange={(v) => { setAdults(v); clearMark('adults'); }} />
                <Counter label={tr('youth', lang)} value={youth} onChange={(v) => { setYouth(v); clearMark('youth'); }} />
                <Counter label={tr('children', lang)} value={children} onChange={(v) => { setChildren(v); clearMark('children'); }} />
                <Counter label={tr('infants', lang)} value={infants} onChange={(v) => { setInfants(v); clearMark('infants'); }} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={lbl}>{tr('notes', lang)}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Any special requests or additional info…"
                style={{ ...inp, resize: 'vertical' }} />
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting || !earlyDep || !from || !to}
              className="w-full py-4 rounded-xl font-bold text-[18px] transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'var(--primary)', color: 'var(--on-primary)', boxShadow: '0 4px 24px rgba(0,30,64,0.25)' }}>
              {submitting ? tr('submitting', lang) : tr('submit', lang)}
            </button>

            <p className="text-center text-xs flex items-center justify-center gap-2" style={{ color: 'var(--on-surface-variant)' }}>
              <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              Your data is secure and will only be used to provide the travel quotation.
            </p>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
