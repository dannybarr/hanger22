import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="display text-5xl text-ink">Privacy</h1>
      <p>V1 stores two things in your browser: piece requests, and drop-list addresses. They stay in localStorage on that device. Clearing site data removes them.</p>
      <p>The request form also posts to this site. The handler checks the fields and writes a log line. It does not yet save to a database or send email. Do not put anything in the notes you would not put in a server log.</p>
      <p>There are no advertising pixels and no account system. If that changes, this page changes first.</p>
      <p>To ask about a request you already sent, email requests@hanger22.example. That address is not monitored until the domain is live.</p>
    </>
  );
}
