import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, FileText, Gavel, Calendar } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import type { OrzeczenieItem } from "./_authenticated/panel";

export const Route = createFileRoute("/orzecznictwo")({
  head: () => ({
    meta: [
      { title: "Baza Orzeczeń – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Portal orzeczeń i rozstrzygnięć Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Baza Orzeczeń – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Orzecznictwo Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Orzecznictwo,
});

const PRZYKLADOWE_ORZECZENIA: OrzeczenieItem[] = [
  {
    id: "demo-1",
    sygnatura: "I C 234/25",
    data_orzeczenia: "2026-02-14",
    wydzial: "I Wydział Cywilny",
    rodzaj: "Wyrok",
    sedzia: "SSR Paweł Nowak",
    tytul: "O ochronę dóbr osobistych i zadośćuczynienie",
    teza: "Publikacja nieprawdziwych informacji w przestrzeni publicznej narusza dobra osobiste podmiotu, rodząc obowiązek złożenia oświadczenia o przeprosinach oraz zapłaty zadośćuczynienia na cel społeczny.",
  },
  {
    id: "demo-2",
    sygnatura: "II K 89/26",
    data_orzeczenia: "2026-03-01",
    wydzial: "II Wydział Karny",
    rodzaj: "Wyrok",
    sedzia: "SSR Maria Kowalczyk",
    tytul: "Prowadzenie pojazdu w stanie nietrzeźwości (art. 178a § 1 k.k.)",
    teza: "Stopień społecznej szkodliwości czynu uzasadnia orzeczenie zakazu prowadzenia wszelkich pojazdów mechanicznych na okres minimum 3 lat oraz obligatoryjne świadczenie pieniężne na Fundusz Pomocy Pokrzywdzonym.",
  },
];

const WYDZIALY = [
  "Wszystkie",
  "I Wydział Cywilny",
  "II Wydział Karny",
  "III Wydział Rodzinny i Nieletnich",
  "IV Wydział Ksiąg Wieczystych",
];

function Orzecznictwo() {
  const [orzeczenia, setOrzeczenia] = useState<OrzeczenieItem[]>(PRZYKLADOWE_ORZECZENIA);
  const [szukaj, setSzukaj] = useState("");
  const [wybranyWydzial, setWybranyWydzial] = useState("Wszystkie");
  const [wybranyRodzaj, setWybranyRodzaj] = useState("Wszystkie");

  useEffect(() => {
    try {
      const zapisane = localStorage.getItem("sad_orzeczenia");
      if (zapisane) {
        const parsed: OrzeczenieItem[] = JSON.parse(zapisane);
        setOrzeczenia([...parsed, ...PRZYKLADOWE_ORZECZENIA]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const przefiltrowane = useMemo(() => {
    return orzeczenia.filter((o) => {
      const pasujeWydzial = wybranyWydzial === "Wszystkie" || o.wydzial === wybranyWydzial;
      const pasujeRodzaj = wybranyRodzaj === "Wszystkie" || o.rodzaj === wybranyRodzaj;
      const q = szukaj.trim().toLowerCase();
      const pasujeTekst =
        !q ||
        o.sygnatura.toLowerCase().includes(q) ||
        o.tytul.toLowerCase().includes(q) ||
        o.sedzia.toLowerCase().includes(q) ||
        o.teza.toLowerCase().includes(q);
      return pasujeWydzial && pasujeRodzaj && pasujeTekst;
    });
  }, [orzeczenia, szukaj, wybranyWydzial, wybranyRodzaj]);

  return (
    <PageShell crumbs={["Baza orzecznictwa"]} title="Baza Orzeczeń Sądu Rejonowego w Pińczowie">
      <p className="mb-6 text-sm text-muted-foreground">
        Lokalna baza wyroków, postanowień i rozstrzygnięć wydanych przez Sąd Rejonowy w Pińczowie, publikowana
        zgodnie z przepisami o dostępie do informacji publicznej.
      </p>

      {/* Wyszukiwarka i filtry */}
      <div className="mb-6 grid gap-3 border border-border bg-surface p-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
            Wyszukaj po sygnaturze, sędzim lub słowach kluczowych:
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="np. I C 234/25, Nowak, zadośćuczynienie..."
              value={szukaj}
              onChange={(e) => setSzukaj(e.target.value)}
              className="w-full border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Wydział:</label>
          <select
            value={wybranyWydzial}
            onChange={(e) => setWybranyWydzial(e.target.value)}
            className="w-full border border-border bg-background px-3 py-1.5 text-sm"
          >
            {WYDZIALY.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Rodzaj orzeczenia:</label>
          <select
            value={wybranyRodzaj}
            onChange={(e) => setWybranyRodzaj(e.target.value)}
            className="w-full border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="Wszystkie">Wszystkie rodzaje</option>
            <option value="Wyrok">Wyrok</option>
            <option value="Postanowienie">Postanowienie</option>
            <option value="Uchwała">Uchwała</option>
          </select>
        </div>

        <div className="flex items-end">
          <span className="text-xs text-muted-foreground">
            Znaleziono: <strong className="text-foreground">{przefiltrowane.length}</strong> orzeczeń
          </span>
        </div>
      </div>

      {/* Lista orzeczeń */}
      {przefiltrowane.length === 0 ? (
        <div className="border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Brak orzeczeń spełniających wybrane kryteria wyszukiwania.
        </div>
      ) : (
        <div className="space-y-4">
          {przefiltrowane.map((o) => (
            <article key={o.id} className="border border-border bg-surface p-5 transition-shadow hover:shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-primary">{o.sygnatura}</span>
                  <span className="bg-primary px-2 py-0.5 text-[11px] font-bold uppercase text-primary-foreground">
                    {o.rodzaj}
                  </span>
                  <span className="bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                    {o.wydzial}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{o.data_orzeczenia}</span>
                </div>
              </div>

              <h3 className="mb-2 font-serif text-base font-bold text-primary">{o.tytul}</h3>

              <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Gavel className="h-3.5 w-3.5" />
                <span>Skład orzekający: <strong>{o.sedzia}</strong></span>
              </div>

              <div className="rounded bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                <p className="mb-1 font-bold uppercase tracking-wider text-muted-foreground">Teza / Uzasadnienie:</p>
                <p className="italic">{o.teza}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
