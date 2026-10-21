import { MARQUEE_PHRASE } from "@/lib/site";

export function Marquee() {
  const line = MARQUEE_PHRASE.repeat(4);
  return (
    <div className="marquee" data-testid="marquee" tabIndex={0} aria-label="Announcements. Focus or hover pauses.">
      <div className="marquee-track" data-testid="marquee-track">
        <span className="px-3 text-[12px] leading-none tracking-[0.14em] uppercase">{line}</span>
        <span className="px-3 text-[12px] leading-none tracking-[0.14em] uppercase" aria-hidden>
          {line}
        </span>
      </div>
    </div>
  );
}
