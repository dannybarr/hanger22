import Image from "next/image";

type Pose = "front" | "side";

const PHOTO: Record<string, { src: string; width: number; height: number }> = {
  trailgrip: { src: "/cutouts/trailgrip-front.webp", width: 1024, height: 1024 },
  "moonwatch-vintage": { src: "/cutouts/speedmaster-front.webp", width: 1024, height: 1024 },
  premoon: { src: "/cutouts/premoon-front.webp", width: 1024, height: 1024 },
  "pvc-down": { src: "/cutouts/down-front.webp", width: 1024, height: 1024 },
  "dress-shirt": { src: "/cutouts/shirt-front.webp", width: 1024, height: 1024 },
  "stretch-jeans": { src: "/cutouts/jeans-front.webp", width: 1024, height: 1024 },
  "training-pants": { src: "/cutouts/pants-front.webp", width: 1024, height: 1024 },
  jersey: { src: "/cutouts/jersey-front.webp", width: 1024, height: 1024 },
};

export function Garment({
  art,
  pose,
  uid,
  priority = false,
  label,
  src,
  align = "bottom",
}: {
  art: string;
  pose: Pose;
  uid: string;
  priority?: boolean;
  label?: string;
  src?: string;
  align?: "top" | "bottom";
}) {
  const photo = src && !src.endsWith(".svg") ? { src, width: 1024, height: 1024 } : PHOTO[art];
  if (photo) {
    return (
      <div
        className="relative h-full w-full"
        style={pose === "side" ? { transform: "perspective(900px) scaleX(0.28) rotateY(16deg)", transformOrigin: "top center" } : undefined}
      >
        <Image
          src={photo.src}
          alt=""
          fill
          priority={priority}
          quality={92}
          sizes="(max-width: 760px) 70vw, 512px"
          className={align === "top" ? "object-contain object-top" : "object-contain object-bottom"}
        />
        {pose === "side" ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(28,22,16,0.5), rgba(28,22,16,0.08) 42%, rgba(28,22,16,0.28))",
              maskImage: `url(${photo.src})`,
              WebkitMaskImage: `url(${photo.src})`,
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center bottom",
              WebkitMaskPosition: "center bottom",
              maskMode: "alpha",
            }}
          />
        ) : null}
      </div>
    );
  }
  return (
    <div className="relative h-full w-full">
      <Silhouette art={art} pose={pose} uid={`${uid}-${pose}`} />
      {label && pose === "front" ? (
        <p className="absolute inset-x-0 bottom-0 text-center text-[8px] leading-tight tracking-[0.12em] text-ink uppercase">{label}</p>
      ) : null}
    </div>
  );
}

function Silhouette({ art, pose, uid }: { art: string; pose: Pose; uid: string }) {
  if (pose === "side") return <Side art={art} uid={uid} />;
  return <Front art={art} uid={uid} />;
}

function Front({ art, uid }: { art: string; uid: string }) {
  switch (art) {
    case "puffer":
      return <PufferFront uid={uid} piped={false} />;
    case "vault-sample":
      return <PufferFront uid={uid} piped />;
    case "trailgrip":
      return <ShoeFront uid={uid} />;
    case "hoodie":
      return <HoodFront uid={uid} />;
    case "laptop":
      return <LaptopFront uid={uid} />;
    case "moonwatch":
      return <WatchFront uid={uid} dial="black" subdials />;
    case "moonwatch-vintage":
      return <WatchFront uid={uid} dial="ink" subdials warm />;
    case "submariner":
      return <WatchFront uid={uid} dial="black" dive />;
    case "vault-chrono":
      return <WatchFront uid={uid} dial="champagne" subdials />;
    case "snowboard":
      return <BoardFront uid={uid} />;
    case "vault-goggle":
      return <GoggleFront uid={uid} />;
    case "ghost":
      return <GhostFront uid={uid} />;
    case "si-dior":
      return <DiorFront uid={uid} />;
    case "skis":
      return <SkiFront uid={uid} />;
    case "af1":
      return <Af1Front uid={uid} />;
    case "daytona":
      return <WatchFront uid={uid} dial="black" tachy />;
    case "royal-oak":
      return <RoyalOakFront uid={uid} />;
    default:
      return <HoodFront uid={uid} />;
  }
}

function Side({ art, uid }: { art: string; uid: string }) {
  const metal = art.includes("moon") || art.includes("sub") || art === "vault-chrono" || art === "daytona" || art === "royal-oak";
  const board = art === "snowboard";
  const ski = art === "skis";
  const shoe = art === "trailgrip" || art === "af1";
  const laptop = art === "laptop";
  const light = art === "hoodie" || art === "ghost";
  const fill = light ? "#f4f1ea" : metal ? "#c8ccd2" : board || ski ? "#d5e3ea" : shoe ? "#8d7b4c" : laptop ? "#6a6d58" : "#1c1a17";
  const edge = light ? "#cfc8bc" : metal ? "#8d939c" : shoe ? "#4a3c22" : "#0c0b0a";
  const g = `${uid}-side`;
  return (
    <svg viewBox="0 0 96 280" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={edge} />
          <stop offset="0.42" stopColor={fill} />
          <stop offset="1" stopColor={edge} />
        </linearGradient>
      </defs>
      {ski ? (
        <>
          <path d="M28 8 H42 L38 268 H24 Z" fill={`url(#${g})`} />
          <path d="M52 8 H66 L62 268 H48 Z" fill={`url(#${g})`} />
        </>
      ) : shoe ? (
        <>
          <path d="M46 6 C46 6 58 10 58 22 C58 34 46 32 46 48" fill="none" stroke={edge} strokeWidth="3" strokeLinecap="round" />
          <path d="M30 150 C34 132 62 130 70 156 L76 196 C72 224 28 226 24 198 Z" fill={`url(#${g})`} />
          <path d="M22 198 H78" stroke="#241c14" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : board ? (
        <path d="M44 6 C58 8 62 28 58 52 L52 250 C50 272 40 272 38 250 L32 52 C28 24 32 6 44 6Z" fill={`url(#${g})`} />
      ) : metal ? (
        <>
          <path d="M44 4 H52 L50 78 H46 Z" fill={`url(#${g})`} />
          <circle cx="48" cy="112" r="30" fill={`url(#${g})`} />
          <circle cx="48" cy="112" r="20" fill="#1a1714" />
          <path d="M46 148 H50 L48 188 H46 Z" fill={`url(#${g})`} />
        </>
      ) : laptop ? (
        <path d="M22 70 H74 L78 150 H18 Z" fill={`url(#${g})`} />
      ) : (
        <path
          d="M50 10 C32 8 24 28 28 50 L18 64 C8 86 12 118 28 128 L42 138 C56 148 66 176 58 214 L52 256 C50 274 34 274 32 256 L26 150 C16 112 22 78 36 58 C30 36 36 14 50 10Z"
          fill={`url(#${g})`}
        />
      )}
    </svg>
  );
}

function PufferFront({ uid, piped }: { uid: string; piped: boolean }) {
  return (
    <svg viewBox="0 0 180 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-pf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={piped ? "#2a2418" : "#2c2c2c"} />
          <stop offset="0.4" stopColor="#121212" />
          <stop offset="1" stopColor="#070707" />
        </linearGradient>
      </defs>
      <path
        d="M90 18c-22 0-36 12-42 22l-22 20c-10 8-8 22 2 28l10 150c2 16 16 22 52 22s50-6 52-22l10-150c10-6 12-20 2-28l-22-20c-6-10-20-22-42-22z"
        fill={`url(#${uid}-pf)`}
      />
      <path d="M70 28c8-10 32-10 40 0" fill="none" stroke="#3a3a3a" strokeWidth="3" />
      {Array.from({ length: 6 }).map((_, index) => (
        <path key={index} d={`M48 ${70 + index * 26} H132`} stroke="#000" strokeOpacity="0.45" />
      ))}
      <path d="M90 46 V230" stroke="#0a0a0a" strokeWidth="1.2" />
      {piped ? <path d="M54 48 H126" stroke="#e0c48a" strokeWidth="2" /> : null}
      <path d="M62 20c10 8 46 8 56 0" fill="none" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function HoodFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 180 250" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-hd`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f4ee" />
          <stop offset="1" stopColor="#e4e0d8" />
        </linearGradient>
      </defs>
      <path d="M90 16c-28 0-40 22-36 48 8 6 18 8 36 8s28-2 36-8c4-26-8-48-36-48z" fill="#ece8e0" />
      <path
        d="M48 70c-16 8-22 20-16 40l12 120c2 14 14 18 46 18s44-4 46-18l12-120c6-20 0-32-16-40-10 10-24 14-42 14s-32-4-42-14z"
        fill={`url(#${uid}-hd)`}
      />
      <path d="M70 150h40v28H70z" fill="none" stroke="#c8c3ba" />
      <path d="M58 214h64" stroke="#d5d0c8" strokeWidth="8" />
      <path d="M40 120c6 20 8 40 6 70M140 120c-6 20-8 40-6 70" fill="none" stroke="#ddd8d0" />
    </svg>
  );
}

function ShoeFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a89462" />
          <stop offset="1" stopColor="#6e6240" />
        </linearGradient>
      </defs>
      <path d="M30 18c8-10 20-8 24 2" fill="none" stroke="#5c5034" strokeWidth="1.5" />
      <path d="M36 46c28-18 70-22 108-8 18 6 28 16 30 28 2 16-10 24-28 26H48c-18 0-28-10-24-24 2-10 6-16 12-22z" fill={`url(#${uid}-sh)`} />
      <path d="M40 78c30 8 90 8 140-6" fill="none" stroke="#3c3422" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 48c10 8 18 8 28 0M110 44c8 8 16 8 26 0" fill="none" stroke="#efe6cf" strokeOpacity="0.7" />
    </svg>
  );
}

function LaptopFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 160 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-lp`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8d9074" />
          <stop offset="0.5" stopColor="#3e4634" />
          <stop offset="1" stopColor="#1c1e16" />
        </linearGradient>
      </defs>
      <path d="M28 28h104c8 0 14 6 14 14v150c0 10-8 16-18 16H32c-10 0-18-6-18-16V42c0-8 6-14 14-14z" fill={`url(#${uid}-lp)`} />
      <path d="M40 48h80v8H40z" fill="#0e0f0c" opacity="0.45" />
      <circle cx="48" cy="86" r="16" fill="#6a6248" opacity="0.85" />
      <circle cx="96" cy="120" r="22" fill="#2a2e22" />
      <circle cx="70" cy="150" r="12" fill="#9a9478" opacity="0.7" />
      <path d="M36 36h88" stroke="#d9d3c2" strokeOpacity="0.35" />
    </svg>
  );
}

function WatchFront({
  uid,
  dial,
  subdials,
  dive,
  warm,
  tachy,
}: {
  uid: string;
  dial: "black" | "ink" | "champagne";
  subdials?: boolean;
  dive?: boolean;
  warm?: boolean;
  tachy?: boolean;
}) {
  const face = dial === "champagne" ? "#d9c39a" : dial === "ink" ? "#1c2438" : "#121212";
  const mark = dial === "champagne" ? "#3a2e1c" : "#f2efe8";
  return (
    <svg viewBox="0 0 140 210" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-dial`} cx="40%" cy="35%">
          <stop offset="0" stopColor={warm ? "#2a3348" : face} />
          <stop offset="1" stopColor={face} />
        </radialGradient>
        <linearGradient id={`${uid}-steel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="0.5" stopColor="#b7bcc6" />
          <stop offset="1" stopColor="#6e7480" />
        </linearGradient>
      </defs>
      <rect x="58" y="4" width="24" height="36" rx="4" fill="#5c4030" />
      <rect x="62" y="8" width="16" height="28" rx="2" fill="#7a5640" />
      <circle cx="70" cy="108" r="52" fill={`url(#${uid}-steel)`} />
      {tachy ? <circle cx="70" cy="108" r="48" fill="none" stroke="#e8e4dc" strokeWidth="3" /> : null}
      {dive ? <circle cx="70" cy="108" r="46" fill="#1a1a1a" /> : null}
      <circle cx="70" cy="108" r={dive ? 38 : 44} fill={`url(#${uid}-dial)`} />
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2 - Math.PI / 2;
        const inner = dive ? 30 : 34;
        const outer = dive ? 36 : 40;
        return (
          <line
            key={index}
            x1={Math.round((70 + Math.cos(angle) * inner) * 100) / 100}
            y1={Math.round((108 + Math.sin(angle) * inner) * 100) / 100}
            x2={Math.round((70 + Math.cos(angle) * outer) * 100) / 100}
            y2={Math.round((108 + Math.sin(angle) * outer) * 100) / 100}
            stroke={mark}
            strokeWidth={index % 3 === 0 ? 2 : 1}
          />
        );
      })}
      {subdials ? (
        <>
          <circle cx="70" cy="92" r="8" fill="none" stroke={mark} strokeOpacity="0.7" />
          <circle cx="56" cy="116" r="8" fill="none" stroke={mark} strokeOpacity="0.7" />
          <circle cx="84" cy="116" r="8" fill="none" stroke={mark} strokeOpacity="0.7" />
        </>
      ) : null}
      {dive ? <rect x="84" y="104" width="10" height="8" rx="1" fill="#f4f1ea" /> : null}
      <line x1="70" y1="108" x2="70" y2="78" stroke={mark} strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="108" x2="92" y2="116" stroke={mark} strokeWidth="2" strokeLinecap="round" />
      <circle cx="70" cy="108" r="2.5" fill={mark} />
      <rect x="108" y="104" width="10" height="6" rx="1" fill={`url(#${uid}-steel)`} />
      <rect x="58" y="158" width="24" height="40" rx="3" fill="#5c4030" />
    </svg>
  );
}

function BoardFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 120 300" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bd`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fbff" />
          <stop offset="0.5" stopColor="#d5e6ee" />
          <stop offset="1" stopColor="#b7cdd8" />
        </linearGradient>
      </defs>
      <path
        d="M60 10c22 2 34 18 32 40l-8 200c-2 22-12 36-24 36s-22-14-24-36L28 50c-2-22 10-38 32-40z"
        fill={`url(#${uid}-bd)`}
      />
      <path d="M60 28 V270" stroke="#4A5275" strokeOpacity="0.35" />
      <rect x="44" y="120" width="32" height="14" rx="2" fill="#4A5275" opacity="0.35" />
      <rect x="44" y="168" width="32" height="14" rx="2" fill="#4A5275" opacity="0.35" />
    </svg>
  );
}

function GoggleFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 180 110" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-lens`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a7588" />
          <stop offset="1" stopColor="#1c212b" />
        </linearGradient>
      </defs>
      <path d="M90 8v18" stroke="#f3f1ea" strokeWidth="8" strokeLinecap="round" />
      <rect x="18" y="28" width="144" height="62" rx="18" fill="#f4f1ea" />
      <rect x="28" y="38" width="124" height="42" rx="12" fill={`url(#${uid}-lens)`} />
      <path d="M90 40 V78" stroke="#f4f1ea" strokeOpacity="0.5" />
    </svg>
  );
}

function GhostFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 180 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-gh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f1ea" />
          <stop offset="1" stopColor="#d9d4ca" />
        </linearGradient>
      </defs>
      <path
        d="M90 22c-24 0-38 14-42 28l-18 18c-8 8-6 18 2 22l8 148c2 14 14 20 50 20s48-6 50-20l8-148c8-4 10-14 2-22l-18-18c-4-14-18-28-42-28z"
        fill={`url(#${uid}-gh)`}
      />
      <path d="M54 70 H126 M50 98 H130 M48 126 H132 M48 154 H132 M50 182 H130" stroke="#f7f6f2" strokeWidth="3" />
      <path d="M90 48 V214" stroke="#f7f6f2" strokeWidth="2" />
      <circle cx="90" cy="36" r="6" fill="#4A5275" />
    </svg>
  );
}

function DiorFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 180 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-dr`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a3148" />
          <stop offset="1" stopColor="#141820" />
        </linearGradient>
      </defs>
      <path
        d="M90 20c-26 0-40 16-44 32l-16 16c-8 8-4 18 4 22l10 146c2 16 16 22 46 22s44-6 46-22l10-146c8-4 12-14 4-22l-16-16c-4-16-18-32-44-32z"
        fill={`url(#${uid}-dr)`}
      />
      <path d="M48 78 H132 M46 110 H134 M46 142 H134 M48 174 H132" stroke="#c9b27a" strokeOpacity="0.55" />
      <rect x="74" y="40" width="32" height="10" fill="#e8e0d2" />
    </svg>
  );
}

function SkiFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 140 300" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-sk`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f4f1ea" />
          <stop offset="0.5" stopColor="#4A5275" />
          <stop offset="1" stopColor="#1c2030" />
        </linearGradient>
      </defs>
      <path d="M38 16c8-6 16-4 16 8l-6 250c-1 10-8 16-14 12-8-4-10-12-8-22L28 28c0-8 4-10 10-12z" fill={`url(#${uid}-sk)`} />
      <path d="M86 16c8-6 16-4 16 8l-6 250c-1 10-8 16-14 12-8-4-10-12-8-22L76 28c0-8 4-10 10-12z" fill={`url(#${uid}-sk)`} />
    </svg>
  );
}

function Af1Front({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 200 130" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-af`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfaf7" />
          <stop offset="1" stopColor="#e6e1d8" />
        </linearGradient>
      </defs>
      <path d="M34 20c10-12 22-8 26 2" fill="none" stroke="#cfc8bc" strokeWidth="1.6" />
      <path d="M40 52c30-20 74-24 112-6 16 8 26 16 28 28 2 14-12 22-30 24H52c-20 0-30-10-26-24 2-8 6-16 14-22z" fill={`url(#${uid}-af)`} stroke="#4A5275" strokeWidth="1.2" />
      <path d="M46 86c32 8 90 8 132-8" fill="none" stroke="#2a2e3a" strokeWidth="7" strokeLinecap="round" />
      <path d="M78 58h28M118 54h24" stroke="#4A5275" strokeOpacity="0.45" />
    </svg>
  );
}

function RoyalOakFront({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 140 220" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${uid}-ro`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f6f8" />
          <stop offset="0.5" stopColor="#b7bcc6" />
          <stop offset="1" stopColor="#6e7480" />
        </linearGradient>
      </defs>
      <rect x="58" y="4" width="24" height="30" rx="3" fill="#5c4030" />
      <polygon points="70,46 98,58 110,86 98,114 70,126 42,114 30,86 42,58" fill={`url(#${uid}-ro)`} />
      <polygon points="70,56 92,66 102,86 92,106 70,116 48,106 38,86 48,66" fill="#16181e" />
      <circle cx="70" cy="86" r="14" fill="none" stroke="#d9c4a2" strokeWidth="1.4" />
      <line x1="70" y1="86" x2="70" y2="74" stroke="#f4f1ea" strokeWidth="1.4" />
      <line x1="70" y1="86" x2="80" y2="92" stroke="#f4f1ea" strokeWidth="1.4" />
      <rect x="58" y="130" width="24" height="72" rx="3" fill="#5c4030" />
    </svg>
  );
}
