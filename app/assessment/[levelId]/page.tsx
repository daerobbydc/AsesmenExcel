"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";
import Spreadsheet from "@/components/Spreadsheet";

interface Question {
  id: number;
  nomor_soal: number;
  judul_soal: string;
  instruksi: string;
  tipe_soal: string;
  answer_cell: string;
  expected_value: string;
  poin: number;
}

interface Level {
  id: number;
  nama_level: string;
  deskripsi: string;
  durasi_menit: number;
  jumlah_soal: number;
  initial_data: {
    data: any[][];
    colWidths?: number[];
  };
}

export default function AssessmentPage() {
  const params = useParams();
  const levelId = params.levelId;
  const router = useRouter();

  const [level, setLevel] = useState<Level | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [cellValues, setCellValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
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

      if (levelData) {
        setLevel(levelData);
        if (levelData.initial_data?.data) {
          const initial: Record<string, string> = {};
          levelData.initial_data.data.forEach((row: any[], rowIdx: number) => {
            row.forEach((cell: any, colIdx: number) => {
              if (cell !== null && cell !== undefined) {
                const cellRef = String.fromCharCode(65 + colIdx) + (rowIdx + 1);
                initial[cellRef] = String(cell);
              }
            });
          });
          setCellValues(initial);
        }
      }
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

  const handleCellsChange = useCallback((changes: any[]) => {
    setCellValues((prev) => {
      const newValues = { ...prev };
      changes.forEach((change: any) => {
        const [row, col, , newVal] = change;
        const cellRef = String.fromCharCode(65 + col) + (row + 1);
        newValues[cellRef] = String(newVal ?? "");
      });
      return newValues;
    });
  }, []);

  const handleSubmit = async () => {
    if (!assessmentId) {
      setError("Asesmen belum dimulai");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          levelId,
          cellValues,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim jawaban");
      }

      setSuccess(`Skor Anda: ${result.skor}% - Mengarahkan ke halaman hasil...`);

      setTimeout(() => {
        router.push(`/assessment/results/${assessmentId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getSpreadsheetData = () => {
    if (!level?.initial_data?.data) return [];
    return level.initial_data.data;
  };

  const getAnswerCells = () => {
    return questions.map((q) => ({
      cell: q.answer_cell,
      formula: q.tipe_soal === "formula" ? q.expected_value : undefined,
      value: q.tipe_soal === "input" ? q.expected_value : undefined,
    }));
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
    <div className="min-h-screen py-6 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard"
              className="text-excel-green hover:underline text-sm mb-2 block"
            >
              &larr; Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Asesmen {level.nama_level}
            </h1>
          </div>

          {started && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Sisa Waktu</p>
              <p
                className={`text-3xl font-bold ${
                  timeLeft < 300 ? "text-red-600" : "text-excel-green"
                }`}
              >
                {formatTime(timeLeft)}
              </p>
            </div>
          )}
        </div>

        {/* Not Started State */}
        {!started && (
          <div className="card max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-excel-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-excel-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
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
                <li>Spreadsheet interaktif akan muncul</li>
                <li>Sel berwarna hijau adalah sel yang perlu Anda isi</li>
                <li>Ketik rumus Excel (contoh: =SUM(B2:B5)) atau angka</li>
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
            {/* Spreadsheet */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Spreadsheet</h2>
                <span className="text-sm text-gray-500">
                  Sel hijau = sel yang perlu diisi
                </span>
              </div>
              <Spreadsheet
                initialData={getSpreadsheetData()}
                answerCells={getAnswerCells()}
                onCellsChange={handleCellsChange}
                colWidths={level.initial_data?.colWidths}
              />
            </div>

            {/* Questions */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Soal</h2>
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`flex items-start p-4 rounded-lg border-l-4 cursor-pointer transition-colors ${
                      currentQuestion === idx
                        ? "border-excel-green bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentQuestion(idx)}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0 ${
                        cellValues[q.answer_cell] ? "bg-green-500" : "bg-gray-400"
                      }`}
                    >
                      {q.nomor_soal}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium">{q.judul_soal}</h3>
                      <p className="text-sm text-gray-600 mt-1">{q.instruksi}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge-blue text-xs">Sel: {q.answer_cell}</span>
                        <span className="badge bg-gray-100 text-gray-700 text-xs">
                          {q.tipe_soal === "formula" ? "Rumus" : "Input"}
                        </span>
                        <span className="badge bg-gray-100 text-gray-700 text-xs">
                          {q.poin} poin
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="card">
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

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    {Object.values(cellValues).filter((v) => v && v !== "").length}
                  </span>{" "}
                  sel terisi dari{" "}
                  <span className="font-medium">{questions.length}</span> soal
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Mengirim...
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
