import { beforeEach, describe, expect, it, vi } from "vitest";
import { secureIndex, randomPicker } from "../src/lib/randomPicker";
import {
  beginPick,
  confirmRoster,
  createState,
  demoDraft,
  eligibleStudents,
  finishPick,
  resetRound,
} from "../src/lib/model";
import { historyCSV } from "../src/lib/csvExport";
import { loadState, saveState, STORAGE_KEY } from "../src/lib/storage";
import { crowdPositions } from "../src/components/ConcertScene";
beforeEach(() => localStorage.clear());
describe("uniform random selection", () => {
  it("rejects the biased tail before returning an index", () => {
    let calls = 0;
    expect(
      secureIndex(3, (a) => {
        a[0] = calls++ === 0 ? 0xffffffff : 5;
      }),
    ).toBe(2);
    expect(calls).toBe(2);
  });
  it("samples without replacement and rejects invalid counts", () => {
    const values = Array.from({ length: 100 }, (_, i) => i);
    const picked = randomPicker(values, 100);
    expect(new Set(picked).size).toBe(100);
    expect(() => randomPicker([], 1)).toThrow();
    expect(() => randomPicker([1], 2)).toThrow();
    expect(() => secureIndex(0)).toThrow();
  });
});
describe("selection persistence and class lifecycle", () => {
  it("migrates existing saved classes to music settings without losing selection/history", () => {
    const original = beginPick(
      confirmRoster(createState(), demoDraft, "replace", "Existing class"),
    );
    const old = JSON.parse(JSON.stringify(original));
    delete old.settings.musicVolume;
    delete old.settings.musicLoop;
    delete old.settings.musicDuck;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(old));
    const loaded = loadState();
    expect(loaded.warning).toBe("");
    expect(loaded.state.students).toEqual(original.students);
    expect(loaded.state.called).toEqual(original.called);
    expect(loaded.state.history).toEqual(original.history);
    expect(loaded.state.settings.musicVolume).toBe(0.2);
    expect(loaded.state.settings.musicLoop).toBe(true);
    expect(loaded.state.settings.musicDuck).toBe(true);
    expect(loaded.state.screen).toBe("reveal");
  });
  it("clamps malformed saved music volume and safely defaults music toggles", () => {
    const raw = JSON.parse(JSON.stringify(createState()));
    raw.settings.musicVolume = 4;
    raw.settings.musicLoop = "broken";
    raw.settings.musicDuck = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    const settings = loadState().state.settings;
    expect(settings.musicVolume).toBe(1);
    expect(settings.musicLoop).toBe(true);
    expect(settings.musicDuck).toBe(true);
    expect(settings.noRepeat).toBe(true);
  });
  it("locks only once, commits history once, and keeps the same result after skip / reload", () => {
    let s = confirmRoster(createState(), demoDraft, "replace", "10A1");
    s = beginPick(s);
    const result = s.pending!;
    expect(beginPick(s)).toBe(s);
    saveState(s);
    const reloaded = loadState().state;
    expect(reloaded.screen).toBe("reveal");
    expect(reloaded.lastPick).toEqual(result);
    expect(reloaded.history).toHaveLength(1);
    expect(reloaded.called).toEqual(result.students.map((s) => s.id));
    expect(finishPick(s).lastPick).toEqual(result);
  });
  it("retains IDs and No Repeat when a selected name changes", () => {
    let s = beginPick(
      confirmRoster(createState(), demoDraft, "replace", "10A1"),
    );
    const id = s.called[0];
    s = {
      ...finishPick(s),
      students: s.students.map((v) =>
        v.id === id ? { ...v, name: "Tên mới" } : v,
      ),
    };
    expect(s.students.find((x) => x.id === id)?.name).toBe("Tên mới");
    expect(eligibleStudents(s)).toHaveLength(39);
    expect(eligibleStudents(s).some((x) => x.id === id)).toBe(false);
  });
  it("supports 1 student, exhaustion, explicit reset and Allow Repeat", () => {
    let s = confirmRoster(
      createState(),
      demoDraft.slice(0, 1),
      "replace",
      "One",
    );
    s = finishPick(beginPick(s));
    expect(eligibleStudents(s)).toHaveLength(0);
    expect(() => beginPick(s)).toThrow();
    s = resetRound(s);
    expect(eligibleStudents(s)).toHaveLength(1);
    expect(s.history).toHaveLength(1);
    expect(s.round).toBe(2);
    s = finishPick(beginPick(s));
    s = { ...s, settings: { ...s.settings, noRepeat: false } };
    expect(eligibleStudents(s)).toHaveLength(1);
    expect(beginPick(s).history).toHaveLength(3);
  });
  it("supports multi-fan picks, append, replacement, and separate class history", () => {
    let s = confirmRoster(createState(), demoDraft, "replace", "A");
    s.settings.fansPerPick = 5;
    s = finishPick(beginPick(s));
    expect(new Set(s.called).size).toBe(5);
    const id = s.classId;
    s = confirmRoster(
      s,
      [{ name: "Fan mới", code: "X", row: 0 }],
      "append",
      "A",
    );
    expect(s.classId).toBe(id);
    expect(s.called).toHaveLength(5);
    s = confirmRoster(s, demoDraft, "replace", "B");
    expect(s.classId).not.toBe(id);
    expect(s.called).toEqual([]);
    expect(s.history.every((h) => h.classId === id)).toBe(true);
  });
  it("keeps identical names with distinct codes separate and gives no-code duplicates unique IDs", () => {
    const draft = [
      { name: "Nguyễn An", code: "A", row: 1 },
      { name: "Nguyễn An", code: "B", row: 2 },
      { name: "Trần An", code: "", row: 3 },
      { name: "Trần An", code: "", row: 4 },
    ];
    const s = confirmRoster(createState(), draft, "replace", "A");
    expect(new Set(s.students.map((v) => v.id)).size).toBe(4);
    expect(s.students[0].id.endsWith(":A")).toBe(true);
  });
  it("handles corrupt storage and quota without overwriting corrupt data", () => {
    localStorage.setItem(STORAGE_KEY, "broken");
    expect(loadState().warning).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEY)).toBe("broken");
    const mock = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Quota exceeded");
      });
    expect(saveState(createState())).toContain("không thể lưu");
    mock.mockRestore();
  });
  it("renders stable distinct positions for 40, 60 and 100 fans", () => {
    for (const size of [40, 60, 100]) {
      const s = confirmRoster(
        createState(),
        Array.from({ length: size }, (_, i) => ({
          name: `Fan ${i}`,
          code: String(i),
          row: i,
        })),
        "replace",
        "Test",
      );
      const positions = crowdPositions(s.students);
      expect(positions.size).toBe(size);
      expect(
        new Set([...positions.values()].map((p) => `${p.x},${p.y}`)).size,
      ).toBe(size);
      expect([...positions.values()].every((p) => p.x < 550 || p.x > 640)).toBe(
        true,
      );
      expect(crowdPositions(s.students)).toEqual(positions);
    }
  });
  it("exports Vietnamese, quotes and newlines correctly", () => {
    const s = beginPick(
      confirmRoster(
        createState(),
        [{ name: 'Nguyễn "An", Bình', code: "A", row: 1 }],
        "replace",
        "Lớp\nA",
      ),
    );
    const csv = historyCSV(s.history);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Nguyễn ""An"", Bình"');
    expect(csv).toContain('"Lớp\nA"');
  });
});
