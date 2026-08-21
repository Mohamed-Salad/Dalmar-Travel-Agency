import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Timer, Wallet, Printer, CreditCard, Download, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Booking, FareOption } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { ReservationDialog, type ReservationValues } from '@/components/reservation/ReservationDialog';

type RequestWithCustomer = BookingRequest & { customers: Customer };
type BookingRow = Pick<Booking, 'id' | 'booking_request_id' | 'payment_status' | 'ticket_sent' | 'card_made' | 'reservation_expiry'>;

// Pipeline status (booking_requests.status) — used by CustomersListPage too, unchanged.
export const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-500/10 text-amber-600',
  responded: 'bg-sky-500/10 text-sky-500',
  booked:    'bg-emerald-500/10 text-emerald-500',
  cancelled: 'bg-destructive/10 text-destructive',
};

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// Customer's-eye-view status — derived from booking_requests.status + the linked
// bookings row, not a stored field. "Where is this traveler in their journey."
export type CustomerStatus = 'Cancelled' | 'Ticket sent' | 'Paid' | 'Reservation made' | 'Inquiry received';

export function customerStatus(req: BookingRequest, booking: Pick<Booking, 'payment_status' | 'ticket_sent'> | undefined): CustomerStatus {
  if (req.status === 'cancelled') return 'Cancelled';
  if (booking?.ticket_sent) return 'Ticket sent';
  if (booking?.payment_status === 'paid') return 'Paid';
  if (booking) return 'Reservation made';
  return 'Inquiry received';
}

export const CUSTOMER_STATUS_BADGE: Record<CustomerStatus, string> = {
  'Inquiry received':  'bg-sky-500/10 text-sky-500',
  'Reservation made':  'bg-amber-500/10 text-amber-600',
  Paid:                'bg-emerald-500/10 text-emerald-500',
  'Ticket sent':        'bg-primary/10 text-primary',
  Cancelled:            'bg-destructive/10 text-destructive',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestWithCustomer[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [fareOptions, setFareOptions] = useState<Pick<FareOption, 'booking_request_id'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState('');
  const [filter, setFilter] = useState('All Statuses');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
      if (agent) setAgentName(agent.name);
      const [{ data: reqData }, { data: bookingData }, { data: fareData }] = await Promise.all([
        supabase.from('booking_requests').select('*, customers(*)').order('created_at', { ascending: false }).limit(20),
        supabase.from('bookings').select('id, booking_request_id, payment_status, ticket_sent, card_made, reservation_expiry'),
        supabase.from('fare_options').select('booking_request_id'),
      ]);
      if (reqData) setRequests(reqData as RequestWithCustomer[]);
      if (bookingData) setBookings(bookingData);
      if (fareData) setFareOptions(fareData);
      setLoading(false);
    }
    load();
  }, []);

  const bookingByRequest = new Map(bookings.map((b) => [b.booking_request_id, b]));

  async function claimRequest(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('booking_requests').update({ claimed_by_agent_id: user.id }).eq('id', id);
    setRequests((r) => r.map((req) => (req.id === id ? { ...req, claimed_by_agent_id: user.id } : req)));
  }

  async function confirmReservation(req: RequestWithCustomer, values: ReservationValues) {
    const { data: fare, error: fareErr } = await supabase
      .from('fare_options')
      .insert({
        booking_request_id: req.id, departure_date: req.earliest_departure,
        price: values.price, airline: values.airline, reservation_date: values.date,
        reservation_expiry: values.expiryIso,
      })
      .select('id').single();
    if (fareErr || !fare) return;
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({ booking_request_id: req.id, fare_option_id: fare.id, reservation_expiry: values.expiryIso })
      .select('id, booking_request_id, payment_status, ticket_sent, card_made, reservation_expiry')
      .single();
    if (bookingErr || !booking) return;
    await supabase.from('booking_requests').update({ status: 'booked' }).eq('id', req.id);
    setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status: 'booked' } : r)));
    setBookings((bs) => [...bs, booking]);
    setReservingId(null);
  }

  async function markPaid(bookingId: string) {
    await supabase.from('bookings').update({ payment_status: 'paid', payment_date: new Date().toISOString() }).eq('id', bookingId);
    setBookings((bs) => bs.map((b) => (b.id === bookingId ? { ...b, payment_status: 'paid' } : b)));
  }

  async function markTicketSent(bookingId: string) {
    await supabase.from('bookings').update({ ticket_sent: true }).eq('id', bookingId);
    setBookings((bs) => bs.map((b) => (b.id === bookingId ? { ...b, ticket_sent: true } : b)));
  }

  async function markCardMade(bookingId: string) {
    await supabase.from('bookings').update({ card_made: true }).eq('id', bookingId);
    setBookings((bs) => bs.map((b) => (b.id === bookingId ? { ...b, card_made: true } : b)));
  }

  function dispatchToGroup(req: RequestWithCustomer) {
    const name = req.customers?.name ?? 'Unknown';
    const phone = req.customers?.phone ?? '';
    const pax = [
      req.adults > 0 && `${req.adults} Adult${req.adults > 1 ? 's' : ''}`,
      req.youth > 0 && `${req.youth} Youth`,
      req.children > 0 && `${req.children} Child${req.children > 1 ? 'ren' : ''}`,
      req.infants > 0 && `${req.infants} Infant${req.infants > 1 ? 's' : ''}`,
    ].filter(Boolean).join(', ') || '1 Adult';
    const msg = encodeURIComponent(
      `New booking request\n${name} — ${phone}\n${req.departure_city} → ${req.destination_city}\n${req.earliest_departure} – ${req.latest_departure}\n${pax}\n\nReply here to claim, then mark it Claimed on the Dashboard.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  function filterTable(status: string) {
    setFilter(status);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const filtered = filter === 'All Statuses'
    ? requests
    : requests.filter((r) => customerStatus(r, bookingByRequest.get(r.id)) === filter);

  const reservingReq = requests.find((r) => r.id === reservingId) ?? null;

  // How many booking_requests have more than one fare_options row -- each
  // re-quote (CustomersPage's "Price changed? Re-quote") adds a row instead
  // of overwriting the price, so >1 means the price moved at least once.
  const fareCountByRequest = new Map<string, number>();
  for (const f of fareOptions) fareCountByRequest.set(f.booking_request_id, (fareCountByRequest.get(f.booking_request_id) ?? 0) + 1);

  const counts = {
    active: requests.filter((r) => r.status === 'booked').length,
    expiring: requests.filter((r) => r.status === 'pending').length,
    paymentsPending: bookings.filter((b) => b.payment_status === 'unpaid').length,
    ticketsToPrint: bookings.filter((b) => b.payment_status === 'paid' && !b.ticket_sent).length,
    cardsToMake: bookings.filter((b) => !b.card_made).length,
    reQuoted: bookings.filter((b) => b.payment_status === 'unpaid' && (fareCountByRequest.get(b.booking_request_id) ?? 0) > 1).length,
  };

  const STATS = [
    { label: 'Active reservations', value: counts.active, icon: Ticket, onClick: () => filterTable('Reservation made') },
    { label: 'Expiring today', value: counts.expiring, icon: Timer, urgent: true, onClick: () => filterTable('Inquiry received') },
    { label: 'Payments pending', value: counts.paymentsPending, icon: Wallet, onClick: () => navigate('/customers') },
    { label: 'Tickets to print', value: counts.ticketsToPrint, icon: Printer, onClick: () => navigate('/customers') },
    { label: 'TAAMS cards to make', value: counts.cardsToMake, icon: CreditCard, onClick: () => navigate('/customers') },
    { label: 'Re-quoted, unpaid', value: counts.reQuoted, icon: TrendingUp, urgent: counts.reQuoted > 0, onClick: () => navigate('/customers') },
  ];

  return (
    <AppShell agentName={agentName}>
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back{agentName ? `, Agent ${agentName.split(' ')[0]}` : ''}. Here's your overview for today.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="size-4" />
          Export
        </Button>
      </div>

      {/* Stats — click through to the filtered data */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => (
          <button key={s.label} type="button" onClick={s.onClick} className="text-left">
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className={`mt-1 font-mono text-2xl font-bold tabular-nums ${s.urgent ? 'text-destructive' : 'text-foreground'}`}>
                    {s.value}
                  </p>
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <s.icon className="size-4" />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {/* Recent interactions table */}
      <div ref={tableRef} className="scroll-mt-6">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-bold text-foreground">Recent Interactions</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-xs text-foreground outline-none"
          >
            {['All Statuses', 'Inquiry received', 'Reservation made', 'Paid', 'Ticket sent', 'Cancelled'].map((o) => (
              <option key={o} className="bg-card">{o}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-secondary">
              <tr>
                {['Customer', 'Itinerary', 'Travel Dates', 'Status', 'Claimed', 'Actions'].map((h) => (
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
                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">No requests found.</td></tr>
              ) : filtered.map((req) => {
                const name = req.customers?.name ?? '—';
                const phone = req.customers?.phone ?? '';
                const booking = bookingByRequest.get(req.id);
                const status = customerStatus(req, booking);
                // Customer-facing message — stays Somali, ~90% of customers are Somali speakers.
                const waMsg = encodeURIComponent(
                  `Salaan ${name},\n\nWaxaan helnay codsiyadaada safar:\n✈ ${req.departure_city} → ${req.destination_city}\n📅 ${req.earliest_departure} – ${req.latest_departure}\n\nDalmar Travel Agency`
                );

                return (
                  <tr
                    key={req.id}
                    className="border-b border-border transition-colors hover:bg-secondary/50"
                  >
                    <td className="cursor-pointer px-6 py-4" onClick={() => navigate(`/customers/${req.id}`)}>
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
                    <td className="cursor-pointer px-6 py-4 font-mono text-sm text-foreground" onClick={() => navigate(`/customers/${req.id}`)}>
                      {req.departure_city} → {req.destination_city}
                    </td>
                    <td className="cursor-pointer px-6 py-4 font-mono text-sm text-foreground" onClick={() => navigate(`/customers/${req.id}`)}>
                      {req.earliest_departure} – {req.latest_departure}
                    </td>
                    <td className="cursor-pointer px-6 py-4" onClick={() => navigate(`/customers/${req.id}`)}>
                      <Badge className={`uppercase tracking-wide ${CUSTOMER_STATUS_BADGE[status]}`}>
                        {status}
                      </Badge>
                    </td>
                    <td className="cursor-pointer px-6 py-4" onClick={() => navigate(`/customers/${req.id}`)}>
                      {req.claimed_by_agent_id
                        ? <Badge className="bg-emerald-500/10 text-emerald-500">Claimed</Badge>
                        : <Badge className="bg-destructive/10 text-destructive">Open</Badge>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!req.claimed_by_agent_id && req.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => claimRequest(req.id)}>Claim</Button>
                            <Button size="sm" variant="outline" onClick={() => dispatchToGroup(req)}>
                              <WhatsAppIcon className="size-3.5 text-[#25D366]" />
                              Dispatch
                            </Button>
                          </>
                        )}
                        {req.claimed_by_agent_id && !booking && (
                          <Button size="sm" onClick={() => setReservingId(req.id)}>Make reservation</Button>
                        )}
                        {booking && booking.payment_status !== 'paid' && (
                          <Button size="sm" onClick={() => markPaid(booking.id)}>Mark paid</Button>
                        )}
                        {booking && booking.payment_status === 'paid' && !booking.ticket_sent && (
                          <Button size="sm" onClick={() => markTicketSent(booking.id)}>Mark ticket sent</Button>
                        )}
                        {booking?.ticket_sent && !booking.card_made && (
                          <Button size="sm" onClick={() => markCardMade(booking.id)}>Mark TAAMS card</Button>
                        )}
                        <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#25D366]/90 focus-visible:ring-[#25D366]/50">
                          <a href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${waMsg}`} target="_blank" rel="noreferrer">
                            <WhatsAppIcon className="size-3.5" />
                            WhatsApp
                          </a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border bg-secondary/40 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} interaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>
      </div>

      {reservingReq && (
        <ReservationDialog
          open
          onOpenChange={(o) => !o && setReservingId(null)}
          title={`Make reservation — ${reservingReq.customers?.name ?? 'Customer'}`}
          onSave={(values) => confirmReservation(reservingReq, values)}
        />
      )}
    </AppShell>
  );
}
