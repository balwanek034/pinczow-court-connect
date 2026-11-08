import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  Gavel,
  Info,
  Landmark,
  LogIn,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Scale,
  Users,
  Wallet,
  FilePenLine,
} from "lucide-react";
import type { ReactNode } from "react";
import budynek from "@/assets/budynek-sadu.jpg";
import { AKTUALNOSCI, SAD, formatDataPL } from "@/data/sad";
import { LeftMenu } from "@/components/court/LeftMenu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sąd Rejonowy w Pińczowie – strona główna" },
      {
        name: "description",
        content:
          "Sąd Rejonowy w Pińczowie: aktualności, wokanda, wydziały, godziny urzędowania i dane kontaktowe.",
      },
      { property: "og:title", content: "Sąd Rejonowy w Pińczowie" },
      {
        property: "og:description",
        content: "Aktualności, wokanda, wydziały i dane kontaktowe Sądu Rejonowego w Pińczowie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TILE =
  "flex flex-col items-center justify-center gap-2 bg-tile px-2 py-5 text-center font-serif text-sm leading-tight text-muted-foreground transition-colors hover:bg-secondary";

function Tile({ icon, label, to, href }: { icon: ReactNode; label: string; to?: "/wokanda" | "/kontakt"; href?: string }) {
  const body = (
    <>
      <span className="text-primary">{icon}</span>
      {label}
    </>
  );
  return to ? (
    <Link to={to} className={TILE}>
      {body}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={TILE}>
      {body}
    </a>
  );
}

function Index() {
  const lista = AKTUALNOSCI.slice(0, 5);

  return (
    <main id="tresc">
      <img
        src={budynek}
        alt="Budynek Sądu Rejonowego w Pińczowie przy ul. 3 Maja 12a"
        width={1600}
        height={640}
        className="h-[220px] w-full object-cover md:h-[330px]"
      />

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[236px_1fr_366px]">
        <LeftMenu />

        {/* aktualności */}
        <section aria-labelledby="akt">
          <h2 id="akt" className="section-title">
            <MessageSquareText className="h-6 w-6 fill-primary text-surface" /> Aktualności
          </h2>
          <ul className="space-y-2.5">
            {lista.map((a) => (
              <li key={a.id} className="bg-tile p-4">
                <p className="mb-1 text-[11px] text-muted-foreground">{formatDataPL(a.data)}</p>
                <Link
                  to="/aktualnosci"
                  hash={a.id}
                  className="font-serif text-[17px] leading-snug text-primary hover:underline"
                >
                  {a.tytul} <ChevronRight className="inline h-4 w-4" />
                </Link>
                <div className="mt-3">
                  <Link
                    to="/aktualnosci"
                    hash={a.id}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[11px] uppercase text-primary hover:border-primary"
                  >
                    Więcej <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/aktualnosci" className="mt-4 inline-block text-sm uppercase text-primary hover:underline">
            Archiwum aktualności »
          </Link>
        </section>

        {/* informacje */}
        <section aria-labelledby="info" className="space-y-0">
          <div className="bg-tile p-5 pt-4">
            <h2 id="info" className="section-title !mb-5 !border-0">
              <Info className="h-6 w-6 fill-primary text-surface" /> Informacje
            </h2>
            <div className="px-2 text-[13px] leading-relaxed">
              <p className="mb-2 font-serif text-base">{SAD.nazwa}</p>
              <p className="mb-2 flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  ul. 3 Maja 12 a (siedziba główna), ul. 1 Maja 10 (siedziba II Wydziału Karnego) {SAD.kod}
                </span>
              </p>
              <p className="mb-1 flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-primary" /> {SAD.centrala}
              </p>
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <a href={`mailto:${SAD.email}`} className="gov-link font-medium underline">
                  {SAD.email}
                </a>
              </p>
            </div>
          </div>

          <Link
            to="/logowanie"
            className="flex flex-col items-center gap-3 bg-primary px-6 py-6 text-center font-serif text-[15px] text-primary-foreground hover:bg-crimson-dark"
          >
            <LogIn className="h-10 w-10" strokeWidth={1.5} />
            Logowanie pracowników – system wewnętrzny sądu
          </Link>
          <Link
            to="/kontakt"
            className="mt-px flex flex-col items-center gap-3 bg-primary px-6 py-6 text-center font-serif text-[15px] text-primary-foreground hover:bg-crimson-dark"
          >
            <Users className="h-10 w-10" strokeWidth={1.5} />
            Biuro Podawcze / Punkt Informacyjny
          </Link>

          <div className="mt-px grid grid-cols-3 gap-px">
            <Tile to="/wokanda" icon={<Gavel className="h-9 w-9" />} label="e-Wokanda" />
            <Tile to="/kontakt" icon={<FilePenLine className="h-9 w-9" />} label="Formularz kontaktowy" />
            <Tile to="/kontakt" icon={<Wallet className="h-9 w-9" />} label="Numer rachunku" />
            <Tile to="/kontakt" icon={<Clock className="h-9 w-9" />} label="Godziny urzędowania" />
            <Tile href={SAD.portal} icon={<Landmark className="h-9 w-9" />} label="Portal Informacyjny" />
            <Tile href="https://orzeczenia.ms.gov.pl" icon={<Scale className="h-9 w-9" />} label="Portal orzeczeń" />
          </div>

          <div className="mt-4 border-l-4 border-primary bg-notice p-4 text-xs leading-relaxed text-notice-foreground">
            <b>Uwaga!</b> Sąd nie wysyła wezwań do zapłaty drogą SMS ani e-mailem z linkami do płatności.
          </div>
        </section>
      </div>
    </main>
  );
}
