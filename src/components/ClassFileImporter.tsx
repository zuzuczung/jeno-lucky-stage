import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  FileUp,
  Plus,
  Trash2,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import {
  parseRosterFile,
  previewSheet,
  duplicateRows,
  clean,
} from "../lib/rosterParser";
import { demoDraft } from "../lib/model";
import type {
  DraftStudent,
  ParsedFile,
  ParsePreview,
  Student,
  Translate,
} from "../types";
interface ImporterProps {
  onConfirm: (
    draft: DraftStudent[],
    mode: "replace" | "append",
    name: string,
  ) => void;
  className: string;
  students: Student[];
  t: Translate;
}
export function ClassFileImporter({
  onConfirm,
  className,
  students,
  t,
}: ImporterProps) {
  const input = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedFile | null>(null),
    [sheet, setSheet] = useState(0),
    [preview, setPreview] = useState<ParsePreview | null>(null),
    [draft, setDraft] = useState<DraftStudent[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [drag, setDrag] = useState(false),
    [name, setName] = useState(className),
    [mode, setMode] = useState<"replace" | "append">("replace"),
    [duplicatesAccepted, setDuplicatesAccepted] = useState(false),
    [columnConfirmed, setColumnConfirmed] = useState(false);
  function applyPreview(
    p: ParsedFile,
    index: number,
    chosen?: { name: number; surname: number; code: number; header: number },
  ) {
    const next = previewSheet(p.sheets[index], p.plain, chosen);
    setPreview(next);
    setDraft(next.students);
    setDuplicatesAccepted(false);
    setColumnConfirmed(!next.uncertain);
  }
  async function read(file?: File) {
    if (!file || busy) return;
    setError("");
    setBusy(true);
    try {
      const p = await parseRosterFile(file);
      const ranked = p.sheets
        .map((s, i) => ({ i, p: previewSheet(s, p.plain) }))
        .sort(
          (a, b) =>
            Number(a.p.uncertain) - Number(b.p.uncertain) ||
            b.p.students.length - a.p.students.length,
        );
      const best = ranked[0]?.i ?? 0;
      setParsed(p);
      setSheet(best);
      applyPreview(p, best);
      setName(className);
      setMode("replace");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : t("Không đọc được file", "Cannot read file"),
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  const duplicates = duplicateRows(
      mode === "append" ? [...students, ...draft] : draft,
    ),
    hasDuplicates = duplicates.length > 0;
  const invalid = draft.some((s) => !clean(s.name));
  const setColumn = (column: "name" | "surname" | "code", value: number) => {
    if (!parsed || !preview) return;
    applyPreview(parsed, sheet, {
      name: column === "name" ? value : preview.nameColumn,
      surname: column === "surname" ? value : preview.surnameColumn,
      code: column === "code" ? value : preview.codeColumn,
      header: preview.headerRow,
    });
    setColumnConfirmed(true);
  };
  return (
    <div className="importer">
      <div
        className={`dropzone ${drag ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void read(e.dataTransfer.files[0]);
        }}
      >
        <div className="upload-icon">
          <FileUp size={29} strokeWidth={1.5} />
        </div>
        <h3>{t("Cả lớp. Một tấm vé.", "One class. One ticket.")}</h3>
        <p>
          {t(
            "Kéo file danh sách vào đây, hoặc chọn từ máy.",
            "Drop your class list here, or choose a file.",
          )}
        </p>
        <button
          className="primary small"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy
            ? t("Đang đọc file…", "Reading file…")
            : t("CHỌN FILE DANH SÁCH", "UPLOAD CLASS LIST")}{" "}
          <Plus size={16} />
        </button>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.csv,.txt,.docx"
          className="sr-only"
          aria-label={t("Tải file danh sách lớp", "Upload class list")}
          onChange={(e) => void read(e.target.files?.[0])}
        />
        <span className="file-types">
          XLSX · CSV · TXT · DOCX <span> / 10 MB MAX</span>
        </span>
      </div>
      <div className="import-shortcuts">
        <a className="text-button" href="/sample-class.csv" download>
          <Download size={15} />
          {t("Tải file mẫu", "Download template")}
        </a>
        <button
          className="text-button"
          onClick={() => {
            const p: ParsedFile = {
              source: t("Lớp mẫu 40 học sinh", "Demo class · 40 students"),
              plain: false,
              warnings: [],
              sheets: [
                {
                  name: "10A1",
                  rows: [
                    ["Mã học sinh", "Họ và tên"],
                    ...demoDraft.map((s) => [s.code, s.name]),
                  ],
                },
              ],
            };
            setParsed(p);
            setSheet(0);
            applyPreview(p, 0);
            setName("10A1 · Dream Class");
            setError("");
          }}
        >
          <Users size={15} />
          {t("Thử lớp mẫu 40 fan", "Try 40 demo fans")}
        </button>
      </div>
      {error && (
        <div role="alert" className="alert error">
          <TriangleAlert size={18} />
          <span>
            {error}
            <small>
              {t(
                "Danh sách hiện tại được giữ nguyên.",
                "Your current class list is unchanged.",
              )}
            </small>
          </span>
        </div>
      )}
      {parsed && preview && (
        <section className="import-preview">
          <div className="section-heading">
            <div>
              <span className="tiny-label">
                {t("BẢN XEM TRƯỚC", "IMPORT PREVIEW")}
              </span>
              <h3>
                {draft.length} {t("fan được nhận diện", "fans detected")}
              </h3>
              <p className="source-name">{parsed.source}</p>
            </div>
            <button
              className="icon-button"
              onClick={() => {
                setParsed(null);
                setPreview(null);
              }}
              aria-label={t("Hủy bản xem trước", "Cancel preview")}
            >
              <X size={17} />
            </button>
          </div>
          <div className="form-grid">
            <label>
              {t("Tên lớp", "Class name")}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="10A1 · Dream Class"
                maxLength={70}
              />
            </label>
            {parsed.sheets.length > 1 && (
              <label>
                {t("Sheet / Bảng", "Sheet / Table")}
                <select
                  value={sheet}
                  onChange={(e) => {
                    const i = Number(e.target.value);
                    setSheet(i);
                    applyPreview(parsed, i);
                  }}
                >
                  {parsed.sheets.map((s, i) => (
                    <option value={i} key={i}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {!parsed.plain && (
            <details
              className="column-options"
              open={preview.uncertain || undefined}
            >
              <summary>
                {t(
                  "Kiểm tra cột tên và mã học sinh",
                  "Check name and student ID columns",
                )}
              </summary>
              <div className="form-grid">
                <label>
                  {t("Cột họ tên / Tên", "Full name / Given name")}
                  <select
                    value={preview.nameColumn}
                    onChange={(e) => setColumn("name", Number(e.target.value))}
                  >
                    {preview.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t(
                    "Cột họ + tên đệm (tùy chọn)",
                    "Surname column (optional)",
                  )}
                  <select
                    value={preview.surnameColumn}
                    onChange={(e) =>
                      setColumn("surname", Number(e.target.value))
                    }
                  >
                    <option value={-1}>
                      {t("Không ghép cột", "No second column")}
                    </option>
                    {preview.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t("Mã học sinh", "Student ID")}
                  <select
                    value={preview.codeColumn}
                    onChange={(e) => setColumn("code", Number(e.target.value))}
                  >
                    <option value={-1}>{t("Không có", "None")}</option>
                    {preview.headers.map((h, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {h}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t(
                    "Số dòng tiêu đề (0 nếu không có)",
                    "Header row (0 = none)",
                  )}
                  <input
                    type="number"
                    min="0"
                    max={parsed.sheets[sheet].rows.length}
                    value={preview.headerRow + 1}
                    onChange={(e) => {
                      applyPreview(parsed, sheet, {
                        name: preview.nameColumn,
                        surname: preview.surnameColumn,
                        code: preview.codeColumn,
                        header: Number(e.target.value) - 1,
                      });
                      setColumnConfirmed(true);
                    }}
                  />
                </label>
              </div>
              {!columnConfirmed && (
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={columnConfirmed}
                    onChange={(e) => setColumnConfirmed(e.target.checked)}
                  />
                  {t(
                    "Tôi đã kiểm tra cột tên được đề xuất.",
                    "I have checked the suggested name column.",
                  )}
                </label>
              )}
            </details>
          )}
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("Họ và tên", "Full name")}</th>
                  <th>{t("Mã", "ID")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {draft.map((s, i) => (
                  <tr
                    key={i}
                    className={
                      duplicates.includes(
                        i + (mode === "append" ? students.length : 0),
                      )
                        ? "duplicate-row"
                        : ""
                    }
                  >
                    <td>{i + 1}</td>
                    <td>
                      <input
                        aria-label={`${t("Tên dòng", "Name row")} ${i + 1}`}
                        value={s.name}
                        onChange={(e) => {
                          setDraft((d) =>
                            d.map((v, j) =>
                              j === i ? { ...v, name: e.target.value } : v,
                            ),
                          );
                          setDuplicatesAccepted(false);
                        }}
                      />
                    </td>
                    <td>
                      <input
                        aria-label={`${t("Mã dòng", "ID row")} ${i + 1}`}
                        value={s.code}
                        onChange={(e) => {
                          setDraft((d) =>
                            d.map((v, j) =>
                              j === i ? { ...v, code: e.target.value } : v,
                            ),
                          );
                          setDuplicatesAccepted(false);
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        onClick={() =>
                          setDraft((d) => d.filter((_, j) => j !== i))
                        }
                        aria-label={`${t("Xóa dòng", "Delete row")} ${i + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="text-button"
            onClick={() =>
              setDraft((d) => [...d, { name: "", code: "", row: 0 }])
            }
          >
            <Plus size={15} />
            {t("Bổ sung một fan", "Add a fan")}
          </button>
          <details className="parse-report">
            <summary>
              {t(
                `Đọc ${preview.totalRows} dòng · nhận ${preview.students.length} · bỏ qua ${preview.skipped.length}`,
                `Read ${preview.totalRows} rows · detected ${preview.students.length} · skipped ${preview.skipped.length}`,
              )}
            </summary>
            {preview.skipped.map((s) => (
              <p key={s.row}>
                {t("Dòng", "Row")} {s.row}: {s.reason}
              </p>
            ))}
            {parsed.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
            {!preview.skipped.length && !parsed.warnings.length && (
              <p>{t("Không có dòng bị bỏ qua.", "No skipped rows.")}</p>
            )}
          </details>
          {hasDuplicates && (
            <div className="alert warning">
              <TriangleAlert size={18} />
              <div>
                <strong>
                  {t(
                    "Có tên hoặc mã trùng — hãy kiểm tra",
                    "Duplicate names or IDs — please review",
                  )}
                </strong>
                <p>
                  {t(
                    "Tên giống nhau nhưng mã khác nhau vẫn là hai học sinh riêng.",
                    "Matching names with different IDs remain separate students.",
                  )}
                </p>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={duplicatesAccepted}
                    onChange={(e) => setDuplicatesAccepted(e.target.checked)}
                  />
                  {t(
                    "Giữ tất cả các dòng trùng đã kiểm tra",
                    "Keep all reviewed duplicate rows",
                  )}
                </label>
                <button
                  className="text-button"
                  onClick={() => {
                    const seen = new Set<string>();
                    setDraft((d) =>
                      d.filter((s) => {
                        const id = s.code ? "id:" + s.code : "name:" + s.name;
                        if (seen.has(id)) return false;
                        seen.add(id);
                        return true;
                      }),
                    );
                    setDuplicatesAccepted(false);
                  }}
                >
                  {t(
                    "Loại bản sao trong bản xem trước",
                    "Remove duplicate rows in preview",
                  )}
                </button>
              </div>
            </div>
          )}
          {!!students.length && (
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  checked={mode === "replace"}
                  onChange={() => {
                    setMode("replace");
                    setDuplicatesAccepted(false);
                  }}
                />
                {t("Thay toàn bộ lớp", "Replace class")}
              </label>
              <label>
                <input
                  type="radio"
                  checked={mode === "append"}
                  onChange={() => {
                    setMode("append");
                    setDuplicatesAccepted(false);
                  }}
                />
                {t("Nối vào lớp hiện tại", "Append to class")}
              </label>
            </div>
          )}
          <button
            className="primary full"
            disabled={
              !draft.length ||
              invalid ||
              !columnConfirmed ||
              (hasDuplicates && !duplicatesAccepted)
            }
            onClick={() => {
              onConfirm(draft, mode, name);
              setParsed(null);
              setPreview(null);
            }}
          >
            <Check size={17} />
            {t(`XÁC NHẬN ${draft.length} FAN`, `CONFIRM ${draft.length} FANS`)}
            <ArrowRight size={17} />
          </button>
          <p className="muted fine-print">
            {t(
              "Danh sách chỉ thay đổi sau khi bạn xác nhận.",
              "The class list changes only after you confirm.",
            )}
          </p>
        </section>
      )}
    </div>
  );
}
