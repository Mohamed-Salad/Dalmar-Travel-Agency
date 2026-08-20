/**
 * Quick Capture parser for QuotePage — turns bullet-point notes into
 * structured quote-form fields. Local regex/heuristics only, no external
 * API calls. See docs/superpowers/specs/2026-08-19-quote-quick-capture-design.md.
 *
 * ── EDIT ME ──────────────────────────────────────────────────────────
 * Tune these to change what the parser recognizes. Nothing below this
 * block needs to change for common tweaks (new month spelling, a
 * different pax letter, a wider/narrower phone-number length).
 */
export const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export const PAX_LETTERS = { adults: 'A', youth: 'Y', children: 'C', infants: 'I' } as const;

export const TRIP_KEYWORDS = {
  oneway: ['one way', 'oneway', 'one-way', 'single'],
  return: ['round trip', 'roundtrip'],
};

export const PHONE_DIGITS = { min: 7, max: 15 };
/** ────────────────────────────────────────────────────────────────── */

import { CITIES } from './cities';

export interface QuoteCaptureResult {
  fields: Record<string, string | number>;
  matched: Set<string>;
  leftoverLines: string[];
}

type PaxKey = 'adults' | 'youth' | 'children' | 'infants';

const KNOWN_CITIES = CITIES.map((c) => {
  const m = c.match(/^(.*)\s+\(([A-Z]{3})\)$/);
  return m ? { display: m[1], code: m[2] } : { display: c, code: '' };
});

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findCityMentions(line: string): { display: string; index: number }[] {
  const found: { display: string; index: number }[] = [];
  for (const city of KNOWN_CITIES) {
    const names = [city.display, city.code].filter(Boolean);
    for (const name of names) {
      const re = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
      const m = re.exec(line);
      if (m) { found.push({ display: city.display, index: m.index }); break; }
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

function matchPhone(line: string): string | null {
  const m = line.match(/\+?\d[\d\s-]{5,}\d/);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, '');
  if (digits.length < PHONE_DIGITS.min || digits.length > PHONE_DIGITS.max) return null;
  return m[0].trim();
}

function matchCityPair(line: string): { from: string; to: string } | null {
  const mentions = findCityMentions(line);
  if (mentions.length < 2) return null;
  return { from: mentions[0].display, to: mentions[1].display };
}

function isoDateForMonthDay(month: number, day: number): string {
  const now = new Date();
  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (candidate < today) year += 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function matchDateRange(line: string): { early: string; late: string } | null {
  const monthPattern = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');

  // "10-15 Sept" or "10 Sept"
  let m = line.match(new RegExp(`^(\\d{1,2})\\s*(?:-|to)?\\s*(\\d{1,2})?\\s+(${monthPattern})\\.?$`, 'i'));
  if (m) {
    const month = MONTHS[m[3].toLowerCase()];
    const d1 = Number(m[1]);
    const d2 = m[2] ? Number(m[2]) : d1;
    return { early: isoDateForMonthDay(month, d1), late: isoDateForMonthDay(month, d2) };
  }

  // "Sept 10-15" or "Sept 10 to 15" or "Sept 10"
  m = line.match(new RegExp(`^(${monthPattern})\\.?\\s+(\\d{1,2})\\s*(?:-|to)?\\s*(\\d{1,2})?$`, 'i'));
  if (m) {
    const month = MONTHS[m[1].toLowerCase()];
    const d1 = Number(m[2]);
    const d2 = m[3] ? Number(m[3]) : d1;
    return { early: isoDateForMonthDay(month, d1), late: isoDateForMonthDay(month, d2) };
  }

  return null;
}

function matchPax(line: string): Partial<Record<PaxKey, number>> | null {
  const letterToKey: Record<string, PaxKey> = {
    [PAX_LETTERS.adults.toLowerCase()]: 'adults',
    [PAX_LETTERS.youth.toLowerCase()]: 'youth',
    [PAX_LETTERS.children.toLowerCase()]: 'children',
    [PAX_LETTERS.infants.toLowerCase()]: 'infants',
  };
  const re = /(\d+)\s*([A-Za-z])\b/g;
  const result: Partial<Record<PaxKey, number>> = {};
  let found = false;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const key = letterToKey[m[2].toLowerCase()];
    if (key) { result[key] = Number(m[1]); found = true; }
  }
  return found ? result : null;
}

function matchTripType(line: string): 'oneway' | 'return' | null {
  const lower = line.toLowerCase();
  if (TRIP_KEYWORDS.oneway.some((k) => lower.includes(k))) return 'oneway';
  if (TRIP_KEYWORDS.return.some((k) => lower.includes(k))) return 'return';
  return null;
}

/**
 * Parses free-text notes (one fact per line) into QuotePage form fields.
 * `customerNameAlreadySet` guards the low-confidence name-fallback heuristic
 * so it never overwrites a name the agent already typed manually.
 */
export function parseQuickCapture(
  text: string,
  options: { customerNameAlreadySet?: boolean } = {}
): QuoteCaptureResult {
  const fields: Record<string, string | number> = {};
  const matched = new Set<string>();
  const leftoverLines: string[] = [];
  let nameSet = options.customerNameAlreadySet ?? false;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    const phone = matchPhone(line);
    if (phone) { fields.phone = phone; matched.add('phone'); continue; }

    const cityPair = matchCityPair(line);
    if (cityPair) {
      fields.from = cityPair.from; fields.to = cityPair.to;
      matched.add('from'); matched.add('to');
      continue;
    }

    const returnMatch = line.match(/^return\b\s*(.*)$/i);
    if (returnMatch) {
      const range = matchDateRange(returnMatch[1].trim());
      if (range) {
        fields.earlyRet = range.early; fields.lateRet = range.late;
        matched.add('earlyRet'); matched.add('lateRet');
        continue;
      }
    }

    const dateRange = matchDateRange(line);
    if (dateRange) {
      fields.earlyDep = dateRange.early; fields.lateDep = dateRange.late;
      matched.add('earlyDep'); matched.add('lateDep');
      continue;
    }

    const pax = matchPax(line);
    if (pax) {
      for (const [key, value] of Object.entries(pax)) { fields[key] = value as number; matched.add(key); }
      continue;
    }

    const tripType = matchTripType(line);
    if (tripType) { fields.tripType = tripType; matched.add('tripType'); continue; }

    if (!nameSet) {
      fields.customerName = line;
      matched.add('customerName');
      nameSet = true;
      continue;
    }

    leftoverLines.push(line);
  }

  return { fields, matched, leftoverLines };
}
