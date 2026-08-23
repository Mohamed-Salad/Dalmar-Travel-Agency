-- Agents print a reservation confirmation slip far more often than the
-- final ticket (per user: "more common") -- tracked the same way
-- card_made/ticket_sent already are, so it persists and any agent opening
-- the record sees it.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS reservation_printed boolean NOT NULL DEFAULT false;
