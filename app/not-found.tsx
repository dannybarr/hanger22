import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { RailBar } from "@/components/rail/RailBar";
import { Suspension } from "@/components/rail/Hanger";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="dotgrid flex min-h-[70vh] flex-col items-center justify-center px-6 py-20">
        <div className="w-[min(640px,88vw)]">
          <RailBar />
          <div className="empty-swing mx-auto mt-1 w-24 origin-top">
            <Suspension mode="wood" width={96} uid="missing" />
          </div>
        </div>
        <p className="display mt-8 text-[28px] text-ink">Sold before you got here.</p>
        <Link href="/" className="pill-btn mt-6">
          Back to the rail
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
