import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "How to buy",
  description: "Buying from Hanger 22 is simple. Choose your piece, express your intent to buy, and complete your private checkout.",
};

const STEPS = [
  {
    title: "Choose your piece",
    body: "Every piece in the edit is limited, a collaboration or a rarity from its range. Read its story, check the size and condition, and press Buy now.",
  },
  {
    title: "Express your intent to buy",
    body: "Leave your name, email and size. It takes a moment and no payment is taken at this stage.",
  },
  {
    title: "Complete your private checkout",
    body: "We send a checkout link made for you by email. Your delivery date and method are confirmed there, and you pay securely to complete your order.",
  },
  {
    title: "Delivered to you",
    body: "Your piece is sent to your door. You then have 14 days from delivery to change your mind.",
  },
];

const QUESTIONS = [
  {
    q: "Why a private checkout?",
    a: "Our pieces are limited, and many exist in very small numbers. A private checkout means each piece goes to one buyer, with a moment to confirm size and delivery before you pay.",
  },
  {
    q: "When do I pay?",
    a: "Only when you complete your private checkout. Expressing your intent to buy is free and does not commit you to anything.",
  },
  {
    q: "What if I change my mind?",
    a: "You have 14 days from delivery to return a piece, unworn and as it arrived. Our delivery and returns page has the details.",
  },
  {
    q: "Can you find a piece that is not in the edit?",
    a: "Yes. Our personal shopping team can look for almost anything. Tell us the piece, your size and your budget.",
  },
];

export default function HowToBuyPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="pb-24">
        <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
          <p className="eyebrow">Client services</p>
          <h1 className="display mt-3 max-w-4xl text-[48px] text-ink sm:text-[72px]">How to buy</h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed">
            Buying from Hanger 22 is simple and private. Every piece is sold through a personal checkout, so it goes to one buyer at a time.
          </p>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-5 sm:px-8" aria-label="The steps">
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-t border-ink pt-5">
                <p className="mono text-[12px] text-muted">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="display mt-4 text-[28px] text-ink">{step.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="tile mt-24" aria-labelledby="questions">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-20">
            <h2 id="questions" className="display text-[40px] text-ink">
              Questions
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {QUESTIONS.map((item) => (
                <details key={item.q} className="fold">
                  <summary className="flex items-center justify-between gap-6 py-5 text-[16px] font-medium text-ink">
                    {item.q}
                    <span className="fold-mark text-[20px] leading-none font-normal" aria-hidden>
                      +
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-6 text-[15px] leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 sm:px-8">
          <p className="display text-[32px] text-ink">Ready to choose?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pieces" className="btn-solid px-10">
              Shop all
            </Link>
            <Link href="/contact" className="pill-btn min-h-[54px] px-10">
              Personal shopping
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
