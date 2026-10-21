import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE_DESCRIPTION, SITE_NAME, siteOrigin } from "@/lib/site";
import "./globals.css";
import "lenis/dist/lenis.css";

const origin = siteOrigin("https://hanger22.example");

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const json = organizationJsonLd(origin);
  return (
    <html lang="en-GB">
      <body className="antialiased">
        <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2">
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      </body>
    </html>
  );
}
