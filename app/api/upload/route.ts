import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const XLSX = require("xlsx");

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const assessmentId = formData.get("assessmentId") as string;
    const levelId = formData.get("levelId") as string;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file harus .xlsx atau .xls" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("level_id", levelId)
      .order("nomor_soal");

    if (questionsError) {
      return NextResponse.json(
        { error: "Gagal mengambil soal" },
        { status: 500 }
      );
    }

    let totalPoin = 0;
    let poinDidapat = 0;
    const answers: any[] = [];

    for (const question of questions) {
      totalPoin += question.poin;
      let isCorrect = false;
      let jawabanUser = "";

      try {
        if (question.tipe_soal === "formula" && question.expected_cell) {
          const cellValue = getCellValue(firstSheet, question.expected_cell);
          jawabanUser = String(cellValue || "");

          if (question.expected_value) {
            const expectedClean = question.expected_value
              .replace("=", "")
              .toUpperCase();
            const actualClean = String(cellValue || "").toUpperCase();

            isCorrect =
              actualClean === expectedClean ||
              actualClean.replace(/\s/g, "") === expectedClean.replace(/\s/g, "");
          }
        } else if (question.tipe_soal === "format") {
          jawabanUser = "Format applied";
          isCorrect = true;
        } else if (question.tipe_soal === "hasil" && question.expected_cell) {
          const cellValue = getCellValue(firstSheet, question.expected_cell);
          jawabanUser = String(cellValue || "");

          if (question.expected_value) {
            isCorrect = String(cellValue) === question.expected_value;
          }
        }
      } catch (e) {
        jawabanUser = "Error reading cell";
        isCorrect = false;
      }

      const poin = isCorrect ? question.poin : 0;
      poinDidapat += poin;

      answers.push({
        assessment_id: assessmentId,
        question_id: question.id,
        jawaban_user: jawabanUser,
        is_correct: isCorrect,
        poin_didapat: poin,
      });
    }

    const skor = totalPoin > 0 ? Math.round((poinDidapat / totalPoin) * 100) : 0;

    const { error: answersError } = await supabase
      .from("assessment_answers")
      .insert(answers);

    if (answersError) {
      console.error("Answers error:", answersError);
    }

    const { error: updateError } = await supabase
      .from("assessments")
      .update({
        status: "completed",
        skor: skor,
        selesai_pada: new Date().toISOString(),
      })
      .eq("id", assessmentId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      skor,
      totalPoin,
      poinDidapat,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses file" },
      { status: 500 }
    );
  }
}

function getCellValue(sheet: any, cellRef: string): any {
  const cell = sheet[cellRef];
  return cell ? cell.v : null;
}
