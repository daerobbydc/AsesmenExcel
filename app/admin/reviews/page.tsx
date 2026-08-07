"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface AssessmentWithUser {
  id: number;
  user_id: string;
  level_id: number;
  status: string;
  skor: number;
  mulai_pada: string;
  selesai_pada: string;
  nama_level: string;
  nama_user: string;
  email_user: string;
}

export default function ReviewsPage() {
  const [assessments, setAssessments] = useState<AssessmentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchAssessments();
  }, [filter]);

  const fetchAssessments = async () => {
    let query = supabase
      .from("assessments")
      .select(`
        id,
        user_id,
        level_id,
        status,
        skor,
        mulai_pada,
        selesai_pada,
        levels (nama_level),
        profiles!user_id (nama_lengkap, email)
      `)
      .order("mulai_pada", { ascending: false });

    if (filter === "completed") {
      query = query.eq("status", "completed");
    } else if (filter === "active") {
      query = query.eq("status", "active");
    }

    const { data } = await query;

    if (data) {
      const formatted = data.map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        level_id: a.level_id,
        status: a.status,
        skor: a.skor,
        mulai_pada: a.mulai_pada,
        selesai_pada: a.selesai_pada,
        nama_level: a.levels?.nama_level || "Unknown",
        nama_user: a.profiles?.nama_lengkap || "Unknown",
        email_user: a.profiles?.email || "Unknown",
      }));
      setAssessments(formatted);
    }
    setLoading(false);
  };

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

  const getScoreColor = (skor: number) => {
    if (skor >= 80) return "text-green-600";
    if (skor >= 60) return "text-yellow-600";
    return "text-red-600";
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
          <Link href="/admin" className="text-excel-green hover:underline text-sm mb-2 block">
            &larr; Kembali ke Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Review Asesmen</h1>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-excel-green text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "completed"
                ? "bg-excel-green text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "active"
                ? "bg-excel-green text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Berlangsung
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Level</th>
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Skor</th>
                <th className="text-left py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Tidak ada data asesmen
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr key={a.id} className="border-b last:border-b-0">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{a.nama_user}</p>
                        <p className="text-sm text-gray-500">{a.email_user}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={a.level_id === 1 ? "badge-green" : "badge-blue"}>
                        {a.nama_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatDate(a.mulai_pada)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(a.status)}</td>
                    <td className="py-3 px-4">
                      {a.status === "completed" ? (
                        <span className={`font-bold ${getScoreColor(a.skor)}`}>
                          {a.skor}%
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {a.status === "completed" && (
                        <Link
                          href={`/assessment/results/${a.id}`}
                          className="text-excel-green hover:underline text-sm font-medium"
                          target="_blank"
                        >
                          Lihat Detail
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
