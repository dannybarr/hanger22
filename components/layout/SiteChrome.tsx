import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <nav aria-label="Primary" className="flex gap-5">
          <Link href="/pieces" className="nav-link">
            Pieces
          </Link>
          <Link href="/about" className="nav-link">
            About
          </Link>
        </nav>
        <Link href="/" className="text-center leading-none text-ink">
          <span className="block font-script text-[26px] leading-none">Hanger</span>
          <span className="mt-1 ml-4 block font-script text-[20px] leading-none">22</span>
        </Link>
        <nav aria-label="Secondary" className="flex gap-5">
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 text-[13px] text-muted sm:grid-cols-3">
        <div>
          <p className="font-script text-[28px] text-ink">Hanger 22</p>
          <p className="mt-2 max-w-xs leading-relaxed">London. Five jackets on the rail, sourced to order. The Trailgrip is in the vault.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/pieces">Pieces</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/#drop-list">Drop list</Link>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/returns">Returns</Link>
          <Link href="/llms.txt">llms.txt</Link>
        </div>
      </div>
    </footer>
  );
}
