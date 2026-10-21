import type { Metadata } from "next";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <>
      <h1 className="display text-5xl text-ink">Returns</h1>
      <p>The Trailgrip in the vault ships from the desk. The five jackets on the rail are sourced to order, so a return follows the listing we buy from, or the terms agreed before anyone pays.</p>
      <p>A sold comparable is not for sale and cannot be returned. If a piece needs a specialist to authenticate it, that check happens before it ships, and we agree what happens if they disagree with the listing.</p>
    </>
  );
}
