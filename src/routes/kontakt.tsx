import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/court/PageShell";
import { GODZINY, SAD, WYDZIALY } from "@/data/sad";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Kontakt – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Adres, telefony, godziny urzędowania i informacja telefoniczna Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Kontakt – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Adres, telefony i godziny urzędowania Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Kontakt,
});

const DODATKOWE = [
  ["Wydział Ksiąg Wieczystych – informacja", "41 246-22-34"],
  ["Wykonywanie orzeczeń karnych", "41 246-22-40"],
  ["Zamawianie akt do czytelni", "41 246-22-02"],
  ["Zespół Kuratorskiej Służby Sądowej – sprawy rodzinne", "41 246-22-21"],
  ["Zespół Kuratorskiej Służby Sądowej – sprawy karne", "41 246-22-18"],
];

function Kontakt() {
  return (
    <PageShell crumbs={["Kontakt"]} title="Kontakt">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="text-sm leading-relaxed">
          <h2 className="mb-2 font-bold text-primary">{SAD.nazwa}</h2>
          <p>{SAD.adres}</p>
          <p>{SAD.kod}</p>
          <p className="mt-2 text-muted-foreground">Siedziba II Wydziału Karnego: {SAD.adresKarny}</p>
          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">Tel. centrala:</dt>
            <dd className="font-bold">{SAD.centrala}</dd>
            <dt className="text-muted-foreground">Punkt Informacyjny:</dt>
            <dd>{SAD.informacja}</dd>
            <dt className="text-muted-foreground">Faks (Oddz. Adm.):</dt>
            <dd>{SAD.faksAdm}</dd>
            <dt className="text-muted-foreground">Faks (Wydz. Karny):</dt>
            <dd>{SAD.faksKarny}</dd>
            <dt className="text-muted-foreground">E-mail:</dt>
            <dd>
              <a className="gov-link" href={`mailto:${SAD.email}`}>{SAD.email}</a>
            </dd>
            <dt className="text-muted-foreground">NIP / REGON:</dt>
            <dd>{SAD.nip} / {SAD.regon}</dd>
          </dl>
        </div>
        <div className="min-h-[240px] border border-border">
          <iframe
            title="Mapa – Sąd Rejonowy w Pińczowie"
            className="h-full min-h-[240px] w-full"
            loading="lazy"
            src="https://www.openstreetmap.org/export/embed.html?bbox=20.508%2C50.513%2C20.540%2C50.528&layer=mapnik&marker=50.5205%2C20.5245"
          />
        </div>
      </div>

      <h3 className="mt-8 mb-3 font-bold text-primary">Godziny urzędowania</h3>
      <table className="w-full border border-border text-sm">
        <thead>
          <tr className="bg-muted text-left text-xs uppercase text-muted-foreground">
            <th className="px-3 py-2">Dzień</th>
            <th className="px-3 py-2">Godziny urzędowania</th>
            <th className="px-3 py-2">Przyjmowanie interesantów</th>
          </tr>
        </thead>
        <tbody>
          {GODZINY.map((g) => (
            <tr key={g.dzien} className="border-t border-border">
              <td className="px-3 py-2 font-bold">{g.dzien}</td>
              <td className="px-3 py-2">{g.urzedowanie}</td>
              <td className="px-3 py-2">{g.interesanci}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-8 mb-3 font-bold text-primary">Telefony do wydziałów i komórek</h3>
      <table className="w-full border border-border text-sm">
        <tbody>
          {WYDZIALY.map((w) => (
            <tr key={w.id} className="border-t border-border first:border-t-0">
              <td className="px-3 py-2">{w.numer} {w.nazwa} – sekretariat</td>
              <td className="whitespace-nowrap px-3 py-2 font-bold">{w.tel}</td>
            </tr>
          ))}
          {DODATKOWE.map(([k, v]) => (
            <tr key={k} className="border-t border-border">
              <td className="px-3 py-2">{k}</td>
              <td className="whitespace-nowrap px-3 py-2 font-bold">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 border-l-4 border-primary bg-muted p-4 text-sm leading-relaxed">
        Informacji telefonicznych udziela Telefoniczne Biuro Obsługi Interesantów z siedzibą w Krakowie:{" "}
        <b>12 286-32-83</b> (tel. stacjonarne i komórkowe) oraz <b>801 800 122</b> (tel. stacjonarne). Biuro nie
        udziela porad prawnych.
      </div>
    </PageShell>
  );
}
