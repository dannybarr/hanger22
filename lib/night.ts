/** Boutique lights dim from 22:00 through 06:59, Europe/London. */
export function isRailClosed(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );
  return hour >= 22 || hour < 7;
}

export function nightRequested(search: string) {
  return new URLSearchParams(search).get("night") === "1";
}
