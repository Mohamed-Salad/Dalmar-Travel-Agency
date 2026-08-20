-- Agent signup approval gate.
--
-- Existing agent rows are grandfathered in as 'approved' (two-step default
-- below) so this migration cannot lock out anyone already using the app --
-- only rows inserted AFTER this migration default to 'pending'.
ALTER TABLE public.agents ADD COLUMN status text NOT NULL DEFAULT 'approved';
ALTER TABLE public.agents ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.agents ADD CONSTRAINT agents_status_check CHECK (status IN ('pending', 'approved'));

-- Let a freshly-signed-up user insert their own row. WITH CHECK forces
-- status = 'pending' at the database level -- a self-signup request that
-- tries to insert status = 'approved' directly (e.g. a raw REST call
-- bypassing the app's UI entirely) is rejected here, not just by the
-- client's TypeScript types (which are not a runtime control).
-- No UPDATE grant/policy exists for agents on `authenticated` at all, so
-- there is also no path to flip status after the row exists -- approval
-- is only possible via the Supabase dashboard (service_role), by design.
GRANT INSERT ON public.agents TO authenticated;

CREATE POLICY "agents can insert their own pending row" ON public.agents
  FOR INSERT
  WITH CHECK (id = auth.uid() AND status = 'pending');

-- Helper for gating other tables behind approval (SECURITY DEFINER avoids
-- RLS recursion when a policy needs to check the agents table itself).
--
-- NOT YET WIRED IN: the existing authenticated-role policies on customers/
-- booking_requests/bookings predate this concept and still only check "is
-- this role authenticated," not "is this agent approved." Until those
-- policies are updated to also call is_approved_agent(), a signed-up-but-
-- pending agent can read/write real customer data via the API directly --
-- AuthGuard's "pending approval" screen is a UI convenience, not a
-- security boundary. See PLANNING.md.
CREATE OR REPLACE FUNCTION public.is_approved_agent()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agents WHERE id = auth.uid() AND status = 'approved'
  );
$$;
