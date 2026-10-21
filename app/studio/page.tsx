import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { unlockStudio } from "@/app/studio/actions";
import { secretsMatch, studioCookieName, studioPassword, studioToken } from "@/lib/studio-auth";

export const dynamic = "force-dynamic";

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const password = studioPassword();
  if (!password) notFound();
  const jar = await cookies();
  const token = jar.get(studioCookieName())?.value ?? "";
  if (!secretsMatch(token, studioToken(password))) {
    const sp = await searchParams;
    return (
      <main id="content" className="dotgrid flex min-h-dvh items-center justify-center px-6">
        <form action={unlockStudio} className="w-full max-w-sm border border-line bg-paper p-8">
          <p className="text-[11px] tracking-[0.16em] text-ink uppercase">Hanger 22</p>
          <h1 className="display mt-3 text-4xl text-ink">Desk</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">The ledger is not on the rail.</p>
          <label className="mt-6 block text-[11px] tracking-[0.14em] text-muted uppercase" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="field mt-2" />
          {sp.denied === "1" ? <p className="mt-3 text-[13px] text-ink">That password does not open the desk.</p> : null}
          <button type="submit" className="pill-btn mt-6">
            Open
          </button>
        </form>
      </main>
    );
  }

  const { StudioDesk } = await import("@/components/studio/StudioDesk");
  return <StudioDesk />;
}
