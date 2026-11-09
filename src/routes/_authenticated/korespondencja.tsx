import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Inbox, Landmark, Send, UserRound } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { NAZWY_STATUSU, SAD } from "@/data/sad";

export const Route = createFileRoute("/_authenticated/korespondencja")({
  head: () => ({
    meta: [
      { title: "Korespondencja z obywatelami – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Zapytania obywateli wysłane przez formularz kontaktowy i odpowiedzi pracowników sądu." },
      { property: "og:title", content: "Korespondencja z obywatelami – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Skrzynka zapytań obywateli dla pracowników sądu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Korespondencja,
});

type Status = "nowe" | "w_toku" | "zamkniete";
type Filtr = "czeka" | "wszystkie" | "zamkniete";

const czas = (iso: string) =>
  new Date(iso).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function useZapytania() {
  return useQuery({
    queryKey: ["zapytania"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zapytania")
        .select(
          "id, numer, imie_nazwisko, kontakt, kategoria, wydzial, sygnatura, temat, status, created_at, updated_at, zapytania_wiadomosci(autor, created_at)",
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((z) => {
        const ost = [...z.zapytania_wiadomosci].sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1);
        return { ...z, status: z.status as Status, czeka: z.status !== "zamkniete" && ost?.autor === "obywatel" };
      });
    },
    refetchInterval: 30_000,
  });
}

function Korespondencja() {
  const { isPracownik, loading } = useAuth();
  if (loading) {
    return (
      <PageShell crumbs={["Panel pracownika", "Korespondencja"]} title="Korespondencja z obywatelami">
        <p className="text-sm">Wczytywanie…</p>
      </PageShell>
    );
  }
  if (!isPracownik) {
    return (
      <PageShell crumbs={["Korespondencja"]} title="Brak uprawnień">
        <p className="text-sm">Ta sekcja jest dostępna tylko dla pracowników sądu.</p>
      </PageShell>
    );
  }
  return <Skrzynka />;
}

function Skrzynka() {
  const { data: lista = [], isLoading, error } = useZapytania();
  const [filtr, setFiltr] = useState<Filtr>("czeka");
  const [wybrane, setWybrane] = useState<string | null>(null);

  const widoczne = lista.filter((z) =>
    filtr === "czeka" ? z.czeka : filtr === "zamkniete" ? z.status === "zamkniete" : true,
  );
  const czekajacych = lista.filter((z) => z.czeka).length;
  const akt = lista.find((z) => z.id === wybrane) ?? null;

  return (
    <PageShell crumbs={["Panel pracownika", "Korespondencja"]} title="Korespondencja z obywatelami">
      <p className="mb-4 text-sm">
        <Link to="/panel" className="gov-link underline">
          ‹ Panel pracownika
        </Link>
      </p>
      <div className="mb-4 flex flex-wrap gap-px">
        {(
          [
            ["czeka", `Czeka na odpowiedź (${czekajacych})`],
            ["wszystkie", `Wszystkie (${lista.length})`],
            ["zamkniete", "Zakończone"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFiltr(k)}
            className={`px-4 py-2 text-xs font-bold uppercase ${
              filtr === k ? "bg-primary text-primary-foreground" : "bg-surface text-primary hover:bg-secondary"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <ul className="max-h-[640px] overflow-y-auto bg-surface">
          {isLoading && <li className="p-4 text-sm text-muted-foreground">Wczytywanie…</li>}
          {error && <li className="p-4 text-sm text-destructive">Nie udało się wczytać zapytań.</li>}
          {!isLoading && widoczne.length === 0 && (
            <li className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Inbox className="h-4 w-4" /> Brak zapytań w tym widoku.
            </li>
          )}
          {widoczne.map((z) => (
            <li key={z.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => setWybrane(z.id)}
                className={`block w-full p-3 text-left hover:bg-secondary ${wybrane === z.id ? "bg-secondary" : ""}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{z.numer}</span>
                  {z.czeka && (
                    <span className="bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                      Nowe
                    </span>
                  )}
                </span>
                <span className="block truncate text-sm font-bold">{z.temat}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {z.imie_nazwisko} · {czas(z.updated_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {akt ? (
          <Watek key={akt.id} zapytanie={akt} />
        ) : (
          <div className="flex min-h-[200px] items-center justify-center bg-surface p-6 text-sm text-muted-foreground">
            Wybierz zapytanie z listy, aby odczytać treść i odpowiedzieć.
          </div>
        )}
      </div>
    </PageShell>
  );
}

type Zap = ReturnType<typeof useZapytania>["data"] extends (infer T)[] | undefined ? T : never;

function Watek({ zapytanie }: { zapytanie: Zap }) {
  const { user, profil } = useAuth();
  const qc = useQueryClient();
  const [tresc, setTresc] = useState("");
  const [zamknij, setZamknij] = useState(false);

  const { data: wiadomosci = [], isLoading } = useQuery({
    queryKey: ["zapytanie-wiadomosci", zapytanie.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zapytania_wiadomosci")
        .select("id, autor, autor_nazwa, tresc, created_at")
        .eq("zapytanie_id", zapytanie.id)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const odswiez = () => {
    void qc.invalidateQueries({ queryKey: ["zapytania"] });
    void qc.invalidateQueries({ queryKey: ["zapytanie-wiadomosci", zapytanie.id] });
  };

  const ustawStatus = useMutation({
    mutationFn: async (status: Status) => {
      const { error } = await supabase.from("zapytania").update({ status }).eq("id", zapytanie.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status zapytania został zmieniony.");
      odswiez();
    },
    onError: () => toast.error("Nie udało się zmienić statusu."),
  });

  const odpowiedz = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Brak sesji");
      const podpis = [profil?.full_name, profil?.stanowisko].filter(Boolean).join(", ");
      const { error } = await supabase.from("zapytania_wiadomosci").insert({
        zapytanie_id: zapytanie.id,
        autor: "sad",
        autor_id: user.id,
        autor_nazwa: podpis,
        tresc: tresc.trim(),
      });
      if (error) throw error;
      const { error: e2 } = await supabase
        .from("zapytania")
        .update({ status: zamknij ? "zamkniete" : "w_toku", updated_at: new Date().toISOString() })
        .eq("id", zapytanie.id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Odpowiedź została wysłana do obywatela.");
      setTresc("");
      setZamknij(false);
      odswiez();
    },
    onError: () => toast.error("Nie udało się wysłać odpowiedzi."),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tresc.trim().length < 2) return;
    odpowiedz.mutate();
  };

  return (
    <section className="bg-surface p-5">
      <div className="mb-4 border-b border-border pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{zapytanie.numer}</p>
            <h2 className="font-serif text-lg text-primary">{zapytanie.temat}</h2>
          </div>
          <select
            aria-label="Status zapytania"
            value={zapytanie.status}
            disabled={ustawStatus.isPending}
            onChange={(e) => ustawStatus.mutate(e.target.value as Status)}
            className="border border-input bg-surface px-2 py-1 text-xs"
          >
            {(Object.keys(NAZWY_STATUSU) as Status[]).map((s) => (
              <option key={s} value={s}>
                {NAZWY_STATUSU[s]}
              </option>
            ))}
          </select>
        </div>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
          <dt className="text-muted-foreground">Nadawca:</dt>
          <dd className="font-bold">{zapytanie.imie_nazwisko}</dd>
          <dt className="text-muted-foreground">Kontakt:</dt>
          <dd>{zapytanie.kontakt || "—"}</dd>
          <dt className="text-muted-foreground">Kategoria:</dt>
          <dd>{zapytanie.kategoria}</dd>
          {zapytanie.wydzial && (
            <>
              <dt className="text-muted-foreground">Wydział:</dt>
              <dd>{zapytanie.wydzial}</dd>
            </>
          )}
          {zapytanie.sygnatura && (
            <>
              <dt className="text-muted-foreground">Sygnatura:</dt>
              <dd>{zapytanie.sygnatura}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Wpłynęło:</dt>
          <dd>{czas(zapytanie.created_at)}</dd>
        </dl>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Wczytywanie korespondencji…</p>
      ) : (
        <ol className="space-y-3">
          {wiadomosci.map((w) => (
            <li
              key={w.id}
              className={`border p-3 ${w.autor === "sad" ? "border-l-4 border-l-primary bg-tile" : "border-border"}`}
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 font-bold">
                  {w.autor === "sad" ? (
                    <>
                      <Landmark className="h-4 w-4 text-primary" /> {SAD.nazwa}
                      {w.autor_nazwa && <span className="font-normal text-muted-foreground">({w.autor_nazwa})</span>}
                    </>
                  ) : (
                    <>
                      <UserRound className="h-4 w-4" /> {w.autor_nazwa}
                    </>
                  )}
                </span>
                <span className="text-muted-foreground">{czas(w.created_at)}</span>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed">{w.tresc}</p>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={onSubmit} className="mt-5">
        <label className="text-xs font-bold uppercase text-primary">
          Odpowiedź sądu
          <textarea
            value={tresc}
            onChange={(e) => setTresc(e.target.value)}
            rows={6}
            maxLength={5000}
            placeholder="Szanowna Pani / Szanowny Panie, uprzejmie informuję, że…"
            className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={zamknij} onChange={(e) => setZamknij(e.target.checked)} />
            Zakończ sprawę po wysłaniu odpowiedzi
          </label>
          <button
            type="submit"
            disabled={odpowiedz.isPending || tresc.trim().length < 2}
            className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
          >
            <Send className="h-4 w-4" /> {odpowiedz.isPending ? "Wysyłanie…" : "Wyślij odpowiedź"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Obywatel zobaczy odpowiedź po wejściu w „Sprawdź odpowiedź sądu” (numer {zapytanie.numer} + kod dostępu).
        </p>
      </form>
    </section>
  );
}
