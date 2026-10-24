import Link from "next/link";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Wordmark } from "@/components/layout/Wordmark";
import { getPublicItems } from "@/lib/data";
import { CATEGORY_LABEL, PROMISES } from "@/lib/site";

export type NavLink = { href: string; label: string };

/** Categories only appear in the nav once there is something to show in them. */
export function shopLinks(): NavLink[] {
  const present = new Set(getPublicItems().map((item) => item.category));
  const categories = Object.entries(CATEGORY_LABEL)
    .filter(([id]) => present.has(id as keyof typeof CATEGORY_LABEL))
    .map(([id, label]) => ({ href: `/pieces?category=${id}`, label }));
  return [{ href: "/pieces", label: "Shop all" }, ...categories, { href: "/brands", label: "Brands" }];
}

export function UtilityBar() {
  return (
    <div className="utility-bar">
      <ul className="mx-auto flex h-8 max-w-7xl items-center justify-center gap-10 px-4">
        {PROMISES.map((line, index) => (
          <li key={line} className={index === 0 ? "" : "hidden md:block"}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const links = shopLinks();
  return (
    <header className={overlay ? "relative z-20" : "relative z-20 border-b border-line bg-paper"}>
      <UtilityBar />
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        <nav aria-label="Shop" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="lg:hidden">
          <MobileMenu links={[...links, { href: "/reserving", label: "How reserving works" }, { href: "/contact", label: "Contact" }]} />
        </div>
        <Link href="/" aria-label="Hanger 22, home">
          <Wordmark />
        </Link>
        <nav aria-label="Help" className="flex items-center justify-end gap-7">
          <Link href="/pieces#search" className="nav-link hidden sm:inline-block">
            Search
          </Link>
          <Link href="/reserving" className="nav-link hidden lg:inline-block">
            How it works
          </Link>
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const shop = shopLinks();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Wordmark />
          <p className="mt-5 text-[14px] leading-relaxed text-muted">
            A small rail of rare collaborations and hard-to-find pieces, based in London.
          </p>
        </div>
        <FooterColumn title="Shop" links={shop} />
        <FooterColumn
          title="Help"
          links={[
            { href: "/reserving", label: "How reserving works" },
            { href: "/legal/returns", label: "Delivery and returns" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <FooterColumn
          title="Hanger 22"
          links={[
            { href: "/legal/terms", label: "Terms" },
            { href: "/legal/privacy", label: "Privacy" },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-[12px] text-muted sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Hanger 22, London</p>
          <p>Prices in pounds sterling</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title}>
      <p className="eyebrow">{title}</p>
      <ul className="mt-5 grid gap-3 text-[14px]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-body transition-colors hover:text-muted">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
