import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <p className="eyebrow">Hanger 22</p>
      <h1 className="display text-[48px] text-ink sm:text-[64px]">Privacy</h1>

      <h2>What we collect</h2>
      <p>
        When you express your intent to buy or write to us, we receive your name, your email address and anything else you choose to add, such as a phone number, your size, a budget or a note.
      </p>

      <h2>How we use it</h2>
      <p>
        Only to send your personal checkout, reply to your message, and arrange delivery if you buy. We do not sell your details, and we do not run advertising pixels or tracking on this site.
      </p>

      <h2>Where it is kept</h2>
      <p>
        This site is hosted by Vercel, and the details you send reach our team by email through FormSubmit, an email delivery service. We keep your details until your request is settled, and after a sale for as long as the law requires us to keep sales records.
      </p>

      <h2>On your device</h2>
      <p>
        This site remembers a few things in your own browser, such as whether you turned the rail sound on. You can clear them at any time in your browser settings.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us what we hold about you, or ask us to delete it, through the <Link href="/contact">contact page</Link>.
      </p>
    </>
  );
}
