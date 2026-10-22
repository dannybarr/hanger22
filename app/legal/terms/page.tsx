import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <h1 className="display text-5xl text-ink">Terms</h1>
      <p>Prices are shown in pounds and can change. A piece is sold through the marketplace listing on its page.</p>
      <p>These draft terms are meant to be read under the law of England and Wales.</p>
    </>
  );
}
