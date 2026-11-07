import { Link } from "@tanstack/react-router";
import { SAD } from "@/data/sad";

const INSTYTUCJE = [
  { label: "Sąd Okręgowy w Kielcach", href: "https://kielce.so.gov.pl" },
  { label: "Sąd Apelacyjny w Krakowie", href: "https://www.krakow.sa.gov.pl" },
  { label: "Ministerstwo Sprawiedliwości", href: "https://www.gov.pl/web/sprawiedliwosc" },
  { label: "Portal Orzeczeń Sądów Powszechnych", href: "https://orzeczenia.ms.gov.pl" },
  { label: "Elektroniczne Księgi Wieczyste", href: "https://ekw.ms.gov.pl" },
  { label: "Krajowy Rejestr Karny", href: "https://ekrk.ms.gov.pl" },
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
          <span>© 2026 {SAD.nazwa}. Wszelkie prawa zastrzeżone.</span>
          <span>
            Serwis demonstracyjny, nieoficjalny. Oficjalna strona sądu:{" "}
            <a href={SAD.oficjalnaStrona} target="_blank" rel="noreferrer" className="underline">
              pinczow.sr.gov.pl
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
