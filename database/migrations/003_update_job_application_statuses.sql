-- Ensure INTERVIEW_DONE status exists in job_applications.status constraint.
-- Safe to run multiple times.

ALTER TABLE IF EXISTS job_applications
  DROP CONSTRAINT IF EXISTS chk_status;

ALTER TABLE IF EXISTS job_applications
  ADD CONSTRAINT chk_status CHECK (
    status IN ('APPLIED', 'SCREENING', 'INTERVIEW', 'INTERVIEW_DONE', 'OFFER', 'REJECTED', 'WITHDRAWN')
  );


