import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, LogOut, User } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";

export const Route = createFileRoute("/logowanie")({
  head: () => ({
    meta: [
      { title: "Logowanie – Panel interesanta – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Panel interesanta Sądu Rejonowego w Pińczowie – logowanie do podglądu spraw." },
      { property: "og:title", content: "Panel interesanta – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Logowanie do panelu interesanta Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Logowanie,
});

const KEY = "sr-demo-user";

const SPRAWY = [
  { sygn: "I C 214/26", przedmiot: "o zapłatę", status: "W toku", termin: "19.11.2026, godz. 10:30, sala nr 12" },
  { sygn: "I Ns 88/26", przedmiot: "o stwierdzenie nabycia spadku", status: "Zakończona", termin: "—" },
  { sygn: "IV Kw 1312/26", przedmiot: "wpis hipoteki", status: "Oczekuje na wpis", termin: "—" },
];

function Logowanie() {
  const [user, setUser] = useState<string | null>(null);
  const [login, setLogin] = useState("");
  const [haslo, setHaslo] = useState("");
  const [pokaz, setPokaz] = useState(false);
  const [blad, setBlad] = useState("");

  useEffect(() => setUser(localStorage.getItem(KEY)), []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !haslo) {
      setBlad("Wprowadź login i hasło.");
      return;
    }
    if (haslo.length < 6) {
      setBlad("Nieprawidłowy login lub hasło.");
      return;
    }
    localStorage.setItem(KEY, login.trim());
    setUser(login.trim());
    setBlad("");
    setHaslo("");
  };

  const wyloguj = () => {
    localStorage.removeItem(KEY);
    setUser(null);
  };

  if (user) {
    return (
      <PageShell crumbs={["Panel interesanta"]} title="Panel interesanta">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 bg-surface p-4">
          <p className="text-sm">
            Zalogowano jako: <b>{user}</b>
          </p>
          <button
            onClick={wyloguj}
            className="inline-flex items-center gap-2 border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4" /> Wyloguj
          </button>
        </div>
        <h2 className="mb-3 font-serif text-lg text-primary">Moje sprawy</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-border bg-surface text-sm">
            <thead>
              <tr className="bg-primary text-left text-xs uppercase text-primary-foreground">
                <th className="px-3 py-2">Sygnatura</th>
                <th className="px-3 py-2">Przedmiot</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Najbliższy termin</th>
              </tr>
            </thead>
            <tbody>
              {SPRAWY.map((s) => (
                <tr key={s.sygn} className="border-t border-border">
                  <td className="whitespace-nowrap px-3 py-2 font-bold text-primary">{s.sygn}</td>
                  <td className="px-3 py-2">{s.przedmiot}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2">{s.termin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Wersja demonstracyjna – wyświetlane sprawy są przykładowe.
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={["Logowanie"]} title="Logowanie do panelu interesanta">
      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-4 bg-surface p-6" noValidate>
          <div>
            <label htmlFor="login" className="mb-1 block text-xs font-bold uppercase text-primary">
              Login (PESEL lub adres e-mail)
            </label>
            <div className="flex border border-input bg-surface focus-within:ring-1 focus-within:ring-ring">
              <span className="flex items-center px-3 text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                id="login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
                className="min-w-0 flex-1 bg-transparent py-2 pr-3 text-sm focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="haslo" className="mb-1 block text-xs font-bold uppercase text-primary">
              Hasło
            </label>
            <div className="flex border border-input bg-surface focus-within:ring-1 focus-within:ring-ring">
              <span className="flex items-center px-3 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="haslo"
                type={pokaz ? "text" : "password"}
                value={haslo}
                onChange={(e) => setHaslo(e.target.value)}
                autoComplete="current-password"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setPokaz((p) => !p)}
                className="px-3 text-muted-foreground hover:text-primary"
                aria-label={pokaz ? "Ukryj hasło" : "Pokaż hasło"}
              >
                {pokaz ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {blad && (
            <p role="alert" className="border-l-4 border-destructive bg-muted px-3 py-2 text-sm text-destructive">
              {blad}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-crimson-dark"
          >
            Zaloguj się
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> lub <span className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={() => setBlad("Logowanie profilem zaufanym jest niedostępne w wersji demonstracyjnej.")}
            className="w-full border border-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary hover:bg-secondary"
          >
            Zaloguj przez profil zaufany
          </button>
        </form>

        <div className="text-sm leading-relaxed">
          <h2 className="mb-2 font-serif text-lg text-primary">Do czego służy panel?</h2>
          <ul className="mb-4 list-disc space-y-1 pl-5">
            <li>podgląd stanu Twoich spraw i najbliższych terminów,</li>
            <li>informacje o wydanych orzeczeniach,</li>
            <li>zamawianie akt do czytelni.</li>
          </ul>
          <p className="mb-3 text-muted-foreground">
            Dostęp otrzymują strony, pełnomocnicy i obrońcy po złożeniu wniosku w Biurze Podawczym lub po zalogowaniu
            profilem zaufanym.
          </p>
          <p className="border-l-4 border-primary bg-surface p-3 text-xs text-muted-foreground">
            Wersja demonstracyjna: zaloguj się dowolnym loginem i hasłem (min. 6 znaków).
          </p>
        </div>
      </div>
    </PageShell>
  );
}
