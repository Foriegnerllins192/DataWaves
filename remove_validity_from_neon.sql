-- Remove validity_days column from Neon PostgreSQL Database
-- Run this script in your Neon PostgreSQL console or using a PostgreSQL client

-- Check if the validity_days column exists before dropping it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'data_plans' 
        AND column_name = 'validity_days'
    ) THEN
        -- Drop the validity_days column
        ALTER TABLE data_plans DROP COLUMN validity_days;
        RAISE NOTICE 'validity_days column has been removed from data_plans table';
    ELSE
        RAISE NOTICE 'validity_days column does not exist in data_plans table';
    END IF;
END $$;

-- Verify the column has been removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'data_plans' 
ORDER BY ordinal_position;