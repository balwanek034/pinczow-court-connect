import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { najblizszeDni, toISO } from "@/data/wokanda";

export const Route = createFileRoute("/wokanda")({
  head: () => ({
    meta: [
      { title: "Wokanda – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Wokanda: terminy posiedzeń i rozpraw w Sądzie Rejonowym w Pińczowie." },
      { property: "og:title", content: "Wokanda – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Terminy posiedzeń i rozpraw w Sądzie Rejonowym w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wokanda,
});

const WYDZIALY = [
  "Wszystkie",
  "I Wydział Cywilny",
  "II Wydział Karny",
  "III Wydział Rodzinny i Nieletnich",
  "IV Wydział Ksiąg Wieczystych",
];

interface SprawaZapisana {
  id: string;
  sygnatura: string;
  data: string;
  godzina: string;
  sala: string;
  wydzial: string;
  przewodniczacy: string;
  rodzaj_sprawy: string;
}

function Wokanda() {
  const [start, setStart] = useState("2026-11-09");
  useEffect(() => setStart(toISO(new Date())), []);

  const dni = useMemo(() => najblizszeDni(start, 6), [start]);
  const [aktywnyDzien, setAktywnyDzien] = useState<string>("2026-11-09");
  const [wydzial, setWydzial] = useState("Wszystkie");
  const [sygn, setSygn] = useState("");

  const [zapisaneSprawy, setZapisaneSprawy] = useState<SprawaZapisana[]>([]);

  useEffect(() => {
    try {
      const dane = localStorage.getItem("sad_wokanda");
      if (dane) {
        setZapisaneSprawy(JSON.parse(dane));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Tylko sprawy wprowadzone przez pracowników w panelu
  const sprawyZDnia = zapisaneSprawy.filter((s) => s.data === aktywnyDzien);

  const lista = sprawyZDnia.filter(
    (p) =>
      (wydzial === "Wszystkie" ||
        p.wydzial === wydzial ||
        p.wydzial === wydzial.replace(" Wydział ", " Wydz. ")) &&
      p.sygnatura.toLowerCase().replace(/\s/g, "").includes(sygn.toLowerCase().replace(/\s/g, "")),
  );

  return (
    <PageShell crumbs={["Wokanda"]} title="Wokanda">
      <p className="mb-5 text-sm text-muted-foreground">
        Wokanda zawiera wykaz spraw wyznaczonych na posiedzenia jawne. Dane osobowe stron nie są publikowane.
        Terminy mogą ulec zmianie – aktualne informacje dostępne są w Portalu Informacyjnym.
      </p>

      {/* Pasek wyboru daty */}
      <div className="mb-5 border border-border bg-surface p-3">
        <label className="mb-2 block text-xs font-bold uppercase text-primary">Wybierz datę posiedzenia:</label>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {dni.map((d) => {
              const dt = new Date(d + "T12:00:00");
              const on = d === aktywnyDzien;
              return (
                <button
                  key={d}
                  onClick={() => setAktywnyDzien(d)}
                  className={`min-w-[80px] border px-2 py-1.5 text-center text-xs transition-colors ${
                    on
                      ? "border-primary bg-primary text-primary-foreground font-bold"
                      : "border-border bg-background text-primary hover:border-primary"
                  }`}
                >
                  <div className="uppercase">{dt.toLocaleDateString("pl-PL", { weekday: "short" })}</div>
                  <div>{dt.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}</div>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-muted-foreground">lub</span>

          <div className="flex items-center gap-2 border border-border bg-background px-3 py-1.5 text-xs">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-bold text-muted-foreground">Wybierz datę:</span>
            <input
              type="date"
              value={aktywnyDzien}
              onChange={(e) => {
                if (e.target.value) setAktywnyDzien(e.target.value);
              }}
              className="border border-border bg-surface px-2 py-1 text-xs font-mono font-bold text-primary"
            />
          </div>
        </div>
      </div>

      {/* Filtry */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold text-primary">
          Wydział
          <select
            value={wydzial}
            onChange={(e) => setWydzial(e.target.value)}
            className="mt-1 block w-full border border-input bg-surface px-2 py-1.5 text-sm font-normal text-foreground"
          >
            {WYDZIALY.map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-primary">
          Sygnatura
          <input
            value={sygn}
            onChange={(e) => setSygn(e.target.value)}
            placeholder="np. I C 214/26"
            className="mt-1 block w-full border border-input bg-surface px-2 py-1.5 text-sm font-normal text-foreground placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Tabela wokandy */}
      <div className="overflow-x-auto">
        <table className="w-full border border-border text-sm">
          <thead>
            <tr className="bg-primary text-left text-xs uppercase tracking-wide text-primary-foreground">
              <th className="px-3 py-2">Godz.</th>
              <th className="px-3 py-2">Sygnatura</th>
              <th className="px-3 py-2">Wydział</th>
              <th className="px-3 py-2">Sala</th>
              <th className="px-3 py-2">Przewodniczący</th>
              <th className="px-3 py-2">Przedmiot</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id} className="border-t border-border even:bg-muted">
                <td className="px-3 py-2 font-bold">{p.godzina}</td>
                <td className="whitespace-nowrap px-3 py-2 font-bold text-primary">{p.sygnatura}</td>
                <td className="px-3 py-2">{p.wydzial}</td>
                <td className="px-3 py-2">{p.sala}</td>
                <td className="px-3 py-2">{p.przewodniczacy}</td>
                <td className="px-3 py-2">{p.rodzaj_sprawy}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Brak wyznaczonych spraw na dzień {aktywnyDzien}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Liczba pozycji w dniu {aktywnyDzien}: {lista.length}
      </p>
    </PageShell>
  );
}
