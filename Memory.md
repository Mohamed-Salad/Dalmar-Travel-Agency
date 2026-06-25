This will be used by me and Claude to note down daily progress and will be used to 
look back on work done and work set for the next day. 

 Daily Log : 
  15/06/2026 aka Inception day of the project:
   started working on setting up the project, set up database and was working on other stuff when conversation between developer and claude ai was compromised by minor mistake. Told Claude my main techstack is not full decided but i wanted : nodejs or npm, react, supabase and the other is up to you. I believe claude was making a express back end server.

 16/06/2026: 
    intending on resuming previous day of work and finishing a MVP build. 
    Today's goals: 
 Scaffold client/ + server/ with packages
 Supabase client + TypeScript types from your schema
 Login page (Supabase Auth)
  Dashboard — pending requests list + active bookings list
 New request form (customer info + travel dates)
 Request detail — add fare options → confirm booking → WhatsApp dispatch button
 Booking detail — update payment amount, tick ticket sent, tick card made
 
 17/06/2026: 
  Only made the github repo and published it

 24/06/2026 (Day 4):
  AUTH DECISION: Customers do NOT need login. Anonymous inquiry form only.
  Agents DO need login via Supabase Auth. Two separate worlds: public site + agent portal.

  DESIGN SYSTEM created (DESIGN.md + design-tokens.json):
  - Colors: Deep Navy (#1B3A6B) primary, Gold (#C9961A) accent
  - Font: Inter
  - Full token set for spacing, radius, shadows, status colors

  LANDING PAGE built (client/src/pages/LandingPage.tsx):
  - Navbar (sticky, navy, Agent Login subtle link)
  - Hero (full-height dark gradient, gold CTA)
  - Why Choose Dalmar (3 value prop cards)
  - Where We Fly (East Africa / Middle East / Asia destination cards)
  - How It Works (3 numbered steps)
  - Inquiry CTA banner
  - Footer (Services + Information links, Reservation Policy, Refund Policy)

  App.tsx wired with React Router. index.css updated with CSS custom properties.

  KNOWN ISSUE: npm must be run from client/ subfolder, not project root.
  Correct command: cd client && npm run dev

  NEXT UP:
  - Customer inquiry form (/inquiry page)
  - Agent login page (/login)
  - Supabase client setup (client/src/lib/supabase.ts)
  - Agent dashboard
  - Reservation + Refund policy placeholder pages

