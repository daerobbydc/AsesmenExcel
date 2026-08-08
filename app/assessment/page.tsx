"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatTime } from "@/lib/utils";
import Spreadsheet from "@/components/Spreadsheet";

interface Question {
  id: number;
  level_type: string;
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
}

const BASIC_DATA = [
  ["Nama", "Harga", "Qty", "Total"],
  ["Apel", 15000, 10, null],
  ["Jeruk", 12000, 8, null],
  ["Mangga", 25000, 5, null],
  ["Pisang", 8000, 15, null],
  ["Anggur", 30000, 3, null],
  [null, null, null, null],
  ["Total:", null, null, null],
  ["Rata-rata Harga:", null, null, null],
  ["Jumlah Item:", null, null, null],
  ["Harga Termurah:", null, null, null],
  ["Harga Termahal:", null, null, null],
];

const INTERMEDIATE_DATA = [
  ["Item", "Kategori", "Harga", "Qty", "Total", "", "Ref_Nama", "Ref_Harga"],
  ["Laptop", "Elektronik", 8500000, 2, null, "", "Laptop", 8500000],
  ["Mouse", "Elektronik", 150000, 10, null, "", "Mouse", 150000],
  ["Meja", "Furniture", 500000, 3, null, "", "Meja", 500000],
  ["Kursi", "Furniture", 350000, 5, null, "", "Kursi", 350000],
  ["Keyboard", "Elektronik", 250000, 4, null, "", "Keyboard", 250000],
  ["Lemari", "Furniture", 1200000, 1, null, "", "Lemari", 1200000],
  ["Headphone", "Elektronik", 450000, 3, null, "", "Headphone", 450000],
  [null, null, null, null, null, null, null, null],
  ["Total Elektronik:", null, null, null, null, null, null, null],
  ["Total Furniture:", null, null, null, null, null, null, null],
  ["Jumlah Semua Item:", null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["", null, null, null, null, null, "Laptop", "Mouse", "Meja", "Kursi", "Keyboard"],
  ["", null, null, null, null, null, 8500000, 150000, 500000, 350000, 250000],
  [null, null, null, null, null, null, null, null, null, null, null],
  ["VLOOKUP (harga Mouse):", null, null, null, null, null, null, null],
  ["HLOOKUP (harga Meja):", null, null, null, null, null, null, null],
  ["INDEX/MATCH (harga Keyboard):", null, null, null, null, null, null, null],
];

export default function AssessmentPage() {
  const router = useRouter();
  const supabase = createClient();

  const [level, setLevel] = useState<Level | null>(null);
  const [basicQuestions, setBasicQuestions] = useState<Question[]>([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState<Question[]>([]);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<"basic" | "intermediate">("basic");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [cellValues, setCellValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [answerInput, setAnswerInput] = useState("");

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [questionTimeSpent, setQuestionTimeSpent] = useState<Record<number, number>>({});
  const questionStartTimeRef = useRef<number>(Date.now());
  const currentQuestionIdxRef = useRef(currentQuestionIdx);
  const cellValuesRef = useRef(cellValues);
  const answerInputRef = useRef(answerInput);
  const currentQuestionRef = useRef<Question | null>(null);
  const questionTimeSpentRef = useRef(questionTimeSpent);
  const submittingRef = useRef(submitting);

  useEffect(() => { cellValuesRef.current = cellValues; }, [cellValues]);
  useEffect(() => { answerInputRef.current = answerInput; }, [answerInput]);
  useEffect(() => { questionTimeSpentRef.current = questionTimeSpent; }, [questionTimeSpent]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { currentQuestionIdxRef.current = currentQuestionIdx; }, [currentQuestionIdx]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: levelData } = await supabase
        .from("levels")
        .select("*")
        .eq("id", 1)
        .single();

      const { data: questionsData } = await supabase
        .from("questions")
        .select("*")
        .eq("level_id", 1)
        .order("nomor_soal");

      if (levelData) setLevel(levelData);
      if (questionsData) {
        setBasicQuestions(questionsData.filter((q: Question) => q.level_type === "basic"));
        setIntermediateQuestions(questionsData.filter((q: Question) => q.level_type === "intermediate"));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          if (submittingRef.current || !assessmentId) return 0;

          const q = currentQuestionRef.current;
          const cv = { ...cellValuesRef.current };
          const ts = { ...questionTimeSpentRef.current };

          if (q) {
            cv[q.answer_cell] = answerInputRef.current;
            const elapsed = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
            ts[q.id] = (ts[q.id] || 0) + elapsed;
          }

          fetch("/api/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assessmentId,
              cellValues: cv,
              currentPhase,
              tabSwitchCount,
              questionTimeSpent: ts,
            }),
          }).then(() => {
            router.push(`/assessment/results/${assessmentId}`);
          }).catch(() => {
            router.push(`/assessment/results/${assessmentId}`);
          });

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft]);

  useEffect(() => {
    if (!started) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) {
        setShowFullscreenWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [started]);

  useEffect(() => {
    if (!started || !currentQuestion) return;

    const now = Date.now();
    const elapsed = Math.floor((now - questionStartTimeRef.current) / 1000);

    if (currentQuestionIdxRef.current !== currentQuestionIdx) {
      setQuestionTimeSpent((prev) => {
        const qId = getCurrentQuestions()[currentQuestionIdxRef.current]?.id;
        if (qId) {
          return { ...prev, [qId]: (prev[qId] || 0) + elapsed };
        }
        return prev;
      });
    }

    questionStartTimeRef.current = now;
  }, [currentQuestionIdx, started]);

  const getCurrentQuestions = () =>
    currentPhase === "basic" ? basicQuestions : intermediateQuestions;

  const currentQuestion = getCurrentQuestions()[currentQuestionIdx];

  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);

  useEffect(() => {
    if (currentQuestion) {
      setAnswerInput(cellValues[currentQuestion.answer_cell] || "");
    }
  }, [currentQuestionIdx, currentPhase, currentQuestion]);

  const requestFullscreen = async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenWarning(false);
    } catch (e) {
      setShowFullscreenWarning(true);
    }
  };

  const handleStart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const durasiMs = (level?.durasi_menit || 45) * 60 * 1000;
    const now = Date.now();

    const { data: existingActive } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("mulai_pada", { ascending: false })
      .limit(1)
      .maybeSingle();

    let assessment;

    if (existingActive) {
      const startTime = new Date(existingActive.mulai_pada).getTime();
      if (now - startTime > durasiMs + 5 * 60 * 1000) {
        await supabase
          .from("assessments")
          .update({ status: "expired" })
          .eq("id", existingActive.id);

        const { data: newAssessment, error } = await supabase
          .from("assessments")
          .insert({ user_id: user.id, level_id: 1, status: "active" })
          .select()
          .single();

        if (error) { setError("Gagal memulai asesmen"); return; }
        assessment = newAssessment;
      } else {
        assessment = existingActive;
      }
    } else {
      const { data: newAssessment, error } = await supabase
        .from("assessments")
        .insert({ user_id: user.id, level_id: 1, status: "active" })
        .select()
        .single();

      if (error) { setError("Gagal memulai asesmen"); return; }
      assessment = newAssessment;
    }

    setAssessmentId(assessment.id);

    const elapsed = now - new Date(assessment.mulai_pada).getTime();
    const remaining = Math.max(0, Math.floor((durasiMs - elapsed) / 1000));
    setTimeLeft(remaining);

    setStarted(true);
    setCurrentQuestionIdx(0);
    setTabSwitchCount(0);
    setQuestionTimeSpent({});
    questionStartTimeRef.current = Date.now();

    const initial: Record<string, string> = {};
    [...BASIC_DATA, ...INTERMEDIATE_DATA].forEach((row: any[], rowIdx: number) => {
      row.forEach((cell: any, colIdx: number) => {
        if (cell !== null && cell !== undefined && String(cell) !== "") {
          initial[String.fromCharCode(65 + colIdx) + (rowIdx + 1)] = String(cell);
        }
      });
    });
    setCellValues(initial);

    requestFullscreen();
  };

  const handleNextQuestion = () => {
    if (!currentQuestion) return;

    const newCellValues = { ...cellValues };
    newCellValues[currentQuestion.answer_cell] = answerInput;
    setCellValues(newCellValues);

    const questions = getCurrentQuestions();
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      handleSubmit(newCellValues);
    }
  };

  const handlePrevQuestion = () => {
    if (currentPhase === "intermediate" && currentQuestionIdx === 0) {
      setCurrentPhase("basic");
      setCurrentQuestionIdx(basicQuestions.length - 1);
      setAnswerInput("");
      questionStartTimeRef.current = Date.now();
      return;
    }
    if (currentQuestionIdx > 0) {
      if (currentQuestion) {
        const newCellValues = { ...cellValues };
        newCellValues[currentQuestion.answer_cell] = answerInput;
        setCellValues(newCellValues);
      }
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmit = async (prebuiltCellValues?: Record<string, string>) => {
    if (!assessmentId) { setError("Asesmen belum dimulai"); return; }
    if (submitting) return;

    const finalCellValues = prebuiltCellValues || { ...cellValues };
    if (!prebuiltCellValues && currentQuestion) {
      finalCellValues[currentQuestion.answer_cell] = answerInput;
    }

    const finalTimeSpent = { ...questionTimeSpent };
    if (currentQuestion) {
      const qId = currentQuestion.id;
      const now = Date.now();
      const elapsed = Math.floor((now - questionStartTimeRef.current) / 1000);
      finalTimeSpent[qId] = (questionTimeSpent[qId] || 0) + elapsed;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          cellValues: finalCellValues,
          currentPhase,
          tabSwitchCount,
          questionTimeSpent: finalTimeSpent,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal mengirim jawaban");

      if (currentPhase === "basic") {
        setSuccess("Soal Basic selesai! Melanjutkan ke Soal Intermediate...");
        setTimeout(() => {
          setCurrentPhase("intermediate");
          setCurrentQuestionIdx(0);
          setSuccess("");
          setAnswerInput("");
          questionStartTimeRef.current = Date.now();
        }, 2000);
        setSubmitting(false);
        return;
      }

      setSuccess(`Skor Anda: ${result.skor}% - Mengarahkan ke halaman hasil...`);
      setTimeout(() => { router.push(`/assessment/results/${assessmentId}`); }, 2000);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
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

  const getSpreadsheetData = () =>
    currentPhase === "basic" ? BASIC_DATA : INTERMEDIATE_DATA;

  const getAnswerCells = () => {
    const questions = getCurrentQuestions();
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
          <Link href="/dashboard" className="btn-primary">Kembali ke Dashboard</Link>
        </div>
      </div>
    );
  }

  const totalQuestions = basicQuestions.length + intermediateQuestions.length;
  const basicAnswered = basicQuestions.filter((q) => cellValues[q.answer_cell]).length;
  const intermediateAnswered = intermediateQuestions.filter((q) => cellValues[q.answer_cell]).length;
  const answeredCount = basicAnswered + intermediateAnswered;
  const globalQuestionIdx = currentPhase === "basic"
    ? currentQuestionIdx
    : basicQuestions.length + currentQuestionIdx;

  return (
    <div className="min-h-screen py-6 pt-24">
      {showFullscreenWarning && started && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fullscreen Diperlukan</h3>
            <p className="text-gray-600 mb-2">Anda keluar dari mode fullscreen.</p>
            <p className="text-sm text-red-600 mb-4">
              Tab switch terdeteksi: <strong>{tabSwitchCount} kali</strong>
            </p>
            <button onClick={requestFullscreen} className="btn-primary w-full py-3">
              Kembali ke Fullscreen
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-excel-green hover:underline text-sm mb-2 block">
              &larr; Kembali ke Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Placement Test</h1>
          </div>
          {started && (
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">Sisa Waktu</p>
              <p className={`text-xl sm:text-3xl font-bold ${timeLeft < 300 ? "text-red-600" : "text-excel-green"}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          )}
        </div>

        {started && (
          <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm">
            <span className={`flex items-center gap-1 ${tabSwitchCount > 0 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Tab switch: {tabSwitchCount}
            </span>
            <span className={`flex items-center gap-1 ${!isFullscreen ? "text-red-600 font-semibold" : "text-gray-500"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {isFullscreen ? "Fullscreen aktif" : "Fullscreen off"}
            </span>
          </div>
        )}

        {!started && (
          <div className="card max-w-2xl mx-auto">
            <div className="text-center mb-8">
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
                <li>Soal ditampilkan satu per satu</li>
                <li>Ketik rumus Excel di kolom jawaban</li>
                <li>Gunakan spreadsheet sebagai referensi data</li>
                <li>Klik &quot;Selanjutnya&quot; untuk lanjut ke soal berikutnya</li>
              </ol>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Peringatan Anti-Cheating:</h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                <li>Tes berjalan dalam mode <strong>fullscreen</strong></li>
                <li>Pindah tab akan <strong>dicatat otomatis</strong></li>
                <li>Waktu per soal <strong>ditrack</strong></li>
                <li>Semua aktivitas dicatat di sistem</li>
              </ul>
            </div>
            <button onClick={handleStart} className="btn-primary w-full text-lg py-3">
              Mulai Placement Test
            </button>
          </div>
        )}

        {started && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">
                  {currentPhase === "basic" ? "Soal Basic" : "Soal Intermediate"}
                </h2>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentPhase === "basic" ? "bg-excel-green text-white" : "bg-gray-200 text-gray-600"}`}>
                    Basic ({basicQuestions.length} soal)
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentPhase === "intermediate" ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                    Intermediate ({intermediateQuestions.length} soal)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-excel-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((globalQuestionIdx + 1) / totalQuestions) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Soal {globalQuestionIdx + 1} dari {totalQuestions} | {answeredCount} terisi
              </p>
            </div>

            {currentQuestion && (
              <div className="card border-l-4 border-excel-green">
                <div className="flex items-start gap-4">
                  <span className="w-10 h-10 rounded-full bg-excel-green text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
                    {currentQuestion.nomor_soal}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{currentQuestion.judul_soal}</h3>
                    <p className="text-gray-600 mt-1">{currentQuestion.instruksi}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge-blue text-xs">Sel: {currentQuestion.answer_cell}</span>
                      <span className="badge bg-gray-100 text-gray-700 text-xs">
                        {currentQuestion.tipe_soal === "formula" ? "Rumus" : "Input"}
                      </span>
                      {questionTimeSpent[currentQuestion.id] !== undefined && (
                        <span className="badge bg-blue-50 text-blue-700 text-xs">
                          {questionTimeSpent[currentQuestion.id]}d lalu
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <h2 className="text-xl font-bold mb-4">Spreadsheet</h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <Spreadsheet
                  key={currentPhase}
                  initialData={getSpreadsheetData()}
                  answerCells={getAnswerCells()}
                  onCellsChange={handleCellsChange}
                />
              </div>
            </div>

            {currentQuestion && (
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jawaban untuk sel {currentQuestion.answer_cell}:
                </label>
                <input
                  type="text"
                  value={answerInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAnswerInput(val);
                    if (currentQuestion) {
                      setCellValues((prev) => ({ ...prev, [currentQuestion.answer_cell]: val }));
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNextQuestion(); }}
                  placeholder={`Ketik rumus, contoh: ${currentQuestion.tipe_soal === "formula" ? "=SUM(B2:B6)" : "12345"}`}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-mono focus:ring-2 focus:ring-excel-green focus:border-excel-green"
                  autoFocus
                />
              </div>
            )}

            <div className="card">
              {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
              {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>}

              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentPhase === "basic" && currentQuestionIdx === 0}
                  className="px-3 sm:px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Sebelumnya
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-8 py-3 text-sm sm:text-lg"
                >
                  {submitting ? "Mengirim..." : currentQuestionIdx === getCurrentQuestions().length - 1
                    ? (currentPhase === "basic" ? "Selesai Basic & Lanjut" : "Selesai & Kirim Jawaban")
                    : "Selanjutnya"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
