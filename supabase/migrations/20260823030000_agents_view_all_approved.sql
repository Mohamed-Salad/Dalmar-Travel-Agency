-- "agent: view own profile" (id = auth.uid()) meant no agent could ever
-- see a colleague's name -- CoordinationPage's "Who's On This Request"
-- roster has been silently broken since it was built (always only shows
-- yourself), and the Dashboard's new claimed-by-name join needs the same
-- broader visibility. Matches how customers/booking_requests/bookings/
-- payments already work in this app: the whole approved team can see
-- each other's data, not just their own -- there's no column-level way to
-- show name-but-not-email/phone across different rows via RLS alone, and
-- splitting that out via a view is overkill for a small team where
-- colleagues already know each other's contact details. status stays
-- protected on the UPDATE side (self-approval), not SELECT -- being able
-- to see who's approved isn't sensitive.
DROP POLICY "agent: view own profile" ON public.agents;

CREATE POLICY "agent: view all agents" ON public.agents
  FOR SELECT
  USING (public.is_agent());
