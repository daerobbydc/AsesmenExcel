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

export default function Spreadsheet({
  initialData,
  answerCells,
  onCellsChange,
  readOnly = false,
  colWidths,
}: SpreadsheetProps) {
  const hotRef = useRef<HotTable>(null);
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

  const getCellClassName = useCallback(
    (row: number, col: number) => {
      const cellRef = String.fromCharCode(65 + col) + (row + 1);
      const isAnswerCell = answerCells.some((ac) => ac.cell === cellRef);
      if (isAnswerCell) {
        return "answer-cell";
      }
      return "";
    },
    [answerCells]
  );

  const getCellMeta = useCallback(
    (row: number, col: number) => {
      const cellRef = String.fromCharCode(65 + col) + (row + 1);
      const isAnswerCell = answerCells.some((ac) => ac.cell === cellRef);

      if (readOnly || !isAnswerCell) {
        return { readOnly: true };
      }
      return {};
    },
    [answerCells, readOnly]
  );

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }, []);

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
      return {
        row,
        col,
        className: "answer-cell",
      };
    }),
    cells: function (row: number, col: number) {
      return {
        readOnly: readOnly || !answerCells.some((ac) => {
          const acCol = ac.cell.charCodeAt(0) - 65;
          const acRow = parseInt(ac.cell.slice(1)) - 1;
          return acRow === row && acCol === col;
        }),
        className: answerCells.some((ac) => {
          const acCol = ac.cell.charCodeAt(0) - 65;
          const acRow = parseInt(ac.cell.slice(1)) - 1;
          return acRow === row && acCol === col;
        })
          ? "answer-cell"
          : "",
      };
    },
    colWidths: colWidths || undefined,
    manualColumnResize: true,
    autoWrapRow: true,
    autoWrapCol: true,
    stretchH: "none" as const,
    contextMenu: false,
    manualRowResize: false,
    fillHandle: false,
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
