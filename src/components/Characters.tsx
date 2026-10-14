import { JENO_PORTRAIT } from "../lib/assets";
import { memo, useId } from "react";
import type { CSSProperties } from "react";
import type { Phase, Settings, Student } from "../types";
export function seedFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++)
    h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
const skins = ["#EDBFA3", "#D7A37F", "#B77E5C", "#F5D2B7", "#CC9275"];
const shirts = [
  "#BCE961",
  "#E7E8DC",
  "#6C8F87",
  "#A0AFC5",
  "#DDAAB7",
  "#EAB56E",
  "#6F6F86",
  "#427A59",
];
const hairColors = ["#292522", "#3A2A24", "#171F20", "#654D3C"];
function Hair({ kind, color }: { kind: number; color: string }) {
  return kind === 0 ? (
    <path
      d="M32 29Q30 6 50 9Q72 8 69 31L62 21 57 25 49 20 41 25 36 34Z"
      fill={color}
    />
  ) : kind === 1 ? (
    <>
      <path
        d="M30 45V26Q28 5 50 8Q73 7 72 29V46L64 42V27L52 19 37 27V44Z"
        fill={color}
      />
      <path d="M32 28Q40 10 56 15L63 23 48 26 43 22 38 30Z" fill={color} />
    </>
  ) : kind === 2 ? (
    <>
      <circle cx="34" cy="17" r="9" fill={color} />
      <circle cx="66" cy="17" r="9" fill={color} />
      <path d="M32 30Q29 9 50 10Q71 8 69 30L58 18Q48 27 33 26Z" fill={color} />
    </>
  ) : kind === 3 ? (
    <path
      d="M32 29Q28 12 42 12Q42 5 52 9Q73 5 69 31L62 20 54 22 49 17 42 22 35 25Z"
      fill={color}
    />
  ) : kind === 4 ? (
    <>
      <path
        d="M31 43V23Q33 7 51 9Q72 11 70 29V48L61 39V25L55 19 38 25V43Z"
        fill={color}
      />
      <path d="M34 24L45 11 60 16 58 23Z" fill={color} />
    </>
  ) : (
    <>
      <path d="M31 27Q32 11 50 11Q68 9 71 28L61 21 41 24Z" fill={color} />
      <path d="M30 23Q50 14 71 23L76 28H29Z" fill="#C5FF59" />
      <path d="M35 22Q37 7 58 11L67 22Z" fill="#9ABC4B" />
    </>
  );
}
export const AudienceCharacter = memo(function AudienceCharacter({
  student,
  active = false,
  called = false,
  stage = false,
}: {
  student: Student;
  active?: boolean;
  called?: boolean;
  stage?: boolean;
}) {
  const seed = seedFor(student.id),
    skin = skins[seed % skins.length],
    shirt = shirts[(seed >>> 3) % shirts.length],
    hair = hairColors[(seed >>> 6) % hairColors.length],
    kind = (seed >>> 9) % 6,
    accessory = (seed >>> 12) % 4;
  const style = {
    "--delay": `${-(seed % 5000) / 1000}s`,
    "--beat": `${0.75 + (seed % 7) / 10}s`,
  } as CSSProperties;
  return (
    <g
      className={`fan-character ${active ? "fan-active" : ""} ${stage ? "fan-onstage" : ""}`}
      style={style}
    >
      <ellipse cx="50" cy="145" rx="31" ry="7" fill="#000" opacity=".3" />
      <g className="fan-bounce">
        <g className="fan-leg leg-left">
          <path d="M36 99 48 100 46 132 34 132Z" fill="#35433E" />
          <path d="M34 130H46L47 140H27Q24 132 34 130" fill="#E2E6DC" />
          <path d="M27 139H47" stroke="#9CA69A" strokeWidth="2" />
        </g>
        <g className="fan-leg leg-right">
          <path d="M52 100 64 99 67 132H55Z" fill="#293832" />
          <path d="M55 131H66Q77 132 76 140H54Z" fill="#E2E6DC" />
          <path d="M54 139H76" stroke="#9CA69A" strokeWidth="2" />
        </g>
        <path d="M42 45H58V62H42Z" fill={skin} />
        <path d="M34 54Q49 48 66 54L69 101Q48 110 31 101Z" fill={shirt} />
        <path
          d="M40 52Q49 62 60 52"
          fill="none"
          stroke="#000"
          opacity=".15"
          strokeWidth="3"
        />
        {(seed >>> 16) % 3 === 0 ? (
          <>
            <path
              d="M32 74H68M32 82H68"
              stroke="#fff"
              opacity=".25"
              strokeWidth="4"
            />
            <path d="M50 60V103" stroke="#000" opacity=".12" strokeWidth="2" />
          </>
        ) : (
          <>
            <path d="m43 72 7-8 7 8-7 9Z" fill="#080B0A" opacity=".3" />
            <path
              d="M35 91Q51 96 66 91"
              fill="none"
              stroke="#000"
              opacity=".15"
              strokeWidth="2"
            />
          </>
        )}
        <g className={`fan-arm arm-left accessory-${accessory}`}>
          <path
            d="M34 59 23 79"
            stroke={shirt}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M23 78 19 60"
            stroke={skin}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="18" cy="57" r="5" fill={skin} />
          {accessory === 0 && (
            <>
              <path d="M18 60V35" stroke="#D3DBC5" strokeWidth="4" />
              <path d="m11 30 7-7 7 7-7 8Z" fill="#C5FF59" />
              <path d="m14 30 4-4 4 4-4 4Z" fill="#ECFFC8" />
              <circle
                className="fan-light-glow"
                cx="18"
                cy="30"
                r="14"
                fill="#C5FF59"
              />
            </>
          )}
          {accessory === 1 && (
            <g className="fan-phone">
              <path d="M18 56V39" stroke={skin} strokeWidth="5" />
              <rect
                x="10"
                y="25"
                width="16"
                height="22"
                rx="3"
                fill="#202E29"
                stroke="#C5FF59"
                strokeWidth="2"
              />
              <rect
                x="13"
                y="28"
                width="10"
                height="15"
                rx="1"
                fill="#E8FFE0"
              />
              <circle
                className="fan-light-glow"
                cx="18"
                cy="35"
                r="13"
                fill="#E8FFE0"
              />
            </g>
          )}
          {accessory === 2 && (
            <>
              <path d="M18 56V42" stroke="#777" strokeWidth="3" />
              <rect x="1" y="25" width="36" height="19" rx="3" fill="#C5FF59" />
              <text
                x="19"
                y="38"
                fontSize="9"
                fontWeight="900"
                textAnchor="middle"
                fill="#142216"
              >
                JENO
              </text>
              <circle
                className="fan-light-glow"
                cx="19"
                cy="34"
                r="17"
                fill="#C5FF59"
              />
            </>
          )}
        </g>
        <g className="fan-arm arm-right">
          <path
            d="M66 59 77 79"
            stroke={shirt}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M77 79 82 59"
            stroke={skin}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <circle cx="82" cy="56" r="5" fill={skin} />
          {stage && (
            <>
              <path d="m82 57 0-15" stroke="#869382" strokeWidth="5" />
              <ellipse cx="82" cy="39" rx="6" ry="8" fill="#182B21" />
              <path d="M78 35H86M78 39H86" stroke="#B5C2B5" strokeWidth="1" />
            </>
          )}
        </g>
        <g className="fan-head">
          <ellipse cx="50" cy="30" rx="20" ry="24" fill={hair} />
          <ellipse cx="31" cy="34" rx="4" ry="6" fill={skin} />
          <ellipse cx="69" cy="34" rx="4" ry="6" fill={skin} />
          <path
            d="M33 26Q50 10 67 26V36Q66 53 50 55Q34 52 33 36Z"
            fill={skin}
          />
          <Hair kind={kind} color={hair} />
          <path
            d="M39 33H43M57 33H61"
            stroke="#262827"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M45 44Q50 48 56 43"
            fill="none"
            stroke="#8E5148"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M49 35 47 40H51"
            fill="none"
            stroke="#B67E62"
            strokeWidth="1"
          />
          <ellipse cx="38" cy="41" rx="4" ry="2" fill="#D17E73" opacity=".4" />
          <ellipse cx="62" cy="41" rx="4" ry="2" fill="#D17E73" opacity=".4" />
          {(seed >>> 18) % 5 === 0 && (
            <>
              <circle
                cx="41"
                cy="34"
                r="6"
                fill="none"
                stroke="#343D35"
                strokeWidth="1.5"
              />
              <circle
                cx="59"
                cy="34"
                r="6"
                fill="none"
                stroke="#343D35"
                strokeWidth="1.5"
              />
              <path d="M47 34H53" stroke="#343D35" />
            </>
          )}
        </g>
        {!stage && (
          <g className="fan-cheer-mark" aria-hidden="true">
            <path
              d="M77 16 81 10M83 23 90 20"
              stroke="#D9FF9F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}
      </g>
      {called && !stage && (
        <g>
          <circle cx="73" cy="107" r="9" fill="#203526" stroke="#829F5D" />
          <path
            d="m69 107 3 3 5-6"
            fill="none"
            stroke="#C5FF59"
            strokeWidth="2"
          />
        </g>
      )}
    </g>
  );
});
export function JenoCharacter({
  phase,
  face,
  settings,
  singing = false,
}: {
  phase: Phase;
  face: string | null;
  settings: Settings;
  singing?: boolean;
}) {
  const clip = useId().replace(/:/g, "");
  const resting = phase === "idle" && !singing;
  const bundled = face === JENO_PORTRAIT;
  const crop = bundled
    ? { x: 12, y: -3, w: 78, h: 107.8 }
    : { x: 25, y: 7, w: 50, h: 56 };
  return (
    <g className={`jeno-character jeno-${singing ? "singing" : phase}`}>
      <defs>
        <clipPath id={clip}>
          <path d="M35 24Q50 12 65 24L65 39Q63 53 50 55Q37 52 35 39Z" />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="162" rx="38" ry="8" fill="#000" opacity=".5" />
      <g className="jeno-body">
        <g className="jeno-leg">
          <path
            d="M31 99 49 101 45 148 30 147Z"
            fill="#101B19"
            stroke="#435348"
          />
          <path d="M53 101 69 98 73 147H57Z" fill="#17231E" stroke="#435348" />
          <path
            d="M30 143H45L46 157H21Q20 146 30 143M57 144H72Q85 148 82 158H56Z"
            fill="#0B1110"
            stroke="#5C6B5E"
          />
          <path d="M21 157H46M56 158H83" stroke="#C5FF59" strokeWidth="3" />
        </g>
        <path d="M42 47H59V65H42Z" fill="#EDC4AB" />
        <path
          d="M29 61 43 53Q51 64 59 53L74 62 71 109Q50 116 28 108Z"
          fill="#17221E"
          stroke="#71856E"
          strokeWidth="1"
        />
        <path d="M42 56 37 72 45 77 50 99 54 77 62 73 59 56" fill="#080E0B" />
        <path d="M50 67V109" stroke="#687C64" strokeWidth="1.5" />
        <path d="M32 86 42 89M58 89 68 86" stroke="#76846B" strokeWidth="2" />
        <path d="M32 108 70 108" stroke="#7E886E" strokeWidth="4" />
        <rect x="47" y="104" width="9" height="7" rx="1" fill="#B3C595" />
        <path d="M34 58Q32 80 36 103" stroke="#596D56" fill="none" />
        <path d="M64 58 63 75" stroke="#C5FF59" strokeWidth="3" />
        <g className="jeno-arm jeno-left">
          <path
            d="M30 65 20 91 13 110"
            fill="none"
            stroke="#17231D"
            strokeWidth="15"
            strokeLinecap="round"
          />
          <path
            d="M13 108 10 120"
            stroke="#EDC4AB"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path d="M20 82 28 87" stroke="#68805D" strokeWidth="2" />
        </g>
        <g className="jeno-arm jeno-mic">
          {resting ? (
            <>
              <path
                d="M71 65 82 91 84 114"
                fill="none"
                stroke="#1B2922"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M84 113 84 125"
                stroke="#EDC4AB"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path d="M84 128V106" stroke="#A4B39B" strokeWidth="5" />
              <ellipse
                cx="84"
                cy="101"
                rx="6"
                ry="8"
                fill="#17231D"
                stroke="#839D79"
              />
              <path d="M79 99H89M79 102H89" stroke="#A9B8A2" />
            </>
          ) : (
            <>
              <path
                d="M71 65 81 85 69 49"
                fill="none"
                stroke="#1B2922"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M70 50 65 42"
                stroke="#EDC4AB"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path d="M64 44 61 25" stroke="#A4B39B" strokeWidth="5" />
              <ellipse
                cx="60"
                cy="21"
                rx="6"
                ry="8"
                fill="#17231D"
                stroke="#839D79"
              />
              <path d="M55 19H65M55 22H65" stroke="#A9B8A2" strokeWidth="1" />
              <path d="M77 77 84 74" stroke="#C5FF59" strokeWidth="2" />
            </>
          )}
        </g>
        <g className="jeno-head">
          <ellipse cx="50" cy="30" rx="21" ry="25" fill="#161D19" />
          <ellipse cx="32" cy="34" rx="4" ry="6" fill="#EDC4AB" />
          <ellipse cx="68" cy="34" rx="4" ry="6" fill="#EDC4AB" />
          <path
            d="M34 24Q50 11 66 24V39Q62 54 50 55Q37 52 34 39Z"
            fill="#EDC4AB"
          />
          {face ? (
            <image
              href={face}
              x={50 + (crop.x - 50) * settings.faceZoom + settings.faceX}
              y={30 + (crop.y - 30) * settings.faceZoom + settings.faceY}
              width={crop.w * settings.faceZoom}
              height={crop.h * settings.faceZoom}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clip})`}
            />
          ) : (
            <>
              <path
                d="M39 33 44 32M56 32 61 33"
                stroke="#29312D"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M49 35 47 42H51" stroke="#C18F74" fill="none" />
              <path
                d="M44 46Q51 50 58 44"
                fill="none"
                stroke="#9A615B"
                strokeWidth="2"
              />
              <path
                d="M37 30 44 29M56 29 64 30"
                stroke="#302C28"
                strokeWidth="1.5"
              />
            </>
          )}
          <path
            d="M31 30Q25 11 45 8Q55 2 68 13Q76 23 68 33L62 19 53 25 49 18 38 29Z"
            fill="#202820"
          />
          <path
            d="M33 19Q42 7 55 12M54 11 63 20"
            stroke="#58654E"
            strokeWidth="2"
            fill="none"
          />
          <path d="M68 35 70 48" stroke="#B7C99F" strokeWidth="1.5" />
          <circle cx="70" cy="48" r="2" fill="#C5FF59" />
        </g>
      </g>
    </g>
  );
}
