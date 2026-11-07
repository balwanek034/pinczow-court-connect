import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/court/PageShell";
import { najblizszeDni, toISO, wokandaNaDzien } from "@/data/wokanda";

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

const WYDZIALY = ["Wszystkie", "I Wydział Cywilny", "II Wydział Karny", "III Wydział Rodzinny i Nieletnich"];

function Wokanda() {
  // data startowa ustalana po stronie przeglądarki, by uniknąć rozjazdu SSR
  const [start, setStart] = useState("2026-11-09");
  useEffect(() => setStart(toISO(new Date())), []);

  const dni = useMemo(() => najblizszeDni(start, 6), [start]);
  const [dzien, setDzien] = useState<string | null>(null);
  const [wydzial, setWydzial] = useState("Wszystkie");
  const [sygn, setSygn] = useState("");

  const aktywny = dzien && dni.includes(dzien) ? dzien : (dni[0] ?? start);
  const lista = wokandaNaDzien(aktywny).filter(
    (p) =>
      (wydzial === "Wszystkie" || p.wydzial === wydzial.replace(" Wydział ", " Wydz. ")) &&
      p.sygnatura.toLowerCase().replace(/\s/g, "").includes(sygn.toLowerCase().replace(/\s/g, "")),
  );

  return (
    <PageShell crumbs={["Wokanda"]} title="Wokanda">
      <p className="mb-5 text-sm text-muted-foreground">
        Wokanda zawiera wykaz spraw wyznaczonych na posiedzenia jawne. Dane osobowe stron nie są publikowane.
        Terminy mogą ulec zmianie – aktualne informacje dostępne są w Portalu Informacyjnym.
      </p>

      <div className="mb-4 flex flex-wrap gap-1" role="tablist" aria-label="Wybór dnia">
        {dni.map((d) => {
          const dt = new Date(d + "T12:00:00");
          const on = d === aktywny;
          return (
            <button
              key={d}
              role="tab"
              aria-selected={on}
              onClick={() => setDzien(d)}
              className={`min-w-[88px] border px-3 py-2 text-center text-xs transition-colors ${
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-primary hover:border-primary"
              }`}
            >
              <div className="font-bold uppercase">{dt.toLocaleDateString("pl-PL", { weekday: "short" })}</div>
              <div>{dt.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}</div>
            </button>
          );
        })}
      </div>

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

      <div className="overflow-x-auto">
        <table className="w-full border border-border text-sm">
          <thead>
            <tr className="bg-primary text-left text-xs uppercase tracking-wide text-primary-foreground">
              <th className="px-3 py-2">Godz.</th>
              <th className="px-3 py-2">Sygnatura</th>
              <th className="px-3 py-2">Wydział</th>
              <th className="px-3 py-2">Sala</th>
              <th className="px-3 py-2">Rodzaj</th>
              <th className="px-3 py-2">Przedmiot</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p, i) => (
              <tr key={p.sygnatura + i} className="border-t border-border even:bg-muted">
                <td className="px-3 py-2 font-bold">{p.godzina}</td>
                <td className="whitespace-nowrap px-3 py-2 font-bold text-primary">{p.sygnatura}</td>
                <td className="px-3 py-2">{p.wydzial}</td>
                <td className="px-3 py-2">{p.sala}</td>
                <td className="px-3 py-2">{p.rodzaj}</td>
                <td className="px-3 py-2">{p.przedmiot}</td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Brak spraw spełniających kryteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Liczba pozycji: {lista.length}</p>
    </PageShell>
  );
}
