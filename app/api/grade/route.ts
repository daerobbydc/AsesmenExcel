import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { HyperFormula } from "hyperformula";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, levelId, cellValues } = body;

    if (!assessmentId || !levelId || !cellValues) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("level_id", levelId)
      .order("nomor_soal");

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: "Gagal mengambil soal" },
        { status: 500 }
      );
    }

    let totalPoin = 0;
    let poinDidapat = 0;
    const answers: any[] = [];

    const hf = HyperFormula.buildEmpty({
      licenseKey: "non-commercial-and-evaluation",
    });

    const sheetName = "Sheet1";
    hf.addSheet(sheetName);

    Object.entries(cellValues).forEach(([cellRef, value]) => {
      const col = cellRef.charCodeAt(0) - 65;
      const row = parseInt(cellRef.slice(1)) - 1;
      const val = value as string;

      if (val.startsWith("=")) {
        try {
          hf.setCellContents(
            { sheet: 0, row, col },
            [[val]]
          );
        } catch (e) {
          hf.setCellContents(
            { sheet: 0, row, col },
            [[val]]
          );
        }
      } else {
        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
          hf.setCellContents(
            { sheet: 0, row, col },
            [[numVal]]
          );
        } else {
          hf.setCellContents(
            { sheet: 0, row, col },
            [[val]]
          );
        }
      }
    });

    for (const question of questions) {
      totalPoin += question.poin;
      let isCorrect = false;
      let jawabanUser = "";

      try {
        const answerRef = question.answer_cell;
        const col = answerRef.charCodeAt(0) - 65;
        const row = parseInt(answerRef.slice(1)) - 1;

        const cellResult = hf.getCellValue({ sheet: 0, row, col });
        jawabanUser = String(cellResult ?? "");

        if (question.tipe_soal === "formula") {
          const expectedFormula = question.expected_value?.toUpperCase().replace(/\s/g, "");
          const userFormula = cellValues[answerRef]?.toUpperCase().replace(/\s/g, "");

          if (userFormula === expectedFormula) {
            isCorrect = true;
          } else {
            const expectedNum = parseFloat(question.expected_value || "0");
            if (!isNaN(expectedNum) && cellResult === expectedNum) {
              isCorrect = true;
            }
          }
        } else if (question.tipe_soal === "input") {
          const expectedNum = parseFloat(question.expected_value || "0");
          const actualNum = parseFloat(String(cellResult ?? "0"));

          if (!isNaN(expectedNum) && !isNaN(actualNum)) {
            isCorrect = Math.abs(expectedNum - actualNum) < 0.01;
          } else {
            isCorrect = String(cellResult).toLowerCase() === question.expected_value?.toLowerCase();
          }
        } else if (question.tipe_soal === "hasil") {
          const expectedNum = parseFloat(question.expected_value || "0");
          const actualNum = parseFloat(String(cellResult ?? "0"));

          if (!isNaN(expectedNum) && !isNaN(actualNum)) {
            isCorrect = Math.abs(expectedNum - actualNum) < 0.01;
          }
        }
      } catch (e) {
        jawabanUser = "Error";
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
      answers: answers.map((a) => ({
        question_id: a.question_id,
        is_correct: a.is_correct,
        jawaban_user: a.jawaban_user,
      })),
    });
  } catch (error: any) {
    console.error("Grade error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghitung skor" },
      { status: 500 }
    );
  }
}
