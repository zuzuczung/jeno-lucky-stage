import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  History,
  Maximize,
  Mic2,
  Music2,
  RotateCcw,
  Settings2,
  SkipForward,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { MusicPlayer } from "./components/MusicPlayer";
import { JENO_PORTRAIT } from "./lib/assets";
import { ConcertScene } from "./components/ConcertScene";
import { ClassFileImporter } from "./components/ClassFileImporter";
import { HistoryPanel } from "./components/HistoryPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { StudentEditor } from "./components/StudentEditor";
import { Modal } from "./components/Modal";
import {
  beginPick,
  confirmRoster,
  demoStudents,
  eligibleStudents,
  finishPick,
  resetRound,
} from "./lib/model";
import { loadState, readFace, saveState, writeFace } from "./lib/storage";
import { playSound, stopAudio } from "./lib/audio";
import { useSelection } from "./lib/useSelection";
import type { AppState, DraftStudent, Settings, Translate } from "./types";
type Panel = "settings" | "history" | "editor" | "help" | null;
export default function App() {
  const [initial] = useState(loadState),
    [state, setState] = useState(initial.state),
    [notice, setNotice] = useState(initial.warning),
    [panel, setPanel] = useState<Panel>(null),
    [face, setFace] = useState<string | null>(JENO_PORTRAIT),
    [faceError, setFaceError] = useState(""),
    [projection, setProjection] = useState(false),
    [resetConfirm, setResetConfirm] = useState(false),
    [easter, setEaster] = useState(false);
  const current = useRef(state),
    faceRequest = useRef(0),
    logoClicks = useRef(0),
    easterTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    faceURL = useRef<string | null>(null);
  const t: Translate = useCallback(
    (vi, en) => (state.settings.locale === "vi" ? vi : en),
    [state.settings.locale],
  );
  const deviceReduced = useReducedMotion(),
    reduced = state.settings.reducedMotion || !!deviceReduced;
  const update = useCallback((fn: (state: AppState) => AppState) => {
    const next = fn(current.current);
    current.current = next;
    const warning = saveState(next);
    if (warning) setNotice(warning);
    setState(next);
  }, []);
  const finish = useCallback(() => update((s) => finishPick(s)), [update]);
  const selection = useSelection(state, reduced, finish);
  const setSettings = useCallback(
    (patch: Partial<Settings>) => {
      if (patch.sound === false) stopAudio();
      update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },
    [update],
  );
  useEffect(() => {
    document.documentElement.lang = state.settings.locale;
  }, [state.settings.locale]);
  useEffect(() => {
    let alive = true;
    void readFace()
      .then((blob) => {
        if (alive && blob) {
          const url = URL.createObjectURL(blob);
          faceURL.current = url;
          setFace(url);
        }
      })
      .catch(() => {
        if (alive)
          setFaceError(
            "Không thể đọc ảnh đã lưu / Cannot load saved face photo.",
          );
      });
    return () => {
      alive = false;
      if (faceURL.current) URL.revokeObjectURL(faceURL.current);
      stopAudio();
      if (logoTimer.current) clearTimeout(logoTimer.current);
      if (easterTimer.current) clearTimeout(easterTimer.current);
    };
  }, []);
  async function changeFace(file: File | null) {
    const token = ++faceRequest.current;
    setFaceError("");
    try {
      if (file) {
        if (file.size > 5 * 1024 * 1024)
          throw new Error(t("Ảnh tối đa 5 MB", "Maximum image size is 5 MB"));
        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
          throw new Error(
            t("Chọn ảnh PNG, JPG hoặc WEBP", "Choose PNG, JPG or WEBP"),
          );
        const testURL = URL.createObjectURL(file);
        try {
          const image = new Image();
          image.src = testURL;
          await image.decode();
        } finally {
          URL.revokeObjectURL(testURL);
        }
      }
      await writeFace(file);
      if (token !== faceRequest.current) return;
      if (faceURL.current) URL.revokeObjectURL(faceURL.current);
      const url = file ? URL.createObjectURL(file) : JENO_PORTRAIT;
      faceURL.current = file ? url : null;
      setFace(url);
      setSettings({ faceZoom: 1, faceX: 0, faceY: 0 });
    } catch (e) {
      if (token === faceRequest.current)
        setFaceError(
          e instanceof Error
            ? e.message
            : t("Không thể lưu ảnh", "Cannot save photo"),
        );
    }
  }
  const lastConfetti = useRef("");
  useEffect(() => {
    if (
      state.screen !== "reveal" ||
      !state.lastPick ||
      lastConfetti.current === state.lastPick.id
    )
      return;
    lastConfetti.current = state.lastPick.id;
    playSound("reveal", current.current.settings.sound);
    if (reduced) return;
    const colors = ["#C5FF59", "#FFF1AC", "#79D7C1", "#FFFFFF"];
    const timers = [
      setTimeout(() => {
        for (const side of [0, 1])
          void confetti({
            particleCount: 78,
            spread: 56,
            angle: side ? 125 : 55,
            startVelocity: 50,
            origin: { x: side ? 0.92 : 0.08, y: 0.72 },
            colors,
            disableForReducedMotion: true,
            ticks: 175,
          });
      }, 100),
      setTimeout(() => {
        void confetti({
          particleCount: 55,
          spread: 110,
          startVelocity: 34,
          origin: { x: 0.5, y: 0.38 },
          colors,
          disableForReducedMotion: true,
          ticks: 150,
        });
      }, 450),
    ];
    return () => {
      timers.forEach(clearTimeout);
      confetti.reset();
    };
  }, [state.screen, state.lastPick, reduced]);
  useEffect(() => {
    // Keep the projector layout active even if the browser leaves native fullscreen.
    const handler = () => {
      if (document.fullscreenElement) setProjection(true);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  async function fullscreen() {
    if (projection || document.fullscreenElement) {
      setProjection(false);
      if (document.fullscreenElement)
        await document.exitFullscreen().catch(() => {});
      return;
    }
    setProjection(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setProjection(true);
      } else {
        setNotice(
          t(
            "Chế độ máy chiếu đang dùng bố cục mở rộng. Dùng chế độ toàn màn hình của trình duyệt nếu cần.",
            "Projection layout enabled. Use the browser fullscreen command if needed.",
          ),
        );
      }
    } catch {
      setNotice(
        t(
          "Trình duyệt chặn fullscreen; đã bật bố cục máy chiếu.",
          "Fullscreen unavailable; projection layout enabled.",
        ),
      );
    }
  }
  const start = useCallback(() => {
    const s = current.current;
    if (s.pending || s.screen !== "concert") return;
    const available = eligibleStudents(s);
    if (available.length < s.settings.fansPerPick) {
      setNotice(
        s.settings.locale === "vi"
          ? `Còn ${available.length} fan đủ điều kiện. Hãy giảm số fan mỗi lượt hoặc bắt đầu vòng mới.`
          : `Only ${available.length} eligible fans remain. Reduce the pick size or reset the round.`,
      );
      return;
    }
    playSound("click", s.settings.sound);
    update(beginPick);
  }, [update]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.code !== "Space" && e.key !== "Enter") ||
        e.repeat ||
        panel ||
        resetConfirm ||
        current.current.screen !== "concert" ||
        current.current.pending
      )
        return;
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'input,textarea,select,button,a,[role="button"],[contenteditable="true"]',
        )
      )
        return;
      e.preventDefault();
      start();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panel, resetConfirm, start]);
  function go(screen: AppState["screen"]) {
    if (current.current.pending) return;
    playSound("click", state.settings.sound);
    update((s) => ({ ...s, screen }));
    setNotice("");
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }
  function confirm(
    draft: DraftStudent[],
    mode: "replace" | "append",
    className: string,
  ) {
    update((s) => confirmRoster(s, draft, mode, className));
    setNotice(
      t(
        `${draft.length} fan đã có vé. Sẵn sàng cho concert!`,
        `${draft.length} fans are checked in. Ready for the concert!`,
      ),
    );
  }
  function logoClick() {
    logoClicks.current++;
    if (logoTimer.current) clearTimeout(logoTimer.current);
    logoTimer.current = setTimeout(() => {
      logoClicks.current = 0;
    }, 2500);
    if (logoClicks.current === 5) {
      setEaster(true);
      logoClicks.current = 0;
      void confetti({
        particleCount: 35,
        colors: ["#C5FF59"],
        disableForReducedMotion: true,
      });
      easterTimer.current = setTimeout(() => setEaster(false), 3500);
    }
  }
  const available = eligibleStudents(state),
    calledCount = state.students.filter((s) =>
      state.called.includes(s.id),
    ).length,
    busy = !!state.pending,
    selected =
      (state.screen === "reveal" ? state.lastPick : state.pending)?.students ||
      [];
  const sceneProps = {
    students: state.screen === "welcome" ? demoStudents : state.students,
    called: state.screen === "welcome" ? [] : state.called,
    phase: selection.phase,
    scannedId: selection.scannedId,
    selected,
    activeFan: selection.activeFan,
    arrived: selection.arrived,
    countdown: selection.countdown,
    settings: state.settings,
    face,
    reduced,
    t,
  };
  const names = selected.map((s) => s.name);
  return (
    <div
      className={`app ${projection ? "projection" : ""} ${reduced ? "reduce-motion" : ""}`}
    >
      <header className="header">
        <button
          className="brand"
          onClick={logoClick}
          aria-label="Jeno’s Lucky Stage logo"
        >
          <span className="brand-mark">
            <Zap size={20} fill="currentColor" />
          </span>
          <span>
            JENO’S<span className="brand-sub">LUCKY STAGE</span>
          </span>
        </button>
        <nav aria-label={t("Điều hướng concert", "Concert navigation")}>
          <button
            className={state.screen === "welcome" ? "nav-active" : ""}
            onClick={() => go("welcome")}
            disabled={busy}
          >
            01 <span>{t("Chào mừng", "Welcome")}</span>
          </button>
          <ChevronRight size={12} />
          <button
            className={state.screen === "fanzone" ? "nav-active" : ""}
            onClick={() => go("fanzone")}
            disabled={busy}
          >
            02 <span>Fan Zone</span>
          </button>
          <ChevronRight size={12} />
          <button
            className={
              ["concert", "reveal"].includes(state.screen) ? "nav-active" : ""
            }
            onClick={() => go("concert")}
            disabled={busy || !state.students.length}
          >
            03 <span>Concert</span>
          </button>
        </nav>
        <div className="header-actions">
          <MusicPlayer
            settings={state.settings}
            onChange={setSettings}
            busy={busy}
            t={t}
          />

          <button
            className="icon-button sound-button"
            onClick={() => {
              setSettings({ sound: !state.settings.sound });
              playSound("click", !state.settings.sound);
            }}
            aria-label={
              state.settings.sound
                ? t("Tắt hiệu ứng sân khấu", "Turn stage sound effects off")
                : t("Bật hiệu ứng sân khấu", "Turn stage sound effects on")
            }
            title={
              state.settings.sound ? "Stage effects ON" : "Stage effects OFF"
            }
          >
            {state.settings.sound ? (
              <Volume2 size={18} />
            ) : (
              <VolumeX size={18} />
            )}
            <span className="sfx-label">SFX</span>
          </button>
          <button
            className="icon-button"
            onClick={() => setPanel("settings")}
            aria-label={t("Cài đặt", "Settings")}
          >
            <Settings2 size={18} />
          </button>
          <button
            className="projector-button fullscreen-button"
            onClick={() => void fullscreen()}
            aria-label={
              projection
                ? t("Thoát chế độ máy chiếu", "Exit projection mode")
                : t(
                    "Chế độ máy chiếu / Toàn màn hình",
                    "Projection mode / Fullscreen",
                  )
            }
          >
            <Maximize size={18} />
            <span>
              {projection ? t("THOÁT", "EXIT") : t("TRÌNH CHIẾU", "PROJECTOR")}
            </span>
          </button>
          <button
            className="language-button"
            onClick={() =>
              setSettings({
                locale: state.settings.locale === "vi" ? "en" : "vi",
              })
            }
          >
            {state.settings.locale.toUpperCase()}
          </button>
        </div>
      </header>
      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            onClick={() => setNotice("")}
            aria-label={t("Đóng thông báo", "Dismiss notice")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.screen}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.22 }}
          >
            {state.screen === "welcome" && (
              <div className="welcome">
                <section className="welcome-intro">
                  <div>
                    <div className="eyebrow">
                      <span className="live-dot" /> THE CLASSROOM CONCERT
                      EXPERIENCE
                    </div>
                    <h1>
                      JENO’S{" "}
                      <span>
                        LUCKY STAGE<span className="title-star">✳</span>
                      </span>
                    </h1>
                    <p className="welcome-subtitle">
                      WHO WILL SING WITH JENO TONIGHT?
                    </p>
                  </div>
                  <div className="welcome-cta">
                    <p>
                      {t(
                        "Biến lớp học thành một concert.",
                        "Turn your class into a concert.",
                      )}
                      <br />
                      {t(
                        "Một spotlight. Một khoảnh khắc của bạn.",
                        "One spotlight. Your moment to shine.",
                      )}
                    </p>
                    <button className="primary" onClick={() => go("fanzone")}>
                      ENTER THE CONCERT <ArrowRight size={19} />
                    </button>
                    <span className="private-note">
                      <Check size={13} />
                      {t(
                        "Không cần tài khoản · Danh sách ở trên máy bạn",
                        "No account needed · Your class stays on your device",
                      )}
                    </span>
                  </div>
                </section>
                <div className="welcome-stage-wrap">
                  <ConcertScene {...sceneProps} welcome />
                  <div className="stage-caption">
                    <span className="caption-tag">
                      <Music2 size={13} /> JENO × YOUR CLASS
                    </span>
                    <span>
                      {t(
                        "40 fan đang chờ. Còn bạn?",
                        "40 fans are waiting. What about you?",
                      )}
                    </span>
                  </div>
                </div>
                <div className="welcome-foot">
                  <span>FAN-MADE EXPERIENCE · JUST FOR FUN</span>
                  <button
                    className="text-button"
                    onClick={() => setPanel("help")}
                  >
                    <CircleHelp size={14} />
                    {t(
                      "Concert hoạt động như thế nào?",
                      "How does the concert work?",
                    )}
                  </button>
                </div>
              </div>
            )}
            {state.screen === "fanzone" && (
              <div className="fanzone">
                <div className="page-heading">
                  <div>
                    <div className="eyebrow">02 / CHECK IN</div>
                    <h1>
                      FAN ZONE<span className="lime">.</span>
                    </h1>
                    <p>
                      IMPORT CLASS LIST{" "}
                      <span className="heading-divider">/</span>{" "}
                      {t(
                        "Trao một tấm vé cho mỗi học sinh.",
                        "A ticket for every student.",
                      )}
                    </p>
                  </div>
                  <span className="outline-tag">
                    <Users size={15} />
                    {state.students.length}{" "}
                    {t("FAN ĐÃ CHECK IN", "FANS CHECKED IN")}
                  </span>
                </div>
                <div className="fanzone-layout">
                  <div className="import-column">
                    <ClassFileImporter
                      onConfirm={confirm}
                      className={state.className}
                      students={state.students}
                      t={t}
                    />
                    <div className="class-controls">
                      <div className="section-heading">
                        <div>
                          <span className="tiny-label">
                            {t("DANH SÁCH ĐANG DÙNG", "CURRENT CLASS")}
                          </span>
                          <h3>
                            {state.className || t("Lớp của bạn", "Your class")}
                          </h3>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => setPanel("editor")}
                        >
                          {t("Thêm / sửa fan", "Add / edit fans")}{" "}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                      <label className="count-control">
                        <span>
                          {t("Số fan mỗi lượt", "Fans per pick")}
                          <small>
                            {t(
                              "Mời từ 1 đến 5 fan lên sân khấu",
                              "Invite 1–5 fans onto the stage",
                            )}
                          </small>
                        </span>
                        <select
                          aria-label={t("Số fan mỗi lượt", "Fans per pick")}
                          value={state.settings.fansPerPick}
                          onChange={(e) =>
                            setSettings({ fansPerPick: Number(e.target.value) })
                          }
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="primary full"
                        disabled={!state.students.length}
                        onClick={() => go("concert")}
                      >
                        GO TO CONCERT <ArrowRight size={18} />
                      </button>
                      {!state.students.length && (
                        <p className="muted fine-print">
                          {t(
                            "Nhập và xác nhận danh sách để mở concert.",
                            "Import and confirm a class list to enter the concert.",
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="fanzone-scene">
                    <div className="scene-section-label">
                      <span>
                        <i /> {t("FAN ZONE CỦA BẠN", "YOUR FAN ZONE")}
                      </span>
                      <span>{t("XEM TRƯỚC TRỰC TIẾP", "LIVE PREVIEW")}</span>
                    </div>
                    {state.students.length ? (
                      <ConcertScene {...sceneProps} />
                    ) : (
                      <div className="empty-crowd">
                        <ConcertScene
                          {...sceneProps}
                          students={demoStudents.slice(0, 20)}
                        />
                        <div className="empty-crowd-overlay">
                          <div className="round-icon">
                            <Users size={26} />
                          </div>
                          <h3>
                            {t(
                              "Lớp bạn sẽ đứng ở đây",
                              "Your class belongs here",
                            )}
                          </h3>
                          <p>
                            {t(
                              "Tải danh sách để tạo đủ nhân vật cho từng học sinh.",
                              "Upload your roster to create a character for every student.",
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="info-strip">
                      <span>
                        <Check size={15} />
                        {t("Một học sinh = một fan", "One student = one fan")}
                      </span>
                      <span>
                        <Check size={15} />
                        {t(
                          "Tên trùng vẫn giữ riêng theo mã",
                          "Same names kept separate by ID",
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {state.screen === "concert" && (
              <div className="concert-page">
                <div className="concert-heading">
                  <div>
                    <div className="eyebrow">03 / THE MAIN EVENT</div>
                    <h1>
                      {busy
                        ? t("SPOTLIGHT ĐANG TÌM BẠN", "FINDING OUR LUCKY FAN")
                        : "IT’S YOUR MOMENT"}
                      <span className="lime">.</span>
                    </h1>
                    <p>
                      {state.className ||
                        t("Concert của lớp bạn", "Your classroom concert")}{" "}
                      <span className="heading-divider">/</span>{" "}
                      {t("Vòng", "Round")} {state.round}
                    </p>
                  </div>
                  <div className="stats">
                    <div>
                      <b>{state.students.length}</b>
                      <span>{t("TỔNG FAN", "TOTAL FANS")}</span>
                    </div>
                    <div>
                      <b>{calledCount}</b>
                      <span>{t("ĐÃ GỌI", "CALLED")}</span>
                    </div>
                    <div>
                      <b className="lime">{available.length}</b>
                      <span>{t("CÒN LẠI", "ELIGIBLE")}</span>
                    </div>
                  </div>
                </div>
                <ConcertScene {...sceneProps} />
                <div className="selection-dock">
                  <div className="selection-status">
                    <span className={`live-dot ${busy ? "pulse" : ""}`} />
                    <div>
                      <strong>
                        {busy
                          ? "JENO IS LOOKING FOR TONIGHT’S LUCKY FAN…"
                          : available.length
                            ? t(
                                "SPOTLIGHT ĐÃ SẴN SÀNG",
                                "THE SPOTLIGHT IS READY",
                              )
                            : t(
                                "CẢ LỚP ĐÃ LÊN SÂN KHẤU!",
                                "EVERY FAN HAS HAD THEIR MOMENT!",
                              )}
                      </strong>
                      <small>
                        {busy
                          ? selection.phase === "inviting"
                            ? t(
                                "Đi theo spotlight lên sân khấu cùng Jeno.",
                                "Follow the spotlight to the stage.",
                              )
                            : t(
                                "Tên của ai sẽ xuất hiện trên màn LED?",
                                "Whose name will light up the LED?",
                              )
                          : available.length
                            ? t(
                                `${state.settings.fansPerPick} fan mỗi lượt · ${state.settings.noRepeat ? "Không lặp lại" : "Cho phép lặp lại"}`,
                                `${state.settings.fansPerPick} fan(s) per pick · ${state.settings.noRepeat ? "No Repeat" : "Allow Repeat"}`,
                              )
                            : t(
                                "Bắt đầu vòng mới để tất cả có cơ hội lần nữa.",
                                "Reset the round to give everyone another chance.",
                              )}
                      </small>
                    </div>
                  </div>
                  {busy ? (
                    <button className="secondary" onClick={finish}>
                      <SkipForward size={17} />
                      SKIP ANIMATION
                    </button>
                  ) : available.length ? (
                    <button
                      className="primary pick-button"
                      onClick={start}
                      disabled={state.settings.fansPerPick > available.length}
                    >
                      <Sparkles size={18} /> LET JENO CHOOSE{" "}
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      className="primary"
                      onClick={() => setResetConfirm(true)}
                    >
                      <RotateCcw size={18} />
                      {t("BẮT ĐẦU VÒNG MỚI", "RESET ROUND")}
                    </button>
                  )}
                </div>
                {!busy &&
                  state.settings.fansPerPick > available.length &&
                  available.length > 0 && (
                    <div className="alert warning">
                      {t(
                        `Chỉ còn ${available.length} fan. Giảm số fan mỗi lượt để tiếp tục.`,
                        `Only ${available.length} fans remain. Reduce the pick size to continue.`,
                      )}
                      <button
                        className="text-button"
                        onClick={() =>
                          setSettings({ fansPerPick: available.length })
                        }
                      >
                        {t(
                          `Chọn ${available.length} fan`,
                          `Pick ${available.length} fans`,
                        )}
                      </button>
                    </div>
                  )}
                <div className="concert-tools">
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => go("fanzone")}
                  >
                    <ArrowLeft size={14} />
                    FAN ZONE
                  </button>
                  <span className="keyboard-tip">
                    {t("Nhấn", "Press")} <kbd>SPACE</kbd>{" "}
                    {t("để chọn", "to pick")}
                  </span>
                  <div>
                    <button
                      className="text-button"
                      onClick={() => setPanel("history")}
                    >
                      <History size={15} />
                      {t("Lịch sử", "History")}
                    </button>
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() => setResetConfirm(true)}
                    >
                      <RotateCcw size={14} />
                      {t("Reset Round", "Reset Round")}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {state.screen === "reveal" && (
              <div className="reveal-page">
                <div className="reveal-heading">
                  <div className="eyebrow">
                    <Sparkles size={14} /> THE SPOTLIGHT IS YOURS
                  </div>
                  <h1>
                    JENO PICKED YOU<span className="lime">!</span>
                  </h1>
                  <p>COME TO THE STAGE AND SING TOGETHER!</p>
                  <div
                    className={`winner-names ${names.length > 1 ? "multiple-winners" : ""}`}
                    role="status"
                    aria-live="polite"
                  >
                    {selected.map((s, i) => (
                      <div key={s.id}>
                        <span className="winner-index">
                          {String(i + 1).padStart(2, "0")} / LUCKY FAN
                        </span>
                        <strong>{s.name}</strong>
                        {s.code && <small>{s.code}</small>}
                      </div>
                    ))}
                  </div>
                </div>
                <ConcertScene {...sceneProps} />
                <div className="reveal-actions">
                  <button className="primary" onClick={() => go("concert")}>
                    <Mic2 size={18} />
                    PICK ANOTHER FAN <ArrowRight size={18} />
                  </button>
                  <button className="secondary" onClick={() => go("fanzone")}>
                    BACK TO FAN ZONE
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setPanel("history")}
                  >
                    <History size={16} />
                    VIEW HISTORY
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="footer">
        <span>
          JENO’S LUCKY STAGE <span>© FAN-MADE, WITH LOVE</span>
        </span>
        <span>
          {t(
            "Lớp học của bạn. Sân khấu của bạn.",
            "Your classroom. Your stage.",
          )}{" "}
          <span className="lime">✦</span>
        </span>
      </footer>
      {panel === "settings" && (
        <SettingsPanel
          settings={state.settings}
          onChange={setSettings}
          onClose={() => setPanel(null)}
          t={t}
          face={face}
          onFace={(f) => void changeFace(f)}
          faceError={faceError}
          busy={busy}
        />
      )}
      {panel === "history" && (
        <HistoryPanel
          history={state.history}
          classId={state.classId}
          onClear={() => update((s) => ({ ...s, history: [] }))}
          onClose={() => setPanel(null)}
          t={t}
          locale={state.settings.locale}
        />
      )}
      {panel === "editor" && (
        <StudentEditor
          students={state.students}
          onSave={(students) =>
            update((s) => ({ ...s, students, lastPick: null }))
          }
          onClose={() => setPanel(null)}
          t={t}
        />
      )}
      {panel === "help" && (
        <Modal
          title={t("Một concert, ba bước", "Your concert in three steps")}
          onClose={() => setPanel(null)}
        >
          <div className="help-steps">
            <p>
              <b>01</b>
              <span>
                {t(
                  "Tải XLSX, CSV, TXT hoặc DOCX. Kiểm tra preview và xác nhận danh sách.",
                  "Upload XLSX, CSV, TXT or DOCX. Review and confirm your roster.",
                )}
              </span>
            </p>
            <p>
              <b>02</b>
              <span>
                {t(
                  "Chọn số fan mỗi lượt rồi để Jeno tìm fan bằng spotlight. Mỗi fan đủ điều kiện có xác suất bằng nhau.",
                  "Choose the pick size and let Jeno find a fan. Every eligible student has equal probability.",
                )}
              </span>
            </p>
            <p>
              <b>03</b>
              <span>
                {t(
                  "Fan lên sân khấu! Chọn tiếp, xem lịch sử hoặc bắt đầu vòng mới.",
                  "Your fan takes the stage! Pick again, view history or reset the round.",
                )}
              </span>
            </p>
          </div>
          <p className="muted">
            {t(
              "Mặc định không lặp lại trong một vòng. Âm thanh chỉ bật khi bạn chọn. Dữ liệu và ảnh mặt được lưu trong trình duyệt trên máy này.",
              "No Repeat is on by default. Sound plays only when enabled. Roster and face photo stay in this browser.",
            )}
          </p>
          <button
            className="primary full"
            onClick={() => {
              setPanel(null);
              go("fanzone");
            }}
          >
            {t("BẮT ĐẦU", "LET’S GO")}
            <ArrowRight size={16} />
          </button>
        </Modal>
      )}
      {resetConfirm && (
        <Modal
          title={t("Bắt đầu vòng mới?", "Start a new round?")}
          onClose={() => setResetConfirm(false)}
        >
          <p>
            {t(
              "Tất cả fan sẽ đủ điều kiện được chọn lại. Lịch sử các vòng trước vẫn được giữ.",
              "All fans become eligible again. History from previous rounds stays saved.",
            )}
          </p>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => setResetConfirm(false)}
            >
              {t("Hủy", "Cancel")}
            </button>
            <button
              className="primary"
              onClick={() => {
                update(resetRound);
                setResetConfirm(false);
              }}
            >
              {t("RESET ROUND", "RESET ROUND")}
              <RotateCcw size={16} />
            </button>
          </div>
        </Modal>
      )}
      {easter && (
        <div className="easter-egg" role="status">
          DREAM BIG. SHINE BRIGHT. ✦
        </div>
      )}
    </div>
  );
}
