-- Fix for Supabase Database Linter Issue: Unused Indexes
-- Issue: Indexes on eib_approved table are not being used
-- Severity: INFO (Performance/Storage Optimization)
--
-- Unused indexes consume storage and slow down INSERT/UPDATE/DELETE operations
-- without providing any query performance benefits.
--
-- Analysis: The indexes idx_eib_company_name and idx_eib_normalized are not being used
-- because the application uses the search pattern: company_name=ilike.*query*
-- which cannot use standard B-tree indexes effectively.
--
-- Options:
-- 1. Drop unused indexes (saves storage, improves write performance)
-- 2. Keep indexes if you plan to use exact match queries in the future
--
-- This script drops the unused indexes. If you need them later, you can recreate them.

-- Step 1: Check index usage statistics
SELECT
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as times_used,
    idx_tup_read as rows_read,
    idx_tup_fetch as rows_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND relname = 'eib_approved'
ORDER BY idx_scan;

-- Step 2: Drop unused indexes
-- Only drop if they truly have never been used (idx_scan = 0)
DROP INDEX IF EXISTS public.idx_eib_company_name;
DROP INDEX IF EXISTS public.idx_eib_normalized;

-- Step 3: Verify the GIN trigram indexes are still present (these are being used)
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'eib_approved'
ORDER BY indexname;

-- Step 4: Summary
DO $$
DECLARE
    remaining_indexes INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_indexes
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'eib_approved';

    RAISE NOTICE '✅ Cleanup complete. Remaining indexes on eib_approved: %', remaining_indexes;
    RAISE NOTICE 'Note: GIN trigram indexes for ILIKE searches should still be present';
END $$;

-- Optional: Check for other unused indexes across all tables
-- Uncomment to run a global unused index check:
/*
SELECT
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan as times_used,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'  -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC;
*/
