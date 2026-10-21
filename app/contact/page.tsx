import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { RequestButton } from "@/components/request/RequestButton";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask Hanger 22 to source a piece. London desk, email reply.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Contact</p>
        <h1 className="display mt-3 text-5xl text-ink">Write to the desk</h1>
        <p className="mt-6 text-[17px] leading-relaxed">
          The mailbox below is a placeholder until the domain is live. The form is the one that actually lands: it validates, returns 202, and keeps a copy in this browser.
        </p>
        <p className="mt-4 text-[15px]">
          <a className="text-ink underline" href="mailto:requests@hanger22.example">
            requests@hanger22.example
          </a>
        </p>
        <p className="mt-2 text-[15px] text-muted">London, United Kingdom</p>
        <div className="mt-10">
          <RequestButton itemId="general" title="A general request" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
