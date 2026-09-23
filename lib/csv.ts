// Minimal CSV builder — good enough for a flat table export, opens
// correctly in Excel (including Arabic text) thanks to the UTF-8 BOM.
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (cell: string | number) => {
    const str = String(cell);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return "﻿" + lines.join("\r\n");
}
