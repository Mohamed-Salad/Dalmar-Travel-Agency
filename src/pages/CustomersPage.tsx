import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Booking, FareOption, Payment } from '../types';
import { customerStatus, CUSTOMER_STATUS_BADGE } from './DashboardPage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { ReservationDialog, type ReservationValues } from '@/components/reservation/ReservationDialog';
import { ArrowLeft, User, Plane, CreditCard, Printer, FileText, MessageCircle, Wallet, Timer, CalendarRange, Pencil, TrendingUp, Banknote } from 'lucide-react';

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer'] as const;

type FullBooking = Booking & { fare_options: FareOption; payments: Payment[] };
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
  const [reservationPrinted, setReservationPrinted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [reservationOpen, setReservationOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<typeof PAYMENT_METHODS[number]>('cash');
  const [payError, setPayError] = useState<string | null>(null);
  const [payingSaving, setPayingSaving] = useState(false);
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
        setAgentId(user.id);
        const { data: agent } = await supabase.from('agents').select('name').eq('id', user.id).single();
        if (agent) setAgentName(agent.name);
      }
      if (!id) { setLoading(false); return; }
      const { data } = await supabase
        .from('booking_requests')
        .select('*, customers(*), bookings(*, fare_options(*), payments(*)), fare_options!booking_request_id(*)')
        .eq('id', id)
        .single();
      if (data) {
        const r = data as RequestWithAll;
        setReq(r);
        const b = r.bookings?.[0];
        if (b) {
          setCardMade(b.card_made);
          setTicketSent(b.ticket_sent);
          setReservationPrinted(b.reservation_printed);
          setTicketPrinted(b.ticket_printed);
          if (b.reservation_expiry) startCountdown(b.reservation_expiry);
        }
      }
      setLoading(false);
    }
    load();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id]);

  async function toggleField(field: 'card_made' | 'ticket_sent' | 'reservation_printed' | 'ticket_printed', value: boolean) {
    const bookingId = req?.bookings?.[0]?.id;
    if (!bookingId) return; // no reservation yet -- nothing to persist this to
    const { error } = await supabase.from('bookings').update({ [field]: value }).eq('id', bookingId);
    if (error) { setSaveError(error.message); return; }
    if (field === 'card_made') setCardMade(value);
    if (field === 'ticket_sent') setTicketSent(value);
    if (field === 'reservation_printed') setReservationPrinted(value);
    if (field === 'ticket_printed') setTicketPrinted(value);
  }

  function openReservationDialog() {
    setSaveError(null);
    setReservationOpen(true);
  }

  // Logs a new reservation-attempt row (price + expiry + airline + the date
  // the agent actually made it, timestamped) instead of overwriting the
  // current one -- this is the actual log the Reservation History table
  // below reads from. bookings.reservation_expiry is kept in sync as the
  // "current" convenience value other pages already query directly
  // (Dashboard's stats, the countdown here). Covers both re-quoting an
  // existing reservation and making the first one for this request.
  async function saveReservation(values: ReservationValues) {
    if (!id || !req) return;
    const bookingId = req.bookings?.[0]?.id;
    const { data: newFare, error: fareErr } = await supabase
      .from('fare_options')
      .insert({
        booking_request_id: id, departure_date: req.earliest_departure,
        price: values.price, airline: values.airline, reservation_date: values.date,
        reservation_expiry: values.expiryIso,
      })
      .select('*').single();
    if (fareErr || !newFare) { setSaveError(fareErr?.message ?? 'Could not save.'); return; }

    if (bookingId) {
      const { error: bookingErr } = await supabase
        .from('bookings').update({ fare_option_id: newFare.id, reservation_expiry: values.expiryIso }).eq('id', bookingId);
      if (bookingErr) { setSaveError(bookingErr.message); return; }
      setReq((r) => r && {
        ...r,
        fare_options: [...r.fare_options, newFare],
        bookings: r.bookings.map((b, i) => (i === 0 ? { ...b, fare_options: newFare, reservation_expiry: values.expiryIso } : b)),
      });
    } else {
      const { data: newBooking, error: bookingErr } = await supabase
        .from('bookings')
        .insert({ booking_request_id: id, fare_option_id: newFare.id, reservation_expiry: values.expiryIso })
        .select('*')
        .single();
      if (bookingErr || !newBooking) { setSaveError(bookingErr?.message ?? 'Could not save.'); return; }
      await supabase.from('booking_requests').update({ status: 'booked' }).eq('id', id);
      setReq((r) => r && {
        ...r,
        status: 'booked',
        fare_options: [...r.fare_options, newFare],
        bookings: [{ ...newBooking, fare_options: newFare }],
      });
    }
    if (values.expiryIso) startCountdown(values.expiryIso);
    setReservationOpen(false);
  }

  // Payments are an append-only ledger (one row per installment/deposit --
  // customers on a payment plan pay in increments, others pay the full
  // price up front in one entry) rather than a single overwritten total, so
  // the running balance is always the real sum of what's actually been
  // recorded, not a separately-editable number that can drift from it.
  // Crosses into "paid" the moment the ledger covers the price, whether
  // that takes one entry or five.
  async function recordPayment() {
    const bookingId = req?.bookings?.[0]?.id;
    const amount = Number(payAmount);
    if (!bookingId || !agentId || !amount || amount <= 0) return;
    setPayingSaving(true);
    setPayError(null);
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({ booking_id: bookingId, agent_id: agentId, amount, method: payMethod })
      .select('*').single();
    if (payErr || !payment) { setPayError(payErr?.message ?? 'Could not save.'); setPayingSaving(false); return; }

    const price = req?.bookings?.[0]?.fare_options?.price ?? 0;
    const newTotalPaid = (req?.bookings?.[0]?.payments ?? []).reduce((sum, p) => sum + p.amount, 0) + payment.amount;
    const nowPaid = newTotalPaid >= price;
    if (nowPaid) {
      const { error: statusErr } = await supabase
        .from('bookings').update({ payment_status: 'paid', payment_date: new Date().toISOString() }).eq('id', bookingId);
      if (statusErr) { setPayError(statusErr.message); setPayingSaving(false); return; }
    }
    setReq((r) => r && {
      ...r,
      bookings: r.bookings.map((b, i) => (i === 0
        ? { ...b, payments: [...b.payments, payment], ...(nowPaid ? { payment_status: 'paid' as const } : {}) }
        : b)),
    });
    setPayAmount('');
    setPayingSaving(false);
    setRecordingPayment(false);
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
  const payments = [...(booking?.payments ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max((fare?.price ?? 0) - totalPaid, 0);
  const paidPct = fare?.price ? Math.min((totalPaid / fare.price) * 100, 100) : 0;
  const history = [...req.fare_options].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const firstFare = history[history.length - 1];
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
                    <p className="text-xl font-bold text-foreground">£{fare.price.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status toggles -- card_made/ticket_sent/reservation_printed need a
              reservation to attach to; disabled (not just silently no-op'ing)
              until one exists. */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'TAAMS Card Created', icon: CreditCard, checked: cardMade, onChange: (v: boolean) => toggleField('card_made', v), persisted: true },
              { label: 'Reservation Printed', icon: FileText, checked: reservationPrinted, onChange: (v: boolean) => toggleField('reservation_printed', v), persisted: true },
              { label: 'Ticket Printed', icon: Printer, checked: ticketPrinted, onChange: (v: boolean) => toggleField('ticket_printed', v), persisted: true },
              { label: 'WhatsApp Sent', icon: MessageCircle, checked: ticketSent, onChange: (v: boolean) => toggleField('ticket_sent', v), persisted: true },
            ].map(({ label, icon: Icon, checked, onChange, persisted }) => {
              const disabled = persisted && !booking;
              return (
                <Card key={label} size="sm" className={checked ? 'ring-1 ring-primary' : undefined}>
                  <label className={`flex items-center justify-between px-4 py-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    title={disabled ? 'Make a reservation first' : undefined}>
                    <div className="flex items-center gap-3">
                      <Icon className={`size-5 ${checked ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-[13px] font-semibold text-foreground">{label}</span>
                    </div>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)}
                      className="size-4 cursor-pointer accent-primary disabled:cursor-not-allowed" />
                  </label>
                </Card>
              );
            })}
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
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
                      <p className="text-3xl font-extrabold">{fare?.price != null ? `£${fare.price.toFixed(2)}` : '—'}</p>
                      {wasReQuoted && (
                        <p className="mt-1 flex items-center gap-1 text-[12px] text-primary-foreground/70">
                          <TrendingUp className="size-3.5" />
                          First quoted at £{firstFare.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[11px] uppercase tracking-widest text-primary-foreground/60">Status</p>
                      <p className="text-lg font-bold">
                        {booking.payment_status === 'paid' ? 'Paid ✓' : totalPaid > 0 ? `£${remaining.toFixed(2)} owing` : 'Unpaid'}
                      </p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary-foreground/10">
                    <div className="h-full rounded-full bg-primary-foreground/80 transition-all" style={{ width: `${paidPct}%` }} />
                  </div>
                  {payments.length > 0 && (
                    <div className="space-y-1.5 border-t border-primary-foreground/10 pt-3">
                      <p className="text-[13px] font-semibold">Payments recorded</p>
                      {payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-[12px] text-primary-foreground/80">
                          <span>{new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {p.method.replace('_', ' ')}</span>
                          <span className="font-semibold">£{p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-3">
                    <p className="text-[13px] font-semibold">Expires</p>
                    <p className={`font-mono text-[13px] font-bold ${countdown === 'Expired' ? 'text-destructive' : ''}`}>
                      {countdown || (booking.reservation_expiry ? '—' : 'Not set')}
                    </p>
                  </div>
                  {booking.payment_status !== 'paid' && !recordingPayment && (
                    <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-3">
                      <button onClick={openReservationDialog}
                        className="flex items-center gap-1 text-left text-[13px] font-semibold text-primary-foreground/80 hover:text-primary-foreground">
                        <Pencil className="size-3.5" />
                        Update price / expiry
                      </button>
                      <Button size="sm" variant="secondary" onClick={() => { setPayError(null); setRecordingPayment(true); }}>
                        <Banknote className="size-3.5" />
                        Record a payment
                      </Button>
                    </div>
                  )}
                  {recordingPayment && (
                    <div className="flex flex-col gap-2 border-t border-primary-foreground/10 pt-3">
                      <Input type="number" min="0" step="0.01" placeholder={`Amount (up to £${remaining.toFixed(2)})`} value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="border-primary-foreground/30 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50" />
                      <select value={payMethod} onChange={(e) => setPayMethod(e.target.value as typeof PAYMENT_METHODS[number])}
                        className="rounded-md border border-primary-foreground/30 bg-transparent px-3 py-2 text-sm text-primary-foreground">
                        {PAYMENT_METHODS.map((m) => <option key={m} value={m} className="text-foreground">{m.replace('_', ' ')}</option>)}
                      </select>
                      {payError && <p className="text-[12px] text-red-200">{payError}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={recordPayment} disabled={payingSaving || !payAmount}>
                          {payingSaving ? 'Saving…' : 'Save payment'}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10"
                          onClick={() => setRecordingPayment(false)} disabled={payingSaving}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-primary-foreground/60">No reservation made yet.</p>
                  <Button size="sm" variant="secondary" onClick={openReservationDialog}>Make reservation</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card className="overflow-hidden py-0">
              <div className="flex items-center gap-2 border-b border-border bg-secondary px-4 py-3">
                <Timer className="size-4 text-primary" />
                <h3 className="text-[13px] font-semibold text-foreground">Reservation History</h3>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2 text-left font-semibold">Date Made</th>
                    <th className="px-4 py-2 text-left font-semibold">Price</th>
                    <th className="px-4 py-2 text-left font-semibold">Airline</th>
                    <th className="px-4 py-2 text-left font-semibold">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((f) => (
                    <tr key={f.id} className="border-t border-border">
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(f.reservation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-2 font-semibold text-foreground">£{f.price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{f.airline ?? '—'}</td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">
                        {f.reservation_expiry
                          ? new Date(f.reservation_expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      <ReservationDialog
        open={reservationOpen}
        onOpenChange={(o) => { setReservationOpen(o); if (!o) setSaveError(null); }}
        title={booking ? 'Update price / expiry' : 'Make reservation'}
        initial={{
          date: fare?.reservation_date,
          price: fare?.price != null ? String(fare.price) : '',
          airline: fare?.airline ?? '',
          expiry: booking?.reservation_expiry ? booking.reservation_expiry.slice(0, 16) : '',
        }}
        onSave={saveReservation}
        error={saveError}
      />
    </AppShell>
  );
}
