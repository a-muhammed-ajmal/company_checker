-- Fix for Supabase Database Linter Issue: Multiple Permissive Policies
-- Issue: Table public.enbd_approved has duplicate RLS policies
-- Severity: WARNING (Performance Impact)
--
-- Multiple permissive policies on the same table for the same role and action
-- cause performance degradation as each policy must be executed for every query.
--
-- This script removes duplicate policies and keeps only one consolidated policy.

-- Step 1: Check existing policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'enbd_approved'
ORDER BY policyname;

-- Step 2: Drop the duplicate/redundant policy
-- Keep "Enable read access for all users" and remove "Allow public read access"
DROP POLICY IF EXISTS "Allow public read access" ON public.enbd_approved;

-- Step 3: Verify only one policy remains
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'enbd_approved'
    AND cmd = 'SELECT';

    RAISE NOTICE 'Number of SELECT policies on enbd_approved: %', policy_count;

    IF policy_count = 1 THEN
        RAISE NOTICE '✅ Successfully removed duplicate policy';
    ELSE
        RAISE WARNING '⚠️ Expected 1 SELECT policy, found %', policy_count;
    END IF;
END $$;

-- Step 4: Check the same issue on other tables if they exist
-- Run similar checks for other tables that might have duplicate policies
SELECT
    tablename,
    COUNT(*) as policy_count,
    string_agg(policyname, ', ') as policies
FROM pg_policies
WHERE schemaname = 'public'
AND cmd = 'SELECT'
GROUP BY tablename
HAVING COUNT(*) > 1;
