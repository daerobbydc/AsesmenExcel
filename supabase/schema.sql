-- ============================================
-- Supabase Schema for Asesmen Excel (Interactive)
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
  jumlah_soal INT DEFAULT 10,
  initial_data JSONB
);

-- 3. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  level_id INT REFERENCES levels(id) ON DELETE CASCADE,
  nomor_soal INT NOT NULL,
  judul_soal VARCHAR(255) NOT NULL,
  instruksi TEXT NOT NULL,
  tipe_soal VARCHAR(20) DEFAULT 'formula' CHECK (tipe_soal IN ('formula', 'hasil', 'input')),
  answer_cell VARCHAR(10) NOT NULL,
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
  selesai_pada TIMESTAMPTZ
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

-- Insert Levels with initial_data
INSERT INTO levels (nama_level, deskripsi, durasi_menit, jumlah_soal, initial_data) VALUES
('Basic', 'Asesmen dasar Excel meliputi operasi sel, fungsi dasar (SUM, AVERAGE, COUNT, MIN, MAX)', 30, 10, '{
  "data": [
    ["Nama", "Harga", "Qty", "Total"],
    ["Apel", 15000, 10, null],
    ["Jeruk", 12000, 8, null],
    ["Mangga", 25000, 5, null],
    ["Pisang", 8000, 15, null],
    ["Anggur", 30000, 3, null],
    [null, null, null, null],
    ["Total Harga:", null, null, null],
    ["Rata-rata Harga:", null, null, null],
    ["Jumlah Item:", null, null, null],
    ["Harga Termurah:", null, null, null],
    ["Harga Termahal:", null, null, null]
  ],
  "colWidths": [150, 120, 80, 120]
}'),
('Intermediate', 'Asesmen lanjutan meliputi VLOOKUP, INDEX-MATCH, COUNTIF, SUMIF', 45, 10, '{
  "data": [
    ["Item", "Kategori", "Harga", "Qty", "Total"],
    ["Laptop", "Elektronik", 8500000, 2, null],
    ["Mouse", "Elektronik", 150000, 10, null],
    ["Meja", "Furniture", 500000, 3, null],
    ["Kursi", "Furniture", 350000, 5, null],
    ["Keyboard", "Elektronik", 250000, 4, null],
    ["Lemari", "Furniture", 1200000, 1, null],
    ["Headphone", "Elektronik", 450000, 3, null],
    [null, null, null, null, null],
    ["Total Elektronik:", null, null, null, null],
    ["Total Furniture:", null, null, null, null],
    ["Jumlah Semua Item:", null, null, null, null],
    ["Rata-rata Harga:", null, null, null, null]
  ],
  "colWidths": [150, 120, 120, 80, 120]
}');

-- Insert Questions - Basic Level
INSERT INTO questions (level_id, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 1, 'Hitung Total per Item', 'Di sel D2, buat rumus untuk mengalikan Harga (B2) dengan Qty (C2), lalu drag ke bawah sampai D6', 'formula', 'D2', '=B2*C2', 1),
(1, 2, 'Jumlahkan Semua Total', 'Di sel D8, jumlahkan semua nilai di kolom Total (D2:D6)', 'formula', 'D8', '=SUM(D2:D6)', 1),
(1, 3, 'Rata-rata Harga', 'Di sel B9, hitung rata-rata harga semua item', 'formula', 'B9', '=AVERAGE(B2:B6)', 1),
(1, 4, 'Hitung Jumlah Item', 'Di sel B10, hitung berapa banyak item ( jumlah baris yang ada data)', 'formula', 'B10', '=COUNT(B2:B6)', 1),
(1, 5, 'Harga Termurah', 'Di sel B11, temukan harga termurah dari semua item', 'formula', 'B11', '=MIN(B2:B6)', 1),
(1, 6, 'Harga Termahal', 'Di sel B12, temukan harga termahal dari semua item', 'formula', 'B12', '=MAX(B2:B6)', 1),
(1, 7, 'Total Qty', 'Di sel C8, jumlahkan semua qty di kolom C', 'formula', 'C8', '=SUM(C2:C6)', 1),
(1, 8, 'Rata-rata Qty', 'Di sel C9, hitung rata-rata qty', 'formula', 'C9', '=AVERAGE(C2:C6)', 1),
(1, 9, 'Jumlah Harga Item', 'Di sel B8, jumlahkan semua harga di kolom B', 'formula', 'B8', '=SUM(B2:B6)', 1),
(1, 10, 'Harga Tertinggi Kedua', 'Di sel B12, gunakan kombinasi MAX dan IF atau cara lain untuk mencari harga tertinggi kedua', 'input', 'B12', '25000', 1);

-- Insert Questions - Intermediate Level
INSERT INTO questions (level_id, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(2, 1, 'Hitung Total per Item', 'Di sel E2, buat rumus untuk mengalikan Harga (C2) dengan Qty (D2), lalu drag ke bawah', 'formula', 'E2', '=C2*D2', 1),
(2, 2, 'Total Elektronik', 'Di sel E10, gunakan SUMIF untuk menjumlahkan total dari kategori "Elektronik"', 'formula', 'E10', '=SUMIF(B2:B8,"Elektronik",E2:E8)', 1),
(2, 3, 'Total Furniture', 'Di sel E11, gunakan SUMIF untuk menjumlahkan total dari kategori "Furniture"', 'formula', 'E11', '=SUMIF(B2:B8,"Furniture",E2:E8)', 1),
(2, 4, 'Jumlah Semua Item', 'Di sel E12, hitung jumlah semua item menggunakan COUNTA atau COUNT', 'formula', 'E12', '=COUNTA(A2:A8)', 1),
(2, 5, 'Rata-rata Harga', 'Di sel C13, hitung rata-rata harga semua item', 'formula', 'C13', '=AVERAGE(C2:C8)', 1),
(2, 6, 'Jumlah Item Elektronik', 'Di sel D10, hitung berapa item berkategori Elektronik menggunakan COUNTIF', 'formula', 'D10', '=COUNTIF(B2:B8,"Elektronik")', 1),
(2, 7, 'Jumlah Item Furniture', 'Di sel D11, hitung berapa item berkategori Furniture menggunakan COUNTIF', 'formula', 'D11', '=COUNTIF(B2:B8,"Furniture")', 1),
(2, 8, 'Total Qty Semua', 'Di sel D12, jumlahkan semua qty di kolom D', 'formula', 'D12', '=SUM(D2:D8)', 1),
(2, 9, 'Harga Tertinggi', 'Di sel C14, temukan harga tertinggi menggunakan MAX', 'formula', 'C14', '=MAX(C2:C8)', 1),
(2, 10, 'Harga Terendah', 'Di sel C15, temukan harga terendah menggunakan MIN', 'formula', 'C15', '=MIN(C2:C8)', 1);

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

CREATE POLICY "Admin can manage levels" ON levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

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
