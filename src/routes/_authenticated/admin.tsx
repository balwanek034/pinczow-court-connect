import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Gavel, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { NAZWY_ROL, useAuth, type Rola } from "@/hooks/useAuth";
import { dodajPracownika, listaPracownikow, usunPracownika, zmienRole } from "@/lib/employees.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel administratora – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Zarządzanie kontami, uprawnieniami oraz składem sędziowskim." },
      { property: "og:title", content: "Panel administratora – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Zarządzanie kontami i sędziami sądu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const komunikat = (e: unknown) =>
  e instanceof Error ? e.message.replace(/^\[.*?\]\s*/, "") : "Wystąpił błąd.";

function Admin() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <PageShell crumbs={["Panel administratora"]} title="Panel administratora">
        <p className="text-sm">Wczytywanie…</p>
      </PageShell>
    );
  }
  if (!isAdmin) {
    return (
      <PageShell crumbs={["Panel administratora"]} title="Brak uprawnień">
        <p className="mb-4 text-sm">Ta sekcja jest dostępna tylko dla administratorów.</p>
        <Link to="/panel" className="gov-link underline">
          Wróć do panelu pracownika
        </Link>
      </PageShell>
    );
  }
  return <AdminTresc />;
}

function AdminTresc() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const pobierz = useServerFn(listaPracownikow);
  const dodaj = useServerFn(dodajPracownika);
  const zmien = useServerFn(zmienRole);
  const usun = useServerFn(usunPracownika);

  // --- PRACOWNICY ---
  const { data: lista = [], isLoading } = useQuery({ queryKey: ["pracownicy"], queryFn: () => pobierz() });
  const odswiez = () => qc.invalidateQueries({ queryKey: ["pracownicy"] });

  const zmianaRoli = useMutation({
    mutationFn: (v: { userId: string; role: Rola }) => zmien({ data: v }),
    onSuccess: () => {
      toast.success("Uprawnienia zostały zmienione.");
      void odswiez();
    },
    onError: (e) => toast.error(komunikat(e)),
  });

  const usuwanie = useMutation({
    mutationFn: (userId: string) => usun({ data: { userId } }),
    onSuccess: () => {
      toast.success("Konto zostało usunięte.");
      void odswiez();
    },
    onError: (e) => toast.error(komunikat(e)),
  });

  const [form, setForm] = useState({ full_name: "", stanowisko: "", email: "", password: "", role: "pracownik" as Rola });
  const dodawanie = useMutation({
    mutationFn: () => dodaj({ data: form }),
    onSuccess: () => {
      toast.success("Konto pracownika zostało utworzone.");
      setForm({ full_name: "", stanowisko: "", email: "", password: "", role: "pracownik" });
      void odswiez();
    },
    onError: (e) => toast.error(komunikat(e)),
  });

  const onSubmitPracownik = (e: FormEvent) => {
    e.preventDefault();
    dodawanie.mutate();
  };

  // --- SĘDZIOWIE I ASESORZY ---
  const { data: sedziowie = [], isLoading: wczytywanieSedziow } = useQuery({
    queryKey: ["sedziowie"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sedziowie")
        .select("id, imie_nazwisko, rodzaj, funkcja, wydzial, kolejnosc")
        .order("kolejnosc")
        .order("imie_nazwisko");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [sedziaForm, setSedziaForm] = useState({
    imie_nazwisko: "",
    rodzaj: "sedzia",
    funkcja: "",
    wydzial: "I Wydział Cywilny",
    kolejnosc: 1,
  });

  const dodawanieSedziego = useMutation({
    mutationFn: async () => {
      if (!sedziaForm.imie_nazwisko.trim()) {
        throw new Error("Wpisz imię i nazwisko sędziego lub asesora.");
      }
      const { error } = await supabase.from("sedziowie").insert({
        imie_nazwisko: sedziaForm.imie_nazwisko.trim(),
        rodzaj: sedziaForm.rodzaj,
        funkcja: sedziaForm.funkcja.trim(),
        wydzial: sedziaForm.wydzial.trim(),
        kolejnosc: Number(sedziaForm.kolejnosc) || 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Dodano do wykazu sędziów i asesorów.");
      setSedziaForm({
        imie_nazwisko: "",
        rodzaj: "sedzia",
        funkcja: "",
        wydzial: "I Wydział Cywilny",
        kolejnosc: sedziowie.length + 2,
      });
      void qc.invalidateQueries({ queryKey: ["sedziowie"] });
    },
    onError: (e) => toast.error(komunikat(e)),
  });

  const usuwanieSedziego = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sedziowie").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Wpis został usunięty z wykazu.");
      void qc.invalidateQueries({ queryKey: ["sedziowie"] });
    },
    onError: (e) => toast.error(komunikat(e)),
  });

  const onSubmitSedzia = (e: FormEvent) => {
    e.preventDefault();
    dodawanieSedziego.mutate();
  };

  const adminow = lista.filter((p) => p.roles.includes("admin")).length;

  return (
    <PageShell crumbs={["Panel administratora"]} title="Panel administratora">
      {/* Statystyki */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          ["Konta pracowników", lista.length],
          ["Administratorzy", adminow],
          ["Sędziowie w wykazie", sedziowie.filter((s) => s.rodzaj === "sedzia").length],
          ["Asesorzy w wykazie", sedziowie.filter((s) => s.rodzaj === "asesor").length],
        ].map(([k, v]) => (
          <div key={k} className="border border-border bg-surface p-4">
            <div className="text-xs uppercase text-muted-foreground">{k}</div>
            <div className="font-serif text-3xl text-primary">{v}</div>
          </div>
        ))}
      </div>

      {/* SEKCJA 1: SĘDZIOWIE I ASESORZY */}
      <div className="mb-10 rounded border border-border bg-surface p-5 shadow-xs">
        <h2 className="mb-2 flex items-center gap-2 font-serif text-xl text-primary">
          <Gavel className="h-5 w-5" /> Zarządzanie spisem sędziów i asesorów
        </h2>
        <p className="mb-5 text-xs text-muted-foreground">
          Wpisy dodane w tym miejscu natychmiast pojawiają się w publicznym wykazie pod adresem{" "}
          <Link to="/sedziowie" className="underline hover:text-primary">
            /sedziowie
          </Link>
          .
        </p>

        {/* Tabela sędziów */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full border border-border bg-surface text-sm">
            <thead>
              <tr className="bg-primary text-left text-xs uppercase text-primary-foreground">
                <th className="w-12 px-3 py-2 text-center">Kol.</th>
                <th className="px-3 py-2">Imię i nazwisko</th>
                <th className="px-3 py-2">Rodzaj</th>
                <th className="px-3 py-2">Funkcja</th>
                <th className="px-3 py-2">Wydział</th>
                <th className="px-3 py-2 text-right">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {wczytywanieSedziow && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                    Wczytywanie wykazu…
                  </td>
                </tr>
              )}
              {!wczytywanieSedziow && sedziowie.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                    Brak wpisów w wykazie. Dodaj pierwszą osobę formularzem poniżej.
                  </td>
                </tr>
              )}
              {sedziowie.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-center text-xs font-mono text-muted-foreground">{s.kolejnosc}</td>
                  <td className="px-3 py-2 font-bold">{s.imie_nazwisko}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs uppercase font-medium ${
                        s.rodzaj === "sedzia" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"
                      }`}
                    >
                      {s.rodzaj === "sedzia" ? "Sędzia" : "Asesor sądowy"}
                    </span>
                  </td>
                  <td className="px-3 py-2">{s.funkcja || "—"}</td>
                  <td className="px-3 py-2">{s.wydzial || "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      disabled={usuwanieSedziego.isPending}
                      onClick={() => {
                        if (confirm(`Usunąć ${s.imie_nazwisko} z wykazu?`)) {
                          usuwanieSedziego.mutate(s.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:underline disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" /> Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Formularz dodawania sędziego */}
        <h3 className="mb-3 font-serif text-sm font-bold uppercase tracking-wide text-primary">
          Dodaj sędziego lub asesora do wykazu
        </h3>
        <form onSubmit={onSubmitSedzia} className="grid gap-3 rounded border border-border/60 bg-muted/20 p-4 sm:grid-cols-3">
          <label className="text-xs font-bold uppercase text-primary sm:col-span-2">
            Imię i nazwisko (z tytułem)
            <input
              type="text"
              required
              placeholder="np. SSR Jan Kowalski"
              value={sedziaForm.imie_nazwisko}
              onChange={(e) => setSedziaForm((f) => ({ ...f, imie_nazwisko: e.target.value }))}
              className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="text-xs font-bold uppercase text-primary">
            Stanowisko (rodzaj)
            <select
              value={sedziaForm.rodzaj}
              onChange={(e) => setSedziaForm((f) => ({ ...f, rodzaj: e.target.value }))}
              className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground"
            >
              <option value="sedzia">Sędzia</option>
              <option value="asesor">Asesor sądowy</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase text-primary">
            Funkcja (opcjonalnie)
            <input
              type="text"
              placeholder="np. Prezes Sądu, Przewodniczący Wydziału"
              value={sedziaForm.funkcja}
              onChange={(e) => setSedziaForm((f) => ({ ...f, funkcja: e.target.value }))}
              className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="text-xs font-bold uppercase text-primary">
            Wydział
            <input
              type="text"
              placeholder="np. I Wydział Cywilny"
              value={sedziaForm.wydzial}
              onChange={(e) => setSedziaForm((f) => ({ ...f, wydzial: e.target.value }))}
              className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>

          <label className="text-xs font-bold uppercase text-primary">
            Kolejność wyświetlania
            <input
              type="number"
              min="1"
              value={sedziaForm.kolejnosc}
              onChange={(e) => setSedziaForm((f) => ({ ...f, kolejnosc: parseInt(e.target.value, 10) || 1 }))}
              className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={dodawanieSedziego.isPending}
              className="bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
            >
              {dodawanieSedziego.isPending ? "Zapisywanie…" : "Dodaj do wykazu"}
            </button>
          </div>
        </form>
      </div>

      {/* SEKCJA 2: KONTA I UPRAWNIENIA PRACOWNIKÓW */}
      <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-primary">
        <Users className="h-5 w-5" /> Konta i uprawnienia pracowników
      </h2>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full border border-border bg-surface text-sm">
          <thead>
            <tr className="bg-primary text-left text-xs uppercase text-primary-foreground">
              <th className="px-3 py-2">Pracownik</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Uprawnienia</th>
              <th className="px-3 py-2 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                  Wczytywanie…
                </td>
              </tr>
            )}
            {lista.map((p) => {
              const ja = p.id === user?.id;
              const rola: Rola = p.roles.includes("admin") ? "admin" : "pracownik";
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="font-bold">
                      {p.full_name || "—"} {ja && <span className="text-xs font-normal text-muted-foreground">(Ty)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.stanowisko}</div>
                  </td>
                  <td className="px-3 py-2">{p.email}</td>
                  <td className="px-3 py-2">
                    {p.roles.length === 0 ? (
                      <span className="text-xs text-destructive">brak</span>
                    ) : (
                      <select
                        aria-label={`Uprawnienia: ${p.full_name}`}
                        value={rola}
                        disabled={ja || zmianaRoli.isPending}
                        onChange={(e) => zmianaRoli.mutate({ userId: p.id, role: e.target.value as Rola })}
                        className="border border-input bg-surface px-2 py-1 text-sm disabled:opacity-60"
                      >
                        {(Object.keys(NAZWY_ROL) as Rola[]).map((r) => (
                          <option key={r} value={r}>
                            {NAZWY_ROL[r]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      disabled={ja || usuwanie.isPending}
                      onClick={() => {
                        if (confirm(`Usunąć konto: ${p.full_name || p.email}?`)) usuwanie.mutate(p.id);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:underline disabled:opacity-40 disabled:no-underline"
                    >
                      <Trash2 className="h-4 w-4" /> Usuń
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Formularz tworzenia konta pracownika */}
      <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-primary">
        <UserPlus className="h-5 w-5" /> Utwórz nowe konto pracownika
      </h2>
      <form onSubmit={onSubmitPracownik} className="grid gap-4 bg-surface p-5 sm:grid-cols-2">
        {(
          [
            ["full_name", "Imię i nazwisko", "text"],
            ["stanowisko", "Stanowisko", "text"],
            ["email", "Adres e-mail", "email"],
            ["password", "Hasło startowe (min. 8 znaków)", "password"],
          ] as const
        ).map(([k, label, type]) => (
          <label key={k} className="text-xs font-bold uppercase text-primary">
            {label}
            <input
              type={type}
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              autoComplete={type === "password" ? "new-password" : "off"}
              className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </label>
        ))}
        <label className="text-xs font-bold uppercase text-primary">
          Uprawnienia
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Rola }))}
            className="mt-1 block w-full border border-input bg-surface px-3 py-2 text-sm font-normal normal-case text-foreground"
          >
            <option value="pracownik">Pracownik</option>
            <option value="admin">Administrator</option>
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={dodawanie.isPending}
            className="w-full bg-primary py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-crimson-dark disabled:opacity-60"
          >
            {dodawanie.isPending ? "Tworzenie…" : "Utwórz konto"}
          </button>
        </div>
      </form>
    </PageShell>
  );
}
