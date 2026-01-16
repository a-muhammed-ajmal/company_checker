# Company Checker - Security & Deployment Guide

## 🚀 Quick Start

### 1. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Get credentials from: [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)

### 2. Install Dependencies

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

### 4. Production Build

```bash
npm run build
```

## 🔒 Security Enhancements

### ✅ Completed Fixes

1. **Environment Variables** - Hardcoded credentials removed, now requires `.env` file
2. **Input Sanitization** - All user input is sanitized to prevent injection attacks
3. **Error Handling** - Proper error messages without exposing sensitive data
4. **Loading Timeouts** - 10-second timeout prevents hanging requests

### ⚠️ Database Security (MANUAL SETUP REQUIRED)

**You MUST run these SQL scripts in Supabase for production:**

1. **Enable Row-Level Security (RLS)**
   ```bash
   # File: scripts/01_enable_row_level_security.sql
   ```
   - Go to: [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
   - Copy the contents of `scripts/01_enable_row_level_security.sql`
   - Run the script
   - Verify RLS is enabled on all 7 tables

2. **Create Performance Indexes**
   ```bash
   # File: scripts/02_create_performance_indexes.sql
   ```
   - Run this script in Supabase SQL Editor
   - Improves search performance by 10-100x
   - Essential for production deployment

## ⚡ Performance Improvements

### Implemented Features

1. **Caching System**
   - Memory cache: 5-minute TTL for fast repeated searches
   - localStorage: 24-hour TTL for offline support
   - Automatic cache invalidation

2. **Loading Timeout**
   - 10-second timeout prevents hanging requests
   - User-friendly error messages
   - Proper cleanup on component unmount

3. **Input Sanitization**
   - Removes dangerous characters (`<>\"'`)
   - Limits input length to 100 characters
   - Prevents injection attacks

4. **Offline Detection**
   - Visual indicator when network is unavailable
   - Shows cached results when offline
   - Automatic reconnection detection

## 📦 Deployment to Vercel

### 1. Set Environment Variables

In your Vercel project settings:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Deploy

```bash
# Option 1: GitHub integration (recommended)
# Push to GitHub and connect in Vercel Dashboard

# Option 2: Vercel CLI
vercel --prod
```

## ✅ Pre-Deployment Checklist

- [ ] `.env` file created with valid credentials
- [ ] `npm install` completed successfully
- [ ] `npm run build` runs without errors
- [ ] RLS enabled on all Supabase tables
- [ ] Performance indexes created in Supabase
- [ ] Environment variables set in Vercel
- [ ] Tested search functionality locally
- [ ] Tested offline mode works
- [ ] Verified cache functionality
- [ ] Tested on mobile device (PWA)

## 🧪 Testing

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test search functionality:**
   - Search for "Sobha"
   - Search for "DP World"
   - Verify priority ordering (DELISTED > TML > GOOD)

3. **Test caching:**
   - Search same query twice
   - Second search should be instant

4. **Test offline mode:**
   - Open DevTools → Network tab
   - Set to "Offline"
   - Verify yellow offline banner appears
   - Search should show cached results

### Production Testing

1. Build and preview:
   ```bash
   npm run build
   npm run preview
   ```

2. Test PWA installation on mobile device

## 🛠️ Code Quality Improvements

### Changes Made

1. **Removed Debug Logs**
   - Cleaned 100+ `console.log()` statements from production code
   - Only errors are logged with proper error handling

2. **Enhanced Error Handling**
   - User-friendly error messages
   - Loading states with timeouts
   - Proper cleanup on unmount

3. **Offline Support**
   - Visual offline indicator
   - Cached results available offline
   - Network status monitoring

4. **Type Safety**
   - Proper TypeScript types throughout
   - Strict null checks
   - No `any` types in critical paths

## 📝 API Usage

### Search Function

```typescript
import { searchCompanies } from './services/api'

// Basic search
const results = await searchCompanies("Sobha")

// Force refresh (bypass cache)
const freshResults = await searchCompanies("Sobha", true)
```

### Cache Management

```typescript
import { searchCache } from './utils/cache'

// Clear all cache
searchCache.clear()

// Get cache statistics
const stats = searchCache.getStats()
console.log(stats) // { memoryEntries: 5, storageEntries: 10 }
```

## 🔍 Troubleshooting

### Build Errors

**Error**: `Missing environment variables`
- **Solution**: Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Error**: `tsc not found`
- **Solution**: Run `npm install` to install dependencies

### Runtime Errors

**Error**: `Search timeout`
- **Cause**: Slow network or large result set
- **Solution**: Check internet connection, verify Supabase is accessible

**Error**: `400 Bad Request`
- **Cause**: Missing database indexes or RLS misconfiguration
- **Solution**: Run SQL scripts from `scripts/` directory

### Performance Issues

**Problem**: Slow search responses
- **Solutions**:
  1. Run `scripts/02_create_performance_indexes.sql` in Supabase
  2. Verify caching is working (check browser DevTools → Network)
  3. Limit search query length

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🆘 Support

For issues or questions:
1. Check existing documentation files
2. Review error messages in browser console
3. Verify environment variables are set correctly
4. Contact: [Muhammed Ajmal](https://www.linkedin.com/in/muhammed-ajmal-consultant/)
