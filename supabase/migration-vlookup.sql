-- ============================================
-- MIGRATION: Update Intermediate Questions
-- Ganti AVERAGE, MAX, MIN → VLOOKUP, HLOOKUP, INDEX/MATCH
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- Hapus soal lama yang akan diganti
DELETE FROM questions WHERE level_id = 1 AND level_type = 'intermediate' AND nomor_soal IN (15, 19, 20);

-- Insert soal baru: VLOOKUP (nomor 15)
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'intermediate', 15, 'Cari Harga dengan VLOOKUP', 'Di sel G17, gunakan VLOOKUP untuk mencari harga "Mouse" dari tabel referensi G2:H8', 'formula', 'G17', '=VLOOKUP("Mouse",G2:H8,2,FALSE)', 1);

-- Insert soal baru: HLOOKUP (nomor 19)
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'intermediate', 19, 'Cari Harga dengan HLOOKUP', 'Di sel G18, gunakan HLOOKUP untuk mencari harga "Meja" dari tabel horizontal G14:K15', 'formula', 'G18', '=HLOOKUP("Meja",G14:K15,2,FALSE)', 1);

-- Insert soal baru: INDEX/MATCH (nomor 20)
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'intermediate', 20, 'Cari Harga dengan INDEX/MATCH', 'Di sel G19, gunakan INDEX dan MATCH untuk mencari harga "Keyboard" dari kolom Harga', 'formula', 'G19', '=INDEX(C2:C8,MATCH("Keyboard",A2:A8,0))', 1);

-- Update jumlah_soal di levels
UPDATE levels SET jumlah_soal = 20 WHERE id = 1;
