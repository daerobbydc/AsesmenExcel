"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Question {
  id: number;
  level_id: number;
  nomor_soal: number;
  judul_soal: string;
  instruksi: string;
  tipe_soal: string;
  expected_cell: string;
  expected_value: string;
  poin: number;
  nama_level?: string;
}

export default function ManageQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    level_id: 1,
    nomor_soal: 1,
    judul_soal: "",
    instruksi: "",
    tipe_soal: "hasil",
    expected_cell: "",
    expected_value: "",
    poin: 1,
  });
  const supabase = createClient();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select(`
        *,
        levels (nama_level)
      `)
      .order("level_id")
      .order("nomor_soal");

    if (data) {
      const formatted = data.map((q: any) => ({
        ...q,
        nama_level: q.levels?.nama_level || "Unknown",
      }));
      setQuestions(formatted);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingQuestion) {
      const { error } = await supabase
        .from("questions")
        .update(formData)
        .eq("id", editingQuestion.id);

      if (!error) {
        setShowForm(false);
        setEditingQuestion(null);
        fetchQuestions();
      }
    } else {
      const { error } = await supabase.from("questions").insert(formData);

      if (!error) {
        setShowForm(false);
        fetchQuestions();
      }
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      level_id: question.level_id,
      nomor_soal: question.nomor_soal,
      judul_soal: question.judul_soal,
      instruksi: question.instruksi,
      tipe_soal: question.tipe_soal,
      expected_cell: question.expected_cell,
      expected_value: question.expected_value,
      poin: question.poin,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus soal ini?")) {
      await supabase.from("questions").delete().eq("id", id);
      fetchQuestions();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingQuestion(null);
    setFormData({
      level_id: 1,
      nomor_soal: 1,
      judul_soal: "",
      instruksi: "",
      tipe_soal: "hasil",
      expected_cell: "",
      expected_value: "",
      poin: 1,
    });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-excel-green hover:underline text-sm mb-2 block">
              &larr; Kembali ke Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Soal</h1>
          </div>
          <button
            onClick={() => {
              handleCancel();
              setShowForm(true);
            }}
            className="btn-primary"
          >
            + Tambah Soal
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingQuestion ? "Edit Soal" : "Tambah Soal Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Level</label>
                  <select
                    value={formData.level_id}
                    onChange={(e) => setFormData({ ...formData, level_id: Number(e.target.value) })}
                    className="input-field"
                  >
                    <option value={1}>Basic</option>
                    <option value={2}>Intermediate</option>
                  </select>
                </div>
                <div>
                  <label className="label">Nomor Soal</label>
                  <input
                    type="number"
                    value={formData.nomor_soal}
                    onChange={(e) => setFormData({ ...formData, nomor_soal: Number(e.target.value) })}
                    className="input-field"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="label">Judul Soal</label>
                <input
                  type="text"
                  value={formData.judul_soal}
                  onChange={(e) => setFormData({ ...formData, judul_soal: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label">Instruksi</label>
                <textarea
                  value={formData.instruksi}
                  onChange={(e) => setFormData({ ...formData, instruksi: e.target.value })}
                  className="input-field"
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Tipe Soal</label>
                  <select
                    value={formData.tipe_soal}
                    onChange={(e) => setFormData({ ...formData, tipe_soal: e.target.value })}
                    className="input-field"
                  >
                    <option value="hasil">Hasil</option>
                    <option value="formula">Formula</option>
                    <option value="format">Format</option>
                  </select>
                </div>
                <div>
                  <label className="label">Expected Cell</label>
                  <input
                    type="text"
                    value={formData.expected_cell}
                    onChange={(e) => setFormData({ ...formData, expected_cell: e.target.value })}
                    className="input-field"
                    placeholder="B5"
                  />
                </div>
                <div>
                  <label className="label">Expected Value</label>
                  <input
                    type="text"
                    value={formData.expected_value}
                    onChange={(e) => setFormData({ ...formData, expected_value: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="w-32">
                <label className="label">Poin</label>
                <input
                  type="number"
                  value={formData.poin}
                  onChange={(e) => setFormData({ ...formData, poin: Number(e.target.value) })}
                  className="input-field"
                  min={1}
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {editingQuestion ? "Simpan Perubahan" : "Tambah Soal"}
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">#</th>
                  <th className="text-left py-3 px-4">Level</th>
                  <th className="text-left py-3 px-4">Judul</th>
                  <th className="text-left py-3 px-4">Tipe</th>
                  <th className="text-left py-3 px-4">Poin</th>
                  <th className="text-left py-3 px-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id} className="border-b last:border-b-0">
                    <td className="py-3 px-4">{q.nomor_soal}</td>
                    <td className="py-3 px-4">
                      <span className={q.level_id === 1 ? "badge-green" : "badge-blue"}>
                        {q.nama_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{q.judul_soal}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-gray-100 text-gray-700">{q.tipe_soal}</span>
                    </td>
                    <td className="py-3 px-4">{q.poin}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(q)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
