"use client";

import { List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useModal } from "@/components/forms/Field";
import { createPortal } from "react-dom";
import type { NavLink } from "@/components/layout/SiteChrome";

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    window.__hangerLenis?.stop();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.__hangerLenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" className="-ml-2 flex h-11 w-11 items-center justify-center text-ink" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
        <List size={22} />
      </button>
      {open
        ? createPortal(
            <MenuPanel>
              <div className="flex h-16 items-center justify-between px-5">
                <span className="eyebrow">Menu</span>
                <button type="button" className="-mr-2 flex h-11 w-11 items-center justify-center text-ink" aria-label="Close menu" onClick={() => setOpen(false)}>
                  <X size={22} />
                </button>
              </div>
              <ul className="border-t border-line px-5">
                {links.map((link) => (
                  <li key={link.href} className="border-b border-line">
                    <Link href={link.href} className="display block py-5 text-[30px] text-ink" onClick={() => setOpen(false)}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </MenuPanel>,
            document.body,
          )
        : null}
    </>
  );
}

function MenuPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useModal(ref);
  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-paper" role="dialog" aria-modal="true" aria-label="Menu">
      {children}
    </div>
  );
}
