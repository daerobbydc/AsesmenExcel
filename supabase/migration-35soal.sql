-- ============================================
-- MIGRATION: 35 Soal (100 Poin)
-- Basic: 20 soal (15x3pt + 5x2pt) = 55pt
-- Intermediate: 15 soal (15x3pt) = 45pt
-- ============================================

UPDATE levels 
SET durasi_menit = 45, jumlah_soal = 35 
WHERE id = 1;

DELETE FROM questions WHERE level_id = 1;

-- ============================================
-- BASIC: 20 Soal (55 poin)
-- ============================================
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'basic', 1, 'Total Penjualan Apel', 'Di sel D2, buat rumus untuk mengalikan Harga (B2) dengan Qty (C2)', 'formula', 'D2', '=B2*C2', 3),
(1, 'basic', 2, 'Total Penjualan Jeruk', 'Di sel D3, buat rumus untuk mengalikan Harga (B3) dengan Qty (C3)', 'formula', 'D3', '=B3*C3', 3),
(1, 'basic', 3, 'Total Penjualan Mangga', 'Di sel D4, buat rumus untuk mengalikan Harga (B4) dengan Qty (C4)', 'formula', 'D4', '=B4*C4', 3),
(1, 'basic', 4, 'Total Penjualan Pisang', 'Di sel D5, buat rumus untuk mengalikan Harga (B5) dengan Qty (C5)', 'formula', 'D5', '=B5*C5', 3),
(1, 'basic', 5, 'Total Penjualan Anggur', 'Di sel D6, buat rumus untuk mengalikan Harga (B6) dengan Qty (C6)', 'formula', 'D6', '=B6*C6', 3),
(1, 'basic', 6, 'Jumlahkan Semua Total', 'Di sel D8, jumlahkan semua nilai di kolom Total (D2:D6)', 'formula', 'D8', '=SUM(D2:D6)', 3),
(1, 'basic', 7, 'Jumlahkan Semua Harga', 'Di sel B8, jumlahkan semua harga di kolom B (B2:B6)', 'formula', 'B8', '=SUM(B2:B6)', 3),
(1, 'basic', 8, 'Jumlahkan Semua Qty', 'Di sel C8, jumlahkan semua qty di kolom C (C2:C6)', 'formula', 'C8', '=SUM(C2:C6)', 3),
(1, 'basic', 9, 'Rata-rata Harga', 'Di sel B9, hitung rata-rata harga semua item', 'formula', 'B9', '=AVERAGE(B2:B6)', 3),
(1, 'basic', 10, 'Rata-rata Qty', 'Di sel C9, hitung rata-rata qty semua item', 'formula', 'C9', '=AVERAGE(C2:C6)', 3),
(1, 'basic', 11, 'Hitung Jumlah Item', 'Di sel B10, hitung berapa banyak item menggunakan COUNT', 'formula', 'B10', '=COUNT(B2:B6)', 3),
(1, 'basic', 12, 'Hitung Nama Item', 'Di sel C10, hitung jumlah nama item menggunakan COUNTA', 'formula', 'C10', '=COUNTA(A2:A6)', 3),
(1, 'basic', 13, 'Harga Termurah', 'Di sel B11, temukan harga termurah menggunakan MIN', 'formula', 'B11', '=MIN(B2:B6)', 3),
(1, 'basic', 14, 'Harga Termahal', 'Di sel B12, temukan harga termahal menggunakan MAX', 'formula', 'B12', '=MAX(B2:B6)', 3),
(1, 'basic', 15, 'Rata-rata Total Penjualan', 'Di sel D9, hitung rata-rata total penjualan (D2:D6)', 'formula', 'D9', '=AVERAGE(D2:D6)', 3),
(1, 'basic', 16, 'Total Qty Semua Item', 'Di sel C11, jumlahkan semua qty di kolom C', 'formula', 'C11', '=SUM(C2:C6)', 2),
(1, 'basic', 17, 'Qty Termurah', 'Di sel C12, temukan qty terkecil menggunakan MIN', 'formula', 'C12', '=MIN(C2:C6)', 2),
(1, 'basic', 18, 'Qty Terbesar', 'Di sel C13, temukan qty terbesar menggunakan MAX', 'formula', 'C13', '=MAX(C2:C6)', 2),
(1, 'basic', 19, 'Total Per Item x2', 'Di sel D10, jumlahkan D2:D6 sebagai total seluruh', 'formula', 'D10', '=SUM(D2:D6)', 2),
(1, 'basic', 20, 'Rata-rata Total', 'Di sel D11, hitung rata-rata dari D2:D6', 'formula', 'D11', '=AVERAGE(D2:D6)', 2);

-- ============================================
-- INTERMEDIATE: 15 Soal (45 poin)
-- ============================================
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'intermediate', 21, 'Total Penjualan Item', 'Di sel E2, buat rumus untuk mengalikan Harga (C2) dengan Qty (D2)', 'formula', 'E2', '=C2*D2', 3),
(1, 'intermediate', 22, 'Total Penjualan Item 2', 'Di sel E3, buat rumus untuk mengalikan Harga (C3) dengan Qty (D3)', 'formula', 'E3', '=C3*D3', 3),
(1, 'intermediate', 23, 'Total Penjualan Item 3', 'Di sel E4, buat rumus untuk mengalikan Harga (C4) dengan Qty (D4)', 'formula', 'E4', '=C4*D4', 3),
(1, 'intermediate', 24, 'Total Penjualan Item 4', 'Di sel E5, buat rumus untuk mengalikan Harga (C5) dengan Qty (D5)', 'formula', 'E5', '=C5*D5', 3),
(1, 'intermediate', 25, 'Total Penjualan Item 5', 'Di sel E6, buat rumus untuk mengalikan Harga (C6) dengan Qty (D6)', 'formula', 'E6', '=C6*D6', 3),
(1, 'intermediate', 26, 'Total Elektronik', 'Di sel E10, gunakan SUMIF untuk menjumlahkan total kategori "Elektronik"', 'formula', 'E10', '=SUMIF(B2:B8,"Elektronik",E2:E8)', 3),
(1, 'intermediate', 27, 'Total Furniture', 'Di sel E11, gunakan SUMIF untuk menjumlahkan total kategori "Furniture"', 'formula', 'E11', '=SUMIF(B2:B8,"Furniture",E2:E8)', 3),
(1, 'intermediate', 28, 'Jumlah Semua Item', 'Di sel E12, hitung jumlah semua item menggunakan COUNTA', 'formula', 'E12', '=COUNTA(A2:A8)', 3),
(1, 'intermediate', 29, 'Jumlah Item Elektronik', 'Di sel D10, hitung item berkategori Elektronik menggunakan COUNTIF', 'formula', 'D10', '=COUNTIF(B2:B8,"Elektronik")', 3),
(1, 'intermediate', 30, 'Jumlah Item Furniture', 'Di sel D11, hitung item berkategori Furniture menggunakan COUNTIF', 'formula', 'D11', '=COUNTIF(B2:B8,"Furniture")', 3),
(1, 'intermediate', 31, 'Cari Harga Mouse', 'Di sel G17, gunakan VLOOKUP untuk mencari harga "Mouse" dari tabel referensi', 'formula', 'G17', '=VLOOKUP("Mouse",G2:H8,2,FALSE)', 3),
(1, 'intermediate', 32, 'Cari Harga Meja', 'Di sel G18, gunakan HLOOKUP untuk mencari harga "Meja" dari tabel horizontal', 'formula', 'G18', '=HLOOKUP("Meja",G14:K15,2,FALSE)', 3),
(1, 'intermediate', 33, 'Cari Harga Keyboard', 'Di sel G19, gunakan INDEX dan MATCH untuk mencari harga "Keyboard"', 'formula', 'G19', '=INDEX(C2:C8,MATCH("Keyboard",A2:A8,0))', 3),
(1, 'intermediate', 34, 'Total Qty Semua', 'Di sel D12, jumlahkan semua qty di kolom D', 'formula', 'D12', '=SUM(D2:D8)', 3),
(1, 'intermediate', 35, 'Rata-rata Harga', 'Di sel C9, hitung rata-rata harga semua item', 'formula', 'C9', '=AVERAGE(C2:C8)', 3);
