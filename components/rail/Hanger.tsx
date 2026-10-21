import type { Item } from "@/lib/schema";

export function Suspension({
  mode,
  width,
  mark,
  uid,
  gold,
  pose = "front",
}: {
  mode: Item["suspension"];
  width: number;
  mark?: string;
  uid: string;
  gold?: boolean;
  pose?: "front" | "side";
}) {
  const hookA = gold ? "#f0d9a0" : "#f4f6f8";
  const hookB = gold ? "#8a6428" : "#7d848e";
  const woodA = gold ? "#c9a06a" : "#c6a36a";
  const woodB = gold ? "#6e4a28" : "#6a4324";
  const height = pose === "side" ? 64 : 72;
  return (
    <svg
      width={width}
      height={height}
      viewBox={pose === "side" ? "0 0 48 64" : "0 0 200 72"}
      aria-hidden
      className="block overflow-visible"
    >
      <defs>
        <linearGradient id={`${uid}-hook`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hookB} />
          <stop offset="0.42" stopColor={hookA} />
          <stop offset="1" stopColor={hookB} />
        </linearGradient>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={woodA} />
          <stop offset="0.55" stopColor="#a37848" />
          <stop offset="1" stopColor={woodB} />
        </linearGradient>
      </defs>
      {pose === "side" ? (
        <>
          <path
            d="M24 28 C24 14 24 8 24 6 C24 6 34 8 34 16 C34 24 24 22 24 28"
            fill="none"
            stroke={`url(#${uid}-hook)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path d="M20 30 H28 L26 58 H22 Z" fill={`url(#${uid}-wood)`} />
        </>
      ) : mode === "wood" || mode === "lace" ? (
        <>
          <path
            d="M100 34 C100 18 100 10 100 8 C100 8 124 6 128 16 C132 26 112 28 104 32"
            fill="none"
            stroke={`url(#${uid}-hook)`}
            strokeWidth="3.4"
            strokeLinecap="round"
          />
          <path
            d="M18 58 C22 40 48 36 100 34 C152 36 178 40 182 58 C150 66 50 66 18 58Z"
            fill={`url(#${uid}-wood)`}
          />
          <path d="M36 52 H164" stroke="#3a2012" strokeOpacity="0.28" strokeWidth="1.2" />
          <path d="M28 56 C70 62 130 62 172 56" fill="none" stroke="#f3e6d2" strokeOpacity="0.35" />
          {mark ? (
            <text
              x="100"
              y="58"
              textAnchor="middle"
              fontSize="7"
              fill="#f6ecdf"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
            >
              {mark}
            </text>
          ) : null}
        </>
      ) : (
        <>
          <path
            d="M100 36 C100 16 118 8 124 16 C130 24 110 28 100 34"
            fill="none"
            stroke={`url(#${uid}-hook)`}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path d="M92 20 H108 V32 H92Z" fill={gold ? "#e0c48a" : "#ece8e1"} />
          <path d="M96 32 H104 V66 H96Z" fill={mode === "webbing" ? "#3a2c20" : "#6b4632"} />
        </>
      )}
    </svg>
  );
}

/** Fixed vertical size so a wide garment does not grow a huge hook. Shoulders span `width`. */
export const HANGER_H = 52;

/**
 * Wire hanger: hook over the rail, a short neck, shoulders that tuck into the garment.
 * The rail compresses this with the piece when it is edge-on.
 */
export function RailHanger({ width, gold, uid }: { width: number; gold?: boolean; uid: string }) {
  const hookA = gold ? "#e7c98a" : "#4a4a4a";
  const hookB = gold ? "#6e4e22" : "#1c1c1c";
  const height = HANGER_H;
  const cx = width / 2;
  const left = Math.max(6, width * 0.06);
  const right = width - left;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden className="mx-auto block overflow-visible">
      <defs>
        <linearGradient id={`${uid}-wire`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hookB} />
          <stop offset="0.45" stopColor={hookA} />
          <stop offset="1" stopColor={hookB} />
        </linearGradient>
      </defs>
      <path
        d={`M${cx} 22 C${cx} 12 ${cx + 2} 4 ${cx + 10} 3 C${cx + 20} 2 ${cx + 24} 10 ${cx + 18} 16 C${cx + 14} 21 ${cx + 6} 20 ${cx + 2} 23`}
        fill="none"
        stroke={`url(#${uid}-wire)`}
        strokeWidth="2.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${cx} 22 V34`}
        fill="none"
        stroke={`url(#${uid}-wire)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M${left} ${height - 1} C${cx * 0.55} 40 ${cx} 34 ${cx} 34 C${cx} 34 ${width - cx * 0.55} 40 ${right} ${height - 1}`}
        fill="none"
        stroke={`url(#${uid}-wire)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
