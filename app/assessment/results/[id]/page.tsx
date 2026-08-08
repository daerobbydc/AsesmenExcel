"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Assessment {
  id: number;
  status: string;
  skor: number;
  skor_basic: number;
  skor_intermediate: number;
  qualified_level: string | null;
  mulai_pada: string;
  selesai_pada: string;
  tab_switch_count: number;
  question_time_spent: Record<string, number>;
}

interface Answer {
  id: number;
  nomor_soal: number;
  judul_soal: string;
  instruksi: string;
  tipe_soal: string;
  expected_value: string;
  jawaban_user: string;
  is_correct: boolean;
  poin: number;
  poin_didapat: number;
  level_type: string;
}

export default function ResultsPage() {
  const params = useParams();
  const assessmentId = params.id;
  const router = useRouter();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: assessmentData } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", assessmentId)
        .single();

      if (assessmentData) {
        setAssessment(assessmentData);
      }

      const { data: answersData } = await supabase
        .from("assessment_answers")
        .select(`
          id,
          jawaban_user,
          is_correct,
          poin_didapat,
          questions (
            nomor_soal,
            judul_soal,
            instruksi,
            tipe_soal,
            expected_value,
            poin,
            level_type
          )
        `)
        .eq("assessment_id", assessmentId);

      if (answersData) {
        const formatted = answersData.map((a: any) => ({
          id: a.id,
          nomor_soal: a.questions?.nomor_soal || 0,
          judul_soal: a.questions?.judul_soal || "",
          instruksi: a.questions?.instruksi || "",
          tipe_soal: a.questions?.tipe_soal || "",
          expected_value: a.questions?.expected_value || "",
          jawaban_user: a.jawaban_user || "",
          is_correct: a.is_correct,
          poin: a.questions?.poin || 0,
          poin_didapat: a.poin_didapat || 0,
          level_type: a.questions?.level_type || "basic",
        }));
        setAnswers(formatted.sort((a, b) => a.nomor_soal - b.nomor_soal));
      }

      setLoading(false);
    };

    fetchData();
  }, [assessmentId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-excel-green"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Asesmen tidak ditemukan</h2>
          <Link href="/dashboard" className="btn-primary">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const basicAnswers = answers.filter((a) => a.level_type === "basic");
  const intermediateAnswers = answers.filter((a) => a.level_type === "intermediate");
  const basicCorrect = basicAnswers.filter((a) => a.is_correct).length;
  const intermediateCorrect = intermediateAnswers.filter((a) => a.is_correct).length;

  const getScoreColor = (skor: number) => {
    if (skor >= 80) return "text-green-600";
    if (skor >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (skor: number) => {
    if (skor >= 80) return "bg-green-100";
    if (skor >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="text-excel-green hover:underline text-sm mb-6 block">
          &larr; Kembali ke Dashboard
        </Link>

        {/* Qualified Level Card */}
        <div className="card mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasil Placement Test</h1>
            <p className="text-gray-500 text-sm">{formatDate(assessment.mulai_pada)}</p>
          </div>

          <div className={`rounded-xl p-8 mt-6 ${
            assessment.qualified_level === "Intermediate" ? "bg-blue-100" : "bg-green-100"
          }`}>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Level Anda</p>
              <p className={`text-5xl font-bold ${
                assessment.qualified_level === "Intermediate" ? "text-blue-600" : "text-green-600"
              }`}>
                {assessment.qualified_level || "Basic"}
              </p>
              <p className={`text-lg font-semibold mt-2 ${
                assessment.qualified_level === "Intermediate" ? "text-blue-700" : "text-green-700"
              }`}>
                {assessment.qualified_level === "Intermediate"
                  ? "Selamat! Anda lolos level Intermediate"
                  : "Anda masuk level Basic"}
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Basic Score */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-excel-green">Soal Basic</h3>
            <div className={`rounded-lg p-6 ${getScoreBg(assessment.skor_basic)}`}>
              <div className="text-center">
                <p className={`text-4xl font-bold ${getScoreColor(assessment.skor_basic)}`}>
                  {assessment.skor_basic}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {basicCorrect}/{basicAnswers.length} soal benar
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Topik: Fungsi dasar (SUM, AVERAGE, COUNT, MIN, MAX)</p>
              <p className={`mt-1 font-medium ${
                assessment.skor_basic >= 60 ? "text-green-600" : "text-red-600"
              }`}>
                {assessment.skor_basic >= 60 ? "✓ Lolos" : "✗ Tidak Lolos"} (Batas: 60%)
              </p>
            </div>
          </div>

          {/* Intermediate Score */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-primary-600">Soal Intermediate</h3>
            <div className={`rounded-lg p-6 ${getScoreBg(assessment.skor_intermediate)}`}>
              <div className="text-center">
                <p className={`text-4xl font-bold ${getScoreColor(assessment.skor_intermediate)}`}>
                  {assessment.skor_intermediate}%
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {intermediateCorrect}/{intermediateAnswers.length} soal benar
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Topik: SUMIF, COUNTIF, VLOOKUP, INDEX-MATCH</p>
              <p className={`mt-1 font-medium ${
                assessment.skor_intermediate >= 60 ? "text-green-600" : "text-red-600"
              }`}>
                {assessment.skor_intermediate >= 60 ? "✓ Lolos" : "✗ Tidak Lolos"} (Batas: 60%)
              </p>
            </div>
          </div>
        </div>

        {/* Level Determination */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold mb-4">Penentuan Level</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Skor Basic ≥ 60%</span>
              <span className={`font-medium ${
                assessment.skor_basic >= 60 ? "text-green-600" : "text-red-600"
              }`}>
                {assessment.skor_basic >= 60 ? "✓ Ya" : "✗ Tidak"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Skor Intermediate ≥ 60%</span>
              <span className={`font-medium ${
                assessment.skor_intermediate >= 60 ? "text-green-600" : "text-red-600"
              }`}>
                {assessment.skor_intermediate >= 60 ? "✓ Ya" : "✗ Tidak"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-medium">Level Yang Ditentukan</span>
              <span className={`font-bold ${
                assessment.qualified_level === "Intermediate" ? "text-blue-600" : "text-green-600"
              }`}>
                {assessment.qualified_level}
              </span>
            </div>
          </div>
        </div>

        {/* Anti-Cheating Info */}
        <div className="card mb-8">
          <h3 className="text-lg font-bold mb-4">Informasi Integritas</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Pindah Tab</p>
              <p className={`text-2xl font-bold ${
                (assessment.tab_switch_count || 0) > 3 ? "text-red-600" : "text-green-600"
              }`}>
                {assessment.tab_switch_count || 0}x
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-600">Rata-rata Waktu/Soal</p>
              <p className="text-2xl font-bold text-blue-600">
                {assessment.question_time_spent && Object.keys(assessment.question_time_spent).length > 0
                  ? Math.round(
                      Object.values(assessment.question_time_spent).reduce((a: number, b: number) => a + b, 0) /
                      Object.values(assessment.question_time_spent).length
                    )
                  : 0}s
              </p>
            </div>
          </div>
          {(assessment.tab_switch_count || 0) > 5 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                ⚠️ Catatan: Terdeteksi {assessment.tab_switch_count} kali pindah tab selama ujian.
              </p>
            </div>
          )}
        </div>

        {/* Detail Answers */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Detail Jawaban</h2>

          {/* Basic Section */}
          <div className="mb-6">
            <h3 className="font-bold text-excel-green mb-3">Soal Basic</h3>
            <div className="space-y-3">
              {basicAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    answer.is_correct
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 ${
                          answer.is_correct ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {answer.nomor_soal}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{answer.judul_soal}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Jawaban: <span className={answer.is_correct ? "text-green-700" : "text-red-700"}>{answer.jawaban_user || "-"}</span>
                          {!answer.is_correct && answer.expected_value && (
                            <span className="text-green-700 ml-2">(Benar: {answer.expected_value})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`badge text-xs ${answer.is_correct ? "badge-green" : "badge-red"}`}>
                      {answer.is_correct ? "+1" : "0"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intermediate Section */}
          <div>
            <h3 className="font-bold text-primary-600 mb-3">Soal Intermediate</h3>
            <div className="space-y-3">
              {intermediateAnswers.map((answer) => (
                <div
                  key={answer.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    answer.is_correct
                      ? "border-green-500 bg-green-50"
                      : "border-red-500 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 ${
                          answer.is_correct ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {answer.nomor_soal}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{answer.judul_soal}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Jawaban: <span className={answer.is_correct ? "text-green-700" : "text-red-700"}>{answer.jawaban_user || "-"}</span>
                          {!answer.is_correct && answer.expected_value && (
                            <span className="text-green-700 ml-2">(Benar: {answer.expected_value})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className={`badge text-xs ${answer.is_correct ? "badge-green" : "badge-red"}`}>
                      {answer.is_correct ? "+1" : "0"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="btn-secondary flex-1 text-center">
            Kembali ke Dashboard
          </Link>
          <Link href="/assessment" className="btn-primary flex-1 text-center">
            Ulangi Asesmen
          </Link>
        </div>
      </div>
    </div>
  );
}
