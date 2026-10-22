import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="display text-5xl text-ink">Privacy</h1>
      <p>Hanger 22 does not run advertising pixels or accounts. Mail sent to the desk is used only to reply.</p>
    </>
  );
}
