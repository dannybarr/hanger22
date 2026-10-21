import { cutLabel, marketNote } from "@/lib/cut";
import { buyOutrightScore, demandLabel, priceToMarketGap } from "@/lib/desk";
import { getItems, getSourcesFor } from "@/lib/data";
import { formatGBP, formatSourceMoney, toGBP } from "@/lib/money";

export function StudioDesk() {
  const rows = getItems()
    .map((item) => {
      const sources = getSourcesFor(item.id);
      const costGBP = toGBP(item.costBasis.amount, item.costBasis.currency);
      return { item, sources, costGBP, score: buyOutrightScore(item), gap: priceToMarketGap(item) };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <main id="content" className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Desk</p>
      <h1 className="display mt-3 text-5xl text-ink">Buy outright</h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        Read-only. Cost, markup and margin stay on this page. The score weighs margin, the demand signal, and the gap between the guide midpoint and what the desk pays. Pieces already in the vault are marked held.
      </p>
      <div className="mt-10 overflow-x-auto" tabIndex={0} aria-label="Buy outright ledger">
        <table className="w-full min-w-[880px] border-collapse text-left text-[13px]">
          <caption className="sr-only">Source, cost, list price, margin and buy-outright score</caption>
          <thead>
            <tr className="border-b border-line text-[11px] tracking-[0.12em] text-muted uppercase">
              <th scope="col" className="py-3 pr-4 font-medium">Piece</th>
              <th scope="col" className="py-3 pr-4 font-medium">Source</th>
              <th scope="col" className="py-3 pr-4 font-medium">Cost</th>
              <th scope="col" className="py-3 pr-4 font-medium">List</th>
              <th scope="col" className="py-3 pr-4 font-medium">Margin</th>
              <th scope="col" className="py-3 pr-4 font-medium">Demand</th>
              <th scope="col" className="py-3 pr-4 font-medium">Gap</th>
              <th scope="col" className="py-3 font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ item, sources, costGBP, score, gap }) => (
              <tr key={item.id} className="border-b border-line align-top">
                <th scope="row" className="py-4 pr-4 font-normal">
                  <span className="text-ink">{item.shortTitle}</span>
                  <span className="mt-1 block text-[12px] text-muted">{item.brand}</span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {cutLabel(item.cutReason)} · {marketNote(item.sourceMarket)} · {item.authConfidence}
                  </span>
                  <span className="mt-1 block text-[11px] tracking-[0.08em] text-muted uppercase">
                    {item.unlisted ? "Unlisted" : item.availability === "in_vault" ? "Held" : "To order"}
                  </span>
                </th>
                <td className="py-4 pr-4">
                  {sources.length === 0 ? (
                    <span className="text-muted">No listing</span>
                  ) : (
                    sources.map((source) => (
                      <a key={source.id} href={source.url} className="block text-ink underline-offset-2 hover:underline" rel="noreferrer">
                        {source.platform}
                      </a>
                    ))
                  )}
                </td>
                <td className="py-4 pr-4 tabular-nums">
                  {formatGBP(costGBP)}
                  <span className="mt-1 block text-[11px] text-muted">
                    {formatSourceMoney(item.costBasis.amount, item.costBasis.currency)}
                  </span>
                </td>
                <td className="py-4 pr-4 tabular-nums">
                  {formatGBP(item.guidePriceGBP.min)}–{formatGBP(item.guidePriceGBP.max)}
                </td>
                <td className="py-4 pr-4 tabular-nums">
                  {formatGBP(item.estimatedMarginGBP)}
                  <span className="mt-1 block text-[11px] text-muted">{item.markupPct.toFixed(1)}%</span>
                </td>
                <td className="py-4 pr-4">
                  {demandLabel(item.demandSignal)}
                  <span className="mt-1 block text-[11px] text-muted tabular-nums">{item.demandSignal.toFixed(2)}</span>
                </td>
                <td className="py-4 pr-4 tabular-nums">{Math.round(gap * 1000) / 10}%</td>
                <td className="py-4 text-[20px] text-ink tabular-nums">{score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
