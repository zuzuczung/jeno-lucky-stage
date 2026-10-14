import Papa from "papaparse";
import type { ParsedFile, ParsePreview, SheetData } from "../types";
export const clean = (s: string): string =>
  s
    .replace(/^\uFEFF/, "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
export const key = (s: string): string =>
  clean(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
const nameKeys = [
  "ho va ten",
  "ho ten",
  "ten hoc sinh",
  "full name",
  "name",
  "student name",
];
const surnameKeys = [
  "ho va ten dem",
  "ho ten dem",
  "ho dem",
  "surname",
  "last name",
  "family name",
];
const givenKeys = ["ten", "first name", "given name"];
const codeKeys = [
  "ma hoc sinh",
  "ma hs",
  "student id",
  "id",
  "mshs",
  "ma so",
  "code",
];
const summary =
  /^(tong(?: so)?(?: hoc sinh)?\s*[:：]?\s*\d*|total\s*[:：]?\s*\d*|danh sach(?: lop| hoc sinh)?.*|class list|stt|ho va ten|ho ten|full name|name|ten hoc sinh|so thu tu)$/;
export function previewSheet(
  sheet: SheetData,
  plain = false,
  chosen?: { name: number; surname: number; code: number; header: number },
): ParsePreview {
  const rows = sheet.rows.map((r) => r.map(clean));
  let header = -1,
    name = -1,
    surname = -1,
    code = -1,
    uncertain = false;
  if (chosen) {
    header = chosen.header;
    name = chosen.name;
    surname = chosen.surname;
    code = chosen.code;
  } else if (!plain) {
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const normalized = rows[i].map(key),
        n = normalized.findIndex((s) => nameKeys.includes(s)),
        sur = normalized.findIndex((s) => surnameKeys.includes(s)),
        given = normalized.findIndex((s) => givenKeys.includes(s));
      if (n >= 0 || (sur >= 0 && given >= 0)) {
        header = i;
        name = n >= 0 ? n : given;
        surname = n < 0 ? sur : -1;
        code = normalized.findIndex((s) => codeKeys.includes(s));
        break;
      }
    }
    if (name < 0) {
      uncertain = true;
      const width = Math.max(1, ...rows.slice(0, 30).map((r) => r.length));
      const scores = Array.from(
        { length: width },
        (_, c) =>
          rows
            .slice(0, 30)
            .filter(
              (r) =>
                /[\p{L}]/u.test(r[c] || "") && !summary.test(key(r[c] || "")),
            ).length,
      );
      name = scores.indexOf(Math.max(...scores));
    }
  } else name = 0;
  const width = Math.max(1, ...rows.map((r) => r.length));
  const headers = Array.from({ length: width }, (_, i) =>
    header >= 0 ? rows[header][i] || `Cột ${i + 1}` : `Cột ${i + 1}`,
  );
  const students: ParsePreview["students"] = [],
    skipped: ParsePreview["skipped"] = [];
  rows.forEach((row, i) => {
    if (i <= header) {
      skipped.push({
        row: i + 1,
        reason:
          i === header
            ? "Dòng tiêu đề / Header"
            : "Trước tiêu đề / Before header",
      });
      return;
    }
    let value = clean(
      `${surname >= 0 ? (row[surname] || "") + " " : ""}${row[name] || ""}`,
    );
    if (plain)
      value = value
        .replace(/^\s*\d+\s*[.)\-:、]\s*/, "")
        .replace(/^\s*\d+\s+(?=\p{L})/u, "");
    value = clean(value);
    if (!value) {
      skipped.push({
        row: i + 1,
        reason: row.some(Boolean)
          ? "Cột tên trống / Empty name cell"
          : "Dòng trống / Blank row",
      });
      return;
    }
    if (
      summary.test(key(value)) ||
      /^(tong|total)\s*[:：]?\s*\d+/.test(key(value))
    ) {
      skipped.push({
        row: i + 1,
        reason: "Tiêu đề hoặc tổng kết / Header or summary",
      });
      return;
    }
    if (!/\p{L}/u.test(value)) {
      skipped.push({ row: i + 1, reason: "Không có ký tự tên / No letters" });
      return;
    }
    students.push({
      name: value,
      code: code >= 0 ? row[code] || "" : "",
      row: i + 1,
    });
  });
  return {
    students,
    headers,
    nameColumn: name,
    surnameColumn: surname,
    codeColumn: code,
    headerRow: header,
    uncertain,
    skipped,
    totalRows: rows.length,
  };
}
export async function parseRosterFile(file: File): Promise<ParsedFile> {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("File tối đa 10 MB / Maximum file size is 10 MB.");
  if (!file.size) throw new Error("File trống / The file is empty.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["xlsx", "csv", "txt", "docx"].includes(extension || ""))
    throw new Error(
      "Chỉ hỗ trợ XLSX, CSV, TXT, DOCX / Supported formats: XLSX, CSV, TXT, DOCX.",
    );
  try {
    const bytes = await file.arrayBuffer();
    if (extension === "xlsx") {
      const XLSX = await import("xlsx");
      const data = new Uint8Array(bytes);
      if (data[0] !== 0x50 || data[1] !== 0x4b) throw new Error("Invalid XLSX");
      const book = XLSX.read(bytes, { type: "array" });
      return {
        source: file.name,
        plain: false,
        warnings: [],
        sheets: book.SheetNames.map((name) => ({
          name,
          rows: XLSX.utils
            .sheet_to_json<unknown[]>(book.Sheets[name], {
              header: 1,
              defval: "",
              blankrows: true,
            })
            .map((row) => row.map((v) => String(v ?? ""))),
        })),
      };
    }
    if (extension === "docx") {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.convertToHtml({ arrayBuffer: bytes });
      const doc = new DOMParser().parseFromString(result.value, "text/html");
      const tables = [...doc.querySelectorAll("table")];
      const sheets: SheetData[] = tables.map((table, i) => ({
        name: `Bảng ${i + 1}`,
        rows: [...table.querySelectorAll("tr")].map((tr) =>
          [...tr.querySelectorAll("td,th")].map((cell) =>
            clean(cell.textContent || ""),
          ),
        ),
      }));
      if (!sheets.length)
        sheets.push({
          name: "Danh sách",
          rows: [...doc.querySelectorAll("p")].map((p) => [
            p.textContent || "",
          ]),
        });
      return {
        source: file.name,
        plain: !tables.length,
        sheets,
        warnings: result.messages.map((m) => m.message),
      };
    }
    const text = new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .replace(/^\uFEFF/, "");
    if (extension === "txt")
      return {
        source: file.name,
        plain: true,
        warnings: [],
        sheets: [
          {
            name: "Danh sách",
            rows: text.split(/\r?\n/).map((line) => [line]),
          },
        ],
      };
    const result = Papa.parse<string[]>(text, {
      skipEmptyLines: false,
      delimitersToGuess: [",", ";", "\t", "|"],
    });
    const bad = result.errors.filter((e) => e.code !== "UndetectableDelimiter");
    if (bad.length) throw new Error(bad.map((e) => e.message).join("; "));
    return {
      source: file.name,
      plain: false,
      warnings: [],
      sheets: [{ name: "CSV", rows: result.data }],
    };
  } catch (e) {
    throw new Error(
      `Không đọc được file. Kiểm tra file đúng định dạng và UTF-8. / Cannot read file. ${e instanceof Error ? e.message : ""}`,
    );
  }
}
export function duplicateRows(
  students: { name: string; code: string }[],
): number[] {
  const groups = new Map<string, number[]>();
  students.forEach((s, i) => {
    const k = s.code ? `id:${key(s.code)}` : `name:${key(s.name)}`;
    groups.set(k, [...(groups.get(k) || []), i]);
  });
  return [...groups.values()].filter((g) => g.length > 1).flat();
}
