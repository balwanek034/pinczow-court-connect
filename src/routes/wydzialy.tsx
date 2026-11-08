import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Printer } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { OBSZAR, WYDZIALY } from "@/data/sad";

export const Route = createFileRoute("/wydzialy")({
  head: () => ({
    meta: [
      { title: "Wydziały sądu – Sąd Rejonowy w Pińczowie" },
      {
        name: "description",
        content: "Wydział Cywilny, Karny, Rodzinny i Nieletnich oraz Ksiąg Wieczystych – sekretariaty i kontakt.",
      },
      { property: "og:title", content: "Wydziały – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Sekretariaty, telefony i właściwość wydziałów Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wydzialy,
});

function Wydzialy() {
  return (
    <PageShell crumbs={["Wydziały sądu"]} title="Wydziały sądu">
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Właściwość miejscowa wydziałów obejmuje {OBSZAR}.
      </p>
      <div className="space-y-5">
        {WYDZIALY.map((w) => (
          <section key={w.id} id={w.id} className="border border-border">
            <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-crimson text-sm font-black text-crimson-foreground">
                {w.numer}
              </span>
              <h2 className="font-bold text-primary">
                {w.numer} {w.nazwa}
              </h2>
              <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">Repertorium: {w.skrot}</span>
            </div>
            <div className="grid gap-4 p-4 text-sm md:grid-cols-[1.2fr_1fr]">
              <p className="leading-relaxed">{w.wlasciwosc}</p>
              <ul className="space-y-1.5">
                <li className="font-medium">Przewodniczący: {w.przewodniczacy}</li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
                  <span>
                    Sekretariat: {w.sekretariat}
                    <br />
                    <span className="text-muted-foreground">{w.adres}, 28-400 Pińczów</span>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-crimson" /> tel. {w.tel}
                </li>
                <li className="flex items-center gap-2">
                  <Printer className="h-4 w-4 text-crimson" /> faks {w.faks}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-crimson" />
                  <a href={`mailto:${w.email}`} className="gov-link break-all">
                    {w.email}
                  </a>
                </li>
              </ul>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
