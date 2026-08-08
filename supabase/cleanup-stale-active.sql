-- Cleanup: Auto-complete or expire stuck active assessments
-- Assessments with basic score: mark as completed (Basic level)
UPDATE assessments 
SET status = 'completed',
    skor = skor_basic,
    skor_intermediate = 0,
    qualified_level = 'Basic',
    selesai_pada = NOW()
WHERE status = 'active' 
  AND selesai_pada IS NULL
  AND skor_basic > 0;

-- Assessments with no score: mark as expired
UPDATE assessments 
SET status = 'expired'
WHERE status = 'active' 
  AND selesai_pada IS NULL
  AND (skor_basic = 0 OR skor_basic IS NULL);
