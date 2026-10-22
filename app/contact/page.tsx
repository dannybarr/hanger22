import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to Hanger 22 in London.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Contact</p>
        <h1 className="display mt-3 text-5xl text-ink">Contact</h1>
        <p className="mt-6 text-[17px] leading-relaxed">London, United Kingdom</p>
        <p className="mt-4 text-[15px]">
          <a className="text-ink underline" href="mailto:requests@hanger22.example">
            requests@hanger22.example
          </a>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
