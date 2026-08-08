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
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
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
    if (skor >= 80) return "text-emerald-600";
    if (skor >= 60) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBg = (skor: number) => {
    if (skor >= 80) return "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/60";
    if (skor >= 60) return "bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/60";
    return "bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/60";
  };

  const isIntermediate = assessment.qualified_level === "Intermediate";

  return (
    <div className="min-h-screen py-8 pt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="text-excel-green hover:text-excel-darkgreen text-sm mb-6 block font-medium transition-colors">
          &larr; Kembali ke Dashboard
        </Link>

        {/* Qualified Level Card */}
        <div className="card-static mb-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${isIntermediate ? "bg-gradient-to-r from-primary-500 to-primary-400" : "bg-gradient-to-r from-excel-green to-excel-light"}`}></div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Hasil Placement Test</h1>
            <p className="text-gray-400 text-sm">{formatDate(assessment.mulai_pada)}</p>
          </div>

          <div className={`rounded-2xl p-8 mt-6 ${
            isIntermediate 
              ? "bg-gradient-to-br from-primary-500/10 to-primary-400/5 border border-primary-200/40" 
              : "bg-gradient-to-br from-excel-green/10 to-excel-light/5 border border-excel-green/20"
          }`}>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Level Anda</p>
              <p className={`text-6xl font-bold tracking-tight ${
                isIntermediate ? "text-primary-600" : "text-excel-green"
              }`}>
                {assessment.qualified_level || "Basic"}
              </p>
              <p className={`text-lg font-semibold mt-3 ${
                isIntermediate ? "text-primary-700" : "text-excel-darkgreen"
              }`}>
                {isIntermediate
                  ? "Selamat! Anda lolos level Intermediate"
                  : "Anda masuk level Basic"}
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-static relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-excel-green to-excel-light"></div>
            <h3 className="text-lg font-bold mb-4 text-excel-green flex items-center gap-2">
              <div className="w-8 h-8 bg-excel-green/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Soal Basic
            </h3>
            <div className={`rounded-2xl p-6 ${getScoreBg(assessment.skor_basic)}`}>
              <div className="text-center">
                <p className={`text-5xl font-bold ${getScoreColor(assessment.skor_basic)}`}>
                  {assessment.skor_basic}%
                </p>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {basicCorrect}/{basicAnswers.length} soal benar
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Topik: Fungsi dasar (SUM, AVERAGE, COUNT, MIN, MAX)</p>
              <p className={`mt-2 font-semibold flex items-center gap-1.5 ${
                assessment.skor_basic >= 60 ? "text-excel-green" : "text-red-500"
              }`}>
                {assessment.skor_basic >= 60 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                )}
                {assessment.skor_basic >= 60 ? "Lolos" : "Tidak Lolos"} (Batas: 60%)
              </p>
            </div>
          </div>

          <div className="card-static relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-primary-400"></div>
            <h3 className="text-lg font-bold mb-4 text-primary-600 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Soal Intermediate
            </h3>
            <div className={`rounded-2xl p-6 ${getScoreBg(assessment.skor_intermediate)}`}>
              <div className="text-center">
                <p className={`text-5xl font-bold ${getScoreColor(assessment.skor_intermediate)}`}>
                  {assessment.skor_intermediate}%
                </p>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {intermediateCorrect}/{intermediateAnswers.length} soal benar
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Topik: SUMIF, COUNTIF, VLOOKUP, INDEX-MATCH</p>
              <p className={`mt-2 font-semibold flex items-center gap-1.5 ${
                assessment.skor_intermediate >= 60 ? "text-excel-green" : "text-red-500"
              }`}>
                {assessment.skor_intermediate >= 60 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                )}
                {assessment.skor_intermediate >= 60 ? "Lolos" : "Tidak Lolos"} (Batas: 60%)
              </p>
            </div>
          </div>
        </div>

        {/* Level Determination */}
        <div className="card-static mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Penentuan Level
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Skor Basic &ge; 60%</span>
              <span className={`font-bold flex items-center gap-1.5 ${
                assessment.skor_basic >= 60 ? "text-excel-green" : "text-red-500"
              }`}>
                {assessment.skor_basic >= 60 ? "Ya" : "Tidak"}
                {assessment.skor_basic >= 60 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600">Skor Intermediate &ge; 60%</span>
              <span className={`font-bold flex items-center gap-1.5 ${
                assessment.skor_intermediate >= 60 ? "text-excel-green" : "text-red-500"
              }`}>
                {assessment.skor_intermediate >= 60 ? "Ya" : "Tidak"}
                {assessment.skor_intermediate >= 60 ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                )}
              </span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isIntermediate 
                ? "bg-primary-500/5 border-primary-200/60" 
                : "bg-excel-green/5 border-excel-green/20"
            }`}>
              <span className="font-bold text-gray-900">Level Yang Ditentukan</span>
              <span className={`text-lg font-bold ${
                isIntermediate ? "text-primary-600" : "text-excel-green"
              }`}>
                {assessment.qualified_level}
              </span>
            </div>
          </div>
        </div>

        {/* Anti-Cheating Info */}
        <div className="card-static mb-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Informasi Integritas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Pindah Tab</p>
              <p className={`text-3xl font-bold ${
                (assessment.tab_switch_count || 0) > 3 ? "text-red-500" : "text-excel-green"
              }`}>
                {assessment.tab_switch_count || 0}x
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Rata-rata Waktu/Soal</p>
              <p className="text-3xl font-bold text-primary-600">
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200/60 rounded-xl">
              <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Catatan: Terdeteksi {assessment.tab_switch_count} kali pindah tab selama ujian.
              </p>
            </div>
          )}
        </div>

        {/* Detail Answers */}
        <div className="card-static mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Detail Jawaban
          </h2>

          {basicAnswers.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-excel-green mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-excel-green/10 rounded-md flex items-center justify-center text-xs font-bold">B</span>
                Soal Basic
              </h3>
              <div className="space-y-2">
                {basicAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`p-4 rounded-xl border-l-4 transition-colors ${
                      answer.is_correct
                        ? "border-l-excel-green bg-excel-green/5"
                        : "border-l-red-400 bg-red-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start flex-1">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 ${
                            answer.is_correct ? "bg-excel-green" : "bg-red-400"
                          }`}
                        >
                          {answer.nomor_soal}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{answer.judul_soal}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Jawaban: <span className={answer.is_correct ? "text-excel-green font-semibold" : "text-red-500 font-semibold"}>{answer.jawaban_user || "-"}</span>
                            {!answer.is_correct && answer.expected_value && (
                              <span className="text-excel-green ml-2">(Benar: {answer.expected_value})</span>
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
          )}

          {intermediateAnswers.length > 0 && (
            <div>
              <h3 className="font-bold text-primary-600 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-500/10 rounded-md flex items-center justify-center text-xs font-bold text-primary-600">I</span>
                Soal Intermediate
              </h3>
              <div className="space-y-2">
                {intermediateAnswers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`p-4 rounded-xl border-l-4 transition-colors ${
                      answer.is_correct
                        ? "border-l-excel-green bg-excel-green/5"
                        : "border-l-red-400 bg-red-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start flex-1">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 ${
                            answer.is_correct ? "bg-excel-green" : "bg-red-400"
                          }`}
                        >
                          {answer.nomor_soal}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">{answer.judul_soal}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Jawaban: <span className={answer.is_correct ? "text-excel-green font-semibold" : "text-red-500 font-semibold"}>{answer.jawaban_user || "-"}</span>
                            {!answer.is_correct && answer.expected_value && (
                              <span className="text-excel-green ml-2">(Benar: {answer.expected_value})</span>
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
          )}
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
