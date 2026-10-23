import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";

export const metadata: Metadata = {
  title: "How reserving works",
  description: "At Hanger 22 you reserve first, see the piece up close, and pay only when you are happy.",
};

const STEPS = [
  {
    title: "You reserve",
    body: "Choose a piece, give us your name, email and size. That is all. Nothing is charged and you are not committed to anything.",
  },
  {
    title: "We secure and check it",
    body: "We secure the piece for you and check it against its labels, its maker's details and its photographs. Then we email you close photographs of the labels and any wear.",
  },
  {
    title: "You decide",
    body: "If you are happy, we send a secure payment link along with the delivery method and date. If anything is not as described, or you have changed your mind, you owe nothing.",
  },
  {
    title: "It arrives",
    body: "We send it on once you have paid. You then have 14 days from delivery to change your mind and return it, unworn and as it arrived.",
  },
];

const QUESTIONS = [
  {
    q: "Why not pay at checkout like everywhere else?",
    a: "Because every piece here is one of one. We would rather you saw the labels and the condition for yourself before any money moves. It is how a good boutique would hand over something rare.",
  },
  {
    q: "How do you know a piece is authentic?",
    a: "We check each piece against its labels, its maker's details and its photographs before we offer it to you, and we send you those photographs too. If we are not confident in a piece, we do not sell it.",
  },
  {
    q: "What if the piece has already gone?",
    a: "Rare pieces move quickly and sometimes one sells before we can secure it. If that happens we tell you straight away. You will not have paid anything, and we are happy to hunt for another.",
  },
  {
    q: "Can I ask for a piece that is not on the rail?",
    a: "Yes. Most of what we find never reaches the site. Tell us what you are looking for on the contact page.",
  },
];

export default function ReservingPage() {
  return (
    <>
      <SiteHeader />
      <main id="content" className="pb-24">
        <section className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
          <p className="eyebrow">Buying from Hanger 22</p>
          <h1 className="display mt-3 max-w-4xl text-[48px] text-ink sm:text-[72px]">See it before you pay</h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed">
            Every piece on the rail is one of a kind, so we do not take your money first. You reserve, we confirm the piece with you, and you pay only once you have seen it up close and said yes.
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
          <p className="display text-[32px] text-ink">Ready to look?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pieces" className="btn-solid px-10">
              Shop all
            </Link>
            <Link href="/contact" className="pill-btn min-h-[54px] px-10">
              Ask for a piece
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
