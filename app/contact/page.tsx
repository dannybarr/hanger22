import type { Metadata } from "next";
import Link from "next/link";
import { AskForm } from "@/components/contact/AskForm";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Personal shopping",
  description: "Tell Hanger 22 the piece you are looking for and our team will find it for you.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-7xl px-5 pt-10 pb-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
          <div>
            <p className="eyebrow">Personal shopping</p>
            <h1 className="display mt-3 text-[48px] text-ink sm:text-[64px]">Tell us what you are looking for</h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed">
              Our edit is small on purpose, and there is always more we can find. Tell us the piece, your size and your budget, and our team will come back to you by email.
            </p>
            <dl className="mt-10 grid gap-6 border-t border-line pt-8 text-[15px]">
              <div>
                <dt className="field-label">About a piece in the edit</dt>
                <dd className="mt-2 leading-relaxed">
                  Press Buy now on its page, or write below and name it.
                </dd>
              </div>
              <div>
                <dt className="field-label">Where we are</dt>
                <dd className="mt-2">London, United Kingdom</dd>
              </div>
              <div>
                <dt className="field-label">Before you buy</dt>
                <dd className="mt-2">
                  <Link href="/how-to-buy" className="underline underline-offset-4 hover:text-muted">
                    How to buy
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
