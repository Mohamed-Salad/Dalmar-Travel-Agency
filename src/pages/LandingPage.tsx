import { Link } from 'react-router-dom';

const HERO_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt8k8c3cD7cT0jp3cORX3xibtFK_MPA1b3m9KRiThnF0XN8TO5kMnUPtBqZ_cA3mfi5HlEv1ST-KlvLLQv9H9EuuobY3vESqAthzjEgzkHju5FNbZjHTkMv5rE23mpmlTrs5rT7iHv4EqyC1HaOomsHJjLVvD3uhcaikO2KJUNHwb6ARoceR7s53mbLz7758gw3czwM5z9_nlM7a2KGvHrRslmedzpJgOG7YXqfnoh0dgv_NXug86kdRyt75e0J-beyYQ-Yjobwtfo';
const AGENT_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaJb5u8qEHqRV5jxMF8KVt9P1FVDbmggf3f5KAeQWszt5m442KPGf2wnQqgZuG0x3lSR8127tpNINHb7rtHcF83p9bdcbZ7s0lTKUaZZGK-xXDHYJVqhoiMyb2SFpuL_j-uJ8ORxz69qTK-GUmmWqkVJGfna-4FB_F2HF8DIERWrTOFvLxKAV8nwFWy3GIvPc1l57IHOVLe-KqD2mhNiY40a2_itDWcXYSrStLw4kr35oJn7A49_ac6QwBR8ve52AP5VbVekgkp344';
const W = { maxWidth: '1440px', margin: '0 auto', padding: '0 24px' } as React.CSSProperties;

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--background)', color: 'var(--on-surface)' }}>

      {/* ── Navbar: light surface (Stitch) ── */}
      <header className="w-full sticky top-0 z-50 h-16" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ ...W, height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[32px]" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>flight</span>
            <span className="font-bold text-[24px]" style={{ color: 'var(--primary)', letterSpacing: '-0.01em' }}>Dalmar Travel</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="font-bold text-[13px] pb-1" style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)' }}>Home</a>
            <a href="#services" className="text-[13px] hover:opacity-80 transition-opacity" style={{ color: 'var(--on-surface-variant)' }}>Services</a>
            <a href="#why-us" className="text-[13px] hover:opacity-80 transition-opacity" style={{ color: 'var(--on-surface-variant)' }}>About Us</a>
            <a href="#footer" className="text-[13px] hover:opacity-80 transition-opacity" style={{ color: 'var(--on-surface-variant)' }}>Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/inquiry"
              className="px-6 py-2 rounded font-bold text-[13px] hover:opacity-90 transition-opacity"
              style={{ background: 'var(--primary-container)', color: 'var(--on-primary)' }}>
              Request Quote
            </Link>
            <Link to="/login" className="text-[12px] hover:opacity-70" style={{ color: 'var(--on-surface-variant)' }}>
              Agent Login
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero: photo + overlay (Stitch) ── */}
      <section className="relative w-full flex items-center overflow-hidden" style={{ height: '85vh' }}>
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{ backgroundImage: `url('${HERO_IMG}')` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,30,64,0.9) 0%, rgba(0,30,64,0.4) 100%)' }} />
        <div className="relative z-10 w-full" style={W}>
          <div style={{ maxWidth: '750px' }}>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full mb-4"
              style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="font-bold text-[12px] uppercase tracking-wider">10+ Years of Excellence</span>
            </div>
            <h1 className="font-bold leading-tight mb-4 text-white" style={{ fontSize: 'clamp(32px, 5vw, 40px)', letterSpacing: '-0.02em' }}>
              Trusted Journeys for <br />
              <span style={{ color: 'var(--secondary-fixed)' }}>Over a Decade.</span>
            </h1>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', lineHeight: '1.7', maxWidth: '580px' }}>
              Expert service in connecting you to the world with exclusive discounted rates through Travelport. Dalmar Travel is your reliable partner in global logistics.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/inquiry"
                className="flex items-center gap-2 px-8 py-4 rounded font-bold text-[13px] hover:opacity-90 transition-all active:scale-95 group"
                style={{ background: 'var(--secondary)', color: 'var(--on-secondary)' }}>
                Request a Quote
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <a href="#services"
                className="px-8 py-4 rounded font-bold text-[13px] text-white border border-white/60 hover:bg-white/10 transition-all">
                View Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & Stats ── */}
      <section className="py-12" style={{ background: 'var(--surface)' }}>
        <div style={W}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 flex flex-col justify-center">
              <h2 className="font-bold text-[24px] mb-4" style={{ color: 'var(--primary)', letterSpacing: '-0.01em' }}>Recognized Local Leaders</h2>
              <p className="mb-6 leading-relaxed text-[14px]" style={{ color: 'var(--on-surface-variant)' }}>
                For over 10 years, we've been the heartbeat of the Somali community's travel needs. We understand the unique requirements of diaspora travel, from complex family itineraries to urgent last-minute bookings.
              </p>
              <div className="flex gap-8">
                <div className="text-center">
                  <div className="font-bold text-[32px]" style={{ color: 'var(--secondary)', letterSpacing: '-0.02em' }}>10+</div>
                  <div className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--outline)' }}>Years</div>
                </div>
                <div className="text-center pl-8" style={{ borderLeft: '1px solid var(--outline-variant)' }}>
                  <div className="font-bold text-[32px]" style={{ color: 'var(--secondary)', letterSpacing: '-0.02em' }}>15k+</div>
                  <div className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--outline)' }}>Flights Booked</div>
                </div>
              </div>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: 'workspace_premium', title: 'Community Recognized', desc: 'Voted most reliable travel agency by local community forums for three consecutive years.' },
                { icon: 'security', title: 'Secure Bookings', desc: 'IATA-standard processes ensure every transaction and itinerary is fully protected.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="glass-card p-8 rounded-xl flex flex-col gap-3 hover:shadow-lg transition-shadow">
                  <span className="material-symbols-outlined text-[40px]" style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  <h3 className="font-bold text-[20px]" style={{ color: 'var(--primary)' }}>{title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="py-12 relative overflow-hidden" style={{ background: 'var(--surface-container-lowest)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'rgba(0,30,64,0.03)', transform: 'translate(50%,-50%)', filter: 'blur(60px)' }} />
        <div className="relative z-10" style={W}>
          <div className="text-center mb-10">
            <span className="font-bold text-[13px] uppercase tracking-widest block mb-1" style={{ color: 'var(--secondary)' }}>Our Expertise</span>
            <h2 className="font-bold text-[32px]" style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>Global Reach, Local Touch</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: 'flight_takeoff', title: 'Airplane Tickets', desc: 'Our core specialty. From domestic hops to multi-continent journeys, we find the fastest and most cost-effective routes.' },
              { icon: 'payments', title: 'Special Discounted Rates', desc: "Leveraging Travelport integration, we access proprietary industry rates that aren't available to the general public." },
              { icon: 'map', title: 'Expert Route Planning', desc: 'Avoid long layovers and visa complications. Our agents plan efficient paths tailored to your specific needs.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white flex flex-col items-center text-center group hover:border-secondary transition-all"
                style={{ border: '1px solid var(--outline-variant)', padding: '32px', borderRadius: '2px' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  style={{ background: 'var(--secondary-container)' }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: 'var(--on-secondary-container)' }}>{icon}</span>
                </div>
                <h3 className="font-bold text-[20px] mb-3" style={{ color: 'var(--primary)' }}>{title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{desc}</p>
              </div>
            ))}
          </div>
          {/* WhatsApp CTA */}
          <div className="glass-card p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto"
            style={{ border: '1px solid rgba(37,211,102,0.3)' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'rgba(37,211,102,0.1)' }}>
                <svg className="w-10 h-10" fill="#25D366" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-[20px]" style={{ color: 'var(--primary)' }}>Need Instant Support?</h4>
                <p className="text-[12px] uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>Quick Message to an Agent</p>
              </div>
            </div>
            <a href="https://wa.me/447000000000" target="_blank" rel="noopener noreferrer"
              className="px-6 py-2 rounded-full font-bold text-[13px] text-white flex items-center gap-2 hover:shadow-md transition-all active:scale-95"
              style={{ background: '#25D366' }}>
              WhatsApp Now
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section id="why-us" className="py-12">
        <div style={W}>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img src={AGENT_IMG} alt="Agent assisting customer" className="w-full h-auto" />
              </div>
              <div className="absolute -z-0 rounded-2xl"
                style={{ top: '-16px', left: '-16px', right: '16px', bottom: '16px', border: '2px solid var(--secondary-container)' }} />
            </div>
            <div className="w-full md:w-1/2">
              <span className="font-bold text-[13px] uppercase tracking-widest block mb-1" style={{ color: 'var(--secondary)' }}>Personalized Care</span>
              <h2 className="font-bold leading-tight mb-4" style={{ fontSize: '32px', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                Professional Insight at<br />Every Step.
              </h2>
              <p className="mb-6 leading-relaxed" style={{ fontSize: '16px', color: 'var(--on-surface-variant)' }}>
                Booking a trip shouldn't be stressful. When you visit Dalmar Travel, you're not just a transaction; you're a traveler with a story. Our agents take the time to understand your budget, preferences, and timeline.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { title: 'Deep Industry Knowledge', desc: 'Decades of navigating airline policies, visa requirements, and transit laws.' },
                  { title: 'Post-Booking Support', desc: "Flight canceled? Delayed? We handle the rebookings so you don't wait on hold." },
                ].map(({ title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="p-1 rounded flex-shrink-0 mt-0.5" style={{ background: 'var(--primary)' }}>
                      <span className="material-symbols-outlined text-white text-[20px]">check</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[20px] mb-1" style={{ color: 'var(--primary)' }}>{title}</h4>
                      <p className="text-[14px]" style={{ color: 'var(--on-surface-variant)' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 rounded-xl flex items-center gap-6"
                style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                <div className="flex">
                  {[['var(--primary-container)', ''], ['var(--secondary-container)', ''], ['var(--surface-dim)', '+5k']].map(([bg, label], i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center"
                      style={{ background: bg, marginLeft: i > 0 ? '-8px' : 0 }}>
                      {label && <span className="text-[10px] font-bold" style={{ color: 'var(--on-surface)' }}>{label}</span>}
                    </div>
                  ))}
                </div>
                <p className="font-bold text-[13px]" style={{ color: 'var(--primary)' }}>Join 5,000+ happy travelers this year.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer: dark charcoal var(--tertiary) ── */}
      <footer id="footer" style={{ background: 'var(--tertiary)' }}>
        <div style={{ ...W, paddingTop: '48px', paddingBottom: '48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          <div className="flex flex-col gap-4">
            <div className="font-bold text-[20px]" style={{ color: 'var(--on-tertiary)' }}>Dalmar Travel</div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--on-tertiary-container)' }}>
              The trusted name in travel for over 10 years. Expertly navigating the skies so you can focus on the destination.
            </p>
            <div className="flex gap-4 mt-2">
              {['public', 'mail', 'call'].map(icon => (
                <span key={icon} className="material-symbols-outlined cursor-pointer hover:opacity-70 transition-opacity" style={{ color: 'var(--on-tertiary)' }}>{icon}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: 'var(--on-tertiary)' }}>Services</h4>
            <ul className="flex flex-col gap-3">
              {['Flight Booking', 'Corporate Travel', 'Group Itineraries'].map(l => (
                <li key={l}><Link to="/inquiry" className="text-[14px] hover:opacity-100 transition-opacity" style={{ color: 'var(--on-tertiary-container)' }}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: 'var(--on-tertiary)' }}>Company</h4>
            <ul className="flex flex-col gap-3">
              {['About Us', 'Support', 'Office Locations'].map(l => (
                <li key={l}><a href="#why-us" className="text-[14px] hover:opacity-100 transition-opacity" style={{ color: 'var(--on-tertiary-container)' }}>{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: 'var(--on-tertiary)' }}>Legal</h4>
            <ul className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms of Service'].map(l => (
                <li key={l}><a href="#" className="text-[14px] hover:opacity-100" style={{ color: 'var(--on-tertiary-container)' }}>{l}</a></li>
              ))}
            </ul>
            <div className="mt-6">
              <Link to="/login" className="text-[12px] hover:opacity-100 transition-opacity" style={{ color: 'var(--on-tertiary-container)' }}>Agent Login →</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', paddingBottom: '24px', ...W, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="text-[12px]" style={{ color: 'var(--on-tertiary-container)' }}>© 2026 Dalmar Travel. All rights reserved. 10+ Years of Excellence.</p>
          <div className="flex gap-6">
            <span className="text-[12px]" style={{ color: 'var(--on-tertiary-container)' }}>IATA Accredited</span>
            <span className="text-[12px]" style={{ color: 'var(--on-tertiary-container)' }}>Travelport Partner</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
