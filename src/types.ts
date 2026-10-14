export type Screen = "welcome" | "fanzone" | "concert" | "reveal";
export type Phase = "idle" | "scanning" | "countdown" | "inviting" | "revealed";
export type Locale = "vi" | "en";
export interface Student {
  id: string;
  name: string;
  code: string;
}
export interface Settings {
  locale: Locale;
  sound: boolean;
  speed: "fast" | "normal" | "dramatic";
  noRepeat: boolean;
  reducedMotion: boolean;
  fansPerPick: number;
  faceZoom: number;
  faceX: number;
  faceY: number;
  musicVolume: number;
  musicLoop: boolean;
  musicDuck: boolean;
}
export interface HistoryEntry {
  id: string;
  studentId: string;
  name: string;
  code: string;
  classId: string;
  className: string;
  round: number;
  order: number;
  at: string;
  pickId: string;
}
export interface Pick {
  id: string;
  students: Student[];
  at: string;
}
export interface AppState {
  version: 1;
  screen: Screen;
  classId: string;
  className: string;
  students: Student[];
  called: string[];
  round: number;
  history: HistoryEntry[];
  settings: Settings;
  pending: Pick | null;
  lastPick: Pick | null;
}
export interface DraftStudent {
  name: string;
  code: string;
  row: number;
}
export interface SheetData {
  name: string;
  rows: string[][];
}
export interface ParsedFile {
  sheets: SheetData[];
  source: string;
  plain: boolean;
  warnings: string[];
}
export interface ParsePreview {
  students: DraftStudent[];
  headers: string[];
  nameColumn: number;
  surnameColumn: number;
  codeColumn: number;
  headerRow: number;
  uncertain: boolean;
  skipped: { row: number; reason: string }[];
  totalRows: number;
}
export type Translate = (vi: string, en: string) => string;
