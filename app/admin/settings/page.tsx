"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Level {
  id: number;
  nama_level: string;
  deskripsi: string;
  durasi_menit: number;
  jumlah_soal: number;
}

export default function AdminSettingsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    const { data } = await supabase
      .from("levels")
      .select("*")
      .order("id");

    if (data) setLevels(data);
    setLoading(false);
  };

  const handleUpdate = async (level: Level) => {
    setSaving(level.id);
    setSuccess("");
    setError("");

    const { error: updateError } = await supabase
      .from("levels")
      .update({
        nama_level: level.nama_level,
        deskripsi: level.deskripsi,
        durasi_menit: level.durasi_menit,
        jumlah_soal: level.jumlah_soal,
      })
      .eq("id", level.id);

    if (updateError) {
      setError("Gagal menyimpan: " + updateError.message);
    } else {
      setSuccess("Pengaturan berhasil disimpan!");
      fetchLevels();
    }
    setSaving(null);
    setTimeout(() => setSuccess(""), 3000);
  };

  const updateLevel = (id: number, field: keyof Level, value: any) => {
    setLevels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
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
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/admin" className="text-excel-green hover:text-excel-darkgreen text-sm mb-6 block font-medium transition-colors">
          &larr; Kembali ke Admin
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Asesmen</h1>
          <p className="text-gray-500 mt-1">Konfigurasi durasi, jumlah soal, dan poin per soal</p>
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 text-sm border border-emerald-200 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-200 flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        {/* Level Settings */}
        <div className="space-y-6">
          {levels.map((level) => (
            <div key={level.id} className="card-static relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-excel-green to-primary-500"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{level.nama_level}</h2>
                  <p className="text-sm text-gray-500">ID: {level.id}</p>
                </div>
                <button
                  onClick={() => handleUpdate(level)}
                  disabled={saving === level.id}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  {saving === level.id ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Nama Level</label>
                  <input
                    type="text"
                    value={level.nama_level}
                    onChange={(e) => updateLevel(level.id, "nama_level", e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Deskripsi</label>
                  <textarea
                    value={level.deskripsi || ""}
                    onChange={(e) => updateLevel(level.id, "deskripsi", e.target.value)}
                    className="input-field"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Durasi (Menit)</label>
                    <input
                      type="number"
                      value={level.durasi_menit}
                      onChange={(e) => updateLevel(level.id, "durasi_menit", Number(e.target.value))}
                      className="input-field"
                      min={1}
                    />
                    <p className="text-xs text-gray-400 mt-1">Waktu pengerjaan asesmen</p>
                  </div>
                  <div>
                    <label className="label">Jumlah Soal</label>
                    <input
                      type="number"
                      value={level.jumlah_soal}
                      onChange={(e) => updateLevel(level.id, "jumlah_soal", Number(e.target.value))}
                      className="input-field"
                      min={1}
                    />
                    <p className="text-xs text-gray-400 mt-1">Total soal yang ditampilkan</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200/60 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Info
          </h3>
          <ul className="text-sm text-blue-700 space-y-1.5">
            <li>Poin per soal bisa diubah dari halaman <Link href="/admin/questions" className="font-semibold underline">Kelola Soal</Link></li>
            <li>Perubahan durasi akan berlaku untuk asesmen berikutnya</li>
            <li>Jumlah soal harus sesuai dengan jumlah soal di database</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
