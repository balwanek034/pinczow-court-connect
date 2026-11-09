import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type FormEvent } from "react";
import { Landmark, Search, Send, Trash2, UserRound } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { SAD } from "@/data/sad";
import {
  dopiszDoZapytania,
  pobierzZapytanie,
  type StatusZapytania,
  type ZapytanieObywatela,
} from "@/lib/zapytania.functions";
import {
  oznaczPrzeczytane,
  usunZapisane,
  wczytajZapisane,
  zapiszZapytanie,
  type ZapisaneZapytanie,
} from "@/lib/zapisane-zapytania";

export const Route = createFileRoute("/sprawdz-zapytanie")({
  head: () => ({
    meta: [
      { title: "Sprawdź odpowiedź sądu – Sąd Rejonowy w Pińczowie" },
      {
        name: "description",
        content: "Odczytaj odpowiedź Sądu Rejonowego w Pińczowie na zapytanie wysłane przez formularz kontaktowy.",
      },
      { property: "og:title", content: "Sprawdź odpowiedź sądu – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Odpowiedzi na zapytania obywateli – numer zapytania i kod dostępu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SprawdzZapytanie,
});

export const NAZWY_STATUSU: Record<StatusZapytania, string> = {
  nowe: "Przyjęte – oczekuje na rozpatrzenie",
  w_toku: "W trakcie rozpatrywania",
  zamkniete: "Zakończone",
};

const POLE =
  "mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

const czas = (iso: string) =>
  new Date(iso).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const komunikat = (e: unknown) => {
  if (!(e instanceof Error)) return "Wystąpił błąd.";
  try {
    const issues = JSON.parse(e.message);
    if (Array.isArray(issues)) return "Sprawdź poprawność numeru i kodu dostępu.";
  } catch {
    /* zwykły komunikat */
  }
  return e.message;
};

function SprawdzZapytanie() {
  const pobierz = useServerFn(pobierzZapytanie);
  const dopisz = useServerFn(dopiszDoZapytania);

  const [zapisane, setZapisane] = useState<ZapisaneZapytanie[]>([]);
  const [nowosci, setNowosci] = useState<Record<string, number>>({});
  const [numer, setNumer] = useState("");
  const [kod, setKod] = useState("");
  const [zapytanie, setZapytanie] = useState<ZapytanieObywatela | null>(null);
  const [dane, setDane] = useState<{ numer: string; kod: string } | null>(null);
  const [blad, setBlad] = useState<string | null>(null);
  const [laduje, setLaduje] = useState(false);
  const [odpowiedz, setOdpowiedz] = useState("");
  const [wysylanie, setWysylanie] = useState(false);

  const otworz = async (n: string, k: string) => {
    setBlad(null);
    setLaduje(true);
    try {
      const z = await pobierz({ data: { numer: n, kod: k } });
      const odpSadu = z.wiadomosci.filter((w) => w.autor === "sad").length;
      zapiszZapytanie({ numer: z.numer, kod: k, temat: z.temat, przeczytane: odpSadu });
      oznaczPrzeczytane(z.numer, odpSadu);
      setZapisane(wczytajZapisane());
      setNowosci((m) => ({ ...m, [z.numer]: 0 }));
      setZapytanie(z);
      setDane({ numer: z.numer, kod: k });
    } catch (e) {
      setBlad(komunikat(e));
    } finally {
      setLaduje(false);
    }
  };

  // Zapamiętane na tym urządzeniu: sprawdź, czy przyszły nowe odpowiedzi sądu.
  useEffect(() => {
    const lista = wczytajZapisane();
    setZapisane(lista);
    lista.forEach((z) => {
      pobierz({ data: { numer: z.numer, kod: z.kod } })
        .then((r) => {
          const odp = r.wiadomosci.filter((w) => w.autor === "sad").length;
          setNowosci((m) => ({ ...m, [z.numer]: Math.max(0, odp - z.przeczytane) }));
        })
        .catch(() => undefined);
    });
  }, [pobierz]);

  const onSzukaj = (e: FormEvent) => {
    e.preventDefault();
    void otworz(numer, kod);
  };

  const onOdpowiedz = async (e: FormEvent) => {
    e.preventDefault();
    if (!dane) return;
    setBlad(null);
    setWysylanie(true);
    try {
      await dopisz({ data: { ...dane, tresc: odpowiedz } });
      setOdpowiedz("");
      await otworz(dane.numer, dane.kod);
    } catch (err) {
      setBlad(komunikat(err));
    } finally {
      setWysylanie(false);
    }
  };

  return (
    <PageShell crumbs={["Kontakt", "Sprawdź odpowiedź sądu"]} title="Sprawdź odpowiedź sądu">
      <div className="mb-6 grid gap-6 md:grid-cols-[1fr_260px]">
        <form onSubmit={onSzukaj} className="grid gap-3 bg-surface p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-bold uppercase text-primary">
            Numer zapytania
            <input value={numer} onChange={(e) => setNumer(e.target.value)} placeholder="KO-2026-00001" className={POLE} />
          </label>
          <label className="text-xs font-bold uppercase text-primary">
            Kod dostępu
            <input value={kod} onChange={(e) => setKod(e.target.value)} placeholder="XXXX-XXXX" className={POLE} />
          </label>
          <button
            type="submit"
            disabled={laduje}
            className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-2 text-sm font-bold uppercase text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
          >
            <Search className="h-4 w-4" /> {laduje ? "Szukam…" : "Sprawdź"}
          </button>
        </form>

        <div className="bg-surface p-4 text-sm">
          <h2 className="mb-2 text-xs font-bold uppercase text-primary">Twoje zapytania na tym urządzeniu</h2>
          {zapisane.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Brak. <Link to="/kontakt" className="gov-link underline">Wyślij zapytanie</Link>
            </p>
          ) : (
            <ul className="space-y-1.5">
              {zapisane.map((z) => (
                <li key={z.numer} className="flex items-start justify-between gap-2">
                  <button onClick={() => void otworz(z.numer, z.kod)} className="text-left">
                    <span className="gov-link block font-mono text-xs font-bold">{z.numer}</span>
                    <span className="block truncate text-xs text-muted-foreground">{z.temat}</span>
                    {(nowosci[z.numer] ?? 0) > 0 && (
                      <span className="mt-0.5 inline-block bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                        Nowa odpowiedź sądu
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      usunZapisane(z.numer);
                      setZapisane(wczytajZapisane());
                    }}
                    aria-label={`Zapomnij ${z.numer}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {blad && <p className="mb-4 border-l-4 border-destructive bg-surface p-3 text-sm text-destructive">{blad}</p>}

      {zapytanie && (
        <section className="bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
            <div>
              <p className="font-mono text-xs text-muted-foreground">{zapytanie.numer}</p>
              <h2 className="font-serif text-lg text-primary">{zapytanie.temat}</h2>
              <p className="text-xs text-muted-foreground">
                {zapytanie.kategoria}
                {zapytanie.wydzial && ` · ${zapytanie.wydzial}`}
                {zapytanie.sygnatura && ` · sygn. ${zapytanie.sygnatura}`} · wysłano {czas(zapytanie.created_at)}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-[11px] font-bold uppercase ${
                zapytanie.status === "zamkniete" ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {NAZWY_STATUSU[zapytanie.status]}
            </span>
          </div>

          <ol className="space-y-4">
            {zapytanie.wiadomosci.map((w) =>
              w.autor === "sad" ? (
                <li key={w.id} className="border border-border border-l-4 border-l-primary bg-tile p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-primary">
                      <Landmark className="h-4 w-4" /> {SAD.nazwa}
                    </span>
                    <span className="text-muted-foreground">{czas(w.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-line font-serif text-sm leading-relaxed">{w.tresc}</p>
                  {w.autor_nazwa && <p className="mt-3 text-right text-xs italic text-muted-foreground">{w.autor_nazwa}</p>}
                </li>
              ) : (
                <li key={w.id} className="border border-border p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-bold">
                      <UserRound className="h-4 w-4" /> {w.autor_nazwa}
                    </span>
                    <span className="text-muted-foreground">{czas(w.created_at)}</span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-relaxed">{w.tresc}</p>
                </li>
              ),
            )}
          </ol>

          {zapytanie.wiadomosci.every((w) => w.autor !== "sad") && (
            <p className="mt-4 text-sm text-muted-foreground">
              Sąd nie udzielił jeszcze odpowiedzi. Zajrzyj tu ponownie później.
            </p>
          )}

          {zapytanie.status !== "zamkniete" ? (
            <form onSubmit={onOdpowiedz} className="mt-6">
              <label className="text-xs font-bold uppercase text-primary">
                Dopisz wiadomość
                <textarea value={odpowiedz} onChange={(e) => setOdpowiedz(e.target.value)} rows={4} maxLength={5000} className={POLE} />
              </label>
              <button
                type="submit"
                disabled={wysylanie || odpowiedz.trim().length < 2}
                className="mt-2 inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
              >
                <Send className="h-4 w-4" /> {wysylanie ? "Wysyłanie…" : "Wyślij"}
              </button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Sprawa została zakończona.{" "}
              <Link to="/kontakt" className="gov-link underline">
                Wyślij nowe zapytanie
              </Link>
            </p>
          )}
        </section>
      )}
    </PageShell>
  );
}
