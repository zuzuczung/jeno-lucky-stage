import type { AppState, DraftStudent, Pick, Settings, Student } from "../types";
import { randomPicker } from "./randomPicker";
export const defaultSettings: Settings = {
  locale: "vi",
  sound: false,
  speed: "normal",
  noRepeat: true,
  reducedMotion: false,
  fansPerPick: 1,
  faceZoom: 1,
  faceX: 0,
  faceY: 0,
  musicVolume: 0.2,
  musicLoop: true,
  musicDuck: true,
};
export function createState(): AppState {
  return {
    version: 1,
    screen: "welcome",
    classId: crypto.randomUUID(),
    className: "",
    students: [],
    called: [],
    round: 1,
    history: [],
    settings: { ...defaultSettings },
    pending: null,
    lastPick: null,
  };
}
export function makeStudents(
  draft: DraftStudent[],
  classId: string,
  existing: Student[] = [],
): Student[] {
  const used = new Set(existing.map((s) => s.id));
  return draft.map((s) => {
    let id = s.code
      ? `${classId}:${s.code}`
      : `${classId}:${crypto.randomUUID()}`;
    if (used.has(id)) id += `:${crypto.randomUUID()}`;
    used.add(id);
    return {
      id,
      name: s.name.normalize("NFC").trim().replace(/\s+/g, " "),
      code: s.code.trim(),
    };
  });
}
export function confirmRoster(
  state: AppState,
  draft: DraftStudent[],
  mode: "replace" | "append",
  className: string,
): AppState {
  if (mode === "append")
    return {
      ...state,
      className,
      students: [
        ...state.students,
        ...makeStudents(draft, state.classId, state.students),
      ],
      pending: null,
      lastPick: null,
    };
  const classId = crypto.randomUUID();
  return {
    ...state,
    classId,
    className,
    students: makeStudents(draft, classId),
    called: [],
    round: 1,
    pending: null,
    lastPick: null,
  };
}
export function eligibleStudents(state: AppState): Student[] {
  const called = new Set(state.called);
  return state.students.filter(
    (s) => !state.settings.noRepeat || !called.has(s.id),
  );
}
export function beginPick(state: AppState): AppState {
  if (state.pending) return state;
  const chosen = randomPicker(
    eligibleStudents(state),
    state.settings.fansPerPick,
  );
  const pick: Pick = {
    id: crypto.randomUUID(),
    students: chosen.map((s) => ({ ...s })),
    at: new Date().toISOString(),
  };
  const order = state.history.filter((h) => h.classId === state.classId).length;
  return {
    ...state,
    screen: "concert",
    pending: pick,
    lastPick: pick,
    called: [...new Set([...state.called, ...chosen.map((s) => s.id)])],
    history: [
      ...state.history,
      ...chosen.map((s, i) => ({
        id: `${pick.id}:${s.id}`,
        studentId: s.id,
        name: s.name,
        code: s.code,
        classId: state.classId,
        className: state.className,
        round: state.round,
        order: order + i + 1,
        at: pick.at,
        pickId: pick.id,
      })),
    ],
  };
}
export function finishPick(state: AppState): AppState {
  return { ...state, pending: null, screen: "reveal" };
}
export function resetRound(state: AppState): AppState {
  return {
    ...state,
    round: state.round + 1,
    called: [],
    pending: null,
    lastPick: null,
    screen: "concert",
  };
}
const names = [
  "Nguyễn Minh Anh",
  "Trần Gia Bảo",
  "Lê Ngọc Bích",
  "Phạm Tuấn Dũng",
  "Hoàng Hà Giang",
  "Vũ Đức Hải",
  "Đặng Thu Hằng",
  "Bùi Quang Huy",
  "Đỗ Khánh Linh",
  "Hồ Nhật Minh",
  "Ngô Bảo Ngọc",
  "Dương Hoàng Nam",
  "Lý Kim Ngân",
  "Nguyễn Phương Nhi",
  "Trần Thảo My",
  "Lê Anh Quân",
  "Phạm Minh Phúc",
  "Hoàng Ngọc Quỳnh",
  "Vũ Khánh An",
  "Đặng Minh Tâm",
  "Bùi Phương Thảo",
  "Đỗ Thanh Tùng",
  "Hồ Anh Thư",
  "Ngô Hải Yến",
  "Dương Quốc Việt",
  "Lý Đức Vinh",
  "Nguyễn Mai Chi",
  "Trần Nhật Đăng",
  "Lê Hương Giang",
  "Phạm Khánh Hòa",
  "Hoàng Bảo Khang",
  "Vũ Diệu Linh",
  "Đặng Gia Long",
  "Bùi Tuệ Mẫn",
  "Đỗ Hoàng Phong",
  "Hồ Minh Thư",
  "Ngô An Nhiên",
  "Dương Quỳnh Trang",
  "Lý Minh Trí",
  "Nguyễn Khánh Vy",
];
export const demoDraft = names.map((name, i) => ({
  name,
  code: `HS${String(i + 1).padStart(3, "0")}`,
  row: i + 2,
}));
export const demoStudents = demoDraft.map((s, i) => ({
  ...s,
  id: `demo-${i}`,
}));
