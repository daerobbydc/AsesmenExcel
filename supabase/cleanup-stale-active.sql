-- Cleanup: Expire all active assessments with no scores (stuck from old flow)
UPDATE assessments 
SET status = 'expired' 
WHERE status = 'active' 
  AND skor_basic IS NULL;
