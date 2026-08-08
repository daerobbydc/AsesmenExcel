-- Cleanup: Expire all stuck active assessments (never completed)
UPDATE assessments 
SET status = 'expired' 
WHERE status = 'active' 
  AND selesai_pada IS NULL;
