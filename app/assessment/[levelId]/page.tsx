"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";

interface Question {
  id: number;
  nomor_soal: number;
  judul_soal: string;
  instruksi: string;
  tipe_soal: string;
  poin: number;
}

interface Level {
  id: number;
  nama_level: string;
  deskripsi: string;
  durasi_menit: number;
  jumlah_soal: number;
}

export default function AssessmentPage() {
  const params = useParams();
  const levelId = params.levelId;
  const router = useRouter();

  const [level, setLevel] = useState<Level | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: levelData } = await supabase
        .from("levels")
        .select("*")
        .eq("id", levelId)
        .single();

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("level_id", levelId)
        .order("nomor_soal");

      if (levelData) setLevel(levelData);
      if (questionsData) setQuestions(questionsData);
      setLoading(false);
    };

    fetchData();
  }, [levelId]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const handleStart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        level_id: levelId,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      setError("Gagal memulai asesmen");
      return;
    }

    setAssessmentId(data.id);
    setTimeLeft((level?.durasi_menit || 60) * 60);
    setStarted(true);
  };

  const handleSubmit = async () => {
    if (!file || !assessmentId) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assessmentId", assessmentId.toString());
    formData.append("levelId", levelId.toString());

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal upload file");
      }

      setSuccess("File berhasil diunggah! Menghitung skor...");

      setTimeout(() => {
        router.push(`/assessment/results/${assessmentId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const fileName = level?.nama_level.toLowerCase() === "basic"
      ? "template_basic.xlsx"
      : "template_intermediate.xlsx";

    const response = await fetch(`/templates/${fileName}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-excel-green"></div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Level tidak ditemukan</h2>
          <Link href="/dashboard" className="btn-primary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-excel-green hover:underline text-sm mb-2 block">
              &larr; Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Asesmen {level.nama_level}
            </h1>
          </div>

          {started && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Sisa Waktu</p>
              <p className={`text-3xl font-bold ${timeLeft < 300 ? "text-red-600" : "text-excel-green"}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          )}
        </div>

        {/* Not Started State */}
        {!started && (
          <div className="card">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-excel-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Siap Memulai?</h2>
              <p className="text-gray-600 mb-4">{level.deskripsi}</p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <span>{level.jumlah_soal} Soal</span>
                <span>{level.durasi_menit} Menit</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Petunjuk:</h3>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Klik &quot;Mulai Asesmen&quot; untuk memulai timer</li>
                <li>Download template Excel yang tersedia</li>
                <li>Kerjakan soal-soal di Microsoft Excel</li>
                <li>Upload file Excel yang sudah dikerjakan</li>
                <li>Klik &quot;Selesai&quot; untuk mengirim jawaban</li>
              </ol>
            </div>

            <button onClick={handleStart} className="btn-primary w-full text-lg py-3">
              Mulai Asesmen
            </button>
          </div>
        )}

        {/* Started State */}
        {started && (
          <div className="space-y-6">
            {/* Questions List */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Daftar Soal</h2>
              <div className="space-y-3">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-start p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="bg-excel-green text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      {q.nomor_soal}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{q.judul_soal}</h3>
                      <p className="text-sm text-gray-600 mt-1">{q.instruksi}</p>
                      <span className="badge-blue text-xs mt-2 inline-block">{q.poin} poin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Section */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Upload Jawaban</h2>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Template Excel
                  </button>
                </div>

                <div>
                  <label className="label">Upload File Excel yang Sudah Dikerjakan</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-excel-green transition-colors"
                  >
                    {file ? (
                      <div>
                        <svg className="w-12 h-12 text-excel-green mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium text-excel-green">{file.name}</p>
                        <p className="text-sm text-gray-500">Klik untuk mengganti file</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600">Klik untuk memilih file Excel</p>
                        <p className="text-sm text-gray-400">Format: .xlsx atau .xls</p>
                      </div>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!file || uploading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Mengunggah...
                    </span>
                  ) : (
                    "Selesai & Kirim Jawaban"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
