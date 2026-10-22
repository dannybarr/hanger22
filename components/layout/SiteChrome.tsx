import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <nav aria-label="Primary" className="flex gap-5">
          <Link href="/pieces" className="nav-link">
            Pieces
          </Link>
          <Link href="/brands" className="nav-link">
            Brands
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
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="font-script text-[28px] text-ink">Hanger 22</p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/pieces">Pieces</Link>
          <Link href="/brands">Brands</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/returns">Shipping and returns</Link>
        </nav>
      </div>
    </footer>
  );
}
