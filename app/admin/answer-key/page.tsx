"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Question {
  id: number;
  level_type: string;
  nomor_soal: number;
  judul_soal: string;
  instruksi: string;
  answer_cell: string;
  expected_value: string;
  poin: number;
}

const BASIC_DATA = [
  ["Nama", "Harga", "Qty", "Total"],
  ["Apel", 15000, 10, "=B2*C2"],
  ["Jeruk", 12000, 8, "=B3*C3"],
  ["Mangga", 25000, 5, "=B4*C4"],
  ["Pisang", 8000, 15, "=B5*C5"],
  ["Anggur", 30000, 3, "=B6*C6"],
  [null, null, null, "=SUM(D2:D6)"],
  ["Total:", "=SUM(B2:B6)", "=SUM(C2:C6)", "=SUM(D2:D6)"],
  ["Rata-rata Harga:", "=AVERAGE(B2:B6)", "=AVERAGE(C2:C6)", null],
  ["Jumlah Item:", "=COUNT(B2:B6)", null, null],
  ["Harga Termurah:", "=MIN(B2:B6)", null, null],
  ["Harga Termahal:", "=MAX(B2:B6)", null, null],
];

const INTERMEDIATE_DATA = [
  ["Item", "Kategori", "Harga", "Qty", "Total", "", "Ref_Nama", "Ref_Harga"],
  ["Laptop", "Elektronik", 8500000, 2, "=C2*D2", "", "Laptop", 8500000],
  ["Mouse", "Elektronik", 150000, 10, "=C3*D3", "", "Mouse", 150000],
  ["Meja", "Furniture", 500000, 3, "=C4*D4", "", "Meja", 500000],
  ["Kursi", "Furniture", 350000, 5, "=C5*D5", "", "Kursi", 350000],
  ["Keyboard", "Elektronik", 250000, 4, "=C6*D6", "", "Keyboard", 250000],
  ["Lemari", "Furniture", 1200000, 1, "=C7*D7", "", "Lemari", 1200000],
  ["Headphone", "Elektronik", 450000, 3, "=C8*D8", "", "Headphone", 450000],
  [null, null, null, null, null, null, null, null],
  ["Total Elektronik:", null, null, "=COUNTIF(B2:B8,\"Elektronik\")", "=SUMIF(B2:B8,\"Elektronik\",E2:E8)"],
  ["Total Furniture:", null, null, "=COUNTIF(B2:B8,\"Furniture\")", "=SUMIF(B2:B8,\"Furniture\",E2:E8)"],
  ["Jumlah Semua Item:", null, null, null, "=COUNTA(A2:A8)"],
  [null, null, null, null, null, null, null, null],
  ["", null, null, null, null, null, "Laptop", "Mouse", "Meja", "Kursi", "Keyboard"],
  ["", null, null, null, null, null, 8500000, 150000, 500000, 350000, 250000],
  [null, null, null, null, null, null, null, null, null, null, null],
  ["VLOOKUP (harga Mouse):", null, null, null, null, null, "=VLOOKUP(\"Mouse\",G2:H8,2,FALSE)"],
  ["HLOOKUP (harga Meja):", null, null, null, null, null, "=HLOOKUP(\"Meja\",G14:K15,2,FALSE)"],
  ["INDEX/MATCH (harga Keyboard):", null, null, null, null, null, "=INDEX(C2:C8,MATCH(\"Keyboard\",A2:A8,0))"],
];

export default function AnswerKeyPage() {
  const [basicQuestions, setBasicQuestions] = useState<Question[]>([]);
  const [intermediateQuestions, setIntermediateQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("level_id", 1)
        .order("nomor_soal");

      if (data) {
        setBasicQuestions(data.filter((q: Question) => q.level_type === "basic"));
        setIntermediateQuestions(data.filter((q: Question) => q.level_type === "intermediate"));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderTable = (data: any[][], questions: Question[]) => {
    const answerCells = questions.reduce((acc, q) => {
      acc[q.answer_cell] = q.expected_value;
      return acc;
    }, {} as Record<string, string>);

    return (
      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-2 py-1 w-10"></th>
              {["A", "B", "C", "D", "E"].slice(0, data[0]?.length || 4).map((col) => (
                <th key={col} className="border border-gray-300 bg-gray-100 px-3 py-1 font-bold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="border border-gray-300 bg-gray-50 px-2 py-1 text-center font-bold text-gray-500">
                  {rowIdx + 1}
                </td>
                {row.map((cell, colIdx) => {
                  const cellRef = String.fromCharCode(65 + colIdx) + (rowIdx + 1);
                  const isAnswer = Object.keys(answerCells).includes(cellRef);
                  return (
                    <td
                      key={colIdx}
                      className={`border border-gray-300 px-3 py-1 ${
                        isAnswer ? "bg-green-100 font-mono text-green-800 font-semibold" : ""
                      }`}
                    >
                      {cell === null ? (
                        <span className="text-gray-300">-</span>
                      ) : (
                        String(cell)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAnswerList = (questions: Question[]) => (
    <div className="space-y-2">
      {questions.map((q) => (
        <div key={q.id} className="flex items-center gap-3 p-2 rounded bg-gray-50 border border-gray-200">
          <span className="w-7 h-7 rounded-full bg-excel-green text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {q.nomor_soal}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium">{q.judul_soal}</span>
          </div>
          <code className="bg-green-50 text-green-800 px-2 py-1 rounded text-xs font-mono border border-green-200 flex-shrink-0">
            {q.answer_cell} = {q.expected_value}
          </code>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-excel-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-excel-green hover:underline text-sm mb-2 block">
              &larr; Kembali ke Admin
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Kunci Jawaban Placement Test</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sel hijau = sel yang harus diisi peserta
            </p>
          </div>
        </div>

        {/* Basic Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Soal Basic (10 soal)</h2>
            <span className="px-3 py-1 rounded-full bg-excel-green text-white text-sm font-medium">
              Lulus ≥ 60%
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Data Spreadsheet:</h3>
            {renderTable(BASIC_DATA, basicQuestions)}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Jawaban:</h3>
            {renderAnswerList(basicQuestions)}
          </div>
        </div>

        {/* Intermediate Section */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Soal Intermediate (10 soal)</h2>
            <span className="px-3 py-1 rounded-full bg-primary-600 text-white text-sm font-medium">
              Lulus ≥ 60%
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Data Spreadsheet:</h3>
            {renderTable(INTERMEDIATE_DATA, intermediateQuestions)}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Jawaban:</h3>
            {renderAnswerList(intermediateQuestions)}
          </div>
        </div>

        {/* Summary */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ringkatan Penilaian</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Basic ≤ 5 soal benar</p>
              <p className="text-lg font-bold text-green-800">→ Level: Basic</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Basic &gt; 5 & Intermediate ≤ 5</p>
              <p className="text-lg font-bold text-blue-800">→ Level: Basic</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">Basic &gt; 5 & Intermediate &gt; 5</p>
              <p className="text-lg font-bold text-purple-800">→ Level: Intermediate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
