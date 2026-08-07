import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AppShell from '../components/AppShell';
import type { BookingRequest, Customer, Booking, FareOption } from '../types';

type FullBooking = Booking & { fare_options: FareOption };
type RequestWithAll = BookingRequest & { customers: Customer; bookings: FullBooking[] };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-variant)' }}>{label}</p>
      <p className="text-base font-semibold" style={{ color: 'var(--primary)' }}>{value || '—'}</p>
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
        .select('*, customers(*), bookings(*, fare_options(*))')
        .eq('id', id)
        .single();
      if (data) {
        const r = data as RequestWithAll;
        setReq(r);
        const b = r.bookings?.[0];
        if (b) {
          setCardMade(b.card_made);
          setTicketSent(b.ticket_sent);
          if (b.reservation_expiry) {
            const interval = setInterval(() => {
              const diff = new Date(b.reservation_expiry!).getTime() - Date.now();
              if (diff <= 0) { setCountdown('Expired'); clearInterval(interval); return; }
              const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
              const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
              const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
              setCountdown(`${h}:${m}:${s}`);
            }, 1000);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function toggleField(field: 'card_made' | 'ticket_sent', value: boolean) {
    const bookingId = req?.bookings?.[0]?.id;
    if (!bookingId) return;
    await supabase.from('bookings').update({ [field]: value }).eq('id', bookingId);
    if (field === 'card_made') setCardMade(value);
    if (field === 'ticket_sent') setTicketSent(value);
  }

  if (loading) {
    return (
      <AppShell agentName={agentName}>
        <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--on-surface-variant)' }}>Loading...</div>
      </AppShell>
    );
  }

  if (!req) {
    return (
      <AppShell agentName={agentName}>
        <div className="text-center py-20">
          <p className="text-sm mb-4" style={{ color: 'var(--on-surface-variant)' }}>Booking not found.</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>← Back to Dashboard</button>
        </div>
      </AppShell>
    );
  }

  const booking = req.bookings?.[0];
  const fare = booking?.fare_options;
  const customer = req.customers;
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm mb-2 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--on-surface-variant)' }}>
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Dashboard
          </button>
          <h2 className="text-[32px] font-bold" style={{ color: 'var(--primary)' }}>
            {customer?.name ?? 'Customer Detail'}
          </h2>
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold"
              style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' }}>
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
            </span>
            {countdown && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px]"
                style={{ background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', border: '1px solid var(--outline-variant)' }}>
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                Expires: <span className="font-mono font-bold ml-1">{countdown}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="px-4 py-2 rounded text-sm font-semibold"
            style={{ background: 'var(--surface)', border: '1px solid var(--outline)', color: 'var(--primary)' }}>
            Edit Details
          </button>
          {customer?.phone && (
            <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${waMsg}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold shadow-md"
              style={{ background: '#25D366', color: '#fff' }}>
              <span className="material-symbols-outlined text-[18px]">send</span>
              Send Ticket via WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Passenger Card */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[20px] font-semibold flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>person</span>
                Passenger Details
              </h3>
              <span className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>{pax || '1 Adult'}</span>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Field label="Full Name" value={customer?.name ?? ''} />
              <Field label="Phone Number" value={customer?.phone ?? ''} />
              <Field label="Email Address" value={customer?.email ?? ''} />
              <Field label="Departure City" value={req.departure_city} />
              <Field label="Destination City" value={req.destination_city} />
              <Field label="Notes" value={req.notes ?? ''} />
            </div>
          </div>

          {/* Flight Itinerary */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-low)' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--secondary)' }}>flight</span>
              <h3 className="text-[20px] font-semibold" style={{ color: 'var(--primary)' }}>Flight Itinerary</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--surface-container)' }}>
                  <span className="material-symbols-outlined text-[32px]" style={{ color: 'var(--primary)' }}>flight_takeoff</span>
                </div>
                <div className="flex-1 grid grid-cols-3 items-center gap-4">
                  <div className="text-center">
                    <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{req.departure_city}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>{req.earliest_departure}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xs mb-1" style={{ color: 'var(--on-surface-variant)' }}>
                      {req.earliest_return ? 'Return' : 'One Way'}
                    </p>
                    <div className="w-full h-px relative flex items-center justify-center"
                      style={{ background: 'var(--outline-variant)' }}>
                      <span className="material-symbols-outlined text-[20px]"
                        style={{ color: 'var(--secondary)', background: 'var(--surface-container-lowest)' }}>
                        flight_takeoff
                      </span>
                    </div>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--secondary)' }}>
                      {fare?.airline ?? 'TBD'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{req.destination_city}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>{req.latest_departure}</p>
                  </div>
                </div>
                {fare?.price != null && (
                  <div className="text-right shrink-0">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-variant)' }}>Fare</p>
                    <p className="text-[20px] font-bold" style={{ color: 'var(--primary)' }}>${fare.price.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'TAAMS Card Created', icon: 'credit_card', checked: cardMade,       onChange: (v: boolean) => toggleField('card_made', v) },
              { label: 'Ticket Printed',     icon: 'print',       checked: ticketPrinted,   onChange: (v: boolean) => setTicketPrinted(v) },
              { label: 'WhatsApp Sent',      icon: 'chat',        checked: ticketSent,       onChange: (v: boolean) => toggleField('ticket_sent', v) },
            ].map(({ label, icon, checked, onChange }) => (
              <label key={label} className="glass-card rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors"
                style={{ border: checked ? '1px solid var(--secondary)' : undefined }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined" style={{ color: checked ? 'var(--secondary)' : 'var(--on-surface-variant)' }}>{icon}</span>
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--on-surface)' }}>{label}</span>
                </div>
                <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
                  className="w-5 h-5 rounded cursor-pointer" style={{ accentColor: 'var(--secondary)' }} />
              </label>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6 sticky top-24">
          {/* Payment Tracker */}
          <div className="rounded-xl p-6 shadow-xl" style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}>
            <h3 className="text-[20px] font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">payments</span>
              Payment Tracker
            </h3>
            {booking ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Fare</p>
                    <p className="text-[32px] font-extrabold">{fare?.price != null ? `$${fare.price.toFixed(2)}` : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>Status</p>
                    <p className="text-[20px] font-bold" style={{ color: 'var(--secondary-fixed)' }}>
                      {booking.payment_status === 'paid' ? 'Paid ✓' : 'Unpaid'}
                    </p>
                  </div>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: booking.payment_status === 'paid' ? '100%' : '0%',
                    background: 'var(--secondary-fixed)',
                  }} />
                </div>
                <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-[13px] font-semibold">Payment Method</p>
                  <p className="text-[13px]" style={{ color: 'var(--secondary-fixed)' }}>
                    {booking.payment_method?.replace('_', ' ').toUpperCase() ?? 'Not set'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>No booking created yet.</p>
            )}
          </div>

          {/* Reservation Expiry */}
          {booking?.reservation_expiry && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-[13px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--on-surface-variant)' }}>
                Reservation Expiry
              </h3>
              <p className="text-[20px] font-bold font-mono"
                style={{ color: countdown === 'Expired' ? 'var(--error)' : 'var(--primary)' }}>
                {countdown || '—'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                {new Date(booking.reservation_expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Travel Window */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h3 className="text-[13px] font-bold uppercase tracking-widest" style={{ color: 'var(--on-surface-variant)' }}>Travel Window</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Earliest Departure" value={req.earliest_departure} />
              <Field label="Latest Departure" value={req.latest_departure} />
              {req.earliest_return && <Field label="Earliest Return" value={req.earliest_return} />}
              {req.latest_return && <Field label="Latest Return" value={req.latest_return} />}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
