import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const NAV = [
  { href: '/dashboard',    icon: 'dashboard',      label: 'Dashboard' },
  { href: '/quote',        icon: 'request_quote',  label: 'New Quote' },
  { href: '/customers',    icon: 'group',          label: 'Customers (Macmiilka)' },
  { href: '/coordination', icon: 'chat',           label: 'WhatsApp' },
  { href: '/reports',      icon: 'assessment',     label: 'Reports' },
];

const COLLAPSED_W = 68;
const EXPANDED_W  = 256;

export default function AppShell({ children, agentName = '' }: { children: ReactNode; agentName?: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const initials = agentName
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'AG';

  const sidebarW = expanded ? EXPANDED_W : COLLAPSED_W;

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="h-screen fixed left-0 top-0 flex flex-col py-6 z-50 overflow-hidden"
        style={{
          width: sidebarW,
          background: 'var(--primary)',
          transition: 'width 200ms ease',
          paddingLeft: '12px',
          paddingRight: '12px',
        }}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 overflow-hidden" style={{ minHeight: 40 }}>
          <div className="w-10 h-10 rounded flex items-center justify-center shrink-0"
            style={{ background: 'var(--on-primary)' }}>
            <span className="material-symbols-outlined text-[20px]"
              style={{ color: 'var(--primary)', fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
          </div>
          <div style={{ opacity: expanded ? 1 : 0, transition: 'opacity 150ms ease', whiteSpace: 'nowrap' }}>
            <h1 className="font-bold text-[15px] leading-none" style={{ color: 'var(--on-primary)' }}>Dalmar Travel</h1>
            <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>Agency Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} to={href}
                className="flex items-center gap-3 py-2.5 rounded transition-colors overflow-hidden"
                style={{
                  paddingLeft: active ? '8px' : '12px',
                  borderLeft: active ? '4px solid var(--secondary-fixed)' : '4px solid transparent',
                  color: active ? 'var(--secondary-fixed)' : 'rgba(255,255,255,0.65)',
                  fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  minWidth: 0,
                }}>
                <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
                <span className="text-sm whitespace-nowrap"
                  style={{ opacity: expanded ? 1 : 0, transition: 'opacity 150ms ease' }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto space-y-3">
          <Link to="/quote"
            className="flex items-center justify-center gap-2 py-3 rounded font-semibold text-sm hover:opacity-90 overflow-hidden"
            style={{ background: 'var(--secondary)', color: 'var(--on-secondary)' }}>
            <span className="material-symbols-outlined text-[18px] shrink-0">add</span>
            <span className="whitespace-nowrap"
              style={{ opacity: expanded ? 1 : 0, transition: 'opacity 150ms ease', display: expanded ? 'inline' : 'none' }}>
              New Booking
            </span>
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="material-symbols-outlined text-[16px] shrink-0">logout</span>
            <span className="whitespace-nowrap"
              style={{ opacity: expanded ? 1 : 0, transition: 'opacity 150ms ease', display: expanded ? 'inline' : 'none' }}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header
        className="sticky top-0 z-40 flex justify-between items-center h-16 px-6"
        style={{
          marginLeft: sidebarW,
          transition: 'margin-left 200ms ease',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--outline-variant)',
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px]"
              style={{ color: 'var(--on-surface-variant)' }}>search</span>
            <input className="w-full pl-10 pr-4 py-2 rounded-full text-sm outline-none"
              placeholder="Search bookings or customers..."
              style={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }} />
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="relative" style={{ color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ background: 'var(--error)' }} />
          </button>
          <button style={{ color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="flex items-center gap-3 pl-4" style={{ borderLeft: '1px solid var(--outline-variant)' }}>
            <div className="text-right">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>{agentName || 'Agent Profile'}</p>
              <p className="text-[11px]" style={{ color: 'var(--on-surface-variant)' }}>Senior Consultant</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'var(--surface-container-highest)', color: 'var(--primary)' }}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ marginLeft: sidebarW, transition: 'margin-left 200ms ease', padding: '24px', minHeight: 'calc(100vh - 4rem)' }}>
        {children}
      </main>
    </div>
  );
}
