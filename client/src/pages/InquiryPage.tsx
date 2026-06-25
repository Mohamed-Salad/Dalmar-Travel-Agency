import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Step = 'form' | 'success';

const COMMON_ROUTES = [
  'Mogadishu (MGQ)', 'Nairobi (NBO)', 'Dubai (DXB)', 'Addis Ababa (ADD)',
  'London (LHR)', 'Istanbul (IST)', 'Jeddah (JED)', 'Riyadh (RUH)',
  'Djibouti (JIB)', 'Dar es Salaam (DAR)', 'Karachi (KHI)', 'Doha (DOH)',
];

const PASSENGER_TYPES = [
  { key: 'adults',   label: 'Adults',   sub: '16 and over',  min: 1 },
  { key: 'youth',    label: 'Youth',    sub: 'Ages 12 – 15', min: 0 },
  { key: 'children', label: 'Children', sub: 'Ages 2 – 11',  min: 0 },
  { key: 'infants',  label: 'Infants',  sub: 'Under 2',      min: 0 },
] as const;

const inputStyle = {
  border: '1px solid var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
};

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-4 rounded-lg outline-none transition-all ${props.className ?? ''}`}
      style={inputStyle}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
    />
  );
}

export default function InquiryPage() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOneWay, setIsOneWay] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    departure_city: '', destination_city: '',
    earliest_departure: '', latest_departure: '',
    earliest_return: '', latest_return: '',
    notes: '',
  });

  const [passengers, setPassengers] = useState({ adults: 1, youth: 0, children: 0, infants: 0 });

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [field]: e.target.value }));

  const adjustPassenger = (key: keyof typeof passengers, delta: number, min: number) =>
    setPassengers(p => ({ ...p, [key]: Math.max(min, p[key] + delta) }));

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: customer, error: cErr } = await supabase
        .from('customers')
        .insert({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null })
        .select('id')
        .single();

      if (cErr) throw cErr;

      const { error: rErr } = await supabase.from('booking_requests').insert({
        customer_id: customer.id,
        departure_city: form.departure_city.trim(),
        destination_city: form.destination_city.trim(),
        earliest_departure: form.earliest_departure,
        latest_departure: form.latest_departure,
        earliest_return: isOneWay ? null : form.earliest_return || null,
        latest_return: isOneWay ? null : form.latest_return || null,
        notes: form.notes.trim() || null,
        adults: passengers.adults,
        youth: passengers.youth,
        children: passengers.children,
        infants: passengers.infants,
      });

      if (rErr) throw rErr;
      setStep('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const totalPassengers = passengers.adults + passengers.youth + passengers.children + passengers.infants;

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-md w-full text-center p-10 rounded-2xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div className="text-6xl mb-6">✅</div>
          <h1 className="font-bold text-2xl mb-3" style={{ color: 'var(--color-text)' }}>
            Inquiry Submitted!
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }} className="mb-8 leading-relaxed">
            One of our agents will review your request and contact you shortly on the number you provided.
          </p>
          <Link to="/"
            style={{ background: 'var(--color-primary)', color: 'white' }}
            className="inline-block px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* Navbar */}
      <nav style={{ background: 'var(--color-primary)' }} className="sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-white font-bold text-xl">Dalmar</span>
            <span style={{ color: 'var(--color-gold)' }} className="font-bold text-xl">&nbsp;Travel</span>
          </Link>
          <Link to="/login" className="text-white/40 hover:text-white/70 text-xs transition-colors">
            Agent Login
          </Link>
        </div>
      </nav>

      {/* Page wrapper — truly centered */}
      <div className="flex justify-center px-6 py-16">
        <div className="w-full" style={{ maxWidth: '680px' }}>

          <div className="mb-10">
            <h1 className="font-bold mb-3" style={{ fontSize: '36px', color: 'var(--color-text)' }}>
              Make a Travel Inquiry
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg leading-relaxed">
              Fill in your details below. Our agents will find the best available fares and call you directly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Contact ── */}
            <section className="p-6 rounded-2xl space-y-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                Your Details
              </h2>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <Input required value={form.name} onChange={set('name')} placeholder="e.g. Faadumo Warsame" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Phone Number <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <Input required type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 7700 900000" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Email <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <Input type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" />
                </div>
              </div>
            </section>

            {/* ── Route ── */}
            <section className="p-6 rounded-2xl space-y-4"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                Route
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {(['departure_city', 'destination_city'] as const).map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1.5">
                      {field === 'departure_city' ? 'Flying From' : 'Flying To'}{' '}
                      <span style={{ color: 'var(--color-danger)' }}>*</span>
                    </label>
                    <Input
                      required value={form[field]}
                      onChange={set(field)}
                      list={`${field}-list`}
                      placeholder={field === 'departure_city' ? 'e.g. London (LHR)' : 'e.g. Mogadishu (MGQ)'}
                    />
                    <datalist id={`${field}-list`}>
                      {COMMON_ROUTES.map(r => <option key={r} value={r} />)}
                    </datalist>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Passengers ── */}
            <section className="p-6 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                  Passengers
                </h2>
                <span className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  {totalPassengers} total
                </span>
              </div>
              <div className="space-y-3">
                {PASSENGER_TYPES.map(({ key, label, sub, min }) => (
                  <div key={key} className="flex items-center justify-between py-2"
                    style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button"
                        onClick={() => adjustPassenger(key, -1, min)}
                        disabled={passengers[key] <= min}
                        className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-all disabled:opacity-30"
                        style={{ border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
                        −
                      </button>
                      <span className="w-6 text-center font-semibold">{passengers[key]}</span>
                      <button type="button"
                        onClick={() => adjustPassenger(key, 1, min)}
                        className="w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center transition-all"
                        style={{ background: 'var(--color-primary)', color: 'white' }}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Travel Dates ── */}
            <section className="p-6 rounded-2xl space-y-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
                  Travel Dates
                </h2>
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={isOneWay} onChange={e => setIsOneWay(e.target.checked)} />
                  One-way trip
                </label>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">
                  Departure window <span style={{ color: 'var(--color-danger)' }}>*</span>
                  <span className="ml-2 font-normal text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    earliest and latest you can depart
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(['earliest_departure', 'latest_departure'] as const).map((field, i) => (
                    <div key={field}>
                      <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                        {i === 0 ? 'Earliest' : 'Latest'}
                      </label>
                      <Input
                        required type="date" value={form[field]} onChange={set(field)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {!isOneWay && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    Return window
                    <span className="ml-2 font-normal text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      optional — leave blank if flexible
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {(['earliest_return', 'latest_return'] as const).map((field, i) => (
                      <div key={field}>
                        <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                          {i === 0 ? 'Earliest' : 'Latest'}
                        </label>
                        <Input
                          type="date" value={form[field]} onChange={set(field)}
                          min={form.earliest_departure || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ── Notes ── */}
            <section className="p-6 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <label className="block font-semibold text-sm uppercase tracking-wider mb-3"
                style={{ color: 'var(--color-primary)' }}>
                Additional Notes <span className="font-normal normal-case" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
              </label>
              <textarea
                value={form.notes} onChange={set('notes')} rows={3}
                placeholder="e.g. Prefer morning flights, specific airline, luggage requirements..."
                className="w-full px-4 py-3 rounded-lg outline-none transition-all resize-none"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </section>

            {error && (
              <div className="p-4 rounded-lg text-sm"
                style={{ background: '#FEF2F2', color: 'var(--color-danger)', border: '1px solid #FECACA' }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{ background: loading ? 'var(--color-text-muted)' : 'var(--color-primary)', color: 'white' }}
              className="w-full h-12 rounded-xl font-semibold text-base transition-all hover:opacity-90 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>

            <p className="text-center text-sm pb-8" style={{ color: 'var(--color-text-muted)' }}>
              No account needed. We'll contact you on the number provided.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}
