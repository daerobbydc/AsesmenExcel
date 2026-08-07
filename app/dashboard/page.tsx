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

export default function DashboardPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: assessmentsData } = await supabase
        .from("assessments")
        .select("*")
        .order("mulai_pada", { ascending: false });

      if (assessmentsData) {
        setAssessments(assessmentsData);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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
    if (!level) return <span className="badge bg-gray-100 text-gray-700">-</span>;
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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Placement Test untuk menentukan level Excel Anda</p>
        </div>

        {/* Placement Test Card */}
        <div className="card max-w-2xl mx-auto mb-12 border-l-4 border-excel-green">
          <div className="text-center mb-6">
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
            <h2 className="text-2xl font-bold text-excel-green mb-2">Placement Test</h2>
            <p className="text-gray-600 mb-4">
              Tes ini akan menentukan level Excel Anda (Basic atau Intermediate)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-excel-green">20</p>
              <p className="text-sm text-gray-600">Soal Total</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-excel-green">45</p>
              <p className="text-sm text-gray-600">Menit</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">Alur Tes:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Soal Basic (10 soal) - Fungsi dasar Excel</li>
              <li>Soal Intermediate (10 soal) - Fungsi lanjutan</li>
              <li>Skor dihitung per section</li>
              <li>Level ditentukan berdasarkan skor</li>
            </ol>
          </div>

          <Link
            href="/assessment"
            className="btn-primary block text-center text-lg py-3"
          >
            Mulai Placement Test
          </Link>
        </div>

        {/* History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Riwayat Asesmen</h2>

          {assessments.length === 0 ? (
            <div className="card text-center py-8">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-gray-500">Belum ada riwayat asesmen</p>
              <p className="text-sm text-gray-400 mt-2">Mulai placement test untuk melihat hasil di sini</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Skor Basic</th>
                    <th className="text-left py-3 px-4">Skor Intermediate</th>
                    <th className="text-left py-3 px-4">Level Lolos</th>
                    <th className="text-left py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(assessment.mulai_pada)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(assessment.status)}</td>
                      <td className="py-3 px-4 font-semibold">
                        {assessment.status === "completed"
                          ? `${assessment.skor_basic}%`
                          : "-"}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {assessment.status === "completed" && assessment.skor_intermediate !== null
                          ? `${assessment.skor_intermediate}%`
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {assessment.status === "completed"
                          ? getLevelBadge(assessment.qualified_level)
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {assessment.status === "completed" && (
                          <Link
                            href={`/assessment/results/${assessment.id}`}
                            className="text-excel-green hover:underline text-sm font-medium"
                          >
                            Lihat Hasil
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
