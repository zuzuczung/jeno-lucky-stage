import type { AppState, HistoryEntry, Pick, Student } from "../types";
import { createState, defaultSettings } from "./model";
export const STORAGE_KEY = "jeno-lucky-stage:v1";
function isStudent(x: unknown): x is Student {
  const v = x as Student;
  return (
    !!v &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.code === "string"
  );
}
function isPick(x: unknown): x is Pick {
  const p = x as Pick;
  return (
    !!p &&
    typeof p.id === "string" &&
    typeof p.at === "string" &&
    Array.isArray(p.students) &&
    p.students.every(isStudent)
  );
}
function isHistory(x: unknown): x is HistoryEntry {
  const h = x as HistoryEntry;
  return (
    !!h &&
    [
      "id",
      "studentId",
      "name",
      "code",
      "classId",
      "className",
      "at",
      "pickId",
    ].every(
      (k) => typeof (h as unknown as Record<string, unknown>)[k] === "string",
    ) &&
    Number.isInteger(h.round) &&
    Number.isInteger(h.order)
  );
}
export function loadState(): { state: AppState; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createState(), warning: "" };
    const s = JSON.parse(raw) as AppState;
    if (
      s.version !== 1 ||
      !Array.isArray(s.students) ||
      !s.students.every(isStudent) ||
      new Set(s.students.map((x) => x.id)).size !== s.students.length ||
      !Array.isArray(s.called) ||
      !s.called.every((x) => typeof x === "string") ||
      !Array.isArray(s.history) ||
      !s.history.every(isHistory) ||
      typeof s.classId !== "string" ||
      typeof s.className !== "string" ||
      !Number.isInteger(s.round) ||
      s.round < 1 ||
      !s.settings ||
      (s.pending !== null && !isPick(s.pending)) ||
      (s.lastPick !== null && !isPick(s.lastPick))
    )
      throw new Error("Invalid saved state");
    const settings = { ...defaultSettings, ...s.settings };
    settings.locale = settings.locale === "en" ? "en" : "vi";
    settings.speed = ["fast", "normal", "dramatic"].includes(settings.speed)
      ? settings.speed
      : "normal";
    settings.fansPerPick = Math.max(
      1,
      Math.min(5, Math.floor(Number(settings.fansPerPick) || 1)),
    );
    for (const k of [
      "sound",
      "noRepeat",
      "reducedMotion",
      "musicLoop",
      "musicDuck",
    ] as const)
      settings[k] =
        typeof settings[k] === "boolean" ? settings[k] : defaultSettings[k];
    for (const k of ["faceZoom", "faceX", "faceY"] as const)
      settings[k] = Number.isFinite(settings[k])
        ? settings[k]
        : defaultSettings[k];
    settings.musicVolume = Number.isFinite(settings.musicVolume)
      ? Math.max(0, Math.min(1, settings.musicVolume))
      : defaultSettings.musicVolume;
    if (s.pending) {
      s.lastPick = s.pending;
      s.pending = null;
      s.screen = "reveal";
    }
    if (!["welcome", "fanzone", "concert", "reveal"].includes(s.screen))
      s.screen = "welcome";
    if (!s.students.length && s.screen !== "welcome") s.screen = "fanzone";
    return { state: { ...s, settings }, warning: "" };
  } catch {
    return {
      state: createState(),
      warning:
        "Không đọc được dữ liệu đã lưu. Bạn có thể nhập lại lớp; dữ liệu lỗi chưa bị xóa. / Saved data could not be read.",
    };
  }
}
export function saveState(state: AppState): string {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return "";
  } catch {
    return "Trình duyệt không thể lưu dữ liệu (bộ nhớ đầy hoặc bị chặn). Phiên hiện tại vẫn hoạt động; hãy xuất lịch sử. / Browser storage unavailable.";
  }
}
function faceDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("jeno-face", 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("images"))
        request.result.createObjectStore("images");
      if (!request.result.objectStoreNames.contains("tracks"))
        request.result.createObjectStore("tracks");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export interface SavedTrack {
  blob: Blob;
  name: string;
}
export async function readTrack(): Promise<SavedTrack | null> {
  const db = await faceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("tracks");
    const r = tx.objectStore("tracks").get("background");
    r.onsuccess = () =>
      resolve(
        r.result?.blob instanceof Blob && typeof r.result.name === "string"
          ? r.result
          : null,
      );
    r.onerror = () => reject(r.error);
    tx.oncomplete = () => db.close();
  });
}
export async function writeTrack(track: SavedTrack | null): Promise<void> {
  const db = await faceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("tracks", "readwrite");
    if (track) tx.objectStore("tracks").put(track, "background");
    else tx.objectStore("tracks").delete("background");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function readFace(): Promise<Blob | null> {
  const db = await faceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images");
    const r = tx.objectStore("images").get("face");
    r.onsuccess = () => resolve(r.result instanceof Blob ? r.result : null);
    r.onerror = () => reject(r.error);
    tx.oncomplete = () => db.close();
  });
}
export async function writeFace(blob: Blob | null): Promise<void> {
  const db = await faceDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("images", "readwrite");
    if (blob) tx.objectStore("images").put(blob, "face");
    else tx.objectStore("images").delete("face");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
