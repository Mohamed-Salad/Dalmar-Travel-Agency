# Dalmar Travel Agency — Project Bible

** Every new session please read this quickly to get bearings **
---

## Project Goal

Build a web app that condenses, eases, and speeds up the average interaction between customers and travel agents at Dalmar Travel Agency.

### Average Agent User Story
1. Customer walks in or calls
2. Customer gives earliest + latest departure dates, and return dates if needed (sometimes one-way). Dalmar sells **airplane tickets only** at discounted rates. Internal booking tool is **Travelport**.
3. Agent gives best travel dates based on current availability
4. Customer decides to continue or leave
5. Agent makes a reservation
6. Agent quotes final price again
7. Customer is told reservation expiry date
8. Customer pays via cash, card, or money transfer
9. Ticket sent to customer's phone and printed at the office

### What the Web App Must Do
- Speed up step 2 via a public inquiry form
- Agent dashboard: track customers, payment status, amount paid, ticket sent, card made
- **"Card Made"** = a TAAMS entry (internal software). App does NOT integrate with TAAMS — it just reminds agents to do it so nothing is forgotten when busy
- Somali language support — 90% of customers are Somali
- Generate WhatsApp message from booking request → send to agent group → note which agent claimed it
- Signup is agents-only, admin-approval gated (future feature)
- Other agent-aid features can be freely added

---

## Project Approach (ALWAYS FOLLOW)

### 1. Think Before Coding
State assumptions explicitly. Present multiple interpretations instead of picking silently. Push back when a simpler approach exists. Stop and ask when something is unclear.

### 2. Simplicity First
Minimum code that solves the problem. No speculative features. No abstractions for single-use code. If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes
Touch only what you must. Don't improve adjacent code. Match existing style. Every changed line must trace to the user's request.

### 4. Goal-Driven Execution
Define success criteria. Loop until verified. State a brief plan with verify steps for multi-step tasks.

### 5. make sure to audit yourself every hour by updating /.claude/sessions/ 
every session first check date, then check all the previous entries for each new claude session, then make sure there is a new file to update by checking title contains current date


### 6. push back if user or agent diverts from principle or main goal/development and is going astray
if you notice something doesn't work after 2 attempts or that a task, feature implement does not contribute to goal push back and notify 


### 7. make sure to commit each feature update and if its a big feature consider with me whether we should branch out to test in safe environment before doing so in prod

this is so that we can safely always assess when things went wrong where it went wrong

### 8. make sure to not tag yourself in credits of commits
as mentioned in bullet point title. also don't do credits at alll just commit please not even credditng me since thatis a give away of sloppy vibe coding


---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS v4 — `@import "tailwindcss"` only, **no tailwind.config.js** |
| Design tokens | MD3 CSS custom properties in `client/src/index.css` |
| Icons | Material Symbols Outlined via Google Fonts CDN (already in index.html) |
| Backend / DB | Supabase (Auth + PostgreSQL) |
| Design reference | Stitch (Google) — project ID: `17425367072553794360` |

**CRITICAL — always run dev from the client subfolder:**
```
cd client && npm run dev
```
Running from project root fails — vite lives in `client/node_modules` only.

**CRITICAL — do not revert this pattern:**
Uses `crypto.randomUUID()` client-side to generate the customer ID BEFORE inserting. This avoids `.select('id').single()` after insert, which 401s because anon cannot SELECT from customers (RLS correctly blocks reads for anon):
```ts
const customerId = crypto.randomUUID();
await supabase.from('customers').insert({ id: customerId, name, phone, email });
await supabase.from('booking_requests').insert({ customer_id: customerId, ...rest });
```

**If booking_requests INSERT returns 400, run this once:**
```sql
ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS adults   int4 NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS youth    int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS children int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS infants  int4 NOT NULL DEFAULT 0;
```
---

## Supabase Postgres Best Practices

Full skill at `.agents/skills/supabase-postgres-best-practices/`. Reference when writing SQL:

| Priority | Rule |
|---|---|
| CRITICAL | Index FK columns and columns used in WHERE/ORDER BY |
| CRITICAL | All tables must keep RLS enabled — never disable |
| CRITICAL | Use `SECURITY DEFINER` functions sparingly — only for cross-table auth checks like `is_agent()` |
| HIGH | Keep RLS policies simple — complex policies hurt query speed |
| HIGH | Anon insert policies use `WITH CHECK (true)` not `USING (true)` |
| MEDIUM | Never SELECT * in RLS policies |
| MEDIUM | Use `gen_random_uuid()` for PKs, never serial |
---