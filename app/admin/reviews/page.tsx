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
  skor_basic: number;
  skor_intermediate: number;
  qualified_level: string | null;
  mulai_pada: string;
  selesai_pada: string;
  tab_switch_count: number;
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
      .select("*")
      .order("mulai_pada", { ascending: false });

    if (filter === "completed") {
      query = query.eq("status", "completed");
    } else if (filter === "active") {
      query = query.eq("status", "active");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Fetch assessments error:", error);
    }

    if (data && data.length > 0) {
      const userIds = Array.from(new Set(data.map((a: any) => a.user_id).filter(Boolean)));
      
      let profilesMap: Record<string, { nama_lengkap: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, nama_lengkap, email")
          .in("id", userIds);
        
        if (profilesError) {
          console.error("Fetch profiles error:", profilesError);
        }
        
        if (profilesData) {
          profilesData.forEach((p: any) => {
            profilesMap[p.id] = { nama_lengkap: p.nama_lengkap, email: p.email };
          });
        }
      }

      const formatted = data.map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        level_id: a.level_id,
        status: a.status,
        skor: a.skor,
        skor_basic: a.skor_basic,
        skor_intermediate: a.skor_intermediate,
        qualified_level: a.qualified_level,
        mulai_pada: a.mulai_pada,
        selesai_pada: a.selesai_pada,
        tab_switch_count: a.tab_switch_count,
        nama_user: profilesMap[a.user_id]?.nama_lengkap || "Unknown",
        email_user: profilesMap[a.user_id]?.email || "Unknown",
      }));
      setAssessments(formatted);
    } else {
      setAssessments([]);
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
    <div className="min-h-screen py-8 pt-24">
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
                <th className="text-left py-3 px-4">Tanggal</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Skor Basic</th>
                <th className="text-left py-3 px-4">Skor Inter</th>
                <th className="text-left py-3 px-4">Level</th>
                <th className="text-left py-3 px-4">Tab Switch</th>
                <th className="text-left py-3 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Tidak ada data asesmen
                  </td>
                </tr>
              ) : (
                assessments.map((a) => (
                  <tr key={a.id} className="border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{a.nama_user}</p>
                        <p className="text-xs text-gray-500">{a.email_user}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {formatDate(a.mulai_pada)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(a.status)}</td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      {a.status === "completed" ? `${a.skor_basic || 0}%` : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      {a.status === "completed" && a.skor_intermediate != null ? `${a.skor_intermediate}%` : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {a.status === "completed" ? (
                        <span className={`badge text-xs ${
                          a.qualified_level === "Intermediate" ? "badge-blue" : "badge-green"
                        }`}>
                          {a.qualified_level || "Basic"}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`font-medium ${
                        (a.tab_switch_count || 0) > 3 ? "text-red-600" : "text-gray-500"
                      }`}>
                        {a.tab_switch_count || 0}x
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {a.status === "completed" && (
                        <Link
                          href={`/assessment/results/${a.id}`}
                          className="text-excel-green hover:underline text-sm font-medium"
                          target="_blank"
                        >
                          Detail
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
