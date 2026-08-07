-- ============================================
-- MIGRATION: Update dari Schema Lama ke Placement Test
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Hapus data lama (opsional, jika ingin mulai dari awal)
-- ============================================
-- HAPUS KOMENTAR DI BAWAH INI JIKA INGIN RESET SEMUA DATA
-- TRUNCATE TABLE assessment_answers CASCADE;
-- TRUNCATE TABLE assessments CASCADE;
-- TRUNCATE TABLE questions CASCADE;
-- TRUNCATE TABLE levels CASCADE;

-- ============================================
-- STEP 2: Update tabel levels
-- ============================================

-- Hapus kolom yang tidak diperlukan
ALTER TABLE levels DROP COLUMN IF EXISTS initial_data;

-- Update durasi
UPDATE levels SET durasi_menit = 45, jumlah_soal = 20 WHERE id = 1;

-- Hapus level Intermediate (jika ada)
DELETE FROM levels WHERE id = 2;

-- ============================================
-- STEP 3: Update tabel questions - tambah kolom level_type
-- ============================================

-- Tambah kolom level_type jika belum ada
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'level_type') THEN
        ALTER TABLE questions ADD COLUMN level_type VARCHAR(20) DEFAULT 'basic';
    END IF;
END $$;

-- Rename expected_cell ke answer_cell (jika masih pakai nama lama)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'questions' AND column_name = 'expected_cell') THEN
        ALTER TABLE questions RENAME COLUMN expected_cell TO answer_cell;
    END IF;
END $$;

-- ============================================
-- STEP 4: Update tabel assessments - tambah kolom baru
-- ============================================

-- Tambah kolom skor_basic
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'skor_basic') THEN
        ALTER TABLE assessments ADD COLUMN skor_basic DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Tambah kolom skor_intermediate
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'skor_intermediate') THEN
        ALTER TABLE assessments ADD COLUMN skor_intermediate DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Tambah kolom qualified_level
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'qualified_level') THEN
        ALTER TABLE assessments ADD COLUMN qualified_level VARCHAR(20);
    END IF;
END $$;

-- ============================================
-- STEP 5: Hapus soal lama dan insert soal baru
-- ============================================

-- Hapus semua soal lama
DELETE FROM questions WHERE level_id = 1;

-- Insert Soal BASIC (10 soal)
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'basic', 1, 'Hitung Total per Item', 'Di sel D2, buat rumus untuk mengalikan Harga (B2) dengan Qty (C2)', 'formula', 'D2', '=B2*C2', 1),
(1, 'basic', 2, 'Jumlahkan Semua Total', 'Di sel D8, jumlahkan semua nilai di kolom Total (D2:D6)', 'formula', 'D8', '=SUM(D2:D6)', 1),
(1, 'basic', 3, 'Rata-rata Harga', 'Di sel B9, hitung rata-rata harga semua item', 'formula', 'B9', '=AVERAGE(B2:B6)', 1),
(1, 'basic', 4, 'Hitung Jumlah Item', 'Di sel B10, hitung berapa banyak item menggunakan COUNT', 'formula', 'B10', '=COUNT(B2:B6)', 1),
(1, 'basic', 5, 'Harga Termurah', 'Di sel B11, temukan harga termurah menggunakan MIN', 'formula', 'B11', '=MIN(B2:B6)', 1),
(1, 'basic', 6, 'Harga Termahal', 'Di sel B12, temukan harga termahal menggunakan MAX', 'formula', 'B12', '=MAX(B2:B6)', 1),
(1, 'basic', 7, 'Total Qty', 'Di sel C8, jumlahkan semua qty di kolom C', 'formula', 'C8', '=SUM(C2:C6)', 1),
(1, 'basic', 8, 'Rata-rata Qty', 'Di sel C9, hitung rata-rata qty', 'formula', 'C9', '=AVERAGE(C2:C6)', 1),
(1, 'basic', 9, 'Jumlah Harga Item', 'Di sel B8, jumlahkan semua harga di kolom B', 'formula', 'B8', '=SUM(B2:B6)', 1),
(1, 'basic', 10, 'Total Penjualan', 'Di sel D7, jumlahkan semua total di D2:D6', 'formula', 'D7', '=SUM(D2:D6)', 1);

-- Insert Soal INTERMEDIATE (10 soal)
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'intermediate', 11, 'Hitung Total per Item', 'Di sel E2, buat rumus untuk mengalikan Harga (C2) dengan Qty (D2)', 'formula', 'E2', '=C2*D2', 1),
(1, 'intermediate', 12, 'Total Elektronik', 'Di sel E10, gunakan SUMIF untuk menjumlahkan total kategori "Elektronik"', 'formula', 'E10', '=SUMIF(B2:B8,"Elektronik",E2:E8)', 1),
(1, 'intermediate', 13, 'Total Furniture', 'Di sel E11, gunakan SUMIF untuk menjumlahkan total kategori "Furniture"', 'formula', 'E11', '=SUMIF(B2:B8,"Furniture",E2:E8)', 1),
(1, 'intermediate', 14, 'Jumlah Semua Item', 'Di sel E12, hitung jumlah semua item menggunakan COUNTA', 'formula', 'E12', '=COUNTA(A2:A8)', 1),
(1, 'intermediate', 15, 'Rata-rata Harga', 'Di sel C13, hitung rata-rata harga semua item', 'formula', 'C13', '=AVERAGE(C2:C8)', 1),
(1, 'intermediate', 16, 'Jumlah Item Elektronik', 'Di sel D10, hitung item berkategori Elektronik menggunakan COUNTIF', 'formula', 'D10', '=COUNTIF(B2:B8,"Elektronik")', 1),
(1, 'intermediate', 17, 'Jumlah Item Furniture', 'Di sel D11, hitung item berkategori Furniture menggunakan COUNTIF', 'formula', 'D11', '=COUNTIF(B2:B8,"Furniture")', 1),
(1, 'intermediate', 18, 'Total Qty Semua', 'Di sel D12, jumlahkan semua qty di kolom D', 'formula', 'D12', '=SUM(D2:D8)', 1),
(1, 'intermediate', 19, 'Harga Tertinggi', 'Di sel C14, temukan harga tertinggi menggunakan MAX', 'formula', 'C14', '=MAX(C2:C8)', 1),
(1, 'intermediate', 20, 'Harga Terendah', 'Di sel C15, temukan harga terendah menggunakan MIN', 'formula', 'C15', '=MIN(C2:C8)', 1);

-- ============================================
-- SELESAI! Schema sudah terupdate
-- ============================================
