import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock, Copy, Send } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { KATEGORIE_ZAPYTAN, SAD, WYDZIALY } from "@/data/sad";
import { wyslijZapytanie } from "@/lib/zapytania.functions";
import { zapiszZapytanie } from "@/lib/zapisane-zapytania";

export const Route = createFileRoute("/kontakt")({
  head: () => ({
    meta: [
      { title: "Formularz kontaktowy – Sąd Rejonowy w Pińczowie" },
      {
        name: "description",
        content: "Zadaj pytanie lub opisz swoją sprawę – pracownik Sądu Rejonowego w Pińczowie odpowie przez stronę.",
      },
      { property: "og:title", content: "Formularz kontaktowy – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Zapytania obywateli do Sądu Rejonowego w Pińczowie z odpowiedzią online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Kontakt,
});

const PUSTY = {
  imie_nazwisko: "",
  kontakt: "",
  kategoria: KATEGORIE_ZAPYTAN[0],
  wydzial: "",
  sygnatura: "",
  temat: "",
  tresc: "",
  strona_www: "",
};

const POLE =
  "mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const ETYKIETA = "block text-xs font-bold uppercase text-primary";

const komunikat = (e: unknown) => {
  if (!(e instanceof Error)) return "Wystąpił błąd.";
  try {
    const issues = JSON.parse(e.message);
    if (Array.isArray(issues) && issues[0]?.message) return String(issues[0].message);
  } catch {
    /* zwykły komunikat */
  }
  return e.message;
};

function Kontakt() {
  const wyslij = useServerFn(wyslijZapytanie);
  const [form, setForm] = useState(PUSTY);
  const [zgoda, setZgoda] = useState(false);
  const [blad, setBlad] = useState<string | null>(null);
  const [wysylanie, setWysylanie] = useState(false);
  const [wynik, setWynik] = useState<{ numer: string; kod: string } | null>(null);

  const ustaw = (k: keyof typeof PUSTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBlad(null);
    if (!zgoda) return setBlad("Zaznacz zgodę na przetwarzanie danych w celu udzielenia odpowiedzi.");
    setWysylanie(true);
    try {
      const r = await wyslij({ data: form });
      zapiszZapytanie({ numer: r.numer, kod: r.kod, temat: form.temat, przeczytane: 0 });
      setWynik(r);
      setForm(PUSTY);
      setZgoda(false);
    } catch (err) {
      setBlad(komunikat(err));
    } finally {
      setWysylanie(false);
    }
  };

  if (wynik) {
    return (
      <PageShell crumbs={["Kontakt"]} title="Zapytanie zostało wysłane">
        <div className="bg-surface p-6 text-sm leading-relaxed">
          <p className="mb-4 flex items-center gap-2 font-bold text-primary">
            <CheckCircle2 className="h-5 w-5" /> Dziękujemy. Twoje zapytanie trafiło do Biura Podawczego.
          </p>
          <p className="mb-4">
            Zapisz poniższe dane – są potrzebne, aby odczytać odpowiedź pracownika sądu. Kod dostępu nie zostanie
            pokazany ponownie.
          </p>
          <dl className="mb-4 grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-l-4 border-primary bg-muted p-4">
            <dt className="text-muted-foreground">Numer zapytania:</dt>
            <dd className="font-mono text-base font-bold">{wynik.numer}</dd>
            <dt className="text-muted-foreground">Kod dostępu:</dt>
            <dd className="font-mono text-base font-bold">{wynik.kod}</dd>
          </dl>
          <button
            type="button"
            onClick={() => void navigator.clipboard?.writeText(`Numer: ${wynik.numer}, kod: ${wynik.kod}`)}
            className="mb-6 inline-flex items-center gap-2 border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Copy className="h-4 w-4" /> Kopiuj dane
          </button>
          <p className="mb-4 text-muted-foreground">
            Na tym urządzeniu zapytanie zostało też zapamiętane – po wejściu w „Sprawdź odpowiedź sądu” zobaczysz je
            automatycznie.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/sprawdz-zapytanie"
              className="bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground hover:bg-crimson-dark"
            >
              Sprawdź odpowiedź sądu
            </Link>
            <button type="button" onClick={() => setWynik(null)} className="gov-link text-sm underline">
              Wyślij kolejne zapytanie
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={["Kontakt"]} title="Kontakt – formularz zapytania">
      <div className="mb-6 grid gap-4 text-sm leading-relaxed md:grid-cols-[1fr_auto]">
        <p>
          Za pomocą formularza możesz zadać pytanie lub opisać swoją sprawę. Zapytanie trafi do pracowników{" "}
          {SAD.nazwa}, a odpowiedź odczytasz na tej stronie po podaniu numeru zapytania i kodu dostępu.
        </p>
        <div className="flex flex-col gap-2 text-xs">
          <Link to="/sprawdz-zapytanie" className="gov-link font-bold underline">
            › Mam już numer – sprawdź odpowiedź
          </Link>
          <Link to="/godziny-urzedowania" className="gov-link inline-flex items-center gap-1 underline">
            <Clock className="h-3.5 w-3.5" /> Godziny urzędowania i telefony
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 bg-surface p-5 sm:grid-cols-2" noValidate>
        <label className={ETYKIETA}>
          Imię i nazwisko *
          <input value={form.imie_nazwisko} onChange={ustaw("imie_nazwisko")} maxLength={120} className={POLE} />
        </label>
        <label className={ETYKIETA}>
          Kontakt zwrotny (e-mail, telefon lub Discord)
          <input value={form.kontakt} onChange={ustaw("kontakt")} maxLength={160} className={POLE} />
        </label>
        <label className={ETYKIETA}>
          Kategoria sprawy *
          <select value={form.kategoria} onChange={ustaw("kategoria")} className={POLE}>
            {KATEGORIE_ZAPYTAN.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className={ETYKIETA}>
          Wydział (jeśli dotyczy)
          <select value={form.wydzial} onChange={ustaw("wydzial")} className={POLE}>
            <option value="">— nie wiem / nie dotyczy —</option>
            {WYDZIALY.map((w) => (
              <option key={w.id} value={`${w.numer} ${w.nazwa}`}>
                {w.numer} {w.nazwa}
              </option>
            ))}
          </select>
        </label>
        <label className={ETYKIETA}>
          Sygnatura akt (jeśli znana)
          <input
            value={form.sygnatura}
            onChange={ustaw("sygnatura")}
            maxLength={60}
            placeholder="np. I C 123/26"
            className={POLE}
          />
        </label>
        <label className={ETYKIETA}>
          Temat *
          <input value={form.temat} onChange={ustaw("temat")} maxLength={160} className={POLE} />
        </label>
        <label className={`${ETYKIETA} sm:col-span-2`}>
          Pytanie / opis sprawy *
          <textarea
            value={form.tresc}
            onChange={ustaw("tresc")}
            rows={8}
            maxLength={5000}
            className={POLE}
          />
          <span className="mt-1 block text-right text-[11px] font-normal normal-case text-muted-foreground">
            {form.tresc.length} / 5000
          </span>
        </label>
        <div className="hidden" aria-hidden>
          <label>
            Strona www
            <input tabIndex={-1} autoComplete="off" value={form.strona_www} onChange={ustaw("strona_www")} />
          </label>
        </div>
        <label className="flex items-start gap-2 text-xs sm:col-span-2">
          <input type="checkbox" checked={zgoda} onChange={(e) => setZgoda(e.target.checked)} className="mt-0.5" />
          <span>
            Wyrażam zgodę na przetwarzanie podanych danych w celu udzielenia odpowiedzi na zapytanie. Formularz nie
            służy do składania pism procesowych – te należy złożyć w Biurze Podawczym lub drogą pocztową.
          </span>
        </label>
        {blad && <p className="text-sm text-destructive sm:col-span-2">{blad}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={wysylanie}
            className="inline-flex items-center gap-2 bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {wysylanie ? "Wysyłanie…" : "Wyślij zapytanie"}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
