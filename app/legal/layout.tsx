import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-3xl px-5 pt-10 pb-24 sm:px-8">
        <div className="legal grid gap-5 text-[16px] leading-relaxed [&_h2]:mt-8 [&_h2]:text-[13px] [&_h2]:font-medium [&_h2]:tracking-[0.1em] [&_h2]:text-ink [&_h2]:uppercase [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
        <p className="mt-14 border-t border-line pt-6 text-[13px] text-muted">Last updated 23 October 2026</p>
      </main>
      <SiteFooter />
    </>
  );
}
