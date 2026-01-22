-- Add role column to users table
-- Safe to run multiple times

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'USER';
        
        -- Add constraint to ensure only valid roles
        ALTER TABLE users
        ADD CONSTRAINT chk_user_role CHECK (role IN ('USER', 'ADMIN'));
    END IF;
END $$;
