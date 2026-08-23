-- Same fix as reservation_printed: "Ticket Printed" was local-only React
-- state (persisted: false, by original design intent) with no DB column
-- backing it at all -- reverting on navigation was the correct behavior
-- for what existed, not a bug in the persistence layer. Now explicitly
-- requested to persist, so wiring it the same way card_made/ticket_sent/
-- reservation_printed already are.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS ticket_printed boolean NOT NULL DEFAULT false;
