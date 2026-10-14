import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { readFile } from "node:fs/promises";
import {
  parseRosterFile,
  previewSheet,
  duplicateRows,
} from "../src/lib/rosterParser";
function file(name: string, data: string | Uint8Array | ArrayBuffer): File {
  const bytes =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : data instanceof Uint8Array
        ? data
        : new Uint8Array(data);
  const file = new File([bytes], name);
  Object.defineProperty(file, "arrayBuffer", {
    value: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  });
  return file;
}
describe("roster file ingestion", () => {
  it("reads multi-sheet XLSX, finds normalized headers, combines surname/given name and retains Vietnamese", async () => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([["Instructions"], ["Use sheet 2"]]),
      "Info",
    );
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.aoa_to_sheet([
        ["Danh sách lớp"],
        ["MA HOC SINH", "HO VA TEN DEM", "TEN"],
        ["A", "Nguyễn Minh", "Anh"],
        ["B", "Nguyễn Minh", "Anh"],
        ["", "", ""],
        ["", "Tổng số học sinh: 2", ""],
      ]),
      "Lớp",
    );
    const data = await parseRosterFile(
      file("test.xlsx", XLSX.write(book, { type: "array", bookType: "xlsx" })),
    );
    expect(data.sheets).toHaveLength(2);
    const p = previewSheet(data.sheets[1]);
    expect(p.students.map((s) => s.name)).toEqual([
      "Nguyễn Minh Anh",
      "Nguyễn Minh Anh",
    ]);
    expect(p.students.map((s) => s.code)).toEqual(["A", "B"]);
    expect(p.skipped).toHaveLength(4);
    expect(duplicateRows(p.students)).toEqual([]);
  });
  it.each([",", ";", "\t"])(
    "reads CSV delimiter %s, BOM, quoted cells and escaped quotes",
    async (delimiter) => {
      const text =
        "\uFEFF" +
        `Mã học sinh${delimiter}Họ và tên\r\nA01${delimiter}"Nguyễn, Minh ""An"""\r\nA02${delimiter}Trần Gia Bảo`;
      const data = await parseRosterFile(file("test.csv", text));
      expect(previewSheet(data.sheets[0]).students[0].name).toBe(
        'Nguyễn, Minh "An"',
      );
      expect(previewSheet(data.sheets[0]).students).toHaveLength(2);
    },
  );
  it("reads TXT numbering, blank lines, header and summary without stripping accents", async () => {
    const data = await parseRosterFile(
      file(
        "test.txt",
        "Danh sách lớp\n1. Nguyễn   Hà An\n2) Trần Minh\n3 Lê Ngọc\n\nTổng: 3",
      ),
    );
    const p = previewSheet(data.sheets[0], true);
    expect(p.students.map((s) => s.name)).toEqual([
      "Nguyễn Hà An",
      "Trần Minh",
      "Lê Ngọc",
    ]);
    expect(p.skipped).toHaveLength(3);
  });
  it("reads DOCX tables with names split across runs", async () => {
    const data = await parseRosterFile(
      file("table.docx", await readFile("tests/fixtures/table.docx")),
    );
    expect(data.plain).toBe(false);
    expect(previewSheet(data.sheets[0]).students.map((s) => s.name)).toEqual([
      "Nguyễn Minh Anh",
      "Trần Gia Bảo",
    ]);
  });
  it("reads DOCX lists and joins split text runs", async () => {
    const data = await parseRosterFile(
      file("list.docx", await readFile("tests/fixtures/list.docx")),
    );
    expect(data.plain).toBe(true);
    expect(
      previewSheet(data.sheets[0], true).students.map((s) => s.name),
    ).toEqual(["Lê Hà An", "Trần Minh"]);
  });
  it("flags uncertain columns and missing-name rows visibly", () => {
    const p = previewSheet({
      name: "A",
      rows: [
        ["A01", "Nguyễn An"],
        ["A02", ""],
        ["A03", "Trần Bình"],
      ],
    });
    expect(p.uncertain).toBe(true);
    const fixed = previewSheet(
      {
        name: "A",
        rows: [
          ["A01", "Nguyễn An"],
          ["A02", ""],
          ["A03", "Trần Bình"],
        ],
      },
      false,
      { name: 1, surname: -1, code: 0, header: -1 },
    );
    expect(fixed.students).toHaveLength(2);
    expect(fixed.skipped[0].row).toBe(2);
  });
  it("rejects empty, damaged, unsupported and too-large files", async () => {
    await expect(parseRosterFile(file("a.csv", ""))).rejects.toThrow("trống");
    await expect(parseRosterFile(file("a.xlsx", "not a zip"))).rejects.toThrow(
      "Không đọc",
    );
    await expect(parseRosterFile(file("a.docx", "bad"))).rejects.toThrow(
      "Không đọc",
    );
    await expect(parseRosterFile(file("a.pdf", "fake"))).rejects.toThrow(
      "Chỉ hỗ trợ",
    );
    const big = file("a.txt", "x");
    Object.defineProperty(big, "size", { value: 11 * 1024 * 1024 });
    await expect(parseRosterFile(big)).rejects.toThrow("10 MB");
  });
  it("flags same-name no-code and same-code duplicate groups", () => {
    expect(
      duplicateRows([
        { name: "Nguyễn An", code: "" },
        { name: "Nguyễn An", code: "" },
        { name: "Nguyễn An", code: "X" },
        { name: "Nguyễn An", code: "Y" },
      ]),
    ).toEqual([0, 1]);
    expect(
      duplicateRows([
        { name: "A", code: "X" },
        { name: "B", code: "X" },
      ]),
    ).toEqual([0, 1]);
  });
});
