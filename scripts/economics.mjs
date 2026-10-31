// Prints the price fields a new piece needs, from the source listing's price.
// The formulas mirror lib/money.ts (guideFromSource) and lib/desk.ts
// (economicsFromGuide). The unit test "prices public pieces from the source
// comp" fails if a piece's numbers do not match, so this cannot drift silently.
//
//   node scripts/economics.mjs 411.39 USD
const FX_TO_GBP = { GBP: 1, USD: 0.7532, EUR: 0.843, CNY: 0.1055, KRW: 0.00055821 };

const [amountArg, currency = "GBP"] = process.argv.slice(2);
const amount = Number(amountArg);
if (!Number.isFinite(amount) || !(currency in FX_TO_GBP)) {
  console.error("usage: node scripts/economics.mjs <source price> <GBP|USD|EUR|CNY|KRW>");
  process.exit(1);
}

const roundGuide = (n) => {
  const step = n >= 5000 ? 50 : n >= 500 ? 10 : 5;
  return Math.round(n / step) * step;
};
const gbp = amount * FX_TO_GBP[currency];
const guidePriceGBP = { min: roundGuide(gbp * 1.2), max: roundGuide(gbp * 1.35) };
const mid = (guidePriceGBP.min + guidePriceGBP.max) / 2;

console.log(
  JSON.stringify(
    {
      guidePriceGBP,
      priceGBP: guidePriceGBP.max,
      priceProvisional: true,
      costBasis: { amount, currency },
      markupPct: Math.round((mid / gbp - 1) * 1000) / 10,
      estimatedMarginGBP: Math.round(mid - gbp),
    },
    null,
    2,
  ),
);
