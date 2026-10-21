import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <h1 className="display text-5xl text-ink">Terms</h1>
      <p>Hanger 22 shows source listings. A request is an enquiry, not an order and not a contract to buy.</p>
      <p>Guide prices are the last figure we can cite, converted to pounds and marked up. They are not an offer. The seller’s price can move or the listing can vanish before we reply.</p>
      <p>We do not take payment on this website. If a piece is still available and you want it, the commercial terms are agreed in writing after that, including any fee for the search itself.</p>
      <p>These draft terms are meant to be read under the law of England and Wales. They are not a substitute for advice.</p>
    </>
  );
}
