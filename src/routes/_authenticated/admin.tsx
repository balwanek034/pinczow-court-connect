import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { NAZWY_ROL, useAuth, type Rola } from "@/hooks/useAuth";
import { dodajPracownika, listaPracownikow, usunPracownika, zmienRole } from "@/lib/employees.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel administratora – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Zarządzanie kontami i uprawnieniami pracowników sądu." },
      { property: "og:title", content: "Panel administratora – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Zarządzanie kontami pracowników sądu." },
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
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    dodawanie.mutate();
  };

  const adminow = lista.filter((p) => p.roles.includes("admin")).length;

  return (
    <PageShell crumbs={["Panel administratora"]} title="Panel administratora">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Konta", lista.length],
          ["Administratorzy", adminow],
          ["Pracownicy", lista.length - adminow],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-4">
            <div className="text-xs uppercase text-muted-foreground">{k}</div>
            <div className="font-serif text-3xl text-primary">{v}</div>
          </div>
        ))}
      </div>

      <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-primary">
        <ShieldCheck className="h-5 w-5" /> Konta i uprawnienia
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

      <h2 className="mb-3 flex items-center gap-2 font-serif text-lg text-primary">
        <UserPlus className="h-5 w-5" /> Dodaj pracownika
      </h2>
      <form onSubmit={onSubmit} className="grid gap-4 bg-surface p-5 sm:grid-cols-2">
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
