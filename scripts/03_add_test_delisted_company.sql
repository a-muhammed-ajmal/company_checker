-- Add test delisted company to verify the system works
-- This adds "AQILI INFORMATION SYSTEMS LLC" to the delisted_company_1 table

INSERT INTO delisted_company_1 (company_name)
VALUES ('AQILI INFORMATION SYSTEMS LLC')
ON CONFLICT DO NOTHING;

-- Verify the insertion
SELECT * FROM delisted_company_1 WHERE company_name = 'AQILI INFORMATION SYSTEMS LLC';
