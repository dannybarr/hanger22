import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shipping and returns" };

export default function ReturnsPage() {
  return (
    <>
      <h1 className="display text-5xl text-ink">Shipping and returns</h1>
      <p>Shipping and returns follow the marketplace listing linked on the piece. Write to the desk if something arrives not as described.</p>
    </>
  );
}