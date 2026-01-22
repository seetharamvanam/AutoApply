-- Add description column to job_applications table and update status constraint to include SAVED
-- Safe to run multiple times

-- Add description column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'job_applications' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE job_applications 
        ADD COLUMN description TEXT;
    END IF;
END $$;

-- Update status constraint to include SAVED
ALTER TABLE IF EXISTS job_applications
  DROP CONSTRAINT IF EXISTS chk_status;

ALTER TABLE job_applications
  ADD CONSTRAINT chk_status CHECK (
    status IN ('SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'INTERVIEW_DONE', 'OFFER', 'REJECTED', 'WITHDRAWN')
  );
