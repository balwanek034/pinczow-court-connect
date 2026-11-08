import { Link } from "@tanstack/react-router";
import { SAD } from "@/data/sad";

type Item = { label: string; to?: "/" | "/aktualnosci" | "/wydzialy" | "/wokanda" | "/kontakt" | "/logowanie" | "/struktura-organizacyjna"; href?: string };

const GROUPS: { title: string; bg: string; items: Item[] }[] = [
  {
    title: "Ogłoszenia",
    bg: "bg-menu-1",
    items: [{ label: "Aktualności", to: "/aktualnosci" }],
  },
  {
    title: "Działalność sądu",
    bg: "bg-menu-2",
    items: [
      { label: "Godziny urzędowania", to: "/kontakt" },
      { label: "Kontakt", to: "/kontakt" },
      { label: "Struktura organizacyjna", to: "/struktura-organizacyjna" },
      { label: "Wydziały", to: "/wydzialy" },
      { label: "Wokanda", to: "/wokanda" },
    ],
  },
  {
    title: "Obsługa interesanta",
    bg: "bg-menu-3",
    items: [
      { label: "Logowanie pracowników", to: "/logowanie" },
      { label: "Portal Informacyjny", href: SAD.portal },
      { label: "Elektroniczne Księgi Wieczyste", href: "https://ekw.ms.gov.pl" },
      { label: "Orzecznictwo", href: "https://orzeczenia.ms.gov.pl" },
      { label: "Krajowy Rejestr Karny", href: "https://ekrk.ms.gov.pl" },
    ],
  },
];

const ITEM_CLASS =
  "flex items-center gap-3 border-t border-menu-foreground/15 px-4 py-2.5 text-[13px] text-menu-foreground hover:bg-menu-foreground/10";

export function LeftMenuLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Menu" className="space-y-2.5">
      {GROUPS.map((g) => (
        <div key={g.title} className={`${g.bg} border border-menu-foreground/0`}>
          <div className="px-4 py-3 font-serif text-base text-menu-foreground">{g.title}</div>
          <ul>
            {g.items.map((i) => (
              <li key={i.label}>
                {i.to ? (
                  <Link to={i.to} onClick={onNavigate} className={ITEM_CLASS}>
                    <span aria-hidden>›</span>
                    {i.label}
                  </Link>
                ) : (
                  <a href={i.href} target="_blank" rel="noreferrer" className={ITEM_CLASS}>
                    <span aria-hidden>›</span>
                    {i.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function LeftMenu() {
  return (
    <aside className="hidden lg:block">
      <LeftMenuLinks />
    </aside>
  );
}
