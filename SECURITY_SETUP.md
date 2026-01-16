# Security & Performance Setup Guide

## 🔒 IMMEDIATE SECURITY ACTIONS (REQUIRED)

### 1. Secure Supabase Credentials

**Current Issue:** Credentials are in code (constants.ts uses environment variables, but .env file is missing)

**Fix Steps:**

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Fill in your Supabase credentials in `.env`:
   \`\`\`env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   \`\`\`

3. Get credentials from: https://supabase.com/dashboard/project/_/settings/api

4. **NEVER commit `.env` to git** (already in .gitignore)

---

### 2. Enable Row Level Security (RLS)

**Why:** Protects your database from unauthorized access

**Steps:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `scripts/01_enable_row_level_security.sql`
3. Click "Run"

**What it does:**
- Enables RLS on all 7 tables
- Allows public read-only access (for search)
- Blocks all write/update/delete operations
- Only admins can modify data via Dashboard

---

### 3. Create Performance Indexes

**Why:** 10-100x faster search queries (essential for production)

**Steps:**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `scripts/02_create_performance_indexes.sql`
3. Click "Run"

**What it does:**
- Creates GIN indexes on all searchable columns
- Enables efficient ILIKE pattern matching
- Dramatically reduces query time for large datasets

---

## ✅ COMPLETED FIXES

### Error Boundary
- ✅ App wrapped with ErrorBoundary component
- ✅ Prevents crashes from breaking entire UI
- ✅ Shows user-friendly error messages
- ✅ Auto-reload functionality

### Environment Variables
- ✅ `.env.example` template created
- ✅ `.gitignore` configured to exclude `.env`
- ✅ `constants.ts` uses VITE_ prefix for environment variables

### Cross-Reference Testing
- ✅ Test suite created in `tests/cross-reference-test.ts`
- ✅ Tests priority system (DELISTED > TML > GOOD)
- ✅ Tests match score tie-breaker
- ✅ Run in browser console: `window.testCrossReference()`

---

## 🧪 TESTING INSTRUCTIONS

### Manual Cross-Reference Testing

Test these scenarios in the live app:

1. **Company in DELISTED + TML**
   - Search for a company that exists in both lists
   - Expected: DELISTED result appears first
   - Should show cross-reference warning

2. **Company in TML + GOOD**
   - Search for a company in both lists
   - Expected: TML results appear before GOOD
   - Should show cross-reference warning

3. **Company in ALL 3 LISTS**
   - Search for a company in all lists
   - Expected Order: DELISTED, TML, GOOD results
   - Should show cross-reference warning

### Automated Testing

Run in browser console:
\`\`\`javascript
window.testCrossReference()
\`\`\`

---

## 📊 VERIFICATION CHECKLIST

- [ ] `.env` file created with real Supabase credentials
- [ ] RLS enabled on all tables (run SQL script 01)
- [ ] Indexes created (run SQL script 02)
- [ ] App loads without errors
- [ ] Search returns results quickly (< 1 second)
- [ ] Error boundary shows when error occurs (test by breaking something temporarily)
- [ ] Cross-reference warning appears for multi-list companies
- [ ] Priority system works correctly (DELISTED > TML > GOOD)

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables on Vercel

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Redeploy

### Build Configuration
- Build command: `tsc && vite build`
- Output directory: `dist`
- Framework: Vite (React + TypeScript)

---

## ⚠️ IMPORTANT NOTES

1. **Never use SERVICE_ROLE key in client-side code** - only use ANON key
2. **RLS is your safety net** - even if key leaks, RLS limits damage
3. **Indexes are required for production** - without them, search will be very slow
4. **Error boundaries are critical** - they prevent one error from crashing the entire app
