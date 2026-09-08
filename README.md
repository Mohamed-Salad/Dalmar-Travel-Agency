# Dalmar Travel Agency

A booking management platform built for a real, working travel agency — condenses the usual
customer-to-agent flow (phone call → price check → reservation → payment → ticket) into a single
tool, with a public inquiry form on one side and an agent dashboard on the other.

**Live demo:** https://dalmar-travel-agency.netlify.app

The public pages (Landing, Inquiry, Login) are open to browse. The agent dashboard sits behind
sign-in and admin approval by design — it's the internal tool agents use daily to track real
customer data, not a public-facing feature.

## What it does

- Public inquiry form customers fill in with their travel dates, so agents skip re-asking the same
  questions on the call
- Agent dashboard: claim inquiries, track reservation status, log payments (including partial /
  installment payments), and get reminders for steps that are easy to forget when busy (printing a
  ticket, making the internal TAAMS card entry)
- Reservation price history — every re-quote is logged, not overwritten, so an agent can see how a
  price moved over time
- English / Somali bilingual customer-facing UI (the majority of this agency's customers are
  Somali speakers)
- WhatsApp handoff for dispatching new inquiries to the agent team

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase (Postgres, Auth, Row-Level Security) ·
deployed on Netlify · CI via GitHub Actions

## Notes on the build

RLS policies are the actual enforced access-control layer here, not just an app-level check — an
agent's ability to see or edit a row is decided by Postgres, not by trusting the frontend to ask
nicely. Schema changes are tracked as ordered migration files under `supabase/migrations/`.
