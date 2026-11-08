import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Search, FileText, Gavel, Calendar, ChevronDown, ChevronUp, Scale } from "lucide-react";
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
    teza: "Sąd Rejonowy w Pińczowie I Wydział Cywilny po rozpoznaniu sprawy z powództwa Jana Kowalskiego przeciwko Tomaszowi Wiśniewskiemu o ochronę dóbr osobistych:\n\n1. Zobowiązuje pozwanego do usunięcia spornych wpisów w terminie 7 dni od uprawomocnienia się wyroku.\n2. Zasądza od pozwanego na rzecz Fundacji Pomocy Społecznej kwotę 5.000 zł tytułem zadośćuczynienia.\n\nUZASADNIENIE:\nPublikacja nieprawdziwych informacji w przestrzeni publicznej bezpośrednio godzi w dobra osobiste powoda, co uzasadnia zastosowanie środków ochrony prawnej przewidzianych w art. 24 k.c.",
  },
  {
    id: "demo-2",
    sygnatura: "II K 89/26",
    data_orzeczenia: "2026-03-01",
    wydzial: "II Wydział Karny",
    rodzaj: "Wyrok",
    sedzia: "SSR Maria Kowalczyk",
    tytul: "Prowadzenie pojazdu w stanie nietrzeźwości (art. 178a § 1 k.k.)",
    teza: "Sąd Rejonowy w Pińczowie II Wydział Karny uznaje oskarżonego za winnego popełnienia zarzucanego mu czynu z art. 178a § 1 k.k. i za to:\n\n1. Wymierza karę grzywny w wysokości 100 stawek dziennych przy ustaleniu wysokości jednej stawki na kwotę 40 zł.\n2. Orzeka zakaz prowadzenia wszelkich pojazdów mechanicznych na okres 3 lat.\n3. Zasądza świadczenie pieniężne na rzecz Funduszu Pomocy Pokrzywdzonym w kwocie 5.000 zł.\n\nUZASADNIENIE:\nWina oskarżonego oraz okoliczności popełnienia czynu nie budzą wątpliwości w świetle zebranego materiału dowodowego i badania alkomatem.",
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
  
  // Przechowuje ID aktualnie rozwiniętych orzeczeń
  const [otwarteId, setOtwarteId] = useState<Record<string, boolean>>({});

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
        o.tytul.toLowerCase().includes(q) ||
        o.sedzia.toLowerCase().includes(q) ||
        o.teza.toLowerCase().includes(q);
      return pasujeWydzial && pasujeRodzaj && pasujeTekst;
    });
  }, [orzeczenia, szukaj, wybranyWydzial, wybranyRodzaj]);

  return (
    <PageShell crumbs={["Baza orzecznictwa"]} title="Baza Orzeczeń Sądu Rejonowego w Pińczowie">
      <p className="mb-6 text-sm text-muted-foreground">
        Lokalna baza wyroków, postanowień i rozstrzygnięć wydanych przez Sąd Rejonowy w Pińczowie. Kliknij w wybrane orzeczenie, aby otworzyć pełną treść dokumentu.
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
          {przefiltrowane.map((o) => {
            const czyOtwarte = !!otwarteId[o.id];

            return (
              <article
                key={o.id}
                className="border border-border bg-surface transition-all hover:border-primary/50"
              >
                {/* Klikalny nagłówek orzeczenia */}
                <button
                  type="button"
                  onClick={() => toggleRozwiniecie(o.id)}
                  className="flex w-full cursor-pointer flex-col p-5 text-left transition-colors hover:bg-muted/10"
                >
                  <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
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

                  <div className="flex w-full items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-base font-bold text-primary">{o.tytul}</h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Gavel className="h-3.5 w-3.5" />
                        <span>
                          Skład: <strong>{o.sedzia}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 rounded border border-primary/30 px-3 py-1.5 text-xs font-bold uppercase text-primary">
                      <FileText className="h-4 w-4" />
                      <span>{czyOtwarte ? "Zwiń orzeczenie" : "Zobacz orzeczenie"}</span>
                      {czyOtwarte ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </button>

                {/* Rozwijana treść dokumentu */}
                {czyOtwarte && (
                  <div className="border-t border-border bg-background p-6">
                    {/* Urzędowa stylizacja dokumentu sądowego */}
                    <div className="mx-auto max-w-2xl rounded border border-border bg-white p-6 shadow-sm font-serif text-foreground">
                      <div className="mb-4 text-center">
                        <Scale className="mx-auto mb-2 h-7 w-7 text-primary" />
                        <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                          Rzeczpospolita Polska
                        </p>
                        <h4 className="text-sm font-bold tracking-wider text-primary">
                          W IMIENIU RZECZYPOSPOLITEJ POLSKIEJ
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Dnia {o.data_orzeczenia} r.
                        </p>
                      </div>

                      <div className="mb-4 border-y border-border/60 py-3 text-xs leading-relaxed">
                        <p><strong>Sąd:</strong> {o.wydzial} Sądu Rejonowego w Pińczowie</p>
                        <p><strong>Sygnatura akt:</strong> <span className="font-mono font-bold">{o.sygnatura}</span></p>
                        <p><strong>Przewodniczący / Skład:</strong> {o.sedzia}</p>
                        <p><strong>Przedmiot sprawy:</strong> {o.tytul}</p>
                      </div>

                      <div className="space-y-3 font-sans text-xs leading-relaxed text-foreground">
                        <p className="font-bold uppercase tracking-wider text-primary font-serif">
                          Treść rozstrzygnięcia / Uzasadnienie:
                        </p>
                        <div className="whitespace-pre-line rounded bg-muted/30 p-4 font-mono text-[11px] leading-relaxed">
                          {o.teza}
                        </div>
                      </div>

                      <div className="mt-6 border-t border-border/60 pt-3 text-right text-[10px] text-muted-foreground font-sans">
                        Opublikowano w portalu orzeczeń Sądu Rejonowego w Pińczowie
                      </div>
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
