import type { HistoryEntry } from "../types";
export function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
export function historyCSV(history: HistoryEntry[]): string {
  return (
    "\uFEFF" +
    [
      [
        "Thứ tự",
        "Họ và tên",
        "Mã học sinh",
        "Lớp",
        "Vòng",
        "Thời gian",
        "ID học sinh",
      ],
      ...history.map((h) => [
        String(h.order),
        h.name,
        h.code,
        h.className,
        String(h.round),
        h.at,
        h.studentId,
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
export function downloadText(
  text: string,
  filename: string,
  type = "text/csv;charset=utf-8",
): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
