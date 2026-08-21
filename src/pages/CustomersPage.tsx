import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Booking, FareOption } from '../types';
import { customerStatus, CUSTOMER_STATUS_BADGE } from './DashboardPage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { ArrowLeft, User, Plane, CreditCard, Printer, MessageCircle, Wallet, Timer, CalendarRange, Pencil, TrendingUp } from 'lucide-react';

type FullBooking = Booking & { fare_options: FareOption };
type RequestWithAll = BookingRequest & { customers: Customer; bookings: FullBooking[]; fare_options: FareOption[] };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
  );
}

export default function CustomersPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState('');
  const [req, setReq] = useState<RequestWithAll | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardMade, setCardMade] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketPrinted, setTicketPrinted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [expiryInput, setExpiryInput] = useState('');
  const [reQuoting, setReQuoting] = useState(false);
  const [reQuotePrice, setReQuotePrice] = useState('');
  const intervalRef = useRef<number | null>(null);

  function startCountdown(expiry: string) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      const diff = new Date(expiry).getTime() - Date.now();
      if (diff <= 0) { setCountdown('Expired'); if (intervalRef.current) clearInterval(intervalRef.current); return; }
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    }, 1000);
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
        if (agent) setAgentName(agent.name);
      }
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from('booking_requests')
        .select('*, customers(*), bookings(*, fare_options(*)), fare_options!booking_request_id(*)')
        .eq('id', id)
        .single();
      if (data) {
        const r = data as RequestWithAll;
        setReq(r);
        const b = r.bookings?.[0];
        if (b) {
          setCardMade(b.card_made);
          setTicketSent(b.ticket_sent);
          if (b.reservation_expiry) startCountdown(b.reservation_expiry);
        }
      }
      setLoading(false);
    }
    load();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  async function toggleField(field: 'card_made' | 'ticket_sent', value: boolean) {
    const bookingId = req?.bookings?.[0]?.id;
    if (!bookingId) return;
    await supabase.from('bookings').update({ [field]: value }).eq('id', bookingId);
    if (field === 'card_made') setCardMade(value);
    if (field === 'ticket_sent') setTicketSent(value);
  }

  function openExpiryEdit() {
    const current = req?.bookings?.[0]?.reservation_expiry;
    setExpiryInput(current ? current.slice(0, 16) : '');
    setEditingExpiry(true);
  }

  async function saveExpiry() {
    const bookingId = req?.bookings?.[0]?.id;
    if (!bookingId || !expiryInput) return;
    const iso = new Date(expiryInput).toISOString();
    await supabase.from('bookings').update({ reservation_expiry: iso }).eq('id', bookingId);
    setReq((r) => r && { ...r, bookings: r.bookings.map((b, i) => (i === 0 ? { ...b, reservation_expiry: iso } : b)) });
    startCountdown(iso);
    setEditingExpiry(false);
  }

  async function saveReQuote() {
    const price = Number(reQuotePrice);
    const bookingId = req?.bookings?.[0]?.id;
    if (!price || !bookingId || !id) return;
    // A re-quote is a new fare_options row, not an edit to the existing one --
    // the old price stays on record so "first quoted vs current" is a real
    // query, not something overwritten and lost.
    const { data: newFare, error: fareErr } = await supabase
      .from('fare_options')
      .insert({ booking_request_id: id, departure_date: req!.earliest_departure, price })
      .select('*').single();
    if (fareErr || !newFare) return;
    await supabase.from('bookings').update({ fare_option_id: newFare.id }).eq('id', bookingId);
    setReq((r) => r && {
      ...r,
      fare_options: [...r.fare_options, newFare],
      bookings: r.bookings.map((b, i) => (i === 0 ? { ...b, fare_options: newFare } : b)),
    });
    setReQuoting(false);
    setReQuotePrice('');
  }

  if (loading) {
    return (
      <AppShell agentName={agentName}>
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Loading...</div>
      </AppShell>
    );
  }

  if (!req) {
    return (
      <AppShell agentName={agentName}>
        <div className="py-20 text-center">
          <p className="mb-4 text-sm text-muted-foreground">Booking not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  const booking = req.bookings?.[0];
  const fare = booking?.fare_options;
  const firstFare = [...req.fare_options].sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
  const wasReQuoted = firstFare && fare && firstFare.id !== fare.id;
  const customer = req.customers;
  const status = customerStatus(req, booking);
  const pax = [
    req.adults > 0 && `${req.adults} Adult${req.adults > 1 ? 's' : ''}`,
    req.youth > 0 && `${req.youth} Youth`,
    req.children > 0 && `${req.children} Child${req.children > 1 ? 'ren' : ''}`,
    req.infants > 0 && `${req.infants} Infant${req.infants > 1 ? 's' : ''}`,
  ].filter(Boolean).join(', ');

  const waMsg = encodeURIComponent(
    `Salaan ${customer?.name},\n\nTigidhkaaga safarka waa diyaar!\n✈ ${req.departure_city} → ${req.destination_city}\n📅 ${req.earliest_departure}\n\nDalmar Travel Agency`
  );

  return (
    <AppShell agentName={agentName}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/dashboard')}
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </button>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {customer?.name ?? 'Customer Detail'}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={`uppercase tracking-wide ${CUSTOMER_STATUS_BADGE[status]}`}>{status}</Badge>
            {countdown && (
              <Badge variant="outline" className="gap-1.5">
                <Timer className="size-3.5" />
                Expires: <span className="font-mono font-bold">{countdown}</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" size="sm">Edit Details</Button>
          {customer?.phone && (
            <Button asChild size="sm" className="bg-[#25D366] text-white hover:bg-[#25D366]/90 focus-visible:ring-[#25D366]/50">
              <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${waMsg}`} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="size-4" />
                Send Ticket via WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-8">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <User className="size-5 text-primary" />
                Passenger Details
              </CardTitle>
              <span className="text-sm text-muted-foreground">{pax || '1 Adult'}</span>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-6">
              <Field label="Full Name" value={customer?.name ?? ''} />
              <Field label="Phone Number" value={customer?.phone ?? ''} />
              <Field label="Email Address" value={customer?.email ?? ''} />
              <Field label="Departure City" value={req.departure_city} />
              <Field label="Destination City" value={req.destination_city} />
              <Field label="Notes" value={req.notes ?? ''} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden py-0">
            <div className="flex items-center gap-2 border-b border-border bg-secondary px-6 py-4">
              <Plane className="size-5 text-primary" />
              <h3 className="font-display text-lg font-bold text-foreground">Flight Itinerary</h3>
            </div>
            <CardContent className="py-6">
              <div className="flex items-center gap-8">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Plane className="size-8" />
                </div>
                <div className="grid flex-1 grid-cols-3 items-center gap-4">
                  <div className="text-center">
                    <p className="font-mono text-xl font-bold text-foreground">{req.departure_city}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{req.earliest_departure}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="mb-1 text-xs text-muted-foreground">{req.earliest_return ? 'Return' : 'One Way'}</p>
                    <div className="relative flex w-full items-center justify-center border-t border-dashed border-border">
                      <Plane className="size-4 -rotate-45 bg-card text-primary" />
                    </div>
                    <p className="mt-1 text-xs font-bold text-primary">{fare?.airline ?? 'TBD'}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-xl font-bold text-foreground">{req.destination_city}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{req.latest_departure}</p>
                  </div>
                </div>
                {fare?.price != null && (
                  <div className="shrink-0 text-right">
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Fare</p>
                    <p className="text-xl font-bold text-foreground">${fare.price.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status toggles */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'TAAMS Card Created', icon: CreditCard, checked: cardMade, onChange: (v: boolean) => toggleField('card_made', v) },
              { label: 'Ticket Printed', icon: Printer, checked: ticketPrinted, onChange: setTicketPrinted },
              { label: 'WhatsApp Sent', icon: MessageCircle, checked: ticketSent, onChange: (v: boolean) => toggleField('ticket_sent', v) },
            ].map(({ label, icon: Icon, checked, onChange }) => (
              <Card key={label} size="sm" className={checked ? 'ring-1 ring-primary' : undefined}>
                <label className="flex cursor-pointer items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Icon className={`size-5 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-[13px] font-semibold text-foreground">{label}</span>
                  </div>
                  <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
                    className="size-4 cursor-pointer accent-primary" />
                </label>
              </Card>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Wallet className="size-5" />
                Payment Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              {booking ? (
                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="mb-1 text-[11px] uppercase tracking-widest text-primary-foreground/60">Total Fare</p>
                      <p className="text-3xl font-extrabold">{fare?.price != null ? `$${fare.price.toFixed(2)}` : '—'}</p>
                      {wasReQuoted && (
                        <p className="mt-1 flex items-center gap-1 text-[12px] text-primary-foreground/70">
                          <TrendingUp className="size-3.5" />
                          First quoted at ${firstFare.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[11px] uppercase tracking-widest text-primary-foreground/60">Status</p>
                      <p className="text-lg font-bold">{booking.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}</p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-foreground/10">
                    <div className="h-full rounded-full bg-primary-foreground/80 transition-all"
                      style={{ width: booking.payment_status === 'paid' ? '100%' : '0%' }} />
                  </div>
                  <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-3">
                    <p className="text-[13px] font-semibold">Payment Method</p>
                    <p className="text-[13px]">{booking.payment_method?.replace('_', ' ').toUpperCase() ?? 'Not set'}</p>
                  </div>
                  {booking.payment_status !== 'paid' && (
                    reQuoting ? (
                      <div className="flex flex-col gap-2 border-t border-primary-foreground/10 pt-3">
                        <Input type="number" min="0" step="0.01" placeholder="New price" value={reQuotePrice}
                          onChange={(e) => setReQuotePrice(e.target.value)}
                          className="border-primary-foreground/30 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50" />
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={saveReQuote}>Save new price</Button>
                          <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setReQuoting(false)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setReQuoting(true); setReQuotePrice(fare?.price != null ? String(fare.price) : ''); }}
                        className="border-t border-primary-foreground/10 pt-3 text-left text-[13px] font-semibold text-primary-foreground/80 hover:text-primary-foreground">
                        Price changed? Re-quote →
                      </button>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-primary-foreground/60">No reservation made yet.</p>
              )}
            </CardContent>
          </Card>

          {booking && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reservation Expiry
                </CardTitle>
                {!editingExpiry && (
                  <button onClick={openExpiryEdit} className="text-muted-foreground hover:text-foreground" aria-label="Edit reservation expiry">
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </CardHeader>
              <CardContent>
                {editingExpiry ? (
                  <div className="flex flex-col gap-2">
                    <Input type="datetime-local" value={expiryInput} onChange={(e) => setExpiryInput(e.target.value)} className="font-mono" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveExpiry}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingExpiry(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : booking.reservation_expiry ? (
                  <>
                    <p className={`font-mono text-xl font-bold ${countdown === 'Expired' ? 'text-destructive' : 'text-foreground'}`}>
                      {countdown || '—'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(booking.reservation_expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set — the reservation system deletes unconfirmed holds after a deadline; set this once you know it.</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-muted-foreground">
                <CalendarRange className="size-4" />
                Travel Window
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Field label="Earliest Departure" value={req.earliest_departure} />
              <Field label="Latest Departure" value={req.latest_departure} />
              {req.earliest_return && <Field label="Earliest Return" value={req.earliest_return} />}
              {req.latest_return && <Field label="Latest Return" value={req.latest_return} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
