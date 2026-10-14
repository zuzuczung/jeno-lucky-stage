import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Music2,
  Pause,
  Play,
  Repeat2,
  Upload,
  RotateCcw,
  Volume2,
  X,
} from "lucide-react";
import { DEFAULT_TRACK } from "../lib/assets";
import { readTrack, writeTrack } from "../lib/storage";
import type { Settings, Translate } from "../types";
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds) % 60).padStart(2, "0")}`;
export function MusicPlayer({
  settings,
  onChange,
  busy,
  t,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  busy: boolean;
  t: Translate;
}) {
  const [track, setTrack] = useState({
      url: DEFAULT_TRACK,
      name: "LUCKY STAGE BEAT",
      custom: false,
    }),
    [playing, setPlaying] = useState(false),
    [time, setTime] = useState(0),
    [duration, setDuration] = useState(0),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [expanded, setExpanded] = useState(false);
  const controlsId = useId();
  const audio = useRef<HTMLAudioElement>(null),
    input = useRef<HTMLInputElement>(null),
    toggleButton = useRef<HTMLButtonElement>(null),
    ownedURL = useRef<string | null>(null),
    generation = useRef(0),
    mounted = useRef(true),
    translate = useRef(t),
    pendingAbort = useRef<(() => void) | null>(null);
  translate.current = t;
  const dispose = useCallback(() => {
    mounted.current = false;
    generation.current++;
    pendingAbort.current?.();
    audio.current?.pause();
    if (ownedURL.current) URL.revokeObjectURL(ownedURL.current);
  }, []);
  useEffect(() => {
    mounted.current = true;
    const element = audio.current;
    const token = generation.current;
    void readTrack()
      .then((saved) => {
        if (saved && mounted.current && token === generation.current) {
          const url = URL.createObjectURL(saved.blob);
          ownedURL.current = url;
          setTrack({ url, name: saved.name, custom: true });
        }
      })
      .catch(() => {
        if (mounted.current)
          setError(
            translate.current(
              "Không đọc được nhạc đã lưu. Nhạc mẫu vẫn dùng được.",
              "Saved music could not be loaded. The demo track is available.",
            ),
          );
      });
    return () => {
      element?.pause();
      dispose();
    };
  }, [dispose]);
  useEffect(() => {
    if (audio.current)
      audio.current.volume =
        settings.musicVolume * (busy && settings.musicDuck ? 0.3 : 1);
  }, [settings.musicVolume, settings.musicDuck, busy]);
  function closeControls() {
    setExpanded(false);
    toggleButton.current?.focus();
  }
  async function toggle() {
    if (!audio.current) return;
    setError("");
    if (!audio.current.paused) {
      audio.current.pause();
      return;
    }
    try {
      await audio.current.play();
    } catch {
      setError(
        t(
          "Trình duyệt chưa phát được nhạc. Bấm Phát lần nữa hoặc chọn file khác.",
          "Playback could not start. Press Play again or choose another file.",
        ),
      );
    }
  }
  async function choose(file?: File) {
    if (!file || loading) return;
    const token = ++generation.current;
    setError("");
    setLoading(true);
    let url: string | null = null;
    try {
      if (file.size > 50 * 1024 * 1024)
        throw new Error(
          t("Nhạc tối đa 50 MB.", "Maximum audio size is 50 MB."),
        );
      if (!/\.(mp3|m4a|wav|ogg|flac)$/i.test(file.name) || !file.size)
        throw new Error(
          t(
            "Chọn file MP3, M4A, WAV, OGG hoặc FLAC.",
            "Choose MP3, M4A, WAV, OGG or FLAC.",
          ),
        );
      url = URL.createObjectURL(file);
      const probe = new Audio();
      probe.preload = "metadata";
      try {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => {
            pendingAbort.current = null;
            reject(
              new Error(
                t(
                  "Không đọc được file nhạc.",
                  "Could not read this audio file.",
                ),
              ),
            );
          }, 8000);
          pendingAbort.current = () => {
            clearTimeout(timer);
            probe.onloadedmetadata = null;
            probe.onerror = null;
            pendingAbort.current = null;
            reject(new Error("Cancelled"));
          };
          probe.onloadedmetadata = () => {
            clearTimeout(timer);
            pendingAbort.current = null;
            probe.onerror = null;
            probe.onloadedmetadata = null;
            if (Number.isFinite(probe.duration) && probe.duration > 0)
              resolve();
            else
              reject(
                new Error(t("File nhạc không hợp lệ.", "Invalid audio file.")),
              );
          };
          probe.onerror = () => {
            clearTimeout(timer);
            pendingAbort.current = null;
            probe.onerror = null;
            probe.onloadedmetadata = null;
            reject(
              new Error(
                t(
                  "File nhạc hỏng hoặc trình duyệt không hỗ trợ định dạng này.",
                  "Damaged audio or unsupported codec.",
                ),
              ),
            );
          };
          probe.src = url!;
        });
      } finally {
        probe.removeAttribute("src");
        probe.load();
      }
      if (!mounted.current || token !== generation.current) {
        URL.revokeObjectURL(url);
        return;
      }
      audio.current?.pause();
      if (ownedURL.current) URL.revokeObjectURL(ownedURL.current);
      ownedURL.current = url;
      setTrack({ url, name: file.name, custom: true });
      setTime(0);
      setDuration(0);
      url = null;
      try {
        await writeTrack({ blob: file, name: file.name });
      } catch {
        if (mounted.current)
          setError(
            t(
              "Nhạc đã chọn phát được, nhưng trình duyệt không thể lưu qua reload.",
              "The track is ready, but browser storage could not save it for reload.",
            ),
          );
      }
    } catch (e) {
      if (url) URL.revokeObjectURL(url);
      if (mounted.current)
        setError(
          e instanceof Error
            ? e.message
            : t("Không tải được nhạc.", "Could not load audio."),
        );
    } finally {
      if (mounted.current) {
        setLoading(false);
        if (input.current) input.current.value = "";
      }
    }
  }
  async function reset() {
    audio.current?.pause();
    generation.current++;
    if (ownedURL.current) URL.revokeObjectURL(ownedURL.current);
    ownedURL.current = null;
    setTrack({ url: DEFAULT_TRACK, name: "LUCKY STAGE BEAT", custom: false });
    setTime(0);
    setError("");
    try {
      await writeTrack(null);
    } catch {
      setError(
        t(
          "Không xóa được nhạc đã lưu; bản mẫu đang dùng cho phiên này.",
          "Saved audio could not be cleared; the demo is active for this session.",
        ),
      );
    }
  }
  return (
    <aside
      className={`soundtrack-bar ${playing ? "music-playing" : ""}`}
      aria-label={t("Trình phát nhạc nền", "Background music player")}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          closeControls();
        }
      }}
    >
      <audio
        ref={audio}
        src={track.url}
        loop={settings.musicLoop}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={() => {
          setDuration(audio.current?.duration || 0);
          setTime(0);
        }}
        onTimeUpdate={() =>
          setTime(Math.floor(audio.current?.currentTime || 0))
        }
        onError={() =>
          setError(
            t(
              "Không phát được nhạc. Chọn file nhạc khác để thử.",
              "Cannot play this track. Choose another audio file.",
            ),
          )
        }
      />
      <button
        className="music-play"
        onClick={() => void toggle()}
        aria-label={
          playing
            ? t("Tạm dừng nhạc nền", "Pause background music")
            : t("Phát nhạc nền", "Play background music")
        }
      >
        {playing ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" />
        )}
      </button>
      <button
        ref={toggleButton}
        className="music-toggle"
        aria-expanded={expanded}
        aria-controls={controlsId}
        aria-label={
          expanded
            ? t("Ẩn bảng nhạc nền", "Hide music controls")
            : t("Mở bảng nhạc nền", "Open music controls")
        }
        onClick={() => setExpanded(!expanded)}
      >
        <Music2 size={15} /> {t("Nhạc", "Music")}
      </button>
      <div className="music-controls" id={controlsId} hidden={!expanded}>
        <button
          className="music-close icon-button"
          onClick={closeControls}
          aria-label={t("Đóng bảng nhạc nền", "Close music controls")}
        >
          <X size={16} />
        </button>
        <div className="music-art">
          <Music2 size={20} />
        </div>
        <div className="track-info">
          <span className="tiny-label">
            {track.custom
              ? t("NHẠC CỦA BẠN", "YOUR SOUNDTRACK")
              : t(
                  "NHẠC NỀN MẪU · ORIGINAL BEAT",
                  "DEMO SOUNDTRACK · ORIGINAL BEAT",
                )}
          </span>
          <strong title={track.name}>{track.name}</strong>
        </div>
        <div className="music-progress">
          <span>{formatTime(time)}</span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="1"
            value={Math.min(time, duration || 0)}
            disabled={!duration}
            aria-label={t("Tua nhạc nền", "Seek background music")}
            onChange={(e) => {
              if (audio.current)
                audio.current.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
        <label className="music-volume">
          <Volume2 size={15} />
          <input
            type="range"
            min="0"
            max="1"
            step=".01"
            value={settings.musicVolume}
            aria-label={t("Âm lượng nhạc nền", "Background music volume")}
            onChange={(e) => onChange({ musicVolume: Number(e.target.value) })}
          />
          <span>{Math.round(settings.musicVolume * 100)}%</span>
        </label>
        <button
          className={`music-loop ${settings.musicLoop ? "enabled" : ""}`}
          aria-pressed={settings.musicLoop}
          aria-label={t("Lặp lại nhạc nền", "Loop background music")}
          onClick={() => onChange({ musicLoop: !settings.musicLoop })}
        >
          <Repeat2 size={17} />
        </button>
        <button
          className="music-upload"
          onClick={() => input.current?.click()}
          disabled={loading}
        >
          <Upload size={15} />
          {loading
            ? t("Đang đọc…", "Loading…")
            : t("CHỌN NHẠC NCT / MP3", "CHOOSE NCT MUSIC / MP3")}
        </button>
        <input
          ref={input}
          className="sr-only"
          type="file"
          accept=".mp3,.m4a,.wav,.ogg,.flac"
          aria-label={t("Tải nhạc nền từ máy", "Upload background music")}
          onChange={(e) => void choose(e.target.files?.[0])}
        />
        {track.custom && (
          <button
            className="icon-button"
            onClick={() => void reset()}
            aria-label={t("Dùng lại nhạc mẫu", "Restore demo track")}
            title={t("Dùng lại nhạc mẫu", "Restore demo track")}
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>
      {error && (
        <div className="music-error" role="alert">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            aria-label={t("Đóng thông báo nhạc", "Dismiss music message")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </aside>
  );
}
