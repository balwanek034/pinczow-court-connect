import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/court/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/sedziowie")({
  head: () => ({
    meta: [
      { title: "Sędziowie i asesorzy sądowi – Sąd Rejonowy w Pińczowie" },
      {
        name: "description",
        content: "Wykaz sędziów i asesorów sądowych orzekających w Sądzie Rejonowym w Pińczowie wraz z przydziałem do wydziałów.",
      },
      { property: "og:title", content: "Sędziowie i asesorzy sądowi – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Wykaz sędziów i asesorów sądowych Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Sedziowie,
});

export const sedziowieQuery = {
  queryKey: ["sedziowie"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("sedziowie")
      .select("id, imie_nazwisko, rodzaj, funkcja, wydzial, kolejnosc")
      .order("kolejnosc")
      .order("imie_nazwisko");
    if (error) throw error;
    return data ?? [];
  },
};

function Sedziowie() {
  const { data = [], isLoading, error } = useQuery(sedziowieQuery);
  const grupy = [
    { tytul: "Sędziowie", osoby: data.filter((o) => o.rodzaj === "sedzia") },
    { tytul: "Asesorzy sądowi", osoby: data.filter((o) => o.rodzaj === "asesor") },
  ];

  return (
    <PageShell crumbs={["Działalność sądu", "Sędziowie i asesorzy"]} title="Sędziowie i asesorzy sądowi">
      <p className="mb-6 text-sm leading-relaxed">
        Wykaz osób pełniących urząd na stanowisku sędziego oraz asesora sądowego w Sądzie Rejonowym w Pińczowie, wraz z
        pełnionymi funkcjami i przydziałem do wydziałów.
      </p>
      {isLoading && <p className="text-sm text-muted-foreground">Wczytywanie…</p>}
      {error && <p className="text-sm text-destructive">Nie udało się wczytać wykazu.</p>}
      {!isLoading &&
        grupy.map((g) => (
          <section key={g.tytul} className="mb-8">
            <h2 className="mb-3 border-b border-border pb-2 font-serif text-lg text-primary">{g.tytul}</h2>
            {g.osoby.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak wpisów.</p>
            ) : (
              <table className="w-full border border-border bg-surface text-sm">
                <thead>
                  <tr className="bg-primary text-left text-xs uppercase text-primary-foreground">
                    <th className="w-10 px-3 py-2">Lp.</th>
                    <th className="px-3 py-2">Imię i nazwisko</th>
                    <th className="px-3 py-2">Funkcja</th>
                    <th className="px-3 py-2">Wydział</th>
                  </tr>
                </thead>
                <tbody>
                  {g.osoby.map((o, i) => (
                    <tr key={o.id} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}.</td>
                      <td className="px-3 py-2 font-bold">{o.imie_nazwisko}</td>
                      <td className="px-3 py-2">{o.funkcja || "—"}</td>
                      <td className="px-3 py-2">{o.wydzial || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
    </PageShell>
  );
}
