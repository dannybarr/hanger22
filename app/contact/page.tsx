import type { Metadata } from "next";
import Link from "next/link";
import { AskForm } from "@/components/contact/AskForm";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask Hanger 22 for a piece, or ask us anything about one on the rail.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="display mt-3 text-[48px] text-ink sm:text-[64px]">Ask us for a piece</h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed">
              The rail is small on purpose, and most of what we find never makes it online. Tell us the piece you are hunting for, the size, and what you would pay. A person reads every message.
            </p>
            <dl className="mt-10 grid gap-6 border-t border-line pt-8 text-[15px]">
              <div>
                <dt className="field-label">About a piece on the rail</dt>
                <dd className="mt-2 leading-relaxed">
                  Reserve it from its page and we will be in touch, or write below and name it.
                </dd>
              </div>
              <div>
                <dt className="field-label">Where we are</dt>
                <dd className="mt-2">London, United Kingdom</dd>
              </div>
              <div>
                <dt className="field-label">Before you buy</dt>
                <dd className="mt-2">
                  <Link href="/reserving" className="underline underline-offset-4 hover:text-muted">
                    How reserving works
                  </Link>
                  {" · "}
                  <Link href="/legal/returns" className="underline underline-offset-4 hover:text-muted">
                    Delivery and returns
                  </Link>
                </dd>
              </div>
            </dl>
          </div>
          <AskForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
