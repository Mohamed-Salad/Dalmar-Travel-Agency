-- The "agent: update own profile" RLS policy (id = auth.uid()) already
-- existed but was inert -- authenticated never had table-level UPDATE on
-- agents at all. Column-scoped grant so an agent can edit their own
-- name/phone (for the new profile-popover "Edit profile" action) without
-- ever being able to touch status (the self-approval gate) or email
-- (tied to the actual Supabase Auth login, changing it here would just
-- desync display from the real credential).
GRANT UPDATE (name, phone) ON public.agents TO authenticated;
