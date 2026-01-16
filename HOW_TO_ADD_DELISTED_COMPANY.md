# How to Add a Delisted Company to Your Database

## Problem
The app is searching correctly, but "AQILI INFORMATION SYSTEMS LLC" is NOT in your Supabase `delisted_company_1` or `delisted_company_2` tables. It only exists in the `good_listed` table, which is why it shows as "GOOD" instead of "DELISTED".

## Solution
You need to add the company to one of your delisted tables in Supabase.

### Option 1: Run SQL Script (Recommended)
1. Open the script: `scripts/03_add_test_delisted_company.sql`
2. In v0, I can execute this script for you
3. Or copy the SQL and run it in your Supabase SQL Editor

### Option 2: Manual Entry in Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Table Editor
4. Open the `delisted_company_1` table
5. Click "Insert" → "Insert row"
6. Add: `company_name` = `AQILI INFORMATION SYSTEMS LLC`
7. Save

### Option 3: Check if it exists in the wrong table
The company might be in `good_listed` table. You may need to:
1. Remove it from `good_listed`
2. Add it to `delisted_company_1`

## Verify It Works
1. After adding the company to the delisted table
2. Go back to the app
3. Click "Refresh from Database" button
4. Search for "AQILI INFORMATION SYSTEMS LLC"
5. It should now show with red "Deletion / Suspension" theme

## Current Database State
Based on the logs:
- ✅ `good_listed` has "AQILI INFORMATION SYSTEMS LLC" (that's why it shows as GOOD)
- ❌ `delisted_company_1` does NOT have it
- ❌ `delisted_company_2` does NOT have it

The app is working correctly - it's showing what's actually in your database!
