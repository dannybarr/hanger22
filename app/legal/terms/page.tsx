import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <p className="eyebrow">Hanger 22</p>
      <h1 className="display text-[48px] text-ink sm:text-[64px]">Terms</h1>

      <h2>Reserving</h2>
      <p>
        Reserving a piece asks us to secure it and confirm it with you. A reservation is not a purchase and costs nothing. Either of us can cancel it before you pay, and we will tell you straight away if a piece is no longer available.
      </p>

      <h2>Buying</h2>
      <p>
        Your purchase is agreed when you pay the payment link we send you. Before then we will have sent you photographs of the piece, its condition and the delivery method and date. Prices are in pounds sterling and are the price shown when we send your link.
      </p>

      <h2>Pieces and condition</h2>
      <p>
        Most pieces are pre-owned or no longer sold in shops. We describe the condition of each one and photograph any wear before you pay. Measurements and sizes come from the labels and, where noted, from the previous owner.
      </p>

      <h2>Delivery and returns</h2>
      <p>
        Delivery and your right to return a piece within 14 days are set out on our <Link href="/legal/returns">delivery and returns</Link> page.
      </p>

      <h2>Law</h2>
      <p>These terms are governed by the law of England and Wales. They do not affect your statutory rights.</p>
    </>
  );
}
