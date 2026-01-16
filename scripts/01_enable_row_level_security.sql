-- ==========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- This ensures data protection at the database level
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE eib_approved ENABLE ROW LEVEL SECURITY;
ALTER TABLE enbd_approved ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_approved ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_card_approved ENABLE ROW LEVEL SECURITY;
ALTER TABLE good_listed ENABLE ROW LEVEL SECURITY;
ALTER TABLE delisted_company_1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE delisted_company_2 ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CREATE PUBLIC READ POLICIES
-- Allow anonymous users to read data (search functionality)
-- But prevent any writes/updates/deletes
-- ==========================================

-- EIB Approved
CREATE POLICY "Allow public read access" ON eib_approved
  FOR SELECT USING (true);

-- ENBD Approved
CREATE POLICY "Allow public read access" ON enbd_approved
  FOR SELECT USING (true);

-- Payroll Approved
CREATE POLICY "Allow public read access" ON payroll_approved
  FOR SELECT USING (true);

-- Credit Card Approved
CREATE POLICY "Allow public read access" ON credit_card_approved
  FOR SELECT USING (true);

-- Good Listed
CREATE POLICY "Allow public read access" ON good_listed
  FOR SELECT USING (true);

-- Delisted Company 1
CREATE POLICY "Allow public read access" ON delisted_company_1
  FOR SELECT USING (true);

-- Delisted Company 2
CREATE POLICY "Allow public read access" ON delisted_company_2
  FOR SELECT USING (true);

-- ==========================================
-- NOTES:
-- 1. RLS is now enabled - only SELECT operations are allowed
-- 2. No INSERT, UPDATE, or DELETE allowed by default
-- 3. To manage data, use Supabase Dashboard or create admin policies
-- ==========================================
