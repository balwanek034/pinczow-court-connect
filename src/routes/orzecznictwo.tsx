import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, Calendar, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";

export const Route = createFileRoute("/orzecznictwo")({
  head: () => ({
    meta: [
      { title: "Portal Orzeczeń – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Baza orzeczeń i rozstrzygnięć Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Portal Orzeczeń – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Orzecznictwo Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Orzecznictwo,
});

export interface OrzeczenieWpis {
  id: string;
  sygnatura: string;
  data_orzeczenia: string;
  wydzial: string;
  rodzaj: "Wyrok" | "Postanowienie" | "Uchwała";
  status_prawomocnosci?: "PRAWOMOCNE" | "NIEPRAWOMOCNE";
  sedzia: string;
  protokolant?: string;
  tryb: "na rozprawie" | "na posiedzeniu niejawnym";
  strony: string;
  przedmiot: string;
  sentencja: string;
  uzasadnienie: string;
}

const AUTENTYCZNE_ORZECZENIA: OrzeczenieWpis[] = [];
  
const WYDZIALY = [
  "Wszystkie",
  "I Wydział Cywilny",
  "II Wydział Karny",
  "III Wydział Rodzinny i Nieletnich",
  "IV Wydział Ksiąg Wieczystych",
];

function Orzecznictwo() {
  const [orzeczenia, setOrzeczenia] = useState<OrzeczenieWpis[]>([]);
  const [szukaj, setSzukaj] = useState("");
  const [wybranyWydzial, setWybranyWydzial] = useState("Wszystkie");
  const [wybranyRodzaj, setWybranyRodzaj] = useState("Wszystkie");
  const [otwarteId, setOtwarteId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const zapisane = localStorage.getItem("sad_orzeczenia");
      if (zapisane) {
        const parsed = JSON.parse(zapisane);
        const zmapowane: OrzeczenieWpis[] = parsed.map((item: any) => ({
          id: item.id || Date.now().toString(),
          sygnatura: item.sygnatura.startsWith("Sygn") ? item.sygnatura : `Sygnatura akt ${item.sygnatura}`,
          data_orzeczenia: item.data_orzeczenia || "2026 r.",
          wydzial: item.wydzial || "I Wydział Cywilny",
          rodzaj: item.rodzaj || "Wyrok",
          status_prawomocnosci: "PRAWOMOCNE",
          sedzia: item.sedzia || "Sędzia Sądu Rejonowego",
          tryb: "na rozprawie",
          strony: `w sprawie ${item.tytul || ""}`,
          przedmiot: item.tytul || "rozpoznania sprawy",
sentencja: item.sentencja || item.teza || "Orzeczono zgodnie z wnioskiem.",
uzasadnienie: item.uzasadnienie || "",
        }));
        setOrzeczenia(zmapowane);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleRozwiniecie = (id: string) => {
    setOtwarteId((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const przefiltrowane = useMemo(() => {
    return orzeczenia.filter((o) => {
      const pasujeWydzial = wybranyWydzial === "Wszystkie" || o.wydzial === wybranyWydzial;
      const pasujeRodzaj = wybranyRodzaj === "Wszystkie" || o.rodzaj === wybranyRodzaj;
      const q = szukaj.trim().toLowerCase();
      const pasujeTekst =
        !q ||
        o.sygnatura.toLowerCase().includes(q) ||
        o.przedmiot.toLowerCase().includes(q) ||
        o.sedzia.toLowerCase().includes(q) ||
        o.uzasadnienie.toLowerCase().includes(q);
      return pasujeWydzial && pasujeRodzaj && pasujeTekst;
    });
  }, [orzeczenia, szukaj, wybranyWydzial, wybranyRodzaj]);

  return (
    <PageShell crumbs={["Baza orzecznictwa"]} title="Portal Orzeczeń Sądu Rejonowego w Pińczowie">
      <p className="mb-6 text-sm text-muted-foreground">
        Oficjalny zbiór orzeczeń i uzasadnień Sądu Rejonowego w Pińczowie. Kliknij w wybraną pozycję, aby zapoznać się z pełną treścią dokumentu.
      </p>

      {/* Wyszukiwarka */}
      <div className="mb-6 grid gap-3 border border-border bg-surface p-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
            Wyszukaj w treści orzeczeń (sygnatura, sędzia, hasło):
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="np. I C 45/25, Machynia, wieczyste..."
              value={szukaj}
              onChange={(e) => setSzukaj(e.target.value)}
              className="w-full border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Wydział sądu:</label>
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
          <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Forma orzeczenia:</label>
          <select
            value={wybranyRodzaj}
            onChange={(e) => setWybranyRodzaj(e.target.value)}
            className="w-full border border-border bg-background px-3 py-1.5 text-sm"
          >
            <option value="Wszystkie">Wszystkie formy</option>
            <option value="Wyrok">Wyroki</option>
            <option value="Postanowienie">Postanowienia</option>
          </select>
        </div>

        <div className="flex items-end">
          <span className="text-xs text-muted-foreground">
            Liczba orzeczeń: <strong className="text-foreground">{przefiltrowane.length}</strong>
          </span>
        </div>
      </div>

      {/* Lista */}
      {przefiltrowane.length === 0 ? (
        <div className="border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Brak orzeczeń spełniających wybrane kryteria wyszukiwania.
        </div>
      ) : (
        <div className="space-y-4">
          {przefiltrowane.map((o) => {
            const czyOtwarte = !!otwarteId[o.id];

            return (
              <article key={o.id} className="border border-border bg-surface shadow-xs">
                {/* Wiersz listy z przyciskiem rozwijania */}
                <button
                  type="button"
                  onClick={() => toggleRozwiniecie(o.id)}
                  className="flex w-full cursor-pointer flex-col p-4 text-left transition-colors hover:bg-muted/15"
                >
                  <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-primary">{o.sygnatura}</span>
                      <span className="bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {o.rodzaj}
                      </span>
                      <span className="bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        {o.wydzial}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{o.data_orzeczenia}</span>
                    </div>
                  </div>

                  <div className="flex w-full items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-sm font-semibold text-foreground">{o.przedmiot}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Skład: <strong>{o.sedzia}</strong>
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 rounded border border-primary/30 px-3 py-1.5 text-xs font-bold uppercase text-primary">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{czyOtwarte ? "Ukryj treść" : "Otwórz orzeczenie"}</span>
                      {czyOtwarte ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                </button>

                {/* AUTENTYCZNA KARTA DOKUMENTU SĄDOWEGO */}
                {czyOtwarte && (
                  <div className="border-t border-border bg-neutral-100 p-3 sm:p-6">
                    <div className="mx-auto max-w-3xl border border-neutral-300 bg-white p-6 sm:p-12 shadow-md font-serif text-neutral-900">
                      
                      {/* Nagłówek statusu w prawym górnym rogu */}
                      <div className="text-right">
                        <span className="font-sans text-[11px] font-bold tracking-wider text-neutral-400">
                          {o.status_prawomocnosci === "NIEPRAWOMOCNE"
                            ? "ORZECZENIE NIEPRAWOMOCNE"
                            : "ORZECZENIE PRAWOMOCNE"}
                        </span>
                      </div>

                      {/* Sygnatura lewy górny róg */}
                      <div className="mt-4 mb-6">
                        <p className="italic text-[13.5px] font-serif">{o.sygnatura}</p>
                      </div>

                      {/* Tytuł orzeczenia (Bordowy krój) */}
                      <div className="mb-4 text-center">
                        <h2 className="font-serif italic text-lg uppercase tracking-wider text-[#7A1A26]">
                          {o.rodzaj}
                        </h2>

                        {/* Tylko wyroki wydawane są w imieniu RP */}
                        {o.rodzaj === "Wyrok" && (
                          <h3 className="mt-2 text-xs font-sans tracking-widest text-neutral-800 uppercase">
                            W IMIENIU RZECZYPOSPOLITEJ POLSKIEJ
                          </h3>
                        )}
                      </div>

                      {/* Dane wstępne */}
                      <div className="space-y-1.5 text-[13.5px] italic leading-relaxed text-neutral-800">
                        <p>Dnia {o.data_orzeczenia}</p>
                        <p>
                          <strong>Sąd Rejonowy w Pińczowie {o.wydzial}</strong> w następującym składzie:
                        </p>
                        <p>Przewodniczący: {o.sedzia}</p>
                        {o.protokolant && <p>Protokolant: {o.protokolant}</p>}
                        <p>po rozpoznaniu w dniu {o.data_orzeczenia} w Pińczowie</p>
                        <p>{o.tryb}</p>
                        <p>{o.strony}</p>
                        <p>{o.przedmiot}</p>
                      </div>

                      {/* Sentencja wyroku / postanowienia */}
                      <div className="my-6 border-y border-neutral-200 py-4 text-[13.5px] italic leading-relaxed text-justify text-neutral-900">
                        <p>{o.sentencja}</p>
                        <p className="mt-4 text-right not-italic text-xs font-semibold">{o.sedzia}</p>
                      </div>

                      {/* Uzasadnienie (jeśli istnieje) */}
                      {o.uzasadnienie && (
                        <div className="mt-8 pt-4">
                          <h4 className="mb-6 text-center font-serif italic text-base uppercase tracking-wider text-[#7A1A26]">
                            UZASADNIENIE
                          </h4>

                          <div className="whitespace-pre-line text-justify text-[13.5px] italic leading-relaxed text-neutral-800 space-y-3">
                            {o.uzasadnienie}
                          </div>

                          <div className="mt-8 text-right not-italic text-xs font-semibold">
                            {o.sedzia}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
