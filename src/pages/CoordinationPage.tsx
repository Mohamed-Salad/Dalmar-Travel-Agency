import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Agent } from '../types';
import { STATUS_BADGE, initials } from './DashboardPage';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { RefreshCw, Users, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const SELECT_CLS = 'rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none';

export default function CoordinationPage() {
  const [agentName, setAgentName] = useState('');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestWithCustomer[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<RequestWithCustomer | null>(null);
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAgentId(user.id);
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

  async function claimSelected() {
    if (!selected || !agentId) return;
    await supabase.from('booking_requests').update({ claimed_by_agent_id: agentId }).eq('id', selected.id);
    const updated = { ...selected, claimed_by_agent_id: agentId };
    setSelected(updated);
    setRequests((rs) => rs.map((r) => (r.id === selected.id ? updated : r)));
  }

  const waLink = selected ? `https://wa.me/?text=${encodeURIComponent(message)}` : '#';

  return (
    <AppShell agentName={agentName}>
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">WhatsApp Coordination Queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage incoming customer quotes and team assignments in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {agents.slice(0, 4).map((a) => (
              <div key={a.id} className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary/10 text-[10px] font-bold text-primary">
                {initials(a.name)}
              </div>
            ))}
            {agents.length > 4 && (
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-secondary text-[10px] font-bold text-muted-foreground">
                +{agents.length - 4}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" style={{ minHeight: '560px' }}>
        {/* Left: request queue */}
        <Card className="overflow-hidden py-0 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-display text-base font-bold text-foreground">Live Requests</h2>
            <Badge className="bg-destructive/10 text-destructive">
              {requests.filter((r) => r.status === 'pending').length} new
            </Badge>
          </div>
          <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: '520px' }}>
            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
            ) : requests.map((req) => {
              const isSelected = selected?.id === req.id;
              return (
                <button key={req.id} type="button" onClick={() => setSelected(req)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    isSelected ? 'border-primary bg-secondary' : 'border-border hover:bg-secondary/50'
                  )}>
                  <div className="mb-1.5 flex items-start justify-between">
                    <span className="font-mono text-[11px] font-semibold text-primary">#{req.id.slice(0, 6).toUpperCase()}</span>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(req.created_at)}</span>
                  </div>
                  <p className="mb-1 text-[13px] font-semibold text-foreground">
                    {req.customers?.name ?? '—'} — {req.departure_city} → {req.destination_city}
                  </p>
                  <p className="mb-2 line-clamp-1 text-xs text-muted-foreground">
                    {req.earliest_departure} – {req.latest_departure} · {req.adults + req.youth + req.children + req.infants} pax
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {req.claimed_by_agent_id ? '✓ Assigned' : '○ Unassigned'}
                    </span>
                    <Badge className={`text-[11px] uppercase ${STATUS_BADGE[req.status] ?? STATUS_BADGE.pending}`}>
                      {req.status}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right: composer + roster */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {selected && (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-foreground">
                        {selected.customers?.name} — {selected.departure_city} → {selected.destination_city}
                      </h3>
                      <Badge className={`text-[11px] uppercase ${STATUS_BADGE[selected.status] ?? STATUS_BADGE.pending}`}>
                        {selected.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ref: #{selected.id.slice(0, 8).toUpperCase()} · {selected.earliest_departure} – {selected.latest_departure}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#25D366]/90 focus-visible:ring-[#25D366]/50">
                  <a href={waLink} target="_blank" rel="noreferrer">
                    <WhatsAppIcon className="size-4" />
                    Post to Group
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-2">
            {/* Message composer */}
            <Card className="overflow-hidden py-0">
              <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-3">
                <WhatsAppIcon className="size-4 text-[#25D366]" />
                <h3 className="text-[13px] font-semibold text-foreground">Message Composer</h3>
              </div>
              <CardContent className="flex flex-col gap-3 py-4">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Template</label>
                  <select value={template} onChange={(e) => setTemplate(e.target.value)} className={cn(SELECT_CLS, 'w-full')}>
                    {TEMPLATES.map((t) => <option key={t} className="bg-card">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Preview</label>
                  <div className="whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-3 font-mono text-[12px] leading-relaxed text-foreground">
                    {message}
                  </div>
                </div>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Edit message..." />
                <Button asChild className="bg-[#25D366] text-white hover:bg-[#25D366]/90 focus-visible:ring-[#25D366]/50">
                  <a href={waLink} target="_blank" rel="noreferrer">
                    <WhatsAppIcon className="size-4" />
                    Send to All Agents
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Agent roster — claiming is the real claimed_by_agent_id column, same as Dashboard */}
            <Card className="overflow-hidden py-0">
              <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-3">
                <Users className="size-4 text-primary" />
                <h3 className="text-[13px] font-semibold text-foreground">Who's On This Request?</h3>
              </div>
              <div className="custom-scrollbar space-y-2 overflow-y-auto p-3" style={{ maxHeight: '400px' }}>
                {agents.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No agents found.</p>
                ) : agents.map((agent) => {
                  const isClaimer = selected?.claimed_by_agent_id === agent.id;
                  const isMe = agent.id === agentId;
                  const canClaim = isMe && selected && !selected.claimed_by_agent_id;
                  return (
                    <div key={agent.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3',
                        isClaimer ? 'border-primary bg-primary/5' : 'border-border'
                      )}>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">
                          {initials(agent.name)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{agent.name}{isMe && ' (you)'}</p>
                          <p className="text-[11px] text-muted-foreground">{agent.email}</p>
                        </div>
                      </div>
                      {isClaimer ? (
                        <Badge className="gap-1 bg-primary/10 text-primary">
                          <CheckCircle2 className="size-3.5" />
                          Claimed
                        </Badge>
                      ) : canClaim ? (
                        <Button size="sm" variant="outline" onClick={claimSelected}>
                          <Circle className="size-3.5" />
                          Claim
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
