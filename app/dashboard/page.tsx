"use client";

import { useEffect, useState } from "react";
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
  selesai_pada: string | null;
}

interface Level {
  jumlah_soal: number;
  durasi_menit: number;
}

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: levelData } = await supabase
        .from("levels")
        .select("jumlah_soal, durasi_menit")
        .eq("id", 1)
        .single();

      if (levelData) {
        setLevel(levelData);
      }

      const { data: assessmentsData } = await supabase
        .from("assessments")
        .select("*")
        .order("mulai_pada", { ascending: false });

      if (assessmentsData) {
        const now = Date.now();
        const toExpire: number[] = [];
        const toComplete: any[] = [];

        const cleaned = assessmentsData.map((a: any) => {
          if (a.status === "active") {
            const startTime = new Date(a.mulai_pada).getTime();
            const minutesElapsed = (now - startTime) / 60000;

            if (minutesElapsed > (levelData?.durasi_menit || 45) + 5) {
              if (a.skor_basic > 0) {
                toComplete.push(a);
                return {
                  ...a,
                  status: "completed",
                  skor: a.skor_basic,
                  skor_intermediate: 0,
                  qualified_level: "Basic",
                  selesai_pada: new Date().toISOString(),
                };
              } else {
                toExpire.push(a.id);
                return { ...a, status: "expired" };
              }
            }
          }
          return a;
        });

        setAssessments(cleaned);

        if (toExpire.length > 0) {
          await supabase
            .from("assessments")
            .update({ status: "expired" })
            .in("id", toExpire);
        }

        for (const a of toComplete) {
          await supabase
            .from("assessments")
            .update({
              status: "completed",
              skor: a.skor_basic,
              skor_intermediate: 0,
              qualified_level: "Basic",
              selesai_pada: new Date().toISOString(),
            })
            .eq("id", a.id);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const hasCompleted = assessments.some((a) => a.status === "completed");
  const hasActive = assessments.some((a) => a.status === "active");
  const completedAssessment = assessments.find((a) => a.status === "completed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="badge-green">Selesai</span>;
      case "active":
        return <span className="badge-yellow">Berlangsung</span>;
      case "expired":
        return <span className="badge-red">Expired</span>;
      default:
        return <span className="badge-blue">{status}</span>;
    }
  };

  const getLevelBadge = (level: string | null) => {
    if (!level) return <span className="badge bg-gray-100 text-gray-600 border border-gray-200">-</span>;
    if (level === "Intermediate") {
      return <span className="badge-blue">Intermediate</span>;
    }
    return <span className="badge-green">Basic</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-excel-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 pt-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1">Placement Test untuk menentukan level Excel Anda</p>
        </div>

        {/* Placement Test Card */}
        <div className="card-static max-w-2xl mx-auto mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-excel-green to-primary-500"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-excel-green/5 to-transparent rounded-bl-full"></div>
          
          <div className="relative text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-excel-green/10 to-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-excel-green/10">
              <svg className="w-10 h-10 text-excel-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.495V5.25" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Placement Test</h2>
            <p className="text-gray-500">
              Tes ini akan menentukan level Excel Anda (Basic atau Intermediate)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-excel-green/5 to-excel-green/10 rounded-2xl p-5 text-center border border-excel-green/10">
              <p className="text-3xl font-bold text-excel-green">{level?.jumlah_soal || 35}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Soal Total</p>
            </div>
            <div className="bg-gradient-to-br from-primary-500/5 to-primary-500/10 rounded-2xl p-5 text-center border border-primary-500/10">
              <p className="text-3xl font-bold text-primary-600">{level?.durasi_menit || 45}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">Menit</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 mb-8">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Alur Tes
            </h3>
            <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1.5">
              <li>Soal Basic (20 soal, 55 poin) - Fungsi dasar Excel</li>
              <li>Soal Intermediate (15 soal, 45 poin) - Fungsi lanjutan</li>
              <li>Skor dihitung berdasarkan poin per soal</li>
              <li>Level ditentukan berdasarkan skor</li>
            </ol>
          </div>

          {hasCompleted ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
                <p className="text-green-700 font-semibold mb-1">Anda sudah menyelesaikan Placement Test</p>
                <p className="text-green-600 text-sm">Skor: <strong>{completedAssessment?.skor}%</strong> | Level: <strong>{completedAssessment?.qualified_level || "Basic"}</strong></p>
              </div>
              <Link
                href={`/assessment/results/${completedAssessment?.id}`}
                className="btn-primary block text-center text-lg py-3.5"
              >
                Lihat Hasil
              </Link>
            </div>
          ) : hasActive ? (
            <Link
              href="/assessment"
              className="btn-primary block text-center text-lg py-3.5"
            >
              Lanjutkan Asesmen
            </Link>
          ) : (
            <Link
              href="/assessment"
              className="btn-primary block text-center text-lg py-3.5"
            >
              Mulai Placement Test
            </Link>
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Riwayat Asesmen</h2>

          {assessments.length === 0 ? (
            <div className="card-static text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Belum ada riwayat asesmen</p>
              <p className="text-sm text-gray-400 mt-1">Mulai placement test untuk melihat hasil di sini</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block card-static overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor Basic</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor Intermediate</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level Lolos</th>
                      <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-5 text-gray-600 text-sm">{formatDate(assessment.mulai_pada)}</td>
                        <td className="py-4 px-5">{getStatusBadge(assessment.status)}</td>
                        <td className="py-4 px-5 font-semibold text-sm">{assessment.status === "completed" ? `${assessment.skor_basic}%` : "-"}</td>
                        <td className="py-4 px-5 font-semibold text-sm">{assessment.status === "completed" && assessment.skor_intermediate !== null ? `${assessment.skor_intermediate}%` : "-"}</td>
                        <td className="py-4 px-5">{assessment.status === "completed" ? getLevelBadge(assessment.qualified_level) : "-"}</td>
                        <td className="py-4 px-5">
                          {assessment.status === "completed" ? (
                            <Link href={`/assessment/results/${assessment.id}`} className="text-excel-green hover:text-excel-darkgreen hover:underline text-sm font-semibold transition-colors">Lihat Hasil</Link>
                          ) : assessment.status === "active" ? (
                            <Link href="/assessment" className="text-primary-600 hover:text-primary-700 hover:underline text-sm font-semibold transition-colors">Lanjutkan</Link>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-3">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="card-static">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">{formatDate(assessment.mulai_pada)}</span>
                      {getStatusBadge(assessment.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Basic</p>
                        <p className="font-bold text-gray-900">{assessment.status === "completed" ? `${assessment.skor_basic}%` : "-"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Intermediate</p>
                        <p className="font-bold text-gray-900">{assessment.status === "completed" && assessment.skor_intermediate !== null ? `${assessment.skor_intermediate}%` : "-"}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      {assessment.status === "completed" ? getLevelBadge(assessment.qualified_level) : assessment.status === "active" ? <span className="badge-yellow">Perlu Diselesaikan</span> : <span />}
                      {assessment.status === "completed" ? (
                        <Link href={`/assessment/results/${assessment.id}`} className="text-excel-green hover:text-excel-darkgreen hover:underline text-sm font-semibold transition-colors">Lihat Hasil</Link>
                      ) : assessment.status === "active" ? (
                        <Link href="/assessment" className="text-primary-600 hover:text-primary-700 hover:underline text-sm font-semibold transition-colors">Lanjutkan</Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
