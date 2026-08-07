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
  mulai_pada: string;
  selesai_pada: string;
  nama_level: string;
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
        .select(`
          id,
          status,
          skor,
          mulai_pada,
          selesai_pada,
          levels (nama_level)
        `)
        .eq("id", assessmentId)
        .single();

      if (assessmentData) {
        setAssessment({
          ...assessmentData,
          nama_level: (assessmentData as any).levels?.nama_level || "Unknown",
        });
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
            poin
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

  const correctCount = answers.filter((a) => a.is_correct).length;
  const totalCount = answers.length;

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

  const getScoreLabel = (skor: number) => {
    if (skor >= 80) return "Sangat Baik";
    if (skor >= 60) return "Baik";
    if (skor >= 40) return "Cukup";
    return "Perlu Perbaikan";
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/dashboard" className="text-excel-green hover:underline text-sm mb-6 block">
          &larr; Kembali ke Dashboard
        </Link>

        {/* Score Card */}
        <div className="card mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hasil Asesmen {assessment.nama_level}
            </h1>
            <p className="text-gray-500 text-sm">
              {formatDate(assessment.mulai_pada)}
            </p>
          </div>

          <div className={`rounded-xl p-8 mt-6 ${getScoreBg(assessment.skor)}`}>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Skor Anda</p>
              <p className={`text-6xl font-bold ${getScoreColor(assessment.skor)}`}>
                {assessment.skor}%
              </p>
              <p className={`text-lg font-semibold mt-2 ${getScoreColor(assessment.skor)}`}>
                {getScoreLabel(assessment.skor)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-excel-green">{correctCount}</p>
              <p className="text-sm text-gray-600">Benar</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{totalCount - correctCount}</p>
              <p className="text-sm text-gray-600">Salah</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
              <p className="text-sm text-gray-600">Total Soal</p>
            </div>
          </div>
        </div>

        {/* Detail Answers */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Detail Jawaban</h2>
          <div className="space-y-4">
            {answers.map((answer) => (
              <div
                key={answer.id}
                className={`p-4 rounded-lg border-l-4 ${
                  answer.is_correct
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 flex-shrink-0 ${
                        answer.is_correct ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {answer.nomor_soal}
                    </span>
                    <div>
                      <h3 className="font-medium">{answer.judul_soal}</h3>
                      <p className="text-sm text-gray-600 mt-1">{answer.instruksi}</p>
                      <div className="mt-2 text-sm">
                        <p>
                          <span className="font-medium">Jawaban Anda:</span>{" "}
                          <span className={answer.is_correct ? "text-green-700" : "text-red-700"}>
                            {answer.jawaban_user || "-"}
                          </span>
                        </p>
                        {!answer.is_correct && answer.expected_value && (
                          <p>
                            <span className="font-medium">Jawaban Benar:</span>{" "}
                            <span className="text-green-700">{answer.expected_value}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`badge ${answer.is_correct ? "badge-green" : "badge-red"}`}
                    >
                      {answer.is_correct ? "+1" : "0"} poin
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Link href="/dashboard" className="btn-secondary flex-1 text-center">
            Kembali ke Dashboard
          </Link>
          <Link
            href={`/assessment/${assessment.nama_level.toLowerCase() === "basic" ? 1 : 2}`}
            className="btn-primary flex-1 text-center"
          >
            Ulangi Asesmen
          </Link>
        </div>
      </div>
    </div>
  );
}
