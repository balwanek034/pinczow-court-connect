import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent, type ReactNode } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldAlert, UserRound } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { czyJestAdministrator, utworzPierwszegoAdministratora } from "@/lib/employees.functions";

export const Route = createFileRoute("/logowanie")({
  head: () => ({
    meta: [
      { title: "Logowanie pracowników – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Logowanie do systemu wewnętrznego dla pracowników Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Logowanie pracowników – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "System wewnętrzny dla pracowników Sądu Rejonowego w Pińczowie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Logowanie,
});

const INPUT_WRAP = "flex border border-input bg-surface focus-within:ring-1 focus-within:ring-ring";
const INPUT = "min-w-0 flex-1 bg-transparent py-2 pr-3 text-sm focus:outline-none";
const LABEL = "mb-1 block text-xs font-bold uppercase text-primary";

function Pole({ id, label, icon, children }: { id: string; label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className={INPUT_WRAP}>
        <span className="flex items-center px-3 text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function Logowanie() {
  const { user, isPracownik, loading } = useAuth();
  const sprawdz = useServerFn(czyJestAdministrator);
  const { data: konfig } = useQuery({ queryKey: ["jest-admin"], queryFn: () => sprawdz() });

  if (!loading && user && isPracownik) {
    return (
      <PageShell crumbs={["Logowanie"]} title="Jesteś zalogowany">
        <p className="mb-4 text-sm">Przejdź do swojego panelu, aby kontynuować pracę.</p>
        <Link to="/panel" className="inline-block bg-primary px-5 py-2.5 text-sm font-bold uppercase text-primary-foreground hover:bg-crimson-dark">
          Panel pracownika
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={["Logowanie pracowników"]} title="Logowanie do systemu wewnętrznego">
      <div className="grid gap-6 md:grid-cols-2">
        {konfig && !konfig.jestAdmin ? <PierwszyAdmin /> : <FormularzLogowania />}

        <div className="text-sm leading-relaxed">
          <div className="mb-4 flex gap-3 border-l-4 border-primary bg-surface p-4">
            <ShieldAlert className="h-6 w-6 shrink-0 text-primary" />
            <p>
              Dostęp wyłącznie dla <b>upoważnionych pracowników Sądu Rejonowego w Pińczowie</b>. Konta zakłada
              administrator systemu. Próby nieuprawnionego dostępu są rejestrowane.
            </p>
          </div>
          <p className="text-muted-foreground">
            Interesanci mogą sprawdzić stan swoich spraw w{" "}
            <a href="https://portal.krakow.sa.gov.pl/" target="_blank" rel="noreferrer" className="gov-link underline">
              Portalu Informacyjnym Sądów Powszechnych
            </a>
            .
          </p>
          <p className="mt-3 text-muted-foreground">
            Problem z logowaniem? Skontaktuj się z Oddziałem Informatycznym: informatyk@pinczow.sr.gov.pl
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function FormularzLogowania() {
  const navigate = useNavigate();
  const { odswiez } = useAuth();
  const [email, setEmail] = useState("");
  const [haslo, setHaslo] = useState("");
  const [pokaz, setPokaz] = useState(false);
  const [blad, setBlad] = useState("");
  const [wysylanie, setWysylanie] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBlad("");
    if (!email.trim() || !haslo) {
      setBlad("Wprowadź adres e-mail i hasło.");
      return;
    }
    setWysylanie(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: haslo });
    if (error || !data.user) {
      setWysylanie(false);
      setBlad("Nieprawidłowy adres e-mail lub hasło.");
      return;
    }
    const { data: role } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    if (!role || role.length === 0) {
      await supabase.auth.signOut();
      setWysylanie(false);
      setBlad("To konto nie ma uprawnień pracownika sądu.");
      return;
    }
    await odswiez();
    navigate({ to: role.some((r) => r.role === "admin") ? "/admin" : "/panel" });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-surface p-6" noValidate>
      <Pole id="email" label="Służbowy adres e-mail" icon={<Mail className="h-4 w-4" />}>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={INPUT} />
      </Pole>
      <Pole id="haslo" label="Hasło" icon={<Lock className="h-4 w-4" />}>
        <input
          id="haslo"
          type={pokaz ? "text" : "password"}
          value={haslo}
          onChange={(e) => setHaslo(e.target.value)}
          autoComplete="current-password"
          className={INPUT}
        />
        <button
          type="button"
          onClick={() => setPokaz((p) => !p)}
          className="px-3 text-muted-foreground hover:text-primary"
          aria-label={pokaz ? "Ukryj hasło" : "Pokaż hasło"}
        >
          {pokaz ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </Pole>
      {blad && (
        <p role="alert" className="border-l-4 border-destructive bg-muted px-3 py-2 text-sm text-destructive">
          {blad}
        </p>
      )}
      <button
        type="submit"
        disabled={wysylanie}
        className="w-full bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
      >
        {wysylanie ? "Logowanie..." : "Zaloguj się"}
      </button>
    </form>
  );
}

function PierwszyAdmin() {
  const utworz = useServerFn(utworzPierwszegoAdministratora);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", stanowisko: "" });
  const [blad, setBlad] = useState("");
  const [wysylanie, setWysylanie] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBlad("");
    setWysylanie(true);
    try {
      await utworz({ data: form });
      await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
      await queryClient.invalidateQueries({ queryKey: ["jest-admin"] });
      window.location.assign("/admin");
    } catch (err) {
      setBlad(err instanceof Error ? err.message.replace(/^\[.*?\]\s*/, "") : "Nie udało się utworzyć konta.");
      setWysylanie(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-surface p-6" noValidate>
      <div className="border-l-4 border-primary bg-accent p-3 text-sm text-accent-foreground">
        <b>Pierwsze uruchomienie.</b> Utwórz konto administratora systemu. Po jego utworzeniu ten formularz zniknie, a
        kolejne konta zakłada już administrator.
      </div>
      <Pole id="fn" label="Imię i nazwisko" icon={<UserRound className="h-4 w-4" />}>
        <input id="fn" value={form.full_name} onChange={set("full_name")} className={INPUT} />
      </Pole>
      <Pole id="em" label="Adres e-mail" icon={<Mail className="h-4 w-4" />}>
        <input id="em" type="email" value={form.email} onChange={set("email")} autoComplete="username" className={INPUT} />
      </Pole>
      <Pole id="pw" label="Hasło (min. 8 znaków)" icon={<Lock className="h-4 w-4" />}>
        <input id="pw" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" className={INPUT} />
      </Pole>
      {blad && (
        <p role="alert" className="border-l-4 border-destructive bg-muted px-3 py-2 text-sm text-destructive">
          {blad}
        </p>
      )}
      <button
        type="submit"
        disabled={wysylanie}
        className="w-full bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
      >
        {wysylanie ? "Tworzenie konta..." : "Utwórz konto administratora"}
      </button>
    </form>
  );
}
