import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Step = 'form' | 'success';
type Lang = 'en' | 'so';

const CITIES = [
  'Mogadishu (MGQ)', 'Hargeisa (HGA)', 'Nairobi (NBO)', 'Dubai (DXB)',
  'Addis Ababa (ADD)', 'London (LHR)', 'Istanbul (IST)', 'Jeddah (JED)',
  'Riyadh (RUH)', 'Djibouti (JIB)', 'Dar es Salaam (DAR)', 'Doha (DOH)',
];

const PASSENGER_TYPES = [
  { key: 'adults',   en: 'Adults',   so: 'Waaweyn',    sub: '16+',   min: 1 },
  { key: 'youth',    en: 'Youth',    so: 'Dhalinyaro', sub: '12–15', min: 0 },
  { key: 'children', en: 'Children', so: 'Carruur',    sub: '2–11',  min: 0 },
  { key: 'infants',  en: 'Infants',  so: 'Ilmo yar',   sub: '0–2',   min: 0 },
] as const;

export default function InquiryPage() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOneWay, setIsOneWay] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    departure_city: '', destination_city: '',
    earliest_departure: '', latest_departure: '',
    earliest_return: '', latest_return: '',
    notes: '',
  });
  const [passengers, setPassengers] = useState({ adults: 1, youth: 0, children: 0, infants: 0 });

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const adjust = (key: keyof typeof passengers, delta: number, min: number) =>
    setPassengers(p => ({ ...p, [key]: Math.max(min, p[key] + delta) }));

  const totalPax = passengers.adults + passengers.youth + passengers.children + passengers.infants;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const customerId = crypto.randomUUID();
      const { error: cErr } = await supabase
        .from('customers')
        .insert({ id: customerId, name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null });
      if (cErr) throw cErr;

      const { error: rErr } = await supabase.from('booking_requests').insert({
        customer_id: customerId,
        departure_city: form.departure_city.trim(),
        destination_city: form.destination_city.trim(),
        earliest_departure: form.earliest_departure,
        latest_departure: form.latest_departure,
        earliest_return: isOneWay ? null : form.earliest_return || null,
        latest_return: isOneWay ? null : form.latest_return || null,
        notes: form.notes.trim() || null,
        adults: passengers.adults, youth: passengers.youth,
        children: passengers.children, infants: passengers.infants,
      });
      if (rErr) throw rErr;
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: '100%', padding: '8px 16px', outline: 'none',
    background: 'var(--surface)', border: '1px solid var(--outline-variant)',
    color: 'var(--on-surface)', fontSize: '14px', borderRadius: '4px',
  } as React.CSSProperties;

  const lbl = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--on-surface-variant)', marginBottom: '4px',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'var(--background)' }}>
        <div className="max-w-md w-full text-center p-10 rounded-2xl glass-card">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--secondary-container)' }}>
            <span className="material-symbols-outlined text-[32px]" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-bold text-[24px] mb-3" style={{ color: 'var(--primary)' }}>
            {lang === 'en' ? 'Inquiry Submitted!' : 'Codsi La Diray!'}
          </h1>
          <p className="mb-8 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
            {lang === 'en'
              ? 'One of our agents will review your request and contact you shortly on the number you provided.'
              : 'Mid ka mid ah wakiiladeenna ayaa dib kugu soo wici doona lambarka aad bixisay.'}
          </p>
          <Link to="/" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
            className="inline-block px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            {lang === 'en' ? 'Back to Home' : 'Ku Noqo Bogga Hore'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Navbar */}
      <header className="w-full sticky top-0 z-50 h-16"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>flight</span>
            <span className="font-bold text-[22px]" style={{ color: 'var(--primary)' }}>Dalmar Travel</span>
          </Link>
          <Link to="/login" className="text-[12px] hover:opacity-70 transition-opacity" style={{ color: 'var(--on-surface-variant)' }}>
            Agent Login
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1440px', margin: '0 auto', paddingTop: '32px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px' }}>
        <header className="mb-8">
          <h2 className="font-bold text-[32px]" style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {lang === 'en' ? 'Request Your Travel Quote' : 'Codsiga Qiimaha Safarkaaga'}
          </h2>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
            {lang === 'en'
              ? 'Fill out the form below and our expert agents will find the best rates for your journey.'
              : 'Buuxi foomka hoose, wakiiladeenuna waxay helayaan qiimaha ugu fiican safarkaaga.'}
          </p>
        </header>

        {/* Bento grid: sidebar + main */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl p-4 flex items-start justify-between"
              style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
              <div>
                <p className="text-[12px] opacity-80">Support System</p>
                <p className="font-bold text-[14px]">Soomaali / English</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary-fixed)' }}>translate</span>
                <div className="flex rounded overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                  {(['en', 'so'] as Lang[]).map(l => (
                    <button key={l} type="button" onClick={() => setLang(l)}
                      className="px-2 py-0.5 text-[11px] font-bold uppercase transition-colors"
                      style={{ background: lang === l ? 'var(--secondary-fixed)' : 'transparent', color: lang === l ? 'var(--on-secondary-fixed)' : 'rgba(255,255,255,0.7)' }}>
                      {l === 'en' ? 'EN' : 'SO'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-[14px]" style={{ color: 'var(--primary)' }}>
                {lang === 'en' ? 'How it works' : 'Sida Loo Shaqeeyo'}
              </h3>
              {([
                ['send', lang === 'en' ? 'Submit your request' : 'Dir codsigaaga'],
                ['search', lang === 'en' ? 'We find best fares' : 'Waxaan helaa qiimo fiican'],
                ['phone_in_talk', lang === 'en' ? 'Agent calls you back' : 'Wakiil ku soo wacaa'],
              ] as [string, string][]).map(([icon, text]) => (
                <div key={icon} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--secondary-container)' }}>
                    <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--on-secondary-container)' }}>{icon}</span>
                  </div>
                  <span className="text-[13px]" style={{ color: 'var(--on-surface-variant)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main form */}
          <form onSubmit={handleSubmit}>
            <section className="glass-card rounded-xl shadow-sm"
              style={{ padding: '24px', border: '1px solid rgba(0,30,64,0.05)' }}>
              <div className="space-y-6">

                {/* Contact */}
                <div className="space-y-3">
                  <div>
                    <label style={lbl}>{lang === 'en' ? 'Full Name *' : 'Magacaaga Buuxa *'}</label>
                    <input required value={form.name} onChange={set('name')}
                      placeholder={lang === 'en' ? 'e.g. Faadumo Warsame' : 'Tusaale: Faadumo Warsame'}
                      style={inp} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={lbl}>{lang === 'en' ? 'Phone / WhatsApp *' : 'Telefoon *'}</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: 'var(--outline)' }}>phone</span>
                        <input required type="tel" value={form.phone} onChange={set('phone')}
                          placeholder="+252 ..." style={{ ...inp, paddingLeft: '36px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>{lang === 'en' ? 'Email (optional)' : 'Email (ikhtiyaari)'}</label>
                      <input type="email" value={form.email} onChange={set('email')}
                        placeholder="email@example.com" style={inp} />
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { field: 'departure_city' as const, icon: 'flight_takeoff', en: 'Flying From *', so: 'Ka Duulaya *', ph: 'e.g. London (LHR)' },
                    { field: 'destination_city' as const, icon: 'flight_land', en: 'Flying To *', so: 'U Duulaya *', ph: 'e.g. Mogadishu (MGQ)' },
                  ].map(({ field, icon, en, so, ph }) => (
                    <div key={field}>
                      <label style={lbl}>{lang === 'en' ? en : so}</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: 'var(--outline)' }}>{icon}</span>
                        <input required value={form[field]} onChange={set(field)}
                          list={`${field}-list`} placeholder={ph}
                          style={{ ...inp, paddingLeft: '36px' }} />
                        <datalist id={`${field}-list`}>{CITIES.map(c => <option key={c} value={c} />)}</datalist>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Passengers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label style={lbl}>{lang === 'en' ? 'Passengers' : 'Rakaabka'}</label>
                    <span className="text-[12px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'var(--surface-container)', color: 'var(--on-surface-variant)' }}>
                      {totalPax} {lang === 'en' ? 'total' : 'wadarta'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                    {PASSENGER_TYPES.map(({ key, en, so, sub, min }) => (
                      <div key={key} className="flex items-center justify-between py-2"
                        style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                        <div>
                          <p className="font-bold text-[14px]" style={{ color: 'var(--on-surface)' }}>{lang === 'en' ? en : so}</p>
                          <p className="text-[12px]" style={{ color: 'var(--outline)' }}>{sub}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => adjust(key, -1, min)}
                            disabled={passengers[key] <= min}
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg disabled:opacity-30"
                            style={{ border: '1px solid var(--outline-variant)', color: 'var(--primary)' }}>−</button>
                          <span className="w-5 text-center font-bold" style={{ color: 'var(--primary)' }}>{passengers[key]}</span>
                          <button type="button" onClick={() => adjust(key, 1, min)}
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
                            style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Travel Dates */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label style={lbl}>{lang === 'en' ? 'Travel Dates' : 'Taariikhaha Safarka'}</label>
                    <label className="flex items-center gap-2 cursor-pointer text-[13px]" style={{ color: 'var(--on-surface-variant)' }}>
                      <input type="checkbox" checked={isOneWay} onChange={e => setIsOneWay(e.target.checked)} />
                      {lang === 'en' ? 'One-way trip' : 'Hal Taraf'}
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="font-bold text-[12px]" style={{ color: 'var(--on-surface-variant)' }}>
                        {lang === 'en' ? 'Departure window *' : 'Muddada Baxitaanka *'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(['earliest_departure', 'latest_departure'] as const).map((f, i) => (
                          <div key={f}>
                            <label style={{ ...lbl, fontSize: '10px' }}>
                              {i === 0 ? (lang === 'en' ? 'Earliest' : 'Ugu Horreysa') : (lang === 'en' ? 'Latest' : 'Ugu Dambe')}
                            </label>
                            <input required type="date" value={form[f]} onChange={set(f)}
                              min={new Date().toISOString().split('T')[0]} style={inp} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {!isOneWay && (
                      <div className="space-y-2">
                        <p className="font-bold text-[12px]" style={{ color: 'var(--on-surface-variant)' }}>
                          {lang === 'en' ? 'Return window' : 'Muddada Noqoshada'}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(['earliest_return', 'latest_return'] as const).map((f, i) => (
                            <div key={f}>
                              <label style={{ ...lbl, fontSize: '10px' }}>
                                {i === 0 ? (lang === 'en' ? 'Earliest' : 'Ugu Horreysa') : (lang === 'en' ? 'Latest' : 'Ugu Dambe')}
                              </label>
                              <input type="date" value={form[f]} onChange={set(f)}
                                min={form.earliest_departure || new Date().toISOString().split('T')[0]} style={inp} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label style={lbl}>{lang === 'en' ? 'Additional Notes (optional)' : 'Faallo Dheeraad Ah (ikhtiyaari)'}</label>
                  <textarea value={form.notes} onChange={set('notes')} rows={3}
                    placeholder={lang === 'en' ? 'e.g. Prefer morning flights, specific airline...' : 'Tusaale: Dulimaadka subaxda...'}
                    style={{ ...inp, resize: 'vertical' }} />
                </div>

                {error && (
                  <div className="p-4 rounded-lg text-[13px]"
                    style={{ background: 'var(--error-container)', color: 'var(--error)', border: '1px solid var(--error)' }}>
                    {error}
                  </div>
                )}
              </div>
            </section>

            {/* Stitch submit section */}
            <div className="space-y-4 mt-6">
              <div className="glass-card rounded-xl p-8 text-center" style={{ border: '1px solid rgba(0,30,64,0.1)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--secondary-container)' }}>
                  <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--secondary)' }}>send</span>
                </div>
                <h3 className="font-bold text-[24px] mb-2" style={{ color: 'var(--primary)' }}>
                  {lang === 'en' ? 'Ready to find your flight?' : 'Ma diyaar baad u tahay?'}
                </h3>
                <p className="mb-6 max-w-md mx-auto text-[14px]" style={{ color: 'var(--on-surface-variant)' }}>
                  {lang === 'en'
                    ? 'Once you submit, our travel specialists search all available airlines and contact you via WhatsApp within 2 hours.'
                    : 'Markaad dirto, wakiiladeenna ayaa raadinaya dhamaan dulimaadyada oo kuugu soo wacaya 2 saac gudahood.'}
                </p>
                <button type="submit" disabled={loading}
                  className="font-bold py-4 px-12 rounded-xl text-[20px] hover:opacity-90 transition-all active:scale-95 shadow-lg disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
                  {loading
                    ? (lang === 'en' ? 'Submitting...' : 'La dirayo...')
                    : (lang === 'en' ? 'Submit Quote Request' : 'Dir Codsiga Qiimaha')}
                </button>
              </div>
              <div className="rounded-xl p-4 flex items-center justify-center gap-3"
                style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <p className="font-bold text-[13px]" style={{ color: 'var(--primary)' }}>
                  {lang === 'en'
                    ? 'Your data is secure and will only be used to provide your travel quotation.'
                    : 'Xogahaagu waa ammaan. Waxaa loo isticmaalayaa kaliya siinta qiimaha safarkaaga.'}
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
