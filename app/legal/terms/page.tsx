import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <>
      <p className="eyebrow">Hanger 22</p>
      <h1 className="display text-[48px] text-ink sm:text-[64px]">Terms</h1>

      <h2>Expressing intent to buy</h2>
      <p>
        When you press Buy now and send your details, you are telling us you intend to buy that piece. It is not a purchase and costs nothing. If a piece becomes unavailable before you complete your checkout, we will let you know and you will not be charged.
      </p>

      <h2>Buying</h2>
      <p>
        Your purchase is agreed when you complete the personal checkout link we send you by email. Your checkout confirms the piece, the price, and the delivery method and date. Prices are in pounds sterling.
      </p>

      <h2>Pieces and condition</h2>
      <p>
        Many pieces are previously owned or no longer sold in shops. Each one is graded for condition and described in full on its page, and any size we confirm at checkout is shown as such.
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
