function Bracket({ gold, flip }: { gold?: boolean; flip?: boolean }) {
  const plate = gold ? "#8a7044" : "#c5c8ce";
  const plateDark = gold ? "#5c4318" : "#8e949e";
  const screw = gold ? "#f3e2bc" : "#f7f8fa";
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden className={flip ? "-scale-x-100" : undefined}>
      <rect x="1" y="2" width="8" height="18" rx="1" fill={plate} />
      <circle cx="5" cy="7" r="0.9" fill={screw} />
      <circle cx="5" cy="15" r="0.9" fill={screw} />
      <path d="M9 8 H18 V14 H9Z" fill={plateDark} />
    </svg>
  );
}

export function RailBar({ gold }: { gold?: boolean }) {
  const bar = gold
    ? "linear-gradient(180deg,#fff6e4 0%,#f0d48a 18%,#c4923e 46%,#ffe9b5 62%,#8c6424 84%,#e7c98a 100%)"
    : "linear-gradient(180deg,#f7f7f6 0%,#d5d6d4 28%,#2a2a28 46%,#3a3a38 62%,#b9bab8 100%)";
  return (
    <div className="relative h-[22px]">
      <div className="absolute inset-x-0 top-[7px] flex items-center">
        <Bracket gold={gold} flip />
        <div
          className="h-[7px] flex-1"
          style={{
            background: bar,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 1px rgba(0,0,0,0.45)",
          }}
        />
        <Bracket gold={gold} />
      </div>
    </div>
  );
}
