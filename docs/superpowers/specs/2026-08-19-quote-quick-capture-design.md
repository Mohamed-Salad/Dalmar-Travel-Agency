# Quote Page — Quick Capture (Natural-Language Note Parsing)

## Purpose

When a customer walks into the office, the agent currently has to click through
`QuotePage`'s structured form field by field while the customer talks. This feature adds a
free-text "Quick Capture" box above the existing form: the agent types short bullet-point
notes (one fact per line) while the customer talks, clicks **Fill Form**, and a local
regex-based parser fills as many structured fields as it can recognize. The agent still
reviews and submits through the existing form — nothing about validation or submission
changes.

This is an **augmentation**, not a replacement. The structured form stays exactly as it is
today; this only adds a faster way to populate it.

## Non-goals (explicit scope boundaries)

- **No LLM / no external API call.** Parsing is local regex/heuristics only, chosen
  specifically to avoid new infrastructure (no Supabase Edge Function, no API key, no
  per-request cost, no added latency, nothing leaves the browser).
- **No relative dates.** "Next week", "in two weeks" etc. are not parsed — those lines fall
  through to Notes for the agent to read and fill manually. Only explicit day+month patterns
  are supported.
- **No auto-submit.** Filling the form never submits it. The agent always reviews before
  clicking the existing Submit button.
- **No email parsing.** Dropped per explicit request — not worth the false-positive risk
  (an email-shaped token appearing in an unrelated note).

## UI / interaction model

- A textarea ("Quick Capture") added above the existing form card on `QuotePage.tsx`,
  placeholder text showing the expected one-fact-per-line style with an example.
- A **"Fill Form"** button below it. Clicking it:
  1. Splits the textarea content into non-empty lines.
  2. Runs each line through the parser (see below).
  3. Applies every matched field to the existing form state (`customerName`, `phone`, `from`,
     `to`, `earlyDep`, `lateDep`, `earlyRet`, `lateRet`, `adults`, `youth`, `children`,
     `infants`, `tripType`).
  4. Appends any unmatched line to the existing `notes` field (never dropped, never
     overwrites what the agent already typed there manually — appended, not replaced).
- Re-running **Fill Form** after editing/adding lines re-parses the *entire* textarea from
  scratch and re-applies matched fields — idempotent, not incremental. This keeps the mental
  model simple ("this button syncs the form to whatever is in the box right now") instead of
  tracking per-line diff state.
- Each field that gets auto-filled gets a subtle visual marker (e.g. a left border accent) —
  it clears the moment the agent manually edits that field. This exists because parsing can
  be wrong (especially city-pair and date matches), and the agent needs a visible cue for
  "this was guessed, glance at it" without blocking submission.

## Parsing scope

One line is tested against matchers in this priority order; **first match wins per line**
(a line is only used for one field/group, not re-tested against later matchers):

| Order | Matches | Fills | Example |
|---|---|---|---|
| 1 | Phone | `phone` | `0615123456`, `+252615123456` |
| 2 | City pair | `from`, `to` | `Mogadishu to Nairobi`, `Muqdisho - Nairobi` |
| 3 | Return-prefixed date range | `earlyRet`, `lateRet` | `return 20-25 Sept` |
| 4 | Date range | `earlyDep`, `lateDep` | `10-15 Sept`, `Sept 10 to 15` |
| 5 | Passenger counts | `adults`, `youth`, `children`, `infants` | `2A 1Y 1C` |
| 6 | Trip type keyword | `tripType` | `one way`, `return`, `round trip` |
| 7 | Fallback: name | `customerName` (only if still empty) | first unmatched line |
| 8 | Fallback: notes | `notes` (appended) | every other unmatched line |

### Matcher details

- **Phone**: digit sequences with optional leading `+`, spaces, or dashes, 7–15 digits total.
  Covers `+252...` and local `0...` formats without hardcoding a single country format.
- **City pair**: scans the line for two names present in the existing `CITIES` list
  (`src/lib/cities.ts`), case-insensitive substring match, connected by a separator
  (`to` / `→` / `-` / `,`). First city found = departure, second = destination. If only one
  known city is found, the line is left unmatched (falls through) rather than guessing which
  slot it belongs in.
- **Date range**: `D(-D)? Month` or `Month D (to|-) (Month )?D` patterns, English month names
  plus common 3-letter abbreviations (Jan…Dec). A single date with no range is treated as both
  earliest and latest (matches the existing form's own fallback: `latest_departure` defaults
  to `earliest_departure` when only one date is given, per `QuotePage.tsx`'s submit logic).
  No year is parsed — the form doesn't collect one today either.
- **Return-prefixed date range**: same date pattern, but the line must start with the keyword
  `return` (case-insensitive) — routes to `earlyRet`/`lateRet` instead of the departure
  fields. Without this explicit prefix, a plain date-range line always fills the *departure*
  window, per your instruction — a second, unprefixed date-range line found later in the
  notes would simply overwrite the first (last-match-wins for a given field), not append a
  return window. Agents wanting a return leg captured must use the `return` prefix.
- **Passenger counts**: number immediately followed by one of `A`/`Y`/`C`/`I` (case-insensitive,
  optional space), for Adults / Youth (12–15) / Children (2–11) / Infants (0–2) respectively.
  Multiple counts can appear in one line (`2A 1Y 1C`) or across separate lines.
- **Trip type**: keyword match only (`one way`, `oneway`, `return`, `round trip`) — does not
  infer trip type from the presence/absence of a return-date line, since that inference could
  silently fight an agent who just hasn't typed the return date yet.
- **Name fallback**: the *first* line that doesn't match any earlier pattern, and only while
  `customerName` is still empty, is treated as the customer's name. This matches the
  bullet-point convention described (name is naturally the first thing agents jot down).
- **Notes fallback**: everything else unmatched is appended to the `notes` field, newline-
  joined, so no typed information is ever silently discarded even when the parser can't place
  it in a structured field.

## The editable file

New file: **`src/lib/quoteCapture.ts`**. Structure:

```ts
// ── EDIT ME: tune these lists without touching any matcher logic below ──
const MONTHS = { jan: 1, january: 1, feb: 2, february: 2, /* ... */ };
const PAX_LETTERS = { adults: 'A', youth: 'Y', children: 'C', infants: 'I' };
const TRIP_KEYWORDS = { oneway: ['one way', 'oneway', 'single'], return: ['return', 'round trip'] };
const PHONE_DIGITS = { min: 7, max: 15 };

// ── Matchers, tried in order, first match wins per line ──
const MATCHERS: LineMatcher[] = [
  { id: 'phone', describe: 'Phone number (7-15 digits, optional +/spaces/dashes)', test, apply },
  { id: 'city-pair', describe: 'Two known cities joined by to/-/,/→', test, apply },
  // ...
];
```

Each matcher is a small, independently readable object with a plain-English `describe`
string, a `test(line)` predicate, and an `apply(line, formState)` that returns the field(s)
to set. The tunable constants (month names, pax letters, trip keywords, phone digit range)
live in one block at the top so they can be edited without reading or understanding the
matcher functions themselves.

## Testing

Per this project's "leave one runnable check behind" convention for non-trivial logic: a
`src/lib/quoteCapture.test.ts` (or an assert-based inline `demo()`) exercising each matcher
against 2-3 representative lines, plus the fallback-to-notes behavior for a genuinely
unmatchable line and the return-prefix routing. Not a full per-matcher test suite — one
representative case per matcher is enough to catch a broken regex on future edits.

## Out of scope for this pass (possible future work, not being built now)

- Live/incremental parsing as the agent types (current design is button-triggered).
- Somali-language note parsing (form/notes stay bilingual already; the *parser* only
  recognizes English month names and keywords for v1).
- Persisting "what was auto-filled vs. manually typed" as data (the visual marker is
  UI-only/ephemeral, not stored).
