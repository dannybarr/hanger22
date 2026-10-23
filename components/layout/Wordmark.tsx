export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 leading-none text-ink ${className}`}>
      <span className="font-display text-[22px] font-semibold tracking-[0.16em] uppercase">Hanger</span>
      <span className="mono inline-flex h-[22px] items-center border border-current px-1.5 text-[12px] font-medium">22</span>
    </span>
  );
}
