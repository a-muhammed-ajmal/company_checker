# Company Checker App - Complete Technical Documentation

## Table of Contents
1. [Application Overview](#1-application-overview)
2. [Project Architecture](#2-project-architecture)
3. [Database Details](#3-database-details)
4. [Search Engine Logic](#4-search-engine-logic)
5. [Results Hierarchy & Display](#5-results-hierarchy--display)
6. [Components Reference](#6-components-reference)
7. [Hooks & Utilities](#7-hooks--utilities)
8. [Type Definitions](#8-type-definitions)
9. [Caching System](#9-caching-system)
10. [Issues & Recommended Fixes](#10-issues--recommended-fixes)

---

## 1. Application Overview

**Company Checker** is an instant company verification system that searches multiple databases to determine a company's status (Delisted, TML, or Good Listed).

### Purpose
- Verify company status against multiple authoritative lists
- Flag delisted/suspended companies with highest priority
- Provide instant cross-reference checking across 7 database tables
- Prevent users from being misled by "Good" status when a company is actually delisted

### Tech Stack
- **Framework**: Vite 5.x + React 18 + TypeScript
- **UI**: Tailwind CSS 3.4 + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React useState + Custom Hooks
- **Caching**: In-memory + localStorage hybrid
- **PWA**: vite-plugin-pwa + Workbox (service worker caching)
- **Build**: TypeScript compiler + Vite bundler

### Entry Point
- `index.html` → `/index.tsx` → `App.tsx`
- NOT a Next.js app - pure client-side SPA

---

## 2. Project Architecture

\`\`\`
/
├── public/
│   └── index.html          # Entry point HTML
│
├── src/
│   ├── assets/
│   │   └── icons/           # Icon assets
│   │
│   ├── components/
│   │   ├── cards/
│   │   │   ├── CompanyDetailsCard.tsx   # Detailed company view
│   │   │   ├── ErrorCard.tsx            # Error display component
│   │   │   └── NotListedCard.tsx        # "Not Found" display
│   │   │
│   │   ├── DatabaseDiagnostic.tsx       # Dev tool for DB inspection
│   │   ├── DetailRow.tsx                # Reusable detail row
│   │   ├── ErrorBoundary.tsx            # React error boundary
│   │   └── SuggestionList.tsx           # Search results list
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts       # Input debouncing
│   │   ├── useNetworkStatus.ts  # Online/offline detection
│   │   └── useSearch.ts         # Main search logic hook
│   │
│   ├── services/
│   │   └── api.ts               # Supabase API calls & search logic
│   │
│   ├── utils/
│   │   └── cache.ts             # Hybrid caching system
│   │
│   ├── tests/
│   │   └── cross-reference-test.ts  # Priority logic test suite
│   │
│   ├── App.tsx                  # Main application component
│   ├── constants.ts             # Environment variables
│   └── types.ts                 # TypeScript definitions
│
├── vite.config.ts             # Vite configuration
└── package.json               # Project dependencies
\`\`\`

---

## 3. Database Details

### 3.1 Connection Configuration

| Setting | Value |
|---------|-------|
| **Platform** | Supabase (PostgreSQL) |
| **Base URL** | `https://cioyfhgzwpciczsppdqo.supabase.co` |
| **Auth** | Anonymous key via `SUPABASE_ANON_KEY` |
| **API** | REST API via `/rest/v1/` endpoints |

### 3.2 Database Tables (7 Total)

| # | Table Name | Column Name | UI Type | Priority | Label |
|---|------------|-------------|---------|----------|-------|
| 1 | `delisted_company_1` | `NAME OF THE COMPANY` | DELISTED | 1 (Highest) | Delisted Employer from Jan08 |
| 2 | `delisted_company_2` | `NAME OF THE COMPANY` | DELISTED | 1 (Highest) | Delisted Employer July02 to Dec07 |
| 3 | `eib_approved` | `company_name` | TML | 2 (Medium) | EIB - Approved Employer |
| 4 | `enbd_approved` | `company_name` | TML | 2 (Medium) | ENBD - Approved Employer |
| 5 | `payroll_approved` | `company_name` | TML | 2 (Medium) | Payroll Employer |
| 6 | `credit_card_approved` | `company_name` | TML | 2 (Medium) | Credit Card Approved Employer |
| 7 | `good_listed` | `employer_name` | GOOD | 3 (Lowest) | Good List Company (NTML) |

### 3.3 UI Type Classification

| UI Type | Priority | Color Theme | Icon | Meaning |
|---------|----------|-------------|------|---------|
| **DELISTED** | 1 | Red | ⛔ | Company is suspended/delisted - HIGH RISK |
| **TML** | 2 | Green | ✅ | Target Market List - Approved employer |
| **GOOD** | 3 | Blue | 🛡️ | Good Listed - Verified corporate status (NTML) |

### 3.4 Data Schema (BaseCompanyData)

\`\`\`typescript
interface BaseCompanyData {
  id: string | number

  // Name columns (varies by table)
  company_name?: string
  employer_name?: string

  // Normalized versions
  company_name_normalized?: string
  employer_name_normalized?: string

  // Additional metadata
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
\`\`\`

---

## 4. Search Engine Logic

### 4.1 Text Normalization (`normalizeText`)

Prevents duplicate results from spelling variations.

**Operations:**
1. Convert to lowercase
2. Replace `&` with `and` (e.g., "Al Nasr Sports & Leisure" = "Al Nasr Sports and Leisure")
3. Remove entity types: `L.L.C`, `LLC`, `F.Z.E`, `FZE`
4. Strip all non-alphanumeric characters
5. Collapse multiple spaces

\`\`\`typescript
function normalizeText(text: string): string {
  if (!text) return ""
  let normalized = text.toLowerCase().trim()
  normalized = normalized.replace(/&/g, "and")
  normalized = normalized.replace(/\b(l\.l\.c|llc|f\.z\.e|fze)\b/gi, "")
  normalized = normalized.replace(/[^a-z0-9\s]/g, "")
  normalized = normalized.replace(/\s+/g, " ").trim()
  return normalized
}
\`\`\`

### 4.2 Fuzzy Match Scoring (`calculateMatchScore`)

Returns a score from 0-100:

| Match Type | Score | Example |
|------------|-------|---------|
| **Exact Match** | 100 | Query: "Sobha" → Target: "Sobha" |
| **Substring Match** | 85 | Query: "Sobha" → Target: "Sobha Construction LLC" |
| **Token Match** | % of words matched | Query: "Al Nasr Sports" → Target: "Al Nasr Sports Leisure" (75%) |
| **Threshold** | < 40 discarded | Low relevance results filtered out |

### 4.3 Strict Duplication Handling (`handleDuplicates`)

**Critical Safety Feature**: Ensures delisted companies are ALWAYS shown when they appear in multiple lists.

**Logic:**
1. Group results by normalized company name
2. Detect collisions (same company in multiple lists)
3. If collision between DELISTED + GOOD/TML:
   - Keep BOTH entries
   - Show DELISTED entry FIRST
   - Show GOOD/TML entry as suggestion below
4. Never show ONLY the "Good" status for a suspended company

\`\`\`typescript
function handleDuplicates(results: Company[]): Company[] {
  // Groups by normalized name
  // If hasDelisted && hasGoodOrTML:
  //   - Add delisted entries first
  //   - Then add good/TML entries
  // Returns deduplication-safe results
}
\`\`\`

### 4.4 Search Flow

\`\`\`
User Input → normalizeText() → Query All 7 Tables (Parallel)
    ↓
Calculate Match Scores → Filter (score >= 40)
    ↓
Sort by: 1) ui_priority (1→2→3), 2) match_score (desc)
    ↓
handleDuplicates() → Ensure DELISTED always shown first
    ↓
Cache Results → Return Top 25
\`\`\`

---

## 5. Results Hierarchy & Display

### 5.1 Priority Order (Enforced)

\`\`\`
1. DELISTED (Priority 1) - Always appears first
   ├── delisted_company_1
   └── delisted_company_2

2. TML (Priority 2) - Appears after delisted
   ├── eib_approved
   ├── enbd_approved
   ├── payroll_approved
   └── credit_card_approved

3. GOOD (Priority 3) - Appears last
   └── good_listed
\`\`\`

### 5.2 Cross-Reference Warning

When a company appears in both DELISTED and GOOD/TML lists:
- Yellow warning banner is displayed
- Message: "This entity also appears in other lists. The current status takes priority."

### 5.3 Display States

| State | Component | Condition |
|-------|-----------|-----------|
| **Loading** | Spinner | `loading === true` |
| **Error** | Error Card | `error !== null` |
| **No Results** | NotListedCard | `results.length === 0 && hasSearched` |
| **Results Found** | SuggestionList | `results.length > 0 && !selectedCompany` |
| **Company Selected** | CompanyDetailsCard | `selectedCompany !== null` |

---

## 6. Components Reference

### 6.1 App.tsx (Main Component)

**State:**
- `query`: Search input
- `results`: Array of Company objects
- `loading`: Boolean
- `hasSearched`: Boolean
- `error`: String or null
- `selectedCompany`: Company or null

**Sections:**
1. Header (Title + Subtitle)
2. Database Diagnostic (Dev tool)
3. Search Bar with Clear/Check buttons
4. Results Area (conditional rendering)

### 6.2 SuggestionList.tsx

Displays search results as clickable cards with badges:
- **DELISTED** → Red badge
- **TML** → Green badge  
- **GOOD** → Blue badge

### 6.3 CompanyDetailsCard.tsx

Full company details view with:
- Dynamic theming based on `ui_type`
- Back button to results
- Cross-reference warning (conditional)
- Metadata display (employer_code, legal_status, source)

### 6.4 NotListedCard.tsx

Shown when no matches found:
- "Non-Listed Company (NTML)" message
- Recommended actions checklist

### 6.5 DatabaseDiagnostic.tsx

Dev tool to inspect database structure:
- Lists all 7 tables
- Shows columns for each table
- Displays sample data (first 3 rows)

---

## 7. Hooks & Utilities

### 7.1 useSearch.ts

Main search logic hook exposing:
- `query`, `setQuery`: Search input state
- `results`: Search results array
- `loading`, `hasSearched`, `error`: Status flags
- `handleSearch(forceRefresh?)`: Execute search
- `resetSearch()`: Clear all state

### 7.2 useDebounce.ts

Debounces input value by specified delay.

### 7.3 useNetworkStatus.ts

Tracks online/offline status via browser events.

### 7.4 cache.ts (SearchCache)

Hybrid caching system:
- **Memory Cache**: 5-minute TTL
- **localStorage**: 24-hour TTL (offline support)
- Methods: `get()`, `set()`, `invalidate()`, `clear()`, `getStats()`

---

## 8. Type Definitions

### 8.1 CompanySource

\`\`\`typescript
type CompanySource =
  | "eib_approved"
  | "enbd_approved"
  | "payroll_approved"
  | "credit_card_approved"
  | "good_listed"
  | "delisted_company_1"
  | "delisted_company_2"
\`\`\`

### 8.2 UIType

\`\`\`typescript
type UIType = "DELISTED" | "TML" | "GOOD"
\`\`\`

### 8.3 Company (Full Interface)

\`\`\`typescript
interface Company extends BaseCompanyData {
  displayName: string        // Resolved name for display
  ui_type: UIType           // DELISTED | TML | GOOD
  ui_priority: number       // 1=High, 2=Medium, 3=Low
  ui_source_id: CompanySource
  ui_label: string          // Human-readable status
  match_score?: number      // 0-100 relevance score
}
\`\`\`

---

## 9. Caching System

### 9.1 Cache Keys

Format: `company_search_${query.toLowerCase()}`

### 9.2 TTL Values

| Cache Type | TTL | Purpose |
|------------|-----|---------|
| Memory | 5 minutes | Fast repeated searches |
| localStorage | 24 hours | Offline access |

### 9.3 Cache Bypass

- "Refresh from Database" button calls `searchCache.clear()`
- `handleSearch(true)` forces refresh

---

## 10. Issues & Recommended Fixes

### 10.1 CRITICAL ISSUES

| # | Issue | Location | Severity | Fix |
|---|-------|----------|----------|-----|
| 1 | **Hardcoded Supabase credentials** | `constants.ts` | HIGH | Move to environment variables only |
| 2 | **No input sanitization** | `api.ts` | HIGH | Sanitize query before SQL injection |
| 3 | **No rate limiting** | `api.ts` | MEDIUM | Add throttling for API calls |

### 10.2 BUGS

| # | Bug | Location | Fix |
|---|-----|----------|-----|
| 1 | `useDebounce` hook not used | `App.tsx` | Implement debounced search |
| 2 | `useNetworkStatus` hook not used | Anywhere | Add offline indicator |
| 3 | `ErrorCard` component not imported | `App.tsx` | Use ErrorCard instead of inline error |

### 10.3 CODE IMPROVEMENTS

| # | Issue | Location | Recommendation |
|---|-------|----------|----------------|
| 1 | Console.log statements in production | `api.ts` | Remove or conditionally disable |
| 2 | No loading skeleton | `SuggestionList.tsx` | Add skeleton loader |
| 3 | Missing accessibility | Multiple | Add ARIA labels, keyboard navigation |
| 4 | No pagination | `api.ts` | Implement "Load More" for large results |
| 5 | Duplicate file | `styles/globals.css` + `app/globals.css` | Remove duplicate |

### 10.4 SECURITY FIXES NEEDED

\`\`\`typescript
// constants.ts - CURRENT (INSECURE)
export const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY", "sb_publishable_SJ43W6d...")

// RECOMMENDED - Remove hardcoded fallback
export const SUPABASE_ANON_KEY = getEnv("SUPABASE_ANON_KEY")
if (!SUPABASE_ANON_KEY) {
  throw new Error("Missing SUPABASE_ANON_KEY environment variable")
}
\`\`\`

### 10.5 MISSING FEATURES

1. **Search history** - Track recent searches
2. **Export results** - Download as CSV/PDF
3. **Bulk search** - Upload list of companies
4. **Admin panel** - Manage database entries
5. **Audit logging** - Track who searched what

### 10.6 NORMALIZATION IMPROVEMENTS

Current `normalizeText` should also handle:
- Arabic characters (if applicable)
- Common abbreviations (PVT → PRIVATE, LTD → LIMITED)
- Unicode normalization

\`\`\`typescript
// Add to normalizeText()
normalized = normalized.replace(/\b(pvt|pvt\.)\b/gi, "private")
normalized = normalized.replace(/\b(ltd|ltd\.)\b/gi, "limited")
normalized = normalized.replace(/\b(co|co\.)\b/gi, "company")
\`\`\`

---

## Appendix: File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `services/api.ts` | ~200 | Core search logic & Supabase API |
| `App.tsx` | ~100 | Main application component |
| `types.ts` | ~50 | TypeScript interfaces |
| `utils/cache.ts` | ~90 | Caching system |
| `hooks/useSearch.ts` | ~40 | Search state management |
| `components/SuggestionList.tsx` | ~40 | Results display |
| `components/cards/CompanyDetailsCard.tsx` | ~100 | Detail view |
| `components/DatabaseDiagnostic.tsx` | ~120 | Dev diagnostic tool |

---

*Documentation generated for Company Checker App v1.0*
