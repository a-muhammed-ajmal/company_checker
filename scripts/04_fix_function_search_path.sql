-- Fix for Supabase Database Linter Issue: Function Search Path Mutable
-- Issue: Function public.update_good_normalized has a role mutable search_path
-- Severity: SECURITY
--
-- This script sets a fixed search_path for the function to prevent potential
-- search_path injection attacks.

-- Fix the function by setting a fixed search_path
ALTER FUNCTION public.update_good_normalized() SET search_path = public, pg_temp;

-- Verify the fix
SELECT
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'update_good_normalized';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Function search_path has been fixed for public.update_good_normalized';
END $$;
