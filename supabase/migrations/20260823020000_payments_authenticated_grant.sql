-- Same recurring gap this project keeps hitting: the "agent: manage
-- payments" RLS policy already existed but authenticated never had a
-- table-level grant on payments at all, so it was completely inert.
-- No UPDATE/DELETE granted -- payment records are an append-only ledger
-- (corrections are new rows, not edits), matching Update: never in the
-- generated types.
GRANT SELECT, INSERT ON public.payments TO authenticated;
