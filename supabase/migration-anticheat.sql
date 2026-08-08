-- ============================================
-- MIGRATION: Anti-Cheating Features
-- Tab Switch Count + Time Per Question
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- Tambah kolom tab_switch_count
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS tab_switch_count INT DEFAULT 0;

-- Tambah kolom question_time_spent (JSON object)
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS question_time_spent JSONB DEFAULT '{}';
