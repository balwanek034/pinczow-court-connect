import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Menu, Search, SunMoon, Type, X } from "lucide-react";
import godlo from "@/assets/godlo.png";
import { LeftMenuLinks } from "@/components/court/LeftMenu";
import { UserMenu } from "@/components/court/UserMenu";

const SIZES = ["16px", "18px", "20px"];

export function SiteHeader() {
  const [size, setSize] = useState(0);
  const [contrast, setContrast] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setSize(Number(localStorage.getItem("sr-font") ?? 0));
    setContrast(localStorage.getItem("sr-contrast") === "1");
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--base-font-size", SIZES[size] ?? "16px");
    document.documentElement.classList.toggle("contrast", contrast);
    localStorage.setItem("sr-font", String(size));
    localStorage.setItem("sr-contrast", contrast ? "1" : "0");
  }, [size, contrast]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/aktualnosci", search: { q: q.trim() || undefined } });
  };

  return (
    <header className="border-b border-border bg-surface">
      <a
        href="#tresc"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Przejdź do treści
      </a>
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-4 py-4">
          <img src={godlo} alt="Godło Rzeczypospolitej Polskiej" width={573} height={666} className="h-[72px] w-auto" />
          <div className="font-serif leading-tight text-primary">
            <div className="text-2xl md:text-[28px]">Sąd Rejonowy</div>
            <div className="pl-12 text-base md:text-lg">w Pińczowie</div>
          </div>
        </Link>

        <div className="flex flex-col items-end">
          <div className="hidden items-stretch gap-0 md:flex">
            <form onSubmit={onSearch} role="search" className="flex w-56 bg-muted">
              <label htmlFor="szukaj" className="sr-only">
                Szukaj w serwisie
              </label>
              <input
                id="szukaj"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Wyszukiwana fraza"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button type="submit" className="px-3 text-primary" aria-label="Szukaj">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <div className="ml-3 flex bg-primary text-[11px] font-medium uppercase text-primary-foreground">
              <button
                onClick={() => setContrast((c) => !c)}
                aria-pressed={contrast}
                className="flex items-center gap-1.5 px-3 py-2 hover:bg-crimson-dark"
              >
                <SunMoon className="h-4 w-4" /> Zmień kontrast
              </button>
              <button
                onClick={() => setSize((s) => (s + 1) % SIZES.length)}
                className="flex items-center gap-1.5 px-3 py-2 hover:bg-crimson-dark"
                aria-label="Zmień rozmiar czcionki"
              >
                <Type className="h-4 w-4" /> Czcionka
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="hidden md:block">
              <UserMenu />
            </div>
            <a
              href="https://pinczow.sr.gov.pl"
              target="_blank"
              rel="noreferrer"
              aria-label="Biuletyn Informacji Publicznej"
              className="hidden items-center gap-1 text-3xl font-black tracking-tight text-crimson-dark md:flex"
            >
              <span className="text-xl text-destructive">◥</span>bip
            </a>
          </div>
          <button
            className="mt-4 text-primary md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-3 border-t border-border bg-surface px-4 py-4 md:hidden">
          <div className="flex gap-2 text-xs font-bold uppercase">
            <button onClick={() => setContrast((c) => !c)} className="bg-primary px-3 py-2 text-primary-foreground">
              Kontrast
            </button>
            <button
              onClick={() => setSize((s) => (s + 1) % SIZES.length)}
              className="bg-primary px-3 py-2 text-primary-foreground"
            >
              Czcionka
            </button>
          </div>
          <UserMenu />
          <LeftMenuLinks onNavigate={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
