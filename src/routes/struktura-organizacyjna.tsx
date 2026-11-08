import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, UserRound } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { KIEROWNICTWO, WYDZIALY } from "@/data/sad";

export const Route = createFileRoute("/struktura-organizacyjna")({
  head: () => ({
    meta: [
      { title: "Struktura organizacyjna – Sąd Rejonowy w Pińczowie" },
      {
        name: "description",
        content: "Prezes, Wiceprezes, Kierownik Finansowy i przewodniczący wydziałów Sądu Rejonowego w Pińczowie.",
      },
      { property: "og:title", content: "Struktura organizacyjna – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Kierownictwo sądu i przewodniczący wydziałów Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Struktura,
});

function Struktura() {
  const prezes = KIEROWNICTWO[0];
  const wiceprezes = KIEROWNICTWO[1];
  const pozostali = KIEROWNICTWO.slice(2);

  return (
    <PageShell crumbs={["Działalność sądu", "Struktura organizacyjna"]} title="Struktura organizacyjna">
      {/* schemat */}
      <section aria-label="Schemat organizacyjny" className="mb-8">
        <div className="mx-auto max-w-sm bg-primary px-4 py-3 text-center text-primary-foreground">
          <p className="text-[11px] uppercase tracking-wide opacity-80">Prezes Sądu</p>
          <p className="font-serif text-lg">{prezes.osoba}</p>
        </div>
        <div className="mx-auto h-5 w-px bg-primary" />
        <div className="mx-auto max-w-sm border border-primary bg-surface px-4 py-3 text-center">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Wiceprezes Sądu</p>
          <p className="font-serif text-lg text-primary">{wiceprezes.osoba}</p>
        </div>
        <div className="mx-auto h-5 w-px bg-primary" />
        <div className="grid gap-2 border-t-2 border-primary pt-4 sm:grid-cols-2 xl:grid-cols-4">
          {WYDZIALY.map((w) => (
            <Link
              key={w.id}
              to="/wydzialy"
              hash={w.id}
              className="block bg-surface p-3 text-center transition-colors hover:bg-secondary"
            >
              <p className="text-[11px] uppercase text-muted-foreground">
                {w.numer} {w.nazwa}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Przewodniczący</p>
              <p className="font-serif text-[15px] text-primary">{w.przewodniczacy}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* kierownictwo */}
      <h2 className="mb-3 font-serif text-xl text-primary">Kierownictwo Sądu</h2>
      <div className="mb-8 space-y-3">
        {KIEROWNICTWO.map((k) => (
          <article key={k.funkcja} className="flex gap-4 bg-surface p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-tile text-primary">
              <UserRound className="h-6 w-6" />
            </span>
            <div className="text-sm leading-relaxed">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.funkcja}</p>
              <p className="font-serif text-lg text-primary">{k.osoba}</p>
              <p className="mt-1">{k.opis}</p>
              {k.przyjecia && (
                <p className="mt-2 flex items-start gap-2 text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {k.przyjecia}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* przewodniczący */}
      <h2 className="mb-3 font-serif text-xl text-primary">Przewodniczący wydziałów</h2>
      <table className="w-full border-collapse bg-surface text-sm">
        <thead>
          <tr className="bg-primary text-left text-primary-foreground">
            <th className="px-3 py-2 font-normal">Wydział</th>
            <th className="px-3 py-2 font-normal">Przewodniczący</th>
            <th className="hidden px-3 py-2 font-normal md:table-cell">Sekretariat</th>
          </tr>
        </thead>
        <tbody>
          {WYDZIALY.map((w) => (
            <tr key={w.id} className="border-b border-border">
              <td className="px-3 py-2">
                <Link to="/wydzialy" hash={w.id} className="gov-link">
                  {w.numer} {w.nazwa}
                </Link>
              </td>
              <td className="px-3 py-2 font-medium">{w.przewodniczacy}</td>
              <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                {w.sekretariat}, tel. {w.tel}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted-foreground">
        {pozostali.length > 0 && "Komórki administracyjne podlegają Kierownikowi Finansowemu. "}
        SSR – sędzia sądu rejonowego.
      </p>
    </PageShell>
  );
}
