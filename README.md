# Company Checker

> Instant company verification system — search across 7 databases in real-time with priority-based results and offline support.

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.1-purple)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)

---

## What It Does

Company Checker is a Progressive Web App (PWA) that instantly checks a company's status across multiple authoritative lists. Each company found is classified as one of:

| Status | Color | Meaning |
|--------|-------|---------|
| **DELISTED** | 🔴 Red | Suspended or delisted employer — high risk |
| **TML** | 🟢 Green | Target Market List — bank-approved employer |
| **GOOD** | 🔵 Blue | Good Listed — verified corporate status (NTML) |
| **NOT LISTED** | ⚪ Grey | Not found in any database |

If a company appears in both DELISTED and another list, DELISTED is always shown first with a cross-reference warning. A partial DELISTED match is treated as lower priority than an exact match.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.2 + TypeScript 5.2 + Vite 5.1 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL) via REST API |
| State | React Hooks + custom `useSearch` hook |
| Caching | Memory (5 min) + localStorage (24 hr) |
| PWA | vite-plugin-pwa + Workbox service worker |
| Icons | Lucide React |
| Analytics | Vercel Analytics |
| Hosting | Vercel |

---

## Database Schema

The app searches 7 Supabase tables in parallel on every query:

| # | Table | Search Column | Type | Priority |
|---|-------|--------------|------|----------|
| 1 | `delisted_company_1` | `company_name` | DELISTED | 1 |
| 2 | `delisted_company_2` | `company_name` | DELISTED | 2 |
| 3 | `eib_approved` | `company_name` | TML | 3 |
| 4 | `enbd_approved` | `company_name` | TML | 4 |
| 5 | `payroll_approved` | `company_name` | TML | 5 |
| 6 | `credit_card_approved` | `company_name` | TML | 6 |
| 7 | `good_listed` | `company_name` | GOOD | 7 |

---

## Search Algorithm

Every search runs these steps:

1. **Sanitize input** — strips `<>"'``, newlines, limits to 100 characters
2. **Normalize** — lowercase, `&` → `and`, remove entity types (`LLC`, `FZE`, etc.)
3. **Query all 7 tables in parallel** — using Supabase `ilike.*query*`
4. **Score each result** (0–100):
   - `100` — exact match (normalized)
   - `85` — substring match
   - `0–100` — token match (% of query words found in target)
   - Results below `40` are discarded
5. **Dynamic priority for DELISTED:**
   - Exact match → priority 1 (always first)
   - Partial match → priority 99 (shown last)
6. **Sort** by priority, then by score descending
7. **Deduplicate** — if same company in multiple lists, keep all, DELISTED first
8. **Cache and return** top 25 results

---

## Features

### Search & Results
- Real-time search across all 7 tables simultaneously
- Fuzzy matching handles partial names, typos, and entity type variations
- Cross-reference detection with warning banner
- Priority-ordered results (DELISTED always first)
- "Refresh Database" button clears cache and re-fetches live data

### Performance
- Hybrid cache: 5-minute memory cache + 24-hour localStorage
- 10-second request timeout per table with graceful fallback
- GIN trigram indexes on all searchable columns

### Offline & PWA
- Installable as a mobile or desktop app
- Offline banner shown when network is unavailable (`useNetworkStatus`)
- Static assets and fonts cached by Workbox service worker
- Cached search results available offline for 24 hours

### UI
- Dark mode support (system preference via `next-themes`)
- Mobile-first responsive layout (max-width: 384px card)
- Smooth fade and scale animations on results

---

## Project Structure

```
company_checker/
├── components/
│   ├── cards/
│   │   ├── CompanyDetailsCard.tsx   # Full company detail view
│   │   ├── NotListedCard.tsx        # "Not found" state
│   │   └── ErrorCard.tsx            # Error display
│   ├── ui/                          # shadcn/ui components
│   ├── SearchBar.tsx                # Search input + buttons
│   ├── SuggestionList.tsx           # Results list with badges
│   ├── DatabaseDiagnostic.tsx       # Dev tool for DB inspection
│   └── ErrorBoundary.tsx            # React error boundary
│
├── hooks/
│   ├── useSearch.ts         # Search state + timeout logic
│   ├── useNetworkStatus.ts  # Online/offline detection
│   ├── useDebounce.ts       # Input debounce utility
│   ├── use-mobile.ts        # Mobile breakpoint
│   └── use-toast.ts         # Toast notifications
│
├── services/
│   └── api.ts               # Search engine, Supabase calls, scoring
│
├── utils/
│   └── cache.ts             # Hybrid memory + localStorage cache
│
├── scripts/                 # SQL scripts (already applied to DB)
│   ├── 01_enable_row_level_security.sql
│   ├── 02_create_performance_indexes.sql
│   ├── 04_fix_function_search_path.sql
│   ├── 05_fix_duplicate_policies.sql
│   ├── 06_remove_unused_indexes.sql
│   └── backup_all_tables.sql       # Run this to export all data as CSV
│
├── App.tsx                  # Root component
├── constants.ts             # Env variable loading
├── types.ts                 # TypeScript interfaces
├── vite.config.ts           # Build + PWA config
└── .env.example             # Required environment variables
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- A Supabase project with the 7 tables created

### Install & Run

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

> The app will not start without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set.

---

## Database Setup (New Project)

If setting up a new Supabase project, run these scripts in order via the Supabase SQL Editor:

1. `scripts/01_enable_row_level_security.sql` — enable RLS on all tables
2. `scripts/02_create_performance_indexes.sql` — GIN trigram indexes
3. `scripts/04_fix_function_search_path.sql` — security fix
4. `scripts/05_fix_duplicate_policies.sql` — remove duplicate RLS policies
5. `scripts/06_remove_unused_indexes.sql` — cleanup

Then import your company data into each table via the Supabase Table Editor (CSV import).

---

## Deployment

The app is deployed on Vercel and connected to Supabase via the Vercel Marketplace integration, which automatically syncs environment variables.

### Manual Deployment Steps

1. Push to GitHub
2. Import repository in Vercel → Framework: **Vite**, Output: `dist`
3. Set environment variables in Vercel:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   ```
4. Deploy — `git push origin main` triggers automatic redeploy

---

## Data Backup

After every data update from the bank, export all 7 tables as CSV:

1. Supabase Dashboard → Table Editor → open each table
2. Click the export icon (top right of table)
3. Save CSV files to Google Drive or email

See `scripts/backup_all_tables.sql` for SQL-based export queries.

---

## Security

- No credentials hardcoded — all via environment variables
- Input sanitized before every query (XSS/injection prevention)
- Row-Level Security (RLS) enabled — all tables are read-only via anonymous key
- `.env` is git-ignored

---

## Author

**Muhammed Ajmal**
[LinkedIn](https://www.linkedin.com/in/muhammed-ajmal-consultant/)

---

<p align="center">© 2026 Company Checker · Database last updated: 15 January 2026</p>
