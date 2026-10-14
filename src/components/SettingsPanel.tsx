import { JENO_PORTRAIT } from "../lib/assets";
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { JenoCharacter } from "./Characters";
import type { Settings, Translate } from "../types";
export function SettingsPanel({
  settings,
  onChange,
  onClose,
  t,
  face,
  onFace,
  faceError,
  busy,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onClose: () => void;
  t: Translate;
  face: string | null;
  onFace: (file: File | null) => void;
  faceError: string;
  busy: boolean;
}) {
  return (
    <Modal
      title={t("Backstage · Cài đặt", "Backstage · Settings")}
      onClose={onClose}
    >
      <div className="settings-content">
        <label className="setting-line">
          <span>
            <strong>{t("Hiệu ứng sân khấu", "Stage sound effects")}</strong>
            <small>
              {t(
                "Click, spotlight, countdown và reveal",
                "Click, spotlight, countdown and reveal",
              )}
            </small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => onChange({ sound: e.target.checked })}
          />
        </label>
        <label className="setting-line">
          <span>
            <strong>No Repeat</strong>
            <small>
              {t(
                "Mỗi fan một lần trong vòng hiện tại",
                "Each fan once per round",
              )}
            </small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={settings.noRepeat}
            disabled={busy}
            onChange={(e) => onChange({ noRepeat: e.target.checked })}
          />
        </label>
        <label className="setting-line">
          <span>
            <strong>{t("Giảm chuyển động", "Reduced motion")}</strong>
            <small>
              {t(
                "Tự động tôn trọng cài đặt của thiết bị",
                "Also respects your device preference",
              )}
            </small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => onChange({ reducedMotion: e.target.checked })}
          />
        </label>
        <div className="form-grid">
          <label>
            {t("Nhịp concert", "Animation speed")}
            <select
              value={settings.speed}
              disabled={busy}
              onChange={(e) =>
                onChange({ speed: e.target.value as Settings["speed"] })
              }
            >
              <option value="fast">Fast</option>
              <option value="normal">Normal</option>
              <option value="dramatic">Dramatic</option>
            </select>
          </label>
          <label>
            {t("Ngôn ngữ", "Language")}
            <select
              value={settings.locale}
              onChange={(e) =>
                onChange({ locale: e.target.value as Settings["locale"] })
              }
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <label className="setting-line">
          <span>
            <strong>
              {t("Hạ nhạc khi chọn fan", "Lower music during selection")}
            </strong>
            <small>
              {t(
                "Nhạc nền nhỏ lại khi spotlight và công bố",
                "Duck the soundtrack during the spotlight sequence",
              )}
            </small>
          </span>
          <input
            role="switch"
            type="checkbox"
            checked={settings.musicDuck}
            onChange={(e) => onChange({ musicDuck: e.target.checked })}
          />
        </label>
        <section className="face-settings">
          <span className="tiny-label">JENO’S LOOK</span>
          <h3>{t("Gắn khuôn mặt cho Jeno", "Give Jeno his face")}</h3>
          <p className="muted">
            {t(
              "Đã có ảnh mặt Jeno thật. Bạn có thể thay ảnh và chỉnh crop; ảnh riêng chỉ lưu trong trình duyệt.",
              "A real Jeno face photo is included. Replace it or adjust the crop. Your uploads stay in this browser.",
            )}
          </p>
          <div className="face-crop">
            <svg
              viewBox="0 0 130 180"
              aria-label={t(
                "Xem trước crop mặt Jeno",
                "Jeno face crop preview",
              )}
            >
              <g transform="translate(15 8)">
                <JenoCharacter phase="idle" face={face} settings={settings} />
              </g>
            </svg>
            <div>
              <label className="secondary upload-face">
                <ImagePlus size={17} />
                {t("Chọn ảnh mặt", "Choose face photo")}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFace(f);
                    e.target.value = "";
                  }}
                  aria-label={t("Tải ảnh mặt Jeno", "Upload Jeno face")}
                />
              </label>
              <p className="muted fine-print">PNG · JPG · WEBP · 5 MB</p>
              {face && face !== JENO_PORTRAIT && (
                <button className="text-button" onClick={() => onFace(null)}>
                  <Trash2 size={14} />
                  {t("Ảnh Jeno mặc định", "Default Jeno photo")}
                </button>
              )}
            </div>
          </div>
          {faceError && (
            <p className="alert error" role="alert">
              {faceError}
            </p>
          )}
          {face && (
            <div className="crop-sliders">
              <label>
                {t("Phóng to", "Zoom")}
                <span>{settings.faceZoom.toFixed(2)}×</span>
                <input
                  aria-label={t("Zoom ảnh mặt", "Face zoom")}
                  type="range"
                  min=".65"
                  max="3"
                  step=".05"
                  value={settings.faceZoom}
                  onChange={(e) =>
                    onChange({ faceZoom: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                {t("Vị trí ngang", "Horizontal position")}
                <input
                  aria-label={t("Vị trí ảnh ngang", "Face horizontal position")}
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={settings.faceX}
                  onChange={(e) => onChange({ faceX: Number(e.target.value) })}
                />
              </label>
              <label>
                {t("Vị trí dọc", "Vertical position")}
                <input
                  aria-label={t("Vị trí ảnh dọc", "Face vertical position")}
                  type="range"
                  min="-30"
                  max="30"
                  step="1"
                  value={settings.faceY}
                  onChange={(e) => onChange({ faceY: Number(e.target.value) })}
                />
              </label>
              <button
                className="text-button"
                onClick={() => onChange({ faceZoom: 1, faceX: 0, faceY: 0 })}
              >
                <RotateCcw size={14} />
                {t("Đặt lại crop", "Reset crop")}
              </button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
