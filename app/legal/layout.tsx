import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="content" className="mx-auto max-w-2xl px-6 py-16">
        <p className="border border-line px-4 py-3 text-[13px] leading-relaxed text-muted">
          Draft for the V1 front end. Have a solicitor review it before the desk takes money or holds personal data beyond this browser.
        </p>
        <div className="mt-10 space-y-4 text-[16px] leading-relaxed">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
