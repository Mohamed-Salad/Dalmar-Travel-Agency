-- Agents can backdate when a reservation was actually made with the
-- customer, separate from created_at (row-insert time, which can lag if
-- an agent logs it a little late).
ALTER TABLE public.fare_options
  ADD COLUMN IF NOT EXISTS reservation_date date NOT NULL DEFAULT CURRENT_DATE;
