-- ============================================
-- Supabase Schema for Asesmen Excel (Placement Test)
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

-- 2. Levels table (hanya 1: Placement Test)
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  nama_level VARCHAR(50) NOT NULL,
  deskripsi TEXT,
  durasi_menit INT DEFAULT 45,
  jumlah_soal INT DEFAULT 20
);

-- 3. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  level_id INT REFERENCES levels(id) ON DELETE CASCADE,
  level_type VARCHAR(20) DEFAULT 'basic' CHECK (level_type IN ('basic', 'intermediate')),
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
  skor_basic DECIMAL(5,2) DEFAULT 0,
  skor_intermediate DECIMAL(5,2) DEFAULT 0,
  qualified_level VARCHAR(20),
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

-- Insert Level (Placement Test)
INSERT INTO levels (id, nama_level, deskripsi, durasi_menit, jumlah_soal) VALUES
(1, 'Placement Test', 'Tes penentuan level Excel: Basic atau Intermediate. Kerjakan semua soal secara berurutan.', 45, 20);

-- Insert Questions - BASIC (10 soal)
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

-- Insert Questions - INTERMEDIATE (10 soal)
INSERT INTO questions (level_id, level_type, nomor_soal, judul_soal, instruksi, tipe_soal, answer_cell, expected_value, poin) VALUES
(1, 'intermediate', 11, 'Hitung Total per Item', 'Di sel E2, buat rumus untuk mengalikan Harga (C2) dengan Qty (D2)', 'formula', 'E2', '=C2*D2', 1),
(1, 'intermediate', 12, 'Total Elektronik', 'Di sel E10, gunakan SUMIF untuk menjumlahkan total kategori "Elektronik"', 'formula', 'E10', '=SUMIF(B2:B8,"Elektronik",E2:E8)', 1),
(1, 'intermediate', 13, 'Total Furniture', 'Di sel E11, gunakan SUMIF untuk menjumlahkan total kategori "Furniture"', 'formula', 'E11', '=SUMIF(B2:B8,"Furniture",E2:E8)', 1),
(1, 'intermediate', 14, 'Jumlah Semua Item', 'Di sel E12, hitung jumlah semua item menggunakan COUNTA', 'formula', 'E12', '=COUNTA(A2:A8)', 1),
(1, 'intermediate', 15, 'Cari Harga dengan VLOOKUP', 'Di sel G17, gunakan VLOOKUP untuk mencari harga "Mouse" dari tabel referensi G2:H8', 'formula', 'G17', '=VLOOKUP("Mouse",G2:H8,2,FALSE)', 1),
(1, 'intermediate', 16, 'Jumlah Item Elektronik', 'Di sel D10, hitung item berkategori Elektronik menggunakan COUNTIF', 'formula', 'D10', '=COUNTIF(B2:B8,"Elektronik")', 1),
(1, 'intermediate', 17, 'Jumlah Item Furniture', 'Di sel D11, hitung item berkategori Furniture menggunakan COUNTIF', 'formula', 'D11', '=COUNTIF(B2:B8,"Furniture")', 1),
(1, 'intermediate', 18, 'Total Qty Semua', 'Di sel D12, jumlahkan semua qty di kolom D', 'formula', 'D12', '=SUM(D2:D8)', 1),
(1, 'intermediate', 19, 'Cari Harga dengan HLOOKUP', 'Di sel G18, gunakan HLOOKUP untuk mencari harga "Meja" dari tabel horizontal G14:K15', 'formula', 'G18', '=HLOOKUP("Meja",G14:K15,2,FALSE)', 1),
(1, 'intermediate', 20, 'Cari Harga dengan INDEX/MATCH', 'Di sel G19, gunakan INDEX dan MATCH untuk mencari harga "Keyboard" dari kolom Harga', 'formula', 'G19', '=INDEX(C2:C8,MATCH("Keyboard",A2:A8,0))', 1);

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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view levels" ON levels
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage levels" ON levels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view questions" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage questions" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

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
