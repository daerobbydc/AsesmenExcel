"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface Level {
  id: number;
  nama_level: string;
  deskripsi: string;
  durasi_menit: number;
  jumlah_soal: number;
}

interface Assessment {
  id: number;
  level_id: number;
  status: string;
  skor: number;
  mulai_pada: string;
  selesai_pada: string | null;
  nama_level: string;
}

export default function DashboardPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: levelsData } = await supabase
        .from("levels")
        .select("*")
        .order("id");

      const { data: assessmentsData } = await supabase
        .from("assessments")
        .select(`
          id,
          level_id,
          status,
          skor,
          mulai_pada,
          selesai_pada,
          levels (nama_level)
        `)
        .order("mulai_pada", { ascending: false });

      if (levelsData) setLevels(levelsData);
      if (assessmentsData) {
        const formatted = assessmentsData.map((a: any) => ({
          ...a,
          nama_level: a.levels?.nama_level || "Unknown",
        }));
        setAssessments(formatted);
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
          <p className="text-gray-600 mt-1">Pilih level asesmen untuk memulai</p>
        </div>

        {/* Level Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {levels.map((level) => (
            <div
              key={level.id}
              className="card hover:shadow-lg transition-shadow border-l-4 border-excel-green"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-excel-green">
                    {level.nama_level}
                  </h2>
                  <p className="text-gray-600 mt-1">{level.deskripsi}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {level.jumlah_soal} Soal
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {level.durasi_menit} Menit
                </span>
              </div>

              <Link
                href={`/assessment/${level.id}`}
                className="btn-primary block text-center"
              >
                Mulai Asesmen
              </Link>
            </div>
          ))}
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
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Level</th>
                    <th className="text-left py-3 px-4">Tanggal</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Skor</th>
                    <th className="text-left py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium">{assessment.nama_level}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(assessment.mulai_pada)}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(assessment.status)}</td>
                      <td className="py-3 px-4 font-semibold">
                        {assessment.status === "completed"
                          ? `${assessment.skor}%`
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
