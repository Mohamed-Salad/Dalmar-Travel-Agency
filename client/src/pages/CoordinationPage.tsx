import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Agent } from '../types';

type RequestWithCustomer = BookingRequest & { customers: Customer };

const TEMPLATES = [
  'Standard Quote Summary',
  'Urgent Payment Reminder',
  'Booking Confirmation',
  'Inquiry — Team Help',
];

function buildMessage(req: RequestWithCustomer | null, template: string): string {
  if (!req) return 'Select a request from the queue to generate a message.';
  const name = req.customers?.name ?? 'Customer';
  const route = `${req.departure_city} → ${req.destination_city}`;
  const dates = `${req.earliest_departure} – ${req.latest_departure}`;
  const pax = req.adults + req.youth + req.children + req.infants;
  switch (template) {
    case 'Urgent Payment Reminder':
      return `⚠️ URGENT — Hi Team,\n\nPayment reminder for ${name} (${route}).\nDates: ${dates}\nPlease follow up ASAP.\n\n— Dalmar Travel`;
    case 'Booking Confirmation':
      return `✅ Booking Confirmed!\n\nCustomer: ${name}\nRoute: ${route}\nDates: ${dates}\n\nTicket to be sent shortly.\n— Dalmar Travel`;
    case 'Inquiry — Team Help':
      return `❓ Team Help Needed\n\nNew inquiry from ${name} for ${route}.\nDates: ${dates}\n\nCan anyone assist? — Dalmar Travel`;
    default:
      return `📋 Quote Summary\n\nHi Team, new quote for ${name}:\nRoute: ${route}\nDates: ${dates}\nPassengers: ${pax} total\n\nPlease review and advise.\n— Dalmar Travel`;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

const AVATAR_PALETTE = [
  { bg: 'var(--primary)',           color: 'var(--on-primary)' },
  { bg: 'var(--secondary)',         color: 'var(--on-secondary)' },
  { bg: 'var(--primary-container)', color: 'var(--on-primary-container)' },
  { bg: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
];

export default function CoordinationPage() {
  const [agentName, setAgentName] = useState('');
  const [requests, setRequests] = useState<RequestWithCustomer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<RequestWithCustomer | null>(null);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
        if (agent) setAgentName(agent.name);
      }
      const [{ data: reqs }, { data: agts }] = await Promise.all([
        supabase.from('booking_requests').select('*, customers(*)').order('created_at', { ascending: false }).limit(15),
        supabase.from('agents').select('*'),
      ]);
      if (reqs) {
        const list = reqs as RequestWithCustomer[];
        setRequests(list);
        if (list.length > 0) setSelected(list[0]);
      }
      if (agts) setAgents(agts);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    setMessage(buildMessage(selected, template));
  }, [selected, template]);

  function toggleClaim(agentId: string) {
    const key = `${agentId}-${selected?.id ?? ''}`;
    setClaimed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const waLink = selected ? `https://wa.me/?text=${encodeURIComponent(message)}` : '#';

  return (
    <AppShell agentName={agentName}>
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-[32px] font-bold" style={{ color: 'var(--primary)' }}>WhatsApp Coordination Queue</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            Manage incoming customer quotes and team assignments in real-time.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex -space-x-2">
            {agents.slice(0, 4).map((a, i) => {
              const c = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              return (
                <div key={a.id} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                  style={{ background: c.bg, color: c.color, borderColor: 'var(--surface)' }}>
                  {a.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              );
            })}
            {agents.length > 4 && (
              <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'var(--surface-container-highest)', color: 'var(--primary)', borderColor: 'var(--surface)' }}>
                +{agents.length - 4}
              </div>
            )}
          </div>
          <button onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6" style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}>
        {/* Left: Request Queue */}
        <div className="col-span-4 flex flex-col rounded-xl overflow-hidden"
          style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
          <div className="px-4 py-3 flex justify-between items-center"
            style={{ borderBottom: '1px solid var(--outline-variant)' }}>
            <h3 className="text-[20px] font-semibold" style={{ color: 'var(--primary)' }}>Live Requests</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: 'var(--error)', color: 'var(--on-error)' }}>
              {requests.filter(r => r.status === 'pending').length} NEW
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {loading ? (
              <p className="text-sm text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>Loading...</p>
            ) : requests.map(req => {
              const isSelected = selected?.id === req.id;
              return (
                <div key={req.id} onClick={() => setSelected(req)}
                  className="p-3 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: isSelected ? 'var(--surface-container)' : 'var(--surface-container-lowest)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                  }}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold"
                      style={{ background: isSelected ? 'var(--primary-container)' : 'var(--surface-container-high)', color: 'var(--primary)' }}>
                      #{req.id.slice(0, 6).toUpperCase()}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--outline)' }}>{timeAgo(req.created_at)}</span>
                  </div>
                  <p className="text-[13px] font-semibold mb-1" style={{ color: isSelected ? 'var(--secondary)' : 'var(--primary)' }}>
                    {req.customers?.name ?? '—'} — {req.departure_city} → {req.destination_city}
                  </p>
                  <p className="text-[12px] line-clamp-1 mb-2" style={{ color: 'var(--on-surface-variant)' }}>
                    {req.earliest_departure} – {req.latest_departure} · {req.adults + req.youth + req.children + req.infants} pax
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: req.claimed_by_agent_id ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>
                      {req.claimed_by_agent_id ? '✓ Assigned' : '○ Unassigned'}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded"
                      style={{
                        background: req.status === 'pending' ? '#fef3c7' : req.status === 'booked' ? '#dcfce7' : 'var(--surface-container)',
                        color: req.status === 'pending' ? '#92400e' : req.status === 'booked' ? '#166534' : 'var(--on-surface-variant)',
                      }}>
                      {req.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Composer + Roster */}
        <div className="col-span-8 flex flex-col gap-6 overflow-hidden">
          {/* Selected Summary */}
          {selected && (
            <div className="flex justify-between items-center p-4 rounded-xl shadow-sm"
              style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface-container)' }}>
                  <span className="material-symbols-outlined text-[28px]" style={{ color: 'var(--primary)' }}>travel_explore</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[18px] font-semibold" style={{ color: 'var(--primary)' }}>
                      {selected.customers?.name} — {selected.departure_city} → {selected.destination_city}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
                      {selected.status}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    Ref: #{selected.id.slice(0, 8).toUpperCase()} · {selected.earliest_departure} – {selected.latest_departure}
                  </p>
                </div>
              </div>
              <a href={waLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-md shrink-0"
                style={{ background: '#25D366', color: '#fff' }}>
                <span className="material-symbols-outlined text-[18px]">send</span>
                Post to Group
              </a>
            </div>
          )}

          {/* Composer + Roster */}
          <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
            {/* Message Composer */}
            <div className="rounded-xl flex flex-col overflow-hidden"
              style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <div className="p-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.13 1.411 4.715 1.412 5.223 0 9.474-4.251 9.477-9.477.001-2.533-.985-4.913-2.777-6.706-1.791-1.793-4.17-2.779-6.704-2.779-5.225 0-9.476 4.252-9.479 9.478-.002 1.734.475 3.426 1.382 4.903l-1.033 3.774 3.86-1.011z"/>
                </svg>
                <h5 className="text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>Message Composer</h5>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Template</label>
                  <select value={template} onChange={e => setTemplate(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm outline-none"
                    style={{ background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }}>
                    {TEMPLATES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Preview</label>
                  <div className="p-3 rounded-xl text-[12px] leading-relaxed"
                    style={{ background: '#DCF8C6', color: '#075E54', border: '1px solid #d1e7bc', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {message}
                  </div>
                </div>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded text-sm outline-none resize-none"
                  placeholder="Edit message..."
                  style={{ background: 'var(--surface)', border: '1px solid var(--outline-variant)', color: 'var(--on-surface)' }} />
                <a href={waLink} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm"
                  style={{ background: '#25D366', color: '#fff' }}>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Send to All Agents
                </a>
              </div>
            </div>

            {/* Agent Roster */}
            <div className="rounded-xl flex flex-col overflow-hidden"
              style={{ background: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
              <div className="p-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
                <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--primary)' }}>group</span>
                <h5 className="text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>Who Took This Task?</h5>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {agents.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: 'var(--on-surface-variant)' }}>No agents found.</p>
                ) : agents.map((agent, i) => {
                  const key = `${agent.id}-${selected?.id ?? ''}`;
                  const hasClaimed = claimed.has(key);
                  const c = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                  return (
                    <div key={agent.id}
                      className="flex items-center justify-between p-3 rounded-xl transition-all"
                      style={{
                        background: hasClaimed ? 'rgba(0,106,106,0.08)' : 'var(--surface-container-low)',
                        border: `1px solid ${hasClaimed ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                      }}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0"
                          style={{ background: c.bg, color: c.color }}>
                          {agent.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: 'var(--on-surface)' }}>{agent.name}</p>
                          <p className="text-[11px]" style={{ color: 'var(--on-surface-variant)' }}>{agent.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => selected && toggleClaim(agent.id)}
                        disabled={!selected}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold transition-all disabled:opacity-40"
                        style={{
                          background: hasClaimed ? 'var(--secondary)' : 'var(--surface-container)',
                          color: hasClaimed ? 'var(--on-secondary)' : 'var(--on-surface-variant)',
                          border: '1px solid var(--outline-variant)',
                        }}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: hasClaimed ? "'FILL' 1" : "'FILL' 0" }}>
                          {hasClaimed ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        {hasClaimed ? 'Took Task' : 'Mark Taken'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
