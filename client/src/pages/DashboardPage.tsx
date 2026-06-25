import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { BookingRequest, Customer } from '../types';

type RequestWithCustomer = BookingRequest & { customers: Customer };

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  responded: { bg: '#DBEAFE', color: '#1E40AF', label: 'Responded' },
  booked:    { bg: '#D1FAE5', color: '#065F46', label: 'Booked' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'booked'>('all');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: agent } = await supabase
        .from('agents')
        .select('name')
        .eq('id', user.id)
        .single();

      if (agent) setAgentName(agent.name);

      const { data } = await supabase
        .from('booking_requests')
        .select('*, customers(*)')
        .order('created_at', { ascending: false });

      if (data) setRequests(data as RequestWithCustomer[]);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/');
  }

  async function claimRequest(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('booking_requests').update({ claimed_by_agent_id: user.id }).eq('id', id);
    setRequests(r => r.map(req => req.id === id ? { ...req, claimed_by_agent_id: user.id } : req));
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const counts = {
    pending:   requests.filter(r => r.status === 'pending').length,
    responded: requests.filter(r => r.status === 'responded').length,
    booked:    requests.filter(r => r.status === 'booked').length,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>

      {/* Navbar */}
      <nav style={{ background: 'var(--color-primary)' }} className="sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-white font-bold text-xl">Dalmar</span>
            <span style={{ color: 'var(--color-gold)' }} className="font-bold text-xl">&nbsp;Travel</span>
            <span className="ml-3 text-white/40 text-sm">Agent Portal</span>
          </div>
          <div className="flex items-center gap-4">
            {agentName && (
              <span className="text-white/70 text-sm hidden md:block">
                👋 {agentName}
              </span>
            )}
            <button onClick={handleLogout}
              className="text-white/60 hover:text-white text-sm transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending', count: counts.pending, color: 'var(--color-warning)', key: 'pending' },
            { label: 'Responded', count: counts.responded, color: '#1E40AF', key: 'responded' },
            { label: 'Booked', count: counts.booked, color: 'var(--color-success)', key: 'booked' },
          ].map(({ label, count, color }) => (
            <div key={label} className="p-5 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
              <p className="font-bold text-3xl" style={{ color }}>{count}</p>
            </div>
          ))}
        </div>

        {/* Header + filter */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
            Booking Requests
          </h1>
          <div className="flex gap-2">
            {(['all', 'pending', 'responded', 'booked'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={{
                  background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: filter === f ? 'white' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Request list */}
        {loading ? (
          <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>
            No {filter === 'all' ? '' : filter} requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const pax = [
                req.adults > 0 && `${req.adults} adult${req.adults > 1 ? 's' : ''}`,
                req.youth > 0 && `${req.youth} youth`,
                req.children > 0 && `${req.children} child${req.children > 1 ? 'ren' : ''}`,
                req.infants > 0 && `${req.infants} infant${req.infants > 1 ? 's' : ''}`,
              ].filter(Boolean).join(', ');

              const status = STATUS_STYLES[req.status] ?? STATUS_STYLES.pending;

              return (
                <div key={req.id}
                  className="p-5 rounded-2xl flex items-center justify-between gap-4 transition-all hover:shadow-md cursor-pointer"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onClick={() => navigate(`/requests/${req.id}`)}>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold truncate">{req.customers?.name ?? '—'}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                        style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                      {req.claimed_by_agent_id && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {req.departure_city} → {req.destination_city}
                      {' · '}{req.earliest_departure} – {req.latest_departure}
                      {pax && ` · ${pax}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!req.claimed_by_agent_id && req.status === 'pending' && (
                      <button
                        onClick={e => { e.stopPropagation(); claimRequest(req.id); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                        style={{ background: 'var(--color-gold)', color: 'white' }}>
                        Claim
                      </button>
                    )}
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
