import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer } from '../types';

type RequestWithCustomer = BookingRequest & { customers: Customer };

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e' },
  responded: { bg: '#dbeafe', color: '#1e40af' },
  booked:    { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

const AVATAR_COLORS = [
  { bg: 'var(--primary-fixed)',           color: 'var(--on-primary-fixed)' },
  { bg: 'var(--secondary-container)',     color: 'var(--on-secondary-container)' },
  { bg: 'var(--surface-container-highest)', color: 'var(--primary)' },
  { bg: 'var(--tertiary-fixed)',          color: 'var(--on-tertiary-fixed)' },
];

const TICKER_RATES = [
  'HGA → DXB: $420 ↑', 'MGQ → JED: $315 ↓', 'HGA → ADD: $280 ↔',
  'MGQ → IST: $650 ↑', 'HGA → NBO: $340 ↓', 'MGQ → DXB: $395 ↑',
  'HGA → LHR: $780 ↑', 'MGQ → CAI: $290 ↔',
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [filter, setFilter] = useState('All Statuses');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
      if (agent) setAgentName(agent.name);
      const { data } = await supabase
        .from('booking_requests')
        .select('*, customers(*)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setRequests(data as RequestWithCustomer[]);
      setLoading(false);
    }
    load();
  }, []);

  async function claimRequest(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('booking_requests').update({ claimed_by_agent_id: user.id }).eq('id', id);
    setRequests(r => r.map(req => req.id === id ? { ...req, claimed_by_agent_id: user.id } : req));
  }

  const filtered = filter === 'All Statuses'
    ? requests
    : requests.filter(r => r.status === filter.toLowerCase());

  const counts = {
    active:    requests.filter(r => r.status === 'booked').length,
    expiring:  requests.filter(r => r.status === 'pending').length,
    responded: requests.filter(r => r.status === 'responded').length,
  };

  const STATS = [
    { label: 'Active Reservations', value: counts.active,    sub: '+12% vs last week',         subColor: 'var(--secondary)',              icon: 'airplane_ticket', iconBg: 'var(--primary-fixed)',         iconColor: 'var(--on-primary-fixed-variant)' },
    { label: 'Expiring Today',       value: counts.expiring,  sub: 'Action required immediately', subColor: 'var(--error)',                  icon: 'timer',           iconBg: 'var(--error-container)',       iconColor: 'var(--on-error-container)',       valueColor: 'var(--error)' },
    { label: 'Payments Pending',     value: counts.responded, sub: 'Track in customers view',     subColor: 'var(--on-tertiary-container)',   icon: 'payments',        iconBg: 'var(--secondary-container)',   iconColor: 'var(--on-secondary-container)' },
    { label: 'Tickets to Print',     value: counts.responded, sub: 'Ready for dispatch',          subColor: 'var(--secondary)',              icon: 'print',           iconBg: 'var(--surface-container-high)', iconColor: 'var(--primary)' },
  ];

  return (
    <AppShell agentName={agentName}>
      {/* Live Rates Ticker */}
      <div className="mb-6 rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--primary)' }}>
        <div className="ticker-wrap flex items-center h-10">
          <div className="px-4 h-full flex items-center font-semibold text-[13px] shrink-0 z-10 tracking-wider"
            style={{ background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)' }}>
            TODAY'S RATES
          </div>
          <div className="ticker text-[13px] font-medium" style={{ color: 'var(--on-primary)' }}>
            {[...TICKER_RATES, ...TICKER_RATES].map((r, i) => (
              <span key={i} className="mx-8">✈ {r}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[32px] font-bold leading-tight" style={{ color: 'var(--primary)' }}>
            Maamulka Dashboard-ka
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Welcome back{agentName ? `, Agent ${agentName.split(' ')[0]}` : ''}. Here is your overview for today.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold"
          style={{ border: '1px solid var(--outline)', color: 'var(--primary)' }}>
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          Export
        </button>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s, i) => (
          <div key={i} className="p-6 rounded-xl flex items-start justify-between"
            style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
            <div>
              <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--on-surface-variant)' }}>{s.label}</p>
              <h3 className="text-[24px] font-bold" style={{ color: (s as any).valueColor ?? 'var(--primary)' }}>{s.value}</h3>
              <p className="text-xs mt-2 font-medium" style={{ color: s.subColor }}>{s.sub}</p>
            </div>
            <div className="p-2 rounded-lg" style={{ background: s.iconBg }}>
              <span className="material-symbols-outlined" style={{ color: s.iconColor }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactions Table */}
      <div className="rounded-xl overflow-hidden shadow-sm"
        style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
        <div className="px-6 py-4 flex justify-between items-center"
          style={{ borderBottom: '1px solid var(--outline-variant)' }}>
          <h4 className="text-[20px] font-semibold" style={{ color: 'var(--primary)' }}>
            Recent Interactions (Macmiilka)
          </h4>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-xs px-3 py-1 rounded outline-none"
            style={{ border: '1px solid var(--outline-variant)', background: 'var(--surface)', color: 'var(--on-surface)' }}>
            {['All Statuses', 'Pending', 'Responded', 'Booked', 'Cancelled'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--surface-container-low)' }}>
              <tr>
                {['Customer (Macmiil)', 'Route', 'Travel Dates', 'Status', 'Claimed', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[13px] font-semibold"
                    style={{ color: 'var(--on-surface-variant)', borderBottom: '1px solid var(--outline-variant)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm" style={{ color: 'var(--on-surface-variant)' }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm" style={{ color: 'var(--on-surface-variant)' }}>No requests found.</td></tr>
              ) : filtered.map((req, i) => {
                const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                const sb = STATUS_BADGE[req.status] ?? STATUS_BADGE.pending;
                const name = req.customers?.name ?? '—';
                const phone = req.customers?.phone ?? '';
                const waMsg = encodeURIComponent(
                  `Salaan ${name},\n\nWaxaan helnay codsiyadaada safar:\n✈ ${req.departure_city} → ${req.destination_city}\n📅 ${req.earliest_departure} – ${req.latest_departure}\n\nDalmar Travel Agency`
                );

                return (
                  <tr key={req.id} className="transition-colors cursor-pointer"
                    style={{ borderBottom: '1px solid var(--outline-variant)' }}
                    onClick={() => navigate(`/customers/${req.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(231,238,255,0.3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: av.bg, color: av.color }}>
                          {initials(name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--on-surface)' }}>{name}</p>
                          <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>{phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--on-surface)' }}>
                      {req.departure_city} → {req.destination_city}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--on-surface)' }}>
                      {req.earliest_departure} – {req.latest_departure}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                        style={{ background: sb.bg, color: sb.color }}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {req.claimed_by_agent_id
                        ? <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#dcfce7', color: '#166534' }}>Claimed</span>
                        : <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#fee2e2', color: '#991b1b' }}>Open</span>}
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        {!req.claimed_by_agent_id && req.status === 'pending' && (
                          <button onClick={() => claimRequest(req.id)}
                            className="px-3 py-1.5 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
                            style={{ background: 'var(--secondary)', color: 'var(--on-secondary)' }}>
                            Claim
                          </button>
                        )}
                        <a href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${waMsg}`}
                          target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all"
                          style={{ background: 'rgba(37,211,102,0.1)', color: '#128C7E' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += 'background:#25D366!important;color:#fff!important'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.1)'; (e.currentTarget as HTMLElement).style.color = '#128C7E'; }}>
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 flex justify-between items-center"
          style={{ background: 'var(--surface-container-low)', borderTop: '1px solid var(--outline-variant)' }}>
          <p className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>
            Showing {filtered.length} interaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bottom: Peak Travel + Quick Quote */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 p-6 rounded-xl"
          style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-[20px] font-semibold" style={{ color: 'var(--primary)' }}>Peak Travel Monitoring</h4>
            <span className="text-xs font-semibold uppercase px-2 py-1 rounded"
              style={{ background: 'rgba(0,106,106,0.1)', color: 'var(--secondary)' }}>
              Hajj Season Prep
            </span>
          </div>
          <div className="h-48 rounded-lg flex items-end p-6"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)' }}>
            <p className="text-white text-sm font-medium">
              Projected demand for MGQ→JED route expected to increase by 45% next month. Secure seat blocks now.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl shadow-lg" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
          <h4 className="text-[20px] font-semibold mb-4">Quick Quotation</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Destination</label>
              <select className="w-full py-2 px-3 rounded text-sm text-white" style={{ background: 'var(--primary-container)', border: 'none' }}>
                {['Hargeisa (HGA)', 'Mogadishu (MGQ)', 'Istanbul (IST)', 'Dubai (DXB)', 'London (LHR)'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Departure</label>
                <input type="date" className="w-full py-2 px-3 rounded text-sm text-white" style={{ background: 'var(--primary-container)', border: 'none' }} />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Passengers</label>
                <input type="number" defaultValue={1} min={1} className="w-full py-2 px-3 rounded text-sm text-white" style={{ background: 'var(--primary-container)', border: 'none' }} />
              </div>
            </div>
            <button onClick={() => navigate('/quote')}
              className="w-full py-3 rounded-lg font-bold text-sm mt-2 hover:brightness-110 transition-all active:scale-95"
              style={{ background: 'var(--secondary-fixed)', color: 'var(--on-secondary-fixed)' }}>
              Full Quote →
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
