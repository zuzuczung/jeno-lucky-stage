import { useState } from "react";
import { Download, History, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { downloadText, historyCSV } from "../lib/csvExport";
import type { HistoryEntry, Translate } from "../types";
export function HistoryPanel({
  history,
  classId,
  onClear,
  onClose,
  t,
  locale,
}: {
  history: HistoryEntry[];
  classId: string;
  onClear: () => void;
  onClose: () => void;
  t: Translate;
  locale: string;
}) {
  const [all, setAll] = useState(false),
    [confirm, setConfirm] = useState(false);
  const entries = history.filter((h) => all || h.classId === classId);
  return (
    <Modal
      title={t("Những khoảnh khắc may mắn", "Lucky moments · History")}
      onClose={onClose}
      wide
    >
      <div className="history-toolbar">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={all}
            onChange={(e) => setAll(e.target.checked)}
          />
          {t("Xem mọi lớp", "Show all classes")}
        </label>
        <button
          className="secondary"
          disabled={!entries.length}
          onClick={() => downloadText(historyCSV(entries), "jeno-history.csv")}
        >
          <Download size={16} />
          {t("Xuất CSV", "Export CSV")}
        </button>
      </div>
      {entries.length ? (
        <div className="history-list">
          {[...entries].reverse().map((h) => (
            <div className="history-entry" key={h.id}>
              <span className="history-number">
                {String(h.order).padStart(2, "0")}
              </span>
              <div>
                <strong>{h.name}</strong>
                <small>
                  {h.className || t("Lớp chưa đặt tên", "Unnamed class")} ·{" "}
                  {t("Vòng", "Round")} {h.round}
                  {h.code ? " · " + h.code : ""}
                </small>
              </div>
              <time dateTime={h.at}>
                {new Date(h.at).toLocaleString(
                  locale === "vi" ? "vi-VN" : "en-GB",
                )}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <History size={32} />
          <h3>
            {t("Concert chưa bắt đầu", "The concert is just getting started")}
          </h3>
          <p>
            {t(
              "Fan được chọn sẽ xuất hiện ở đây.",
              "Your lucky fans will appear here.",
            )}
          </p>
        </div>
      )}
      <div className="history-clear">
        {confirm ? (
          <>
            <p>
              {t(
                "Xóa toàn bộ lịch sử các lớp? Trạng thái đã gọi vẫn giữ nguyên.",
                "Clear all class history? No Repeat status will remain.",
              )}
            </p>
            <button
              className="danger"
              onClick={() => {
                onClear();
                setConfirm(false);
              }}
            >
              {t("Xóa lịch sử", "Clear history")}
            </button>
            <button className="text-button" onClick={() => setConfirm(false)}>
              {t("Hủy", "Cancel")}
            </button>
          </>
        ) : (
          <button
            className="text-button"
            disabled={!history.length}
            onClick={() => setConfirm(true)}
          >
            <Trash2 size={14} />
            {t("Xóa toàn bộ lịch sử", "Clear all history")}
          </button>
        )}
      </div>
    </Modal>
  );
}
