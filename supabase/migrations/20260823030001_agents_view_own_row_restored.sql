-- Correction to the previous migration: dropping "view own profile"
-- entirely was wrong. is_agent() requires status = 'approved', so a
-- still-pending agent lost the ability to see their own row at all --
-- AuthGuard's initial check (select status where id = auth.uid()) would
-- return nothing, and only the pending screen still worked because the
-- subsequent insert-attempt hits a caught 23505 duplicate-key error as a
-- fallback. That's an accidental control-flow path, not a real fix.
-- Restoring "view own row" (any status) alongside "view all agents"
-- (approved only) -- SELECT policies OR together, so this means: always
-- see your own row, plus see everyone's once you're approved.
CREATE POLICY "agent: view own profile" ON public.agents
  FOR SELECT
  USING (id = auth.uid());
