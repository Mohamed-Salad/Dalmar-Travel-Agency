# Dalmar Travel Agency — Design System

## Design Rationale

Dalmar serves a predominantly Somali diaspora customer base buying tickets to East Africa and the Middle East. The design must feel:
- **Trustworthy** — customers are handing over significant money
- **Professional** — comparable to established travel agencies
- **Warm** — not cold/corporate; this is a community-facing business
- **Fast to scan** — agents use the dashboard under pressure

---

## Color Palette

### Brand Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#1B3A6B` | Primary actions, nav, key UI |
| `--color-primary-dark` | `#0F2444` | Hover states on primary |
| `--color-primary-light` | `#E8EEF7` | Backgrounds, tints |
| `--color-gold` | `#C9961A` | Accents, highlights, CTAs |
| `--color-gold-light` | `#FDF3DC` | Gold tint backgrounds |

### Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--color-text` | `#111827` | Primary text |
| `--color-text-muted` | `#6B7280` | Secondary text, labels |
| `--color-surface` | `#FFFFFF` | Card/panel backgrounds |
| `--color-bg` | `#F7F8FA` | Page background |
| `--color-border` | `#E5E7EB` | Dividers, card borders |

### Status
| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#059669` | Paid, confirmed, sent |
| `--color-warning` | `#D97706` | Pending, expiring soon |
| `--color-danger` | `#DC2626` | Cancelled, overdue |

---

## Typography

**Font:** Inter (Google Fonts) — clean, highly legible, works for both English and Somali text.

| Scale | Size | Weight | Usage |
|---|---|---|---|
| `display` | 56px / 700 | Hero headline |
| `h1` | 40px / 700 | Page titles |
| `h2` | 32px / 600 | Section headings |
| `h3` | 24px / 600 | Card headings |
| `body-lg` | 18px / 400 | Lead paragraphs |
| `body` | 16px / 400 | Default text |
| `body-sm` | 14px / 400 | Secondary info |
| `caption` | 12px / 500 | Labels, badges |

---

## Spacing Scale (4px base)

4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 4px | Badges |
| `radius-md` | 8px | Inputs, buttons |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 20px | Large cards, modals |
| `radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Default card |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Hover/elevated |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` | Modals |

---

## Landing Page Structure

```
Navbar:  Logo | Destinations | About | Make an Inquiry | [Agent Login]
Hero:    "Your Trusted Connection to Africa & the Middle East" + CTA
Cards:   Discounted Fares | Expert Agents | Fast Booking
Regions: East Africa | Middle East | Asia
Steps:   1. Submit Inquiry → 2. We Find Best Fare → 3. Fly
Banner:  "Ready to travel?" + CTA
Footer:  Links | Inquiry | Policy | Contact | Agent Login
```

---

## Auth Architecture

- **Customers:** No login. Anonymous inquiry form → Supabase anon insert.
- **Agents:** Supabase Auth email/password. Route-guarded portal.
- Agent login: subtle link in navbar and footer — not prominent.
