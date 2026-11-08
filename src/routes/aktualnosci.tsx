import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/court/PageShell";

type Search = { q?: string | undefined };

export const Route = createFileRoute("/aktualnosci")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"].length > 0 ? s["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Aktualności – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Komunikaty, ogłoszenia i zarządzenia Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Aktualności – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Komunikaty, ogłoszenia i zarządzenia Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Aktualnosci,
});

interface AktualnoscItem {
  id: string;
  tytul: string;
  data: string;
  kategoria: string;
  skrot: string;
}

function Aktualnosci() {
  const { q } = Route.useSearch();
  const fraza = q?.toLowerCase();

  const [listaOgloszen, setListaOgloszen] = useState<AktualnoscItem[]>([]);

  useEffect(() => {
    try {
      const zapisane = localStorage.getItem("sad_aktualnosci");
      if (zapisane) {
        setListaOgloszen(JSON.parse(zapisane));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const lista = fraza
    ? listaOgloszen.filter((a) => (a.tytul + " " + a.skrot).toLowerCase().includes(fraza))
    : listaOgloszen;

  return (
    <PageShell crumbs={["Aktualności"]} title={q ? `Wyniki wyszukiwania: „${q}”` : "Aktualności"}>
      {q && (
        <p className="mb-4 text-sm text-muted-foreground">
          Znaleziono: {lista.length}.{" "}
          <Link to="/aktualnosci" search={{}} className="gov-link">
            Pokaż wszystkie
          </Link>
        </p>
      )}

      {lista.length === 0 && (
        <p className="text-sm text-muted-foreground">Brak opublikowanych ogłoszeń w systemie.</p>
      )}

      <div className="space-y-6">
        {lista.map((a) => (
          <article key={a.id} id={a.id} className="border-b border-border pb-6 last:border-b-0">
            <div className="mb-1 flex items-center gap-3 text-xs text-muted-foreground">
              <time dateTime={a.data}>{a.data}</time>
              <span className="font-bold uppercase text-crimson">{a.kategoria}</span>
            </div>
            <h2 className="mb-2 text-lg font-bold leading-snug text-primary">{a.tytul}</h2>
            <p className="text-sm leading-relaxed">{a.skrot}</p>
            <table className="mt-4 w-full max-w-md border border-border text-[11px] text-muted-foreground">
              <tbody>
                <tr className="border-b border-border">
                  <td className="bg-muted px-2 py-1">Podmiot odpowiedzialny:</td>
                  <td className="px-2 py-1">Sąd Rejonowy w Pińczowie</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="bg-muted px-2 py-1">Opublikował:</td>
                  <td className="px-2 py-1">Pracownik sądu</td>
                </tr>
                <tr>
                  <td className="bg-muted px-2 py-1">Data publikacji:</td>
                  <td className="px-2 py-1">{a.data}</td>
                </tr>
              </tbody>
            </table>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
