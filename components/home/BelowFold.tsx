import Link from "next/link";
import { DropListForm } from "@/components/home/DropListForm";
import { SiteFooter } from "@/components/layout/SiteChrome";
import type { PublicItem } from "@/lib/schema";

export function BelowFold({ items }: { items: PublicItem[] }) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <p className="text-[11px] tracking-[0.16em] text-ink uppercase">On the rail this week</p>
        <h2 className="display mt-3 text-4xl text-ink sm:text-5xl">The stories behind the hangers</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} href={`/p/${item.slug}`} className="border border-line p-6 hover:border-ink">
              <p className="text-[11px] tracking-[0.14em] text-muted uppercase">{item.brand}</p>
              <h3 className="display mt-2 text-[32px] text-ink">{item.shortTitle}</h3>
              <p className="mt-3 line-clamp-4 max-w-md text-[15px] leading-relaxed">{item.story}</p>
              <span className="mt-6 inline-block text-[12px] tracking-[0.12em] text-ink uppercase">Read the piece →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-[11px] tracking-[0.16em] text-ink uppercase">How sourcing works</p>
          <h2 className="display mt-3 text-4xl text-ink">Request, then we move</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              ["01", "Request", "Tell us the piece, the size, and the budget. It takes a minute. Nothing is charged on this site."],
              ["02", "We hunt and authenticate", "If it is already in the vault, it ships. If not, we open the listing, check the seller, and agree the route before any money moves."],
              ["03", "Delivered, verified", "You get the piece with the comp, the listing URL, and what we checked. If a sourced piece has gone, we say so."],
            ].map(([n, title, body]) => (
              <li key={n}>
                <p className="text-[12px] tracking-[0.16em] text-muted">{n}</p>
                <h3 className="display mt-2 text-[28px] text-ink">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Provenance</p>
          <h2 className="display mt-3 text-4xl text-ink">Every price has a link</h2>
          <p className="mt-6 text-[17px] leading-relaxed">
            A guide price is the last comp we can point at, plus a sourcing margin, in pounds. What we paid stays off the site. Four of the rail pictures are the seller’s garment-only frame from Vestiaire. The Ghost is a Bloomingdale’s UAE packshot of the same jacket, because the Farfetch frame showed a model. Those photographs identify the piece. They are not campaign imagery.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed">
            Pieces without a photograph we can stand behind stay off the rail.
          </p>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Film</p>
          <h2 className="display mt-3 text-4xl text-ink">Stills of the five jackets</h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            The same cut-outs that hang on the rail. No embed, no borrowed video, no watches.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 pb-2">
            {items.map((item) => (
              <figure key={item.id} className="w-40 shrink-0">
                <div className="dotgrid flex h-72 items-end justify-center border border-line px-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.images.front} alt="" className="h-56 w-full object-contain object-bottom" />
                </div>
                <figcaption className="mt-2 text-[12px] text-muted">{item.shortTitle}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="drop-list" className="border-t border-line">
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Drop list</p>
          <h2 className="display mt-3 text-4xl text-ink">New grails, in your inbox later</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            V1 stores the address in this browser. It does not send mail yet.
          </p>
          <DropListForm />
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
