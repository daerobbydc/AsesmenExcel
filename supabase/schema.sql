-- ============================================
-- Supabase Schema for Asesmen Excel
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Levels table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  nama_level VARCHAR(50) NOT NULL,
  deskripsi TEXT,
  durasi_menit INT DEFAULT 60,
  jumlah_soal INT DEFAULT 15
);

-- 3. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  level_id INT REFERENCES levels(id) ON DELETE CASCADE,
  nomor_soal INT NOT NULL,
  judul_soal VARCHAR(255) NOT NULL,
  instruksi TEXT NOT NULL,
  tipe_soal VARCHAR(20) DEFAULT 'hasil' CHECK (tipe_soal IN ('formula', 'hasil', 'format')),
  expected_cell VARCHAR(10),
  expected_value VARCHAR(255),
  poin INT DEFAULT 1
);

-- 4. Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id INT REFERENCES levels(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  skor DECIMAL(5,2) DEFAULT 0,
  mulai_pada TIMESTAMPTZ DEFAULT NOW(),
  selesai_pada TIMESTAMPTZ,
  file_upload VARCHAR(255)
);

-- 5. Assessment Answers table
CREATE TABLE IF NOT EXISTS assessment_answers (
  id SERIAL PRIMARY KEY,
  assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
  question_id INT REFERENCES questions(id) ON DELETE CASCADE,
  jawaban_user VARCHAR(255),
  is_correct BOOLEAN DEFAULT FALSE,
  poin_didapat DECIMAL(5,2) DEFAULT 0
);

-- ============================================
-- Seed Data
-- ============================================

-- Insert Levels
INSERT INTO levels (nama_level, deskripsi, durasi_menit, jumlah_soal) VALUES
('Basic', 'Asesmen dasar Excel meliputi operasi sel, fungsi dasar, formatting, sort & filter', 45, 15),
('Intermediate', 'Asesmen lanjutan meliputi VLOOKUP/INDEX-MATCH, Pivot Table, Charts, Conditional Formatting', 60, 15);

-- Insert Questions - Basic Level
INSERT INTO questions (level_id, nomor_soal, judul_soal, instruksi, tipe_soal, expected_cell, expected_value, poin) VALUES
(1, 1, 'Penjumlahan Sederhana', 'Di sel B5, masukkan rumus untuk menjumlahkan nilai di B2:B4', 'formula', 'B5', '=SUM(B2:B4)', 1),
(1, 2, 'Rata-rata Data', 'Di sel B6, hitung rata-rata nilai di B2:B5', 'formula', 'B6', '=AVERAGE(B2:B5)', 1),
(1, 3, 'Menghitung Jumlah Data', 'Di sel B7, hitung jumlah data (angka) di kolom B', 'formula', 'B7', '=COUNT(B2:B6)', 1),
(1, 4, 'Nilai Minimum', 'Di sel B8, temukan nilai minimum di B2:B6', 'formula', 'B8', '=MIN(B2:B6)', 1),
(1, 5, 'Nilai Maksimum', 'Di sel B9, temukan nilai maksimum di B2:B6', 'formula', 'B9', '=MAX(B2:B6)', 1),
(1, 6, 'Formula Kali', 'Di sel C2, kalikan nilai di A2 dengan B2', 'formula', 'C2', '=A2*B2', 1),
(1, 7, 'Formula Bagi', 'Di sel C3, bagi nilai di A3 dengan B3', 'formula', 'C3', '=A3/B3', 1),
(1, 8, 'Formatting Angka', 'Format sel B2:B10 sebagai Currency (Rp)', 'format', 'B2', 'currency', 1),
(1, 9, 'Bold Text', 'Buat teks di sel A1 menjadi Bold', 'format', 'A1', 'bold', 1),
(1, 10, 'Warna Latar Belakang', 'Ubah warna latar belakang sel A1:A5 menjadi kuning', 'format', 'A1', 'yellow_bg', 1),
(1, 11, 'Border Tabel', 'Tambahkan border pada range A1:C10', 'format', 'A1', 'border', 1),
(1, 12, 'Sort Data', 'Urutkan data di range A2:C10 berdasarkan kolom A dari A-Z', 'format', 'A2', 'sorted_az', 1),
(1, 13, 'Filter Data', 'Filter data di A1:C10 untuk menampilkan baris dengan nilai B > 50', 'format', 'B1', 'filtered', 1),
(1, 14, 'Freeze Panes', 'Freeze baris pertama (baris 1)', 'format', 'A1', 'frozen', 1),
(1, 15, 'Lebar Kolom', 'Atur lebar kolom A menjadi 20', 'format', 'A1', 'width_20', 1);

-- Insert Questions - Intermediate Level
INSERT INTO questions (level_id, nomor_soal, judul_soal, instruksi, tipe_soal, expected_cell, expected_value, poin) VALUES
(2, 1, 'VLOOKUP Sederhana', 'Gunakan VLOOKUP untuk mencari nilai "Item3" dari tabel di A2:C10, tampilkan di E2', 'formula', 'E2', '=VLOOKUP("Item3",A2:C10,3,FALSE)', 1),
(2, 2, 'VLOOKUP dengan Reference', 'Gunakan VLOOKUP dengan cell reference untuk mencari "Item5" dari tabel', 'formula', 'E3', '=VLOOKUP(D3,A2:C10,3,FALSE)', 1),
(2, 3, 'INDEX-MATCH', 'Gunakan INDEX dan MATCH untuk mengambil nilai dari kolom C berdasarkan "Item4" di kolom A', 'formula', 'E4', '=INDEX(C2:C10,MATCH("Item4",A2:A10,0))', 1),
(2, 4, 'INDEX-MATCH 2D', 'Gunakan INDEX-MATCH untuk mengambil nilai di persimpangan baris "Item2" dan kolom "Harga"', 'formula', 'E5', '=INDEX(B2:C10,MATCH("Item2",A2:A10,0),2)', 1),
(2, 5, 'Conditional Formatting Angka', 'Buat conditional formatting: jika nilai di B2:B10 > 100, warnai merah', 'format', 'B2', 'cond_format_red', 1),
(2, 6, 'Conditional Formatting Teks', 'Buat conditional formatting: jika kolom A berisi "VIP", warnai hijau', 'format', 'A2', 'cond_format_green', 1),
(2, 7, 'Icon Set', 'Terapkan Icon Set (3 icons) pada kolom C', 'format', 'C2', 'icon_set', 1),
(2, 8, 'Color Scale', 'Terapkan Color Scale pada kolom B', 'format', 'B2', 'color_scale', 1),
(2, 9, 'Buat Pivot Table', 'Buat Pivot Table dari data A1:D20, taruh di F1. Rows: Kategori, Values: Sum of Penjualan', 'format', 'F1', 'pivot_table', 1),
(2, 10, 'Pivot Table Grouping', 'Group data Pivot Table berdasarkan bulan', 'format', 'F1', 'pivot_group', 1),
(2, 11, 'Bar Chart', 'Buat Bar Chart dari data A1:B10', 'format', 'A1', 'bar_chart', 1),
(2, 12, 'Pie Chart', 'Buat Pie Chart dari data A1:A10 dan C1:C10', 'format', 'A1', 'pie_chart', 1),
(2, 13, 'Line Chart', 'Buat Line Chart dari data kolom B', 'format', 'B1', 'line_chart', 1),
(2, 14, 'Chart Title', 'Buat chart dengan judul "Data Penjualan 2024"', 'format', 'A1', 'chart_title', 1),
(2, 15, 'Chart Legend', 'Buat chart dengan legenda di posisi bawah', 'format', 'A1', 'chart_legend', 1);

-- ============================================
-- Trigger: Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', NEW.email),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Levels policies (public read)
CREATE POLICY "Anyone can view levels" ON levels
  FOR SELECT USING (true);

-- Questions policies (public read)
CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage questions" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all assessments" ON assessments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Assessment Answers policies
CREATE POLICY "Users can view own answers" ON assessment_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_answers.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own answers" ON assessment_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_answers.assessment_id
      AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all answers" ON assessment_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
