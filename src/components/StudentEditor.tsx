import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Student, Translate } from "../types";
import { Modal } from "./Modal";
import { clean } from "../lib/rosterParser";
export function StudentEditor({
  students,
  onSave,
  onClose,
  t,
}: {
  students: Student[];
  onSave: (students: Student[]) => void;
  onClose: () => void;
  t: Translate;
}) {
  const [draft, setDraft] = useState(() => students.map((s) => ({ ...s })));
  return (
    <Modal
      title={t("Chỉnh danh sách fan", "Edit class fans")}
      onClose={onClose}
      wide
    >
      <p className="muted">
        {t(
          "Sửa tên giữ nguyên ID và trạng thái đã gọi.",
          "Editing names preserves IDs and No Repeat status.",
        )}
      </p>
      <div className="editor-list">
        {draft.map((s, i) => (
          <div className="editor-row" key={s.id}>
            <span>{i + 1}</span>
            <input
              aria-label={`${t("Họ tên", "Full name")} ${i + 1}`}
              value={s.name}
              placeholder={t("Họ và tên", "Full name")}
              onChange={(e) =>
                setDraft((d) =>
                  d.map((v) =>
                    v.id === s.id ? { ...v, name: e.target.value } : v,
                  ),
                )
              }
            />
            <input
              aria-label={`${t("Mã học sinh", "Student ID")} ${i + 1}`}
              value={s.code}
              placeholder={t("Mã (tùy chọn)", "ID (optional)")}
              onChange={(e) =>
                setDraft((d) =>
                  d.map((v) =>
                    v.id === s.id ? { ...v, code: e.target.value } : v,
                  ),
                )
              }
            />
            <button
              className="icon-button"
              aria-label={`${t("Xóa fan", "Delete fan")} ${i + 1}`}
              onClick={() => setDraft((d) => d.filter((v) => v.id !== s.id))}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
      <button
        className="secondary"
        onClick={() =>
          setDraft((d) => [
            ...d,
            { id: crypto.randomUUID(), name: "", code: "" },
          ])
        }
      >
        <Plus size={17} />
        {t("Thêm fan", "Add fan")}
      </button>
      <div className="modal-actions">
        <button className="secondary" onClick={onClose}>
          {t("Hủy", "Cancel")}
        </button>
        <button
          className="primary"
          disabled={draft.some((s) => !clean(s.name))}
          onClick={() => {
            onSave(
              draft.map((s) => ({
                ...s,
                name: clean(s.name),
                code: clean(s.code),
              })),
            );
            onClose();
          }}
        >
          {t(`Lưu ${draft.length} fan`, `Save ${draft.length} fans`)}
        </button>
      </div>
    </Modal>
  );
}
