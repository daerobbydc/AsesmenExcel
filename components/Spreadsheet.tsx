"use client";

import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.min.css";
import { useRef, useEffect, useState, useCallback } from "react";

registerAllModules();

interface SpreadsheetProps {
  initialData: any[][];
  answerCells: { cell: string; formula?: string; value?: string }[];
  onCellsChange?: (changes: any) => void;
  readOnly?: boolean;
  colWidths?: number[];
}

export default function SpreadsheetComponent({
  initialData,
  answerCells,
  onCellsChange,
  readOnly = false,
  colWidths,
}: SpreadsheetProps) {
  const hotRef = useRef<any>(null);
  const [data, setData] = useState<any[][]>(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleAfterChange = useCallback(
    (changes: any[] | null) => {
      if (changes && onCellsChange) {
        onCellsChange(changes);
      }
    },
    [onCellsChange]
  );

  const isAnswerCell = useCallback(
    (row: number, col: number) => {
      const cellRef = String.fromCharCode(65 + col) + (row + 1);
      return answerCells.some((ac) => ac.cell === cellRef);
    },
    [answerCells]
  );

  const hotSettings = {
    data: data,
    colHeaders: true,
    rowHeaders: true,
    width: "100%",
    height: 400,
    licenseKey: "non-commercial-and-evaluation",
    afterChange: handleAfterChange,
    cell: answerCells.map((ac) => {
      const col = ac.cell.charCodeAt(0) - 65;
      const row = parseInt(ac.cell.slice(1)) - 1;
      return { row, col, className: "answer-cell" };
    }),
    cells: function (row: number, col: number) {
      const isAnswer = isAnswerCell(row, col);
      return {
        readOnly: readOnly || !isAnswer,
        className: isAnswer ? "answer-cell" : "",
      };
    },
    colWidths: colWidths || undefined,
    manualColumnResize: true,
    autoWrapRow: true,
    autoWrapCol: true,
    stretchH: "none" as const,
    contextMenu: false,
    manualRowResize: false,
    fillHandle: { autoInsertRow: false },
    undoRedo: false,
  };

  return (
    <div className="spreadsheet-container">
      <style jsx global>{`
        .handsontable .answer-cell {
          background-color: #e8f5e9 !important;
          border: 2px solid #4caf50 !important;
        }
        .handsontable .answer-cell:focus {
          background-color: #c8e6c9 !important;
          border: 2px solid #2e7d32 !important;
        }
        .handsontable .htCore td {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .handsontable .htCore th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        .handsontable {
          border: 1px solid #ddd;
        }
      `}</style>
      <HotTable ref={hotRef} settings={hotSettings} />
    </div>
  );
}
