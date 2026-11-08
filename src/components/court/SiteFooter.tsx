import { Link } from "@tanstack/react-router";
import { SAD } from "@/data/sad";

const INSTYTUCJE = [
  { label: "Sąd Okręgowy w Kielcach", href: "" },
  { label: "Sąd Apelacyjny w Krakowie", href: "" },
  { label: "Ministerstwo Sprawiedliwości", href: "" },
  { label: "Portal Orzeczeń Sądów Powszechnych", href: "" },
  { label: "Elektroniczne Księgi Wieczyste", href: "" },
  { label: "Krajowy Rejestr Karny", href: "" },
];

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest opacity-70">Dane teleadresowe</h2>
          <p className="font-bold">{SAD.nazwa}</p>
          <p>{SAD.adres}</p>
          <p className="mb-2">{SAD.kod}</p>
          <p className="opacity-80">Siedziba II Wydziału Karnego: {SAD.adresKarny}</p>
          <p className="mt-2">Tel. centrala: {SAD.centrala}</p>
          <p>Faks: {SAD.faksAdm}</p>
          <p className="mt-2 opacity-80">
            NIP: {SAD.nip} · REGON: {SAD.regon}
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest opacity-70">Na skróty</h2>
          <ul className="space-y-1.5">
            <li><Link to="/aktualnosci" className="hover:underline">Aktualności</Link></li>
            <li><Link to="/wydzialy" className="hover:underline">Wydziały sądu</Link></li>
            <li><Link to="/wokanda" className="hover:underline">Wokanda</Link></li>
            <li><Link to="/kontakt" className="hover:underline">Kontakt i godziny pracy</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest opacity-70">Instytucje</h2>
          <ul className="space-y-1.5">
            {INSTYTUCJE.map((i) => (
              <li key={i.href}>
                <a href={i.href} target="_blank" rel="noreferrer" className="hover:underline">
                  {i.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs opacity-75 md:flex-row md:items-center md:justify-between">
          <span>
            Strona na potrzeby serwera Pińczów RP (STRONA FIKCYJNA):{" "}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
