import { Link } from 'react-router-dom';

const destinations = [
  {
    region: 'East Africa',
    description: 'Somalia, Kenya, Ethiopia, Uganda, Tanzania and beyond.',
    icon: '🌍',
    color: 'from-emerald-900 to-emerald-700',
  },
  {
    region: 'Middle East',
    description: 'UAE, Saudi Arabia, Qatar, Kuwait, Oman and more.',
    icon: '🕌',
    color: 'from-amber-900 to-amber-700',
  },
  {
    region: 'Asia & Beyond',
    description: 'Pakistan, India, Bangladesh, and connecting routes worldwide.',
    icon: '✈️',
    color: 'from-blue-900 to-blue-700',
  },
];

const valueProps = [
  {
    icon: '💰',
    title: 'Discounted Fares',
    desc: "We leverage agency partnerships to secure prices the public booking sites simply cannot match.",
  },
  {
    icon: '🤝',
    title: 'Expert Agents',
    desc: "Our team knows the routes, the airlines, and the best travel windows — so you don't have to.",
  },
  {
    icon: '⚡',
    title: 'Fast Booking',
    desc: 'Walk in or call us. Most bookings are confirmed the same day.',
  },
];

const steps = [
  { num: '01', title: 'Submit Your Inquiry', desc: 'Tell us your dates, destination, and how flexible you are.' },
  { num: '02', title: 'We Find the Best Fare', desc: 'Our agents search across airlines and fares to find your best option.' },
  { num: '03', title: 'Confirm & Fly', desc: "We handle the reservation. You get your ticket and you're ready to go." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>

      {/* ── Navbar ── */}
      <nav style={{ background: 'var(--color-primary)' }} className="sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-xl tracking-tight">Dalmar</span>
            <span style={{ color: 'var(--color-gold)' }} className="font-bold text-xl tracking-tight">&nbsp;Travel</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#destinations" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Destinations</a>
            <a href="#how-it-works" className="text-white/80 hover:text-white text-sm font-medium transition-colors">How It Works</a>
            <a
              href="#inquiry"
              style={{ background: 'var(--color-gold)', color: 'white' }}
              className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Book Now
            </a>
          </div>
          <Link to="/login" className="text-white/40 hover:text-white/70 text-xs transition-colors">
            Agent Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #0F2444 60%, #1a1a3e 100%)',
          minHeight: '90vh',
        }}
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute top-40 right-40 w-64 h-64 rounded-full border border-white" />
          <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full border border-white" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 flex flex-col justify-center" style={{ minHeight: '90vh', paddingTop: '80px', paddingBottom: '80px' }}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 w-fit"
            style={{ background: 'var(--color-gold-light)', color: 'var(--color-gold)' }}
          >
            ✈️ Trusted by the Somali community
          </div>
          <h1
            className="text-white font-bold leading-tight mb-6"
            style={{ fontSize: 'clamp(36px, 6vw, 64px)', maxWidth: '700px' }}
          >
            Your Trusted Connection to Africa &amp; the Middle East
          </h1>
          <p className="text-white/70 text-lg mb-10" style={{ maxWidth: '500px', lineHeight: '1.7' }}>
            Dalmar Travel Agency secures the best fares on flights to East Africa, the Middle East, and Asia — faster and cheaper than booking online yourself.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="#inquiry"
              style={{ background: 'var(--color-gold)', color: 'white' }}
              className="px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
            >
              Make an Inquiry
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
            >
              How It Works
            </a>
          </div>
          <div className="mt-16 flex flex-wrap gap-8">
            {['Flights to 50+ cities', 'Same-day booking', 'Best price guarantee'].map(item => (
              <div key={item} className="flex items-center gap-2 text-white/60 text-sm">
                <span style={{ color: 'var(--color-gold)' }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-24 px-6" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-bold mb-3" style={{ fontSize: '32px' }}>Why Choose Dalmar?</h2>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">
              We're not just a booking service — we're your travel partner.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="p-8 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-semibold text-xl mb-3">{title}</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section id="destinations" className="py-24 px-6" style={{ background: 'var(--color-bg)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-bold mb-3" style={{ fontSize: '32px' }}>Where We Fly</h2>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">
              Specialising in routes the major booking sites overlook.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {destinations.map(({ region, description, icon, color }) => (
              <div
                key={region}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-8 text-white transition-all duration-200 hover:scale-105 cursor-pointer`}
                style={{ minHeight: '220px' }}
              >
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-bold text-2xl mb-2">{region}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">{description}</p>
                <a href="#inquiry" className="text-xs font-semibold text-white/80 hover:text-white underline underline-offset-2">
                  Enquire about this route →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 px-6" style={{ background: 'var(--color-surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-bold mb-3" style={{ fontSize: '32px' }}>How It Works</h2>
            <p style={{ color: 'var(--color-text-muted)' }} className="text-lg">Three steps from inquiry to boarding pass.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-start">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl mb-5"
                  style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                >
                  {num}
                </div>
                <h3 className="font-semibold text-xl mb-3">{title}</h3>
                <p style={{ color: 'var(--color-text-muted)' }} className="leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inquiry CTA ── */}
      <section
        id="inquiry"
        className="py-24 px-6"
        style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, #0F2444 100%)' }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-bold text-white mb-4" style={{ fontSize: '36px' }}>Ready to Travel?</h2>
          <p className="text-white/70 text-lg mb-10">
            Submit your travel details and one of our agents will get back to you with the best available fares.
          </p>
          <Link
            to="/inquiry"
            style={{ background: 'var(--color-gold)', color: 'white' }}
            className="inline-block px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
          >
            Make an Inquiry
          </Link>
          <p className="text-white/40 text-sm mt-6">No account needed. We'll contact you directly.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0a1628', color: 'white' }} className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-1 mb-4">
                <span className="font-bold text-2xl">Dalmar</span>
                <span style={{ color: 'var(--color-gold)' }} className="font-bold text-2xl">&nbsp;Travel</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Your trusted travel agency for flights to East Africa, the Middle East, and Asia. Competitive prices, expert service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/60 uppercase tracking-wider">Services</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Make an Inquiry', href: '#inquiry' },
                  { label: 'Our Destinations', href: '#destinations' },
                  { label: 'How It Works', href: '#how-it-works' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-white/50 hover:text-white text-sm transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4 text-white/60 uppercase tracking-wider">Information</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Reservation Policy', to: '/policy/reservation' },
                  { label: 'Refund Policy', to: '/policy/refund' },
                  { label: 'Agent Login', to: '/login' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-white/50 hover:text-white text-sm transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© 2026 Dalmar Travel Agency. All rights reserved.</p>
            <p className="text-white/30 text-sm">Built for agents, trusted by the community.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
