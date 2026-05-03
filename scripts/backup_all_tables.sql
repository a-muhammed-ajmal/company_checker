-- Run each of these in Supabase SQL Editor to export table data
-- Go to: Supabase Dashboard > SQL Editor > paste each block > run

-- ============================================================
-- TABLE: delisted_company_1
-- ============================================================
SELECT * FROM delisted_company_1 ORDER BY id;

-- ============================================================
-- TABLE: delisted_company_2
-- ============================================================
SELECT * FROM delisted_company_2 ORDER BY id;

-- ============================================================
-- TABLE: eib_approved
-- ============================================================
SELECT * FROM eib_approved ORDER BY id;

-- ============================================================
-- TABLE: enbd_approved
-- ============================================================
SELECT * FROM enbd_approved ORDER BY id;

-- ============================================================
-- TABLE: payroll_approved
-- ============================================================
SELECT * FROM payroll_approved ORDER BY id;

-- ============================================================
-- TABLE: credit_card_approved
-- ============================================================
SELECT * FROM credit_card_approved ORDER BY id;

-- ============================================================
-- TABLE: good_listed
-- ============================================================
SELECT * FROM good_listed ORDER BY id;

-- ============================================================
-- HOW TO EXPORT AS CSV:
-- 1. Go to Supabase Dashboard > Table Editor
-- 2. Open each table
-- 3. Click the download/export icon (top right of table)
-- 4. Save as CSV
-- 5. Store the CSVs in a safe place (Google Drive, email, etc.)
-- ============================================================
