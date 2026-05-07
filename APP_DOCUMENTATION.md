# Company Checker — Technical Documentation

## Table of Contents
1. [Application Overview](#1-application-overview)
2. [Project Architecture](#2-project-architecture)
3. [Database Details](#3-database-details)
4. [Search Engine Logic](#4-search-engine-logic)
5. [Results Hierarchy & Display](#5-results-hierarchy--display)
6. [Component Architecture](#6-component-architecture)
7. [State Management & Hooks](#7-state-management--hooks)
8. [Caching System](#8-caching-system)
9. [PWA Features](#9-pwa-features)
10. [Type Definitions](#10-type-definitions)
11. [Issues & Recommendations](#11-issues--recommendations)
12. [Deployment Checklist](#12-deployment-checklist)

---

## 1. Application Overview

**Company Checker** is a Progressive Web App (PWA) for instant company verification across multiple authoritative lists.

### Purpose
- Verify company status against 7 database tables in real-time
- Flag delisted/suspended companies with highest priority
- Cross-reference across all lists and warn when a company appears in conflicting lists
- Prevent users from seeing only "Good" status for a company that is actually delisted

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vite 5.x + React 18 + TypeScript |
| UI | Tailwind CSS 3.4 + shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL) |
| State | React useState + Custom Hooks |
| Caching | In-memory + localStorage hybrid |
| PWA | vite-plugin-pwa + Workbox |
| Icons | Lucide React |

### Entry Point
`index.html` → `index.tsx` → `App.tsx` — pure client-side SPA (not Next.js)

---

## 2. Project Architecture

```
company_checker/
├── components/
│   ├── cards/
│   │   ├── CompanyDetailsCard.tsx   # Detailed company view
│   │   ├── ErrorCard.tsx            # Error display
│   │   └── NotListedCard.tsx        # "Not Found" display
│   ├── ui/                          # shadcn/ui component library (58 files)
│   ├── DatabaseDiagnostic.tsx       # Dev tool for DB inspection
│   ├── DetailRow.tsx                # Reusable key-value row
│   ├── ErrorBoundary.tsx            # React error boundary
│   ├── SearchBar.tsx                # Search input component
│   ├── SuggestionList.tsx           # Search results list
│   └── theme-provider.tsx
│
├── hooks/
│   ├── useSearch.ts         # Main search state hook
│   ├── useDebounce.ts       # Input debouncing
│   ├── useNetworkStatus.ts  # Online/offline detection
│   ├── use-mobile.ts        # Mobile breakpoint detection
│   └── use-toast.ts         # Toast notifications
│
├── services/
│   └── api.ts               # Supabase API calls & search logic
│
├── utils/
│   └── cache.ts             # Hybrid caching system
│
├── tests/
│   └── cross-reference-test.ts  # Priority logic test suite
│
├── scripts/                 # SQL setup scripts (already applied to DB)
│   ├── 01_enable_row_level_security.sql
│   ├── 02_create_performance_indexes.sql
│   ├── 04_fix_function_search_path.sql
│   ├── 05_fix_duplicate_policies.sql
│   ├── 06_remove_unused_indexes.sql
│   └── backup_all_tables.sql       # Use this to export all table data
│
├── public/                  # Static assets & PWA icons
├── App.tsx                  # Root component
├── constants.ts             # Environment variable loading
├── types.ts                 # TypeScript definitions
├── vite.config.ts           # Build + PWA configuration
└── .env.example             # Required environment variables template
```

---

## 3. Database Details

### 3.1 Connection

| Setting | Value |
|---------|-------|
| Platform | Supabase (PostgreSQL) |
| Auth | Anonymous key via environment variables |
| API | REST API via `/rest/v1/` endpoints |
| Environment vars | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

### 3.2 Tables (7 Total)

| # | Table | Column | UI Type | Priority | Label |
|---|-------|--------|---------|----------|-------|
| 1 | `delisted_company_1` | `company_name` | DELISTED | 1 | Delisted Employer from Jan 2008 |
| 2 | `delisted_company_2` | `company_name` | DELISTED | 2 | Delisted Employer July 2002 – Dec 2007 |
| 3 | `eib_approved` | `company_name` | TML | 3 | EIB – Approved Employer |
| 4 | `enbd_approved` | `company_name` | TML | 4 | ENBD – Approved Employer |
| 5 | `payroll_approved` | `company_name` | TML | 5 | Payroll Employer |
| 6 | `credit_card_approved` | `company_name` | TML | 6 | Credit Card Approved Employer |
| 7 | `good_listed` | `company_name` | GOOD | 7 | Good List Company (NTML) |

### 3.3 UI Type Classification

| UI Type | Priority | Color | Icon | Meaning |
|---------|----------|-------|------|---------|
| DELISTED | 1 | Red | ⛔ | Suspended/delisted — HIGH RISK |
| TML | 2–6 | Green | ✅ | Target Market List — Approved employer |
| GOOD | 7 | Blue | 🛡️ | Good Listed — Verified corporate status |

### 3.4 Data Schema

```typescript
interface BaseCompanyData {
  id: string | number
  company_name?: string               // Used in 6/7 tables
  employer_name?: string              // Used in good_listed only
  company_name_normalized?: string
  employer_name_normalized?: string
  group_name?: string
  category?: string
  legal_status?: string
  establishment_date?: string
  emirate?: string
  industry?: string
  po_box?: string
  comments?: string
  employer_code?: string
  employer_id?: string
  status?: string
  reason?: string
}
```

---

## 4. Search Engine Logic

### 4.1 Text Normalization

Prevents duplicates from spelling variations:
1. Lowercase + trim
2. Replace `&` → `and`
3. Remove entity types: `LLC`, `L.L.C`, `FZE`, `F.Z.E`
4. Strip non-alphanumeric characters
5. Collapse multiple spaces

### 4.2 Fuzzy Match Scoring

| Match Type | Score | Example |
|------------|-------|---------|
| Exact match | 100 | "Sobha" → "Sobha" |
| Substring match | 85 | "Sobha" → "Sobha Construction LLC" |
| Token match | % of words matched | "Al Nasr Sports" → "Al Nasr Sports Leisure" = 75% |
| Below threshold | Discarded | Score < 40 filtered out |

### 4.3 Search Flow

```
User Input
    ↓
normalizeText() — clean query
    ↓
Query all 7 tables in parallel (ilike *query*)
    ↓
calculateMatchScore() for each result
    ↓
Filter: score >= 40
    ↓
Sort: ui_priority ASC, match_score DESC
    ↓
handleDuplicates() — ensure DELISTED always shown first
    ↓
Cache results
    ↓
Return top 25
```

### 4.4 Duplicate Handling (Safety Critical)

When the same company appears in multiple lists:
1. Group results by normalized name
2. If DELISTED + GOOD/TML collision:
   - Keep **both** entries
   - Show DELISTED **first**
   - Show GOOD/TML as secondary suggestion
3. Never hide a DELISTED entry behind a GOOD status

---

## 5. Results Hierarchy & Display

### Priority Order

```
1. DELISTED (Priority 1–2) — Always first
   ├── delisted_company_1
   └── delisted_company_2

2. TML (Priority 3–6) — After delisted
   ├── eib_approved
   ├── enbd_approved
   ├── payroll_approved
   └── credit_card_approved

3. GOOD (Priority 7) — Last
   └── good_listed
```

### Display States

| State | Component | Condition |
|-------|-----------|-----------|
| Loading | Spinner | `loading === true` |
| No results | NotListedCard | `results.length === 0 && hasSearched` |
| Multiple results | SuggestionList | `results.length > 0 && !selectedCompany` |
| Company selected | CompanyDetailsCard | `selectedCompany !== null` |

### Cross-Reference Warning

When a company appears in both DELISTED and GOOD/TML:
- Yellow warning banner shown on the details card
- "This entity also appears in other lists. The current status takes priority."

---

## 6. Component Architecture

### Component Tree

```
App (Root)
├── SearchBar
│   ├── Input field
│   ├── Clear button (✕) — conditional
│   └── Check button — mobile only
│
└── Results Area (conditional)
    ├── Loading spinner
    ├── NotListedCard         — no results
    ├── SuggestionList        — multiple results
    │   └── SuggestionItem[]  — clickable rows with badges
    └── CompanyDetailsCard    — selected company
        ├── Color-coded header (DELISTED/TML/GOOD)
        ├── Company name + status badge
        ├── Detail rows (employer code, legal status, etc.)
        └── Cross-reference warning (conditional)
```

### User Journey

```
1. Landing       → Empty search bar
2. Typing        → "Sobha" entered
3. Search        → 7 parallel API calls, loading spinner
4. Results       → List of matches, priority-ordered
5. Selection     → Click a result → fade transition
6. Details       → Full card with all metadata
7. Back          → Return to results list
8. Clear (✕)     → Reset to empty state
```

### Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| Mobile < 768px | Full-width layout, visible "Check" button, larger touch targets |
| Desktop ≥ 768px | Centered (max-w-lg), Enter key triggers search, hover effects |

---

## 7. State Management & Hooks

### useSearch Hook

```typescript
const {
  query, setQuery,        // Search input
  results,               // Company[] array
  loading,               // Boolean
  hasSearched,           // Boolean
  error,                 // string | null
  handleSearch(forceRefresh?),  // Execute search
  resetSearch()          // Clear all state
} = useSearch()
```

### State Flow

```
Initial: query='', results=[], loading=false, hasSearched=false
    ↓ User types
query='Sobha'
    ↓ User presses Enter or Check
loading=true, hasSearched=true, results=[]
    ↓ API completes
loading=false, results=[Company1, Company2, ...]
    ↓ User clicks Company1
selectedCompany=Company1
    ↓ User clicks Back
selectedCompany=null
    ↓ User clicks Clear (✕)
Back to Initial
```

### Other Hooks

| Hook | Purpose | Currently Used |
|------|---------|----------------|
| `useDebounce` | Delays state updates | Not wired up in App |
| `useNetworkStatus` | Online/offline detection | Not shown in UI |
| `use-mobile` | Mobile breakpoint | Yes |
| `use-toast` | Toast notifications | Available |

---

## 8. Caching System

### Cache Layers

| Type | TTL | Purpose |
|------|-----|---------|
| Memory cache | 5 minutes | Fast repeated searches |
| localStorage | 24 hours | Offline access |

### Cache Key Format

`company_search_{query.toLowerCase()}`

### Cache Methods

```typescript
searchCache.get(key)          // Returns cached result or null
searchCache.set(key, results) // Store results
searchCache.invalidate(key)   // Remove one entry
searchCache.clear()           // Clear all (used by "Refresh from Database")
searchCache.getStats()        // Cache hit/miss stats
```

---

## 9. PWA Features

### What is Cached (Offline Works)
- All static assets: JS, CSS, HTML, images
- Google Fonts (365-day cache)
- App icons

### What Requires Network
- Supabase API calls (search results)

### Service Worker
- `registerType: 'autoUpdate'` — auto-updates in background
- Workbox handles all caching strategy

### Install Prompt
- `beforeinstallprompt` event captured
- Install button shown when browser supports PWA install
- App runs in `standalone` mode when installed

---

## 10. Type Definitions

```typescript
type CompanySource =
  | "eib_approved"
  | "enbd_approved"
  | "payroll_approved"
  | "credit_card_approved"
  | "good_listed"
  | "delisted_company_1"
  | "delisted_company_2"

type UIType = "DELISTED" | "TML" | "GOOD"

interface Company extends BaseCompanyData {
  displayName: string        // Resolved from company_name or employer_name
  ui_type: UIType
  ui_priority: number        // 1 = highest priority
  ui_source_id: CompanySource
  ui_label: string           // Human-readable status label
  match_score?: number       // 0–100
}
```

---

## 11. Issues & Recommendations

### Critical

| # | Issue | Location | Fix |
|---|-------|----------|-----|
| 1 | No rate limiting on search | `api.ts` | Add throttle/debounce |
| 2 | No offline indicator in UI | App | Wire up `useNetworkStatus` |

### Code Improvements

| # | Issue | Recommendation |
|---|-------|----------------|
| 1 | `useDebounce` not wired up | Add auto-search on debounced input |
| 2 | `ErrorCard` component exists but unused | Replace inline error with ErrorCard |
| 3 | Console.log statements in production | Remove or gate behind `import.meta.env.DEV` |
| 4 | No loading skeleton | Add skeleton loader in SuggestionList |

### Missing Features (Future)

1. **Search history** — Track recent searches in localStorage
2. **Bulk search** — Upload a list of companies and verify all at once
3. **Export results** — Download as CSV/PDF
4. **Admin panel** — Integrate DatabaseDiagnostic into a proper admin route
5. **Offline banner** — Show "You are offline" message using `useNetworkStatus`
6. **Normalization improvements** — Handle `PVT → PRIVATE`, `LTD → LIMITED`, Arabic characters

---

## 12. Deployment Checklist

- [ ] `VITE_SUPABASE_URL` set in Vercel environment variables
- [ ] `VITE_SUPABASE_ANON_KEY` set in Vercel environment variables
- [ ] RLS enabled on all 7 Supabase tables
- [ ] GIN indexes created on all searchable columns
- [ ] PWA icons present in `/public`
- [ ] Service worker tested in production build (`npm run preview`)
- [ ] Mobile responsiveness verified on real device
- [ ] Lighthouse score > 90

---

## Backup Procedure

After each data update from the bank, export all tables as CSV:
1. Go to Supabase Dashboard → Table Editor
2. Open each table → click the export/download icon
3. Save CSV files to Google Drive or email them to yourself
4. See `scripts/backup_all_tables.sql` for SQL-based export queries

---

*Last updated: 2026-05-03*
