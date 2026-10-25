import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delivery and returns",
  description: "How Hanger 22 delivers, and how to return a piece within 14 days.",
};

export default function ReturnsPage() {
  return (
    <>
      <p className="eyebrow">Help</p>
      <h1 className="display text-[48px] text-ink sm:text-[64px]">Delivery and returns</h1>

      <h2>Delivery</h2>
      <p>
        Your delivery method and date are confirmed in your personal checkout, before you pay.
      </p>
      <p>Once the piece is on its way, we send you the tracking details by email.</p>

      <h2>Changing your mind</h2>
      <p>
        You have 14 days from the day the piece is delivered to tell us you want to return it. You do not need to give a reason. Write to us through the <Link href="/contact">contact page</Link> and we will reply with how to send it back.
      </p>
      <p>
        Please send the piece back within 14 days of telling us, unworn and as it arrived, with any tags, packaging and dust bags. We refund you within 14 days of receiving it, to the way you paid.
      </p>

      <h2>If something is not right</h2>
      <p>
        If a piece arrives damaged, or not as we described it, tell us within 14 days of delivery. We arrange and pay for the return and refund you in full. Otherwise, return postage is yours to arrange and pay.
      </p>

      <h2>Your rights</h2>
      <p>These terms do not affect your statutory rights as a consumer in the United Kingdom.</p>
    </>
  );
}
