import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Gavel, LogOut, Megaphone, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { useWyloguj } from "@/components/court/UserMenu";
import { NAZWY_ROL, useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel pracownika – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Panel wewnętrzny pracownika Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Panel pracownika – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Panel wewnętrzny pracownika sądu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Panel,
});

const KAFEL =
  "flex items-center gap-3 bg-surface p-4 font-serif text-primary transition-colors hover:bg-primary hover:text-primary-foreground";

function Panel() {
  const { profil, user, role, isAdmin, isPracownik, loading } = useAuth();
  const wyloguj = useWyloguj();

  if (loading) return <PageShell crumbs={["Panel pracownika"]} title="Panel pracownika"><p className="text-sm">Wczytywanie…</p></PageShell>;

  if (!isPracownik) {
    return (
      <PageShell crumbs={["Panel pracownika"]} title="Brak uprawnień">
        <p className="mb-4 text-sm">Twoje konto nie ma uprawnień pracownika sądu.</p>
        <button onClick={() => void wyloguj()} className="bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground">
          Wyloguj się
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={["Panel pracownika"]} title="Panel pracownika">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-surface p-4">
        <div>
          <p className="font-serif text-lg text-primary">Witaj, {profil?.full_name || user?.email}</p>
          <p className="text-xs text-muted-foreground">
            {profil?.stanowisko || "Pracownik"} · uprawnienia: {role.map((r) => NAZWY_ROL[r]).join(", ")}
          </p>
        </div>
        <button
          onClick={() => void wyloguj()}
          className="inline-flex items-center gap-2 border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Wyloguj
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {isAdmin && (
          <Link to="/admin" className={KAFEL}>
            <ShieldCheck className="h-7 w-7" /> Panel administratora – konta i uprawnienia
          </Link>
        )}
        <Link to="/wokanda" className={KAFEL}>
          <CalendarDays className="h-7 w-7" /> Wokanda – terminy posiedzeń
        </Link>
        <Link to="/wydzialy" className={KAFEL}>
          <Gavel className="h-7 w-7" /> Wydziały i sekretariaty
        </Link>
        <Link to="/aktualnosci" className={KAFEL}>
          <Megaphone className="h-7 w-7" /> Aktualności i komunikaty
        </Link>
      </div>
    </PageShell>
  );
}
