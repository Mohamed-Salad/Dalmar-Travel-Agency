import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Booking } from '../types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE, initials } from './DashboardPage';

type RequestWithAll = BookingRequest & { customers: Customer; bookings: Booking[] };

function FlagBadge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return ok
    ? <Badge className="bg-emerald-500/10 text-emerald-500">{yes}</Badge>
    : <Badge className="bg-destructive/10 text-destructive">{no}</Badge>;
}

export default function CustomersListPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithAll[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [filter, setFilter] = useState('All Statuses');

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
        if (agent) setAgentName(agent.name);
      }
      const { data } = await supabase
        .from('booking_requests')
        .select('*, customers(*), bookings(*)')
        .order('created_at', { ascending: false });
      if (data) setRequests(data as RequestWithAll[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'All Statuses'
    ? requests
    : requests.filter((r) => r.status === filter.toLowerCase());

  return (
    <AppShell agentName={agentName}>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every booking request and where it stands.</p>
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold text-foreground">All Customers</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs text-foreground outline-none"
          >
            {['All Statuses', 'Pending', 'Responded', 'Booked', 'Cancelled'].map((o) => (
              <option key={o} className="bg-card">{o}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary">
              <tr>
                {['Customer', 'Itinerary', 'Status', 'Payment', 'Ticket Sent', 'TAAMS Card'].map((h) => (
                  <th key={h} className="border-b border-border px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">No customers found.</td></tr>
              ) : filtered.map((req) => {
                const name = req.customers?.name ?? '—';
                const phone = req.customers?.phone ?? '';
                const booking = req.bookings?.[0];

                return (
                  <tr
                    key={req.id}
                    className="cursor-pointer border-b border-border transition-colors hover:bg-secondary/50"
                    onClick={() => navigate(`/customers/${req.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials(name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">{phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-foreground">
                      {req.departure_city} → {req.destination_city}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`uppercase tracking-wide ${STATUS_BADGE[req.status] ?? STATUS_BADGE.pending}`}>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {booking
                        ? <FlagBadge ok={booking.payment_status === 'paid'} yes="Paid" no="Unpaid" />
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {booking
                        ? <FlagBadge ok={booking.ticket_sent} yes="Sent" no="Pending" />
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      {booking
                        ? <FlagBadge ok={booking.card_made} yes="Made" no="Pending" />
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-secondary/40 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>
    </AppShell>
  );
}
