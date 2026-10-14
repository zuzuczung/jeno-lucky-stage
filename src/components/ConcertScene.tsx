import { JENO_PORTRAIT, JENO_PHOTO_SOURCE } from "../lib/assets";
import { memo, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "motion/react";
import { Maximize2, Minus, Plus, X } from "lucide-react";
import { AudienceCharacter, JenoCharacter } from "./Characters";
import type { Phase, Settings, Student, Translate } from "../types";
export interface CrowdPosition {
  x: number;
  y: number;
  scale: number;
}
export function crowdPositions(
  students: Student[],
): Map<string, CrowdPosition> {
  const map = new Map<string, CrowdPosition>();
  const columns = 10,
    rows = Math.ceil(students.length / columns);
  students.forEach((s, i) => {
    const row = Math.floor(i / columns),
      col = i % columns;
    const scale = 0.58 + Math.min(row, 8) * 0.028;
    const x =
      col < 5
        ? 135 + col * 87 + (row % 2 ? 15 : 0)
        : 685 + (col - 5) * 87 + (row % 2 ? -15 : 0);
    map.set(s.id, {
      x,
      y: 405 + row * 72,
      scale: rows > 7 ? scale * 0.9 : scale,
    });
  });
  return map;
}
const Stage = memo(function Stage() {
  return (
    <g className="stage">
      <path
        d="M90 67H1110M90 82H1110M105 67V83M1095 67V83"
        stroke="#405047"
        strokeWidth="6"
      />
      {Array.from({ length: 24 }, (_, i) => (
        <path
          key={i}
          d={`M${106 + i * 41} 67l20 15 20-15`}
          stroke="#526250"
          fill="none"
          strokeWidth="2"
        />
      ))}
      <g className="stage-rig-bulbs">
        {Array.from({ length: 13 }, (_, i) => (
          <circle
            key={i}
            cx={150 + i * 75}
            cy="78"
            r="4.5"
            fill={i % 3 === 0 ? "#F8F4C5" : "#C5FF59"}
            style={{ "--bulb-delay": `${-i * 0.14}s` } as CSSProperties}
          />
        ))}
      </g>
      <path
        d="M97 75V348M1103 75V348M84 76V346M1116 76V346"
        stroke="#3B4A3D"
        strokeWidth="5"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <path
            d={`M84 ${86 + i * 28}l27 28-27 0 27-28`}
            stroke="#4E5D46"
            fill="none"
          />
          <path
            d={`M1103 ${86 + i * 28}l13 28-13 0 13-28`}
            stroke="#4E5D46"
            fill="none"
          />
        </g>
      ))}
      <rect
        x="281"
        y="92"
        width="638"
        height="174"
        rx="10"
        fill="#090F0C"
        stroke="#5F873E"
        strokeWidth="2"
      />
      <rect x="289" y="100" width="622" height="157" rx="6" fill="url(#led)" />
      <rect
        x="289"
        y="100"
        width="622"
        height="157"
        fill="url(#ledDots)"
        opacity=".3"
      />
      <text
        x="600"
        y="133"
        textAnchor="middle"
        fill="#87A566"
        letterSpacing="5"
        fontSize="11"
      >
        NCT DREAM · CLASSROOM WORLD TOUR
      </text>
      <text
        x="600"
        y="213"
        textAnchor="middle"
        fill="#C5FF59"
        letterSpacing="21"
        fontWeight="900"
        fontSize="77"
      >
        JENO
      </text>
      <text
        x="600"
        y="245"
        textAnchor="middle"
        fill="#A2BD80"
        letterSpacing="8"
        fontSize="10"
      >
        THE LUCKY STAGE
      </text>
      <path
        d="M227 277H973L1092 342H108L227 277Z"
        fill="url(#floor)"
        stroke="#526544"
        strokeWidth="2"
      />
      <path d="M108 342H1092V370H108Z" fill="#16221A" />
      <path d="M110 350H1090" stroke="#C5FF59" strokeWidth="3" />
      <path d="M110 367H1090" stroke="#5C713D" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path
            d={`M${565 - i * 8} ${366 + i * 13}H${635 + i * 8}v13H${565 - i * 8}Z`}
            fill={i % 2 ? "#253125" : "#303F2C"}
            stroke="#6F844F"
          />
          <path
            d={`M${565 - i * 8} ${366 + i * 13}H${635 + i * 8}`}
            stroke="#B4D876"
            strokeWidth="2"
          />
        </g>
      ))}
      {[139, 1010].map((x) => (
        <g key={x}>
          <rect
            x={x}
            y="211"
            width="52"
            height="124"
            rx="5"
            fill="#111A15"
            stroke="#526145"
          />
          <circle cx={x + 26} cy="244" r="17" fill="#070D09" stroke="#374833" />
          <circle cx={x + 26} cy="244" r="7" fill="#22331B" />
          <circle cx={x + 26} cy="295" r="21" fill="#070D09" stroke="#41583B" />
          <circle cx={x + 26} cy="295" r="10" fill="#20341B" />
          <path d={`M${x + 7} 328H${x + 45}`} stroke="#7A9656" />
        </g>
      ))}
      {[210, 390, 810, 990].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} 75l${i < 2 ? 80 : -80} 265h${i < 2 ? -145 : 145}Z`}
            fill="url(#beam)"
            opacity=".45"
            className={`ambient-beam beam-${i}`}
          />
          <path
            d={`M${x - 12} 80l24 0-4 20h-16Z`}
            fill="#2B3D23"
            stroke="#8FB85D"
          />
          <ellipse cx={x} cy="99" rx="9" ry="3" fill="#D7FF8D" />
        </g>
      ))}
      <path d="M568 419H632L670 1300H530Z" fill="#131C15" />
      <path
        d="M568 420 530 1300M632 420 670 1300"
        stroke="#45583A"
        strokeDasharray="3 14"
      />
    </g>
  );
});
const Firework = memo(function Firework({
  x,
  y,
  delay,
}: {
  x: number;
  y: number;
  delay: number;
}) {
  const colors = ["#C5FF59", "#FFF1AC", "#79D7C1", "#FFFFFF"];
  return (
    <g transform={`translate(${x} ${y})`} className="firework-position">
      <g
        className="firework-burst"
        style={{ "--pyro-delay": `${delay}s` } as CSSProperties}
      >
        <circle r="11" fill="#E8FFBA" opacity=".5" />
        <circle
          r="48"
          fill="none"
          stroke="#C5FF59"
          strokeWidth="1.5"
          opacity=".6"
        />
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 22.5})`}>
            <path
              d="M0 -24 0 -69"
              stroke={colors[i % colors.length]}
              strokeWidth={i % 4 === 0 ? 4 : 2.5}
              strokeLinecap="round"
            />
            <circle
              cy="-77"
              r={i % 4 === 0 ? 5 : 3}
              fill={colors[i % colors.length]}
            />
          </g>
        ))}
      </g>
    </g>
  );
});
interface SceneProps {
  students: Student[];
  called: string[];
  phase: Phase;
  scannedId?: string;
  selected: Student[];
  activeFan?: Student;
  arrived: string[];
  countdown: number | null;
  settings: Settings;
  face: string | null;
  welcome?: boolean;
  reduced: boolean;
  t: Translate;
}
export function ConcertScene({
  students,
  called,
  phase,
  scannedId,
  selected,
  activeFan,
  arrived,
  countdown,
  settings,
  face,
  welcome = false,
  reduced,
  t,
}: SceneProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = viewportRef.current;
    if (el && window.matchMedia("(max-width: 760px)").matches)
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
  }, []);
  const [focused, setFocused] = useState<Student | null>(null),
    [zoom, setZoom] = useState(1),
    [viewportRatio, setViewportRatio] = useState(2.5);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => {
      if (entry.contentRect.height > 0)
        setViewportRatio(entry.contentRect.width / entry.contentRect.height);
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);
  const height = Math.max(620, 440 + Math.ceil(students.length / 10) * 72 + 45);
  const isReveal = phase === "revealed";
  const panorama = Math.max(
    1200,
    Math.min(1800, viewportRatio * (isReveal ? 480 : height)),
  );
  const stretch = panorama / 1200;
  const center = panorama / 2;
  // Keep characters proportional while the stage fits the available screen.
  const wide = (x: number, scale: number) =>
    x * stretch + 50 * (stretch - 1) * scale;
  const positions = new Map(
    [...crowdPositions(students)].map(([id, p]) => [
      id,
      { ...p, x: wide(p.x, p.scale) },
    ]),
  );
  const scanned = students.find((s) => s.id === scannedId);
  const light = positions.get(activeFan?.id || scannedId || "");
  const onStage = isReveal
    ? selected
    : selected.filter((s) => arrived.includes(s.id));
  const ledText =
    countdown !== null
      ? String(countdown)
      : phase === "inviting"
        ? activeFan?.name
        : phase === "scanning"
          ? scanned?.name
          : null;
  const stageSlot = (id: string) => {
    const index = selected.findIndex((s) => s.id === id);
    return { x: wide(665 + index * 68, 0.81), y: 213, scale: 0.81 };
  };
  return (
    <section
      className={`scene-shell ${welcome ? "welcome-scene" : ""} ${reduced ? "reduce-motion" : ""} phase-${phase}`}
      aria-label={t(
        "Sân khấu concert và toàn bộ khán giả",
        "Concert stage and audience",
      )}
    >
      <div className="scene-topline">
        <span>
          <i /> {t("TRỰC TIẾP TỪ LỚP HỌC CỦA BẠN", "LIVE FROM YOUR CLASSROOM")}
        </span>
        <span>JLS / 001</span>
      </div>
      <div className="scene-layout">
        <div className="scene-viewport" ref={viewportRef}>
          <svg
            className="concert-svg"
            viewBox={`0 0 ${panorama} ${isReveal ? 480 : height}`}
            style={{ width: `${zoom * 100}%`, "--zoom": zoom } as CSSProperties}
            role="group"
            aria-label={t(
              `${students.length} nhân vật khán giả`,
              `${students.length} audience characters`,
            )}
          >
            <defs>
              <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#C5FF59" stopOpacity=".38" />
                <stop offset="1" stopColor="#C5FF59" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="led" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#1C3016" />
                <stop offset="1" stopColor="#0A140D" />
              </linearGradient>
              <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#1F2E22" />
                <stop offset="1" stopColor="#3C5031" />
              </linearGradient>
              <radialGradient id="spot">
                <stop stopColor="#D8FF9F" stopOpacity=".48" />
                <stop offset="1" stopColor="#C5FF59" stopOpacity="0" />
              </radialGradient>
              <pattern
                id="ledDots"
                width="6"
                height="6"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r=".6" fill="#C5FF59" />
              </pattern>
              <pattern
                id="groundGrid"
                width="65"
                height="50"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M65 0H0V50"
                  fill="none"
                  stroke="#2B3D2C"
                  strokeWidth=".5"
                />
              </pattern>
            </defs>
            <rect width={panorama} height={height} fill="#0B110D" />
            <rect
              x={70 * stretch}
              y="396"
              width={1060 * stretch}
              height={height - 396}
              fill="url(#groundGrid)"
              opacity=".35"
            />
            <ellipse
              cx={center}
              cy="292"
              rx={505 * stretch}
              ry="330"
              fill="url(#spot)"
              opacity=".22"
            />
            <g className="concert-lasers" pointerEvents="none">
              <path
                d={`M${105 * stretch} 325 Q${center} 8 ${1095 * stretch} 325`}
              />
              <path
                d={`M${1095 * stretch} 325 Q${center} 8 ${105 * stretch} 325`}
              />
            </g>
            <g transform={`scale(${stretch} 1)`}>
              <Stage />
            </g>
            <g className="concert-pyro" pointerEvents="none" aria-hidden="true">
              <Firework x={145 * stretch} y={150} delay={-0.7} />
              <Firework x={1055 * stretch} y={150} delay={-2.4} />
              {[0, 1].map((side) => (
                <g
                  key={side}
                  transform={`translate(${(side ? 1085 : 115) * stretch} 348)`}
                >
                  {Array.from({ length: 9 }, (_, i) => {
                    const offset = (i - 4) * 8;
                    return (
                      <path
                        key={i}
                        className="spark-jet"
                        style={
                          {
                            "--spark-delay": `${-i * 0.13 - side * 0.4}s`,
                          } as CSSProperties
                        }
                        d={`M0 0 Q${offset * 1.4} -34 ${offset * 2.7} ${-66 - (i % 3) * 15}`}
                        stroke={i % 3 === 0 ? "#FFF5B3" : "#C5FF59"}
                        strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                        fill="none"
                      />
                    );
                  })}
                </g>
              ))}
            </g>
            {(phase === "scanning" ||
              phase === "countdown" ||
              phase === "inviting") &&
              ledText && (
                <g>
                  <rect
                    x={294 * stretch}
                    y="100"
                    width={611 * stretch}
                    height="149"
                    fill="#101E12"
                  />
                  <text
                    x={center}
                    y="118"
                    textAnchor="middle"
                    fontSize="10"
                    letterSpacing="3"
                    fill="#9BBA76"
                  >
                    {phase === "inviting"
                      ? "COME TO THE STAGE"
                      : countdown
                        ? "ARE YOU READY?"
                        : "FINDING OUR LUCKY FAN"}
                  </text>
                  <foreignObject
                    x={310 * stretch}
                    y="124"
                    width={580 * stretch}
                    height="38"
                  >
                    <div className={`led-name ${countdown ? "led-count" : ""}`}>
                      {ledText}
                    </div>
                  </foreignObject>
                </g>
              )}
            <g
              transform={`translate(${wide(isReveal ? 515 : 540, 1.18)},151) scale(1.18)`}
            >
              <JenoCharacter
                phase={phase}
                face={face}
                settings={settings}
                singing={welcome}
              />
            </g>
            {light && !isReveal && (
              <g className="spotlight" pointerEvents="none">
                <path
                  d={`M${center} 78  ${light.x - 55} ${light.y + 110} ${light.x + 100} ${light.y + 110}Z`}
                  fill="url(#beam)"
                  opacity=".9"
                />
                <ellipse
                  cx={light.x + 30}
                  cy={light.y + 105}
                  rx="72"
                  ry="24"
                  fill="url(#spot)"
                />
                <ellipse
                  cx={light.x + 30}
                  cy={light.y + 50}
                  rx="54"
                  ry="80"
                  fill="url(#spot)"
                />
              </g>
            )}
            {students.map((s) => {
              const p = positions.get(s.id)!;
              const moving = activeFan?.id === s.id && phase === "inviting";
              const staged = onStage.some((f) => f.id === s.id);
              const active = s.id === scannedId || moving;
              return (
                <g
                  key={s.id}
                  className={`audience-slot ${active ? "lit" : ""}`}
                  transform={`translate(${p.x},${p.y}) scale(${p.scale})`}
                  opacity={moving || staged ? 0 : 1}
                  tabIndex={moving || staged || isReveal ? -1 : 0}
                  role="button"
                  aria-label={`${s.name}${s.code ? " · " + s.code : ""}${called.includes(s.id) ? t(" · đã gọi", " · called") : ""}`}
                  onClick={() => setFocused(s)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      setFocused(s);
                    }
                  }}
                  data-student-id={s.id}
                >
                  <title>
                    {s.name}
                    {s.code ? " · " + s.code : ""}
                  </title>
                  <AudienceCharacter
                    student={s}
                    active={active}
                    called={called.includes(s.id)}
                  />
                  <rect
                    x="-13"
                    y="149"
                    width="126"
                    height="22"
                    rx="7"
                    fill={active ? "#C5FF59" : "#152218"}
                    stroke={active ? "#DEFFB1" : "#354333"}
                    strokeWidth="1"
                  />
                  <text
                    x="50"
                    y="164"
                    textAnchor="middle"
                    fill={active ? "#10210D" : "#B9C4B1"}
                    fontSize="12"
                    fontWeight="600"
                  >
                    {s.name.split(" ").slice(-2).join(" ").slice(0, 18)}
                  </text>
                </g>
              );
            })}
            {onStage.map((s) => {
              const p = stageSlot(s.id);
              return (
                <g
                  key={s.id}
                  transform={`translate(${p.x},${p.y}) scale(${p.scale})`}
                >
                  <AudienceCharacter student={s} stage active />
                  <text
                    x="50"
                    y="166"
                    fill="#C5FF59"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {s.name.split(" ").slice(-2).join(" ")}
                  </text>
                </g>
              );
            })}
            {phase === "inviting" &&
              activeFan &&
              !arrived.includes(activeFan.id) &&
              (() => {
                const p = positions.get(activeFan.id)!,
                  end = stageSlot(activeFan.id),
                  seconds =
                    settings.speed === "fast"
                      ? 1.2
                      : settings.speed === "dramatic"
                        ? 3.2
                        : 2.2;
                return (
                  <motion.g
                    key={activeFan.id}
                    initial={{ x: p.x, y: p.y, scale: p.scale }}
                    animate={{
                      x: [
                        p.x,
                        p.x,
                        center - 50 * p.scale,
                        center - 50 * 0.75,
                        end.x,
                      ],
                      y: [p.y, p.y + 32, p.y + 32, 365, end.y],
                      scale: [p.scale, p.scale, p.scale, 0.75, end.scale],
                    }}
                    transition={{
                      duration: reduced ? 0 : seconds,
                      ease: "linear",
                      times: [0, 0.12, 0.4, 0.83, 1],
                    }}
                    className="walking-fan"
                    data-moving-fan={activeFan.id}
                  >
                    <AudienceCharacter student={activeFan} active stage />
                  </motion.g>
                );
              })()}
            <text
              x={center}
              y={height - 20}
              textAnchor="middle"
              fill="#506443"
              fontSize="10"
              letterSpacing="4"
            >
              {t("MỖI FAN LÀ MỘT NGÔI SAO", "EVERY FAN IS A STAR")} ✦
            </text>
          </svg>
        </div>
        <aside className="artist-card" aria-label="Jeno · NCT DREAM">
          <img src={JENO_PORTRAIT} alt="Jeno của NCT DREAM" />
          <div className="artist-card-top">
            <span>
              <i /> YOUR HOST TONIGHT
            </span>
            <span>★</span>
          </div>
          <div className="artist-card-copy">
            <span>NCT DREAM</span>
            <strong>
              JENO<span>이제노</span>
            </strong>
            <p>
              {t(
                "Spotlight tiếp theo có thể dành cho bạn.",
                "The next spotlight could be yours.",
              )}
            </p>
            <a href={JENO_PHOTO_SOURCE} target="_blank" rel="noreferrer">
              Photo: K-POPIT · CC BY 3.0
            </a>
          </div>
        </aside>
      </div>
      <div className="scene-bottomline">
        <span>
          {t("FAN ZONE", "FAN ZONE")}{" "}
          <b>{String(students.length).padStart(2, "0")}</b>
        </span>
        <span className="scene-hint">
          {t("Chạm một fan để xem tên", "Tap a fan to see their name")}
        </span>
        <div className="zoom-controls">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            aria-label={t("Thu nhỏ", "Zoom out")}
            disabled={zoom === 1}
          >
            <Minus size={14} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
            aria-label={t("Phóng to", "Zoom in")}
            disabled={zoom === 2.5}
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => setZoom(1)}
            aria-label={t("Về kích thước gốc", "Reset zoom")}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      {focused && (
        <div className="fan-tooltip" role="status">
          <span className="tiny-label">{t("FAN TRONG LỚP", "CLASS FAN")}</span>
          <strong>{focused.name}</strong>
          <span>
            {focused.code || t("Không có mã", "No student code")}
            {called.includes(focused.id)
              ? t(" · Đã được gọi", " · Already called")
              : ""}
          </span>
          <button
            onClick={() => setFocused(null)}
            aria-label={t("Đóng tên fan", "Close fan name")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
