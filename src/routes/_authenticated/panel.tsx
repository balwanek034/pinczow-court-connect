import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Gavel,
  LogOut,
  Megaphone,
  ShieldCheck,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { useWyloguj } from "@/components/court/UserMenu";
import { NAZWY_ROL, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/panel")({
  head: () => ({
    meta: [
      { title: "Panel pracownika – Sąd Rejonowy w Pińczowie" },
      { name: "description", content: "Panel wewnętrzny pracownika Sądu Rejonowego w Pińczowie." },
      { property: "og:title", content: "Panel pracownika – Sąd Rejonowy w Pińczowie" },
      { property: "og:description", content: "Panel wewnętrzny pracownika sądu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Panel,
});

const KAFEL =
  "flex items-center gap-3 bg-surface p-4 font-serif text-primary transition-colors hover:bg-primary hover:text-primary-foreground";

interface WokandaItem {
  id: string;
  sygnatura: string;
  data: string;
  godzina: string;
  sala: string;
  wydzial: string;
  przewodniczacy: string;
  rodzaj_sprawy: string;
}

interface AktualnoscItem {
  id: string;
  tytul: string;
  data: string;
  kategoria: string;
  skrot: string;
}

function Panel() {
  const { profil, user, role, isAdmin, isPracownik, loading } = useAuth();
  const wyloguj = useWyloguj();

  // Zakładka: "wokanda" lub "aktualnosci"
  const [aktywnaZakladka, setAktywnaZakladka] = useState<"wokanda" | "aktualnosci">("wokanda");

  // Stan dla wokandy
  const [wokandy, setWokandy] = useState<WokandaItem[]>([]);
  const [wokandaLoading, setWokandaLoading] = useState(false);
  const [sygnatura, setSygnatura] = useState("");
  const [dataSprawy, setDataSprawy] = useState("");
  const [godzina, setGodzina] = useState("");
  const [sala, setSala] = useState("");
  const [wydzial, setWydzial] = useState("I Wydział Cywilny");
  const [sedzia, setSedzia] = useState("");
  const [rodzajSprawy, setRodzajSprawy] = useState("");

  // Stan dla aktualności
  const [aktualnosci, setAktualnosci] = useState<AktualnoscItem[]>([]);
  const [aktualnosciLoading, setAktualnosciLoading] = useState(false);
  const [tytul, setTytul] = useState("");
  const [kategoria, setKategoria] = useState("Komunikat");
  const [skrot, setSkrot] = useState("");
  const [tresc, setTresc] = useState("");

  const [komunikat, setKomunikat] = useState<{ typ: "sukces" | "blad"; tekst: string } | null>(null);

  // Pobranie danych
  const pobierzWokande = async () => {
    setWokandaLoading(true);
    const { data, error } = await (supabase as any)
      .from("wokanda")
      .select("*")
      .order("data", { ascending: false });
    if (!error && data) setWokandy(data);
    setWokandaLoading(false);
  };

  const pobierzAktualnosci = async () => {
    setAktualnosciLoading(true);
    const { data, error } = await (supabase as any)
      .from("aktualnosci")
      .select("*")
      .order("data", { ascending: false });
    if (!error && data) setAktualnosci(data);
    setAktualnosciLoading(false);
  };

  useEffect(() => {
    if (isPracownik) {
      void pobierzWokande();
      void pobierzAktualnosci();
    }
  }, [isPracownik]);

  // Dodawanie sprawy do wokandy
  const handleDodajWokande = async (e: React.FormEvent) => {
    e.preventDefault();
    setKomunikat(null);

    const { error } = await (supabase as any).from("wokanda").insert([
      {
        sygnatura,
        data: dataSprawy,
        godzina,
        sala,
        wydzial,
        przewodniczacy: sedzia,
        rodzaj_sprawy: rodzajSprawy,
      },
    ]);

    if (error) {
      setKomunikat({
        typ: "blad",
        tekst: "Błąd bazy: " + error.message + " (pamiętaj o utworzeniu tabeli w bazie)",
      });
    } else {
      setKomunikat({ typ: "sukces", tekst: "Pomyślnie dodano sprawę do wokandy!" });
      setSygnatura("");
      setDataSprawy("");
      setGodzina("");
      setSala("");
      setSedzia("");
      setRodzajSprawy("");
      void pobierzWokande();
    }
  };

  // Usuwanie sprawy
  const handleUsunWokande = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę sprawę z wokandy?")) return;
    const { error } = await (supabase as any).from("wokanda").delete().eq("id", id);
    if (error) {
      alert("Błąd podczas usuwania: " + error.message);
    } else {
      void pobierzWokande();
    }
  };

  // Dodawanie ogłoszenia
  const handleDodajAktualnosc = async (e: React.FormEvent) => {
    e.preventDefault();
    setKomunikat(null);

    const { error } = await (supabase as any).from("aktualnosci").insert([
      {
        tytul,
        kategoria,
        skrot,
        tresc,
        data: new Date().toISOString().slice(0, 10),
      },
    ]);

    if (error) {
      setKomunikat({
        typ: "blad",
        tekst: "Błąd bazy: " + error.message + " (pamiętaj o utworzeniu tabeli w bazie)",
      });
    } else {
      setKomunikat({ typ: "sukces", tekst: "Pomyślnie opublikowano ogłoszenie!" });
      setTytul("");
      setSkrot("");
      setTresc("");
      void pobierzAktualnosci();
    }
  };

  // Usuwanie ogłoszenia
  const handleUsunAktualnosc = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;
    const { error } = await (supabase as any).from("aktualnosci").delete().eq("id", id);
    if (error) {
      alert("Błąd podczas usuwania: " + error.message);
    } else {
      void pobierzAktualnosci();
    }
  };

  if (loading) {
    return (
      <PageShell crumbs={["Panel pracownika"]} title="Panel pracownika">
        <p className="text-sm">Wczytywanie…</p>
      </PageShell>
    );
  }

  if (!isPracownik) {
    return (
      <PageShell crumbs={["Panel pracownika"]} title="Brak uprawnień">
        <p className="mb-4 text-sm">Twoje konto nie ma uprawnień pracownika sądu.</p>
        <button
          onClick={() => void wyloguj()}
          className="bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground"
        >
          Wyloguj się
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={["Panel pracownika"]} title="Panel pracownika">
      {/* Nagłówek powitalny */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-surface p-4">
        <div>
          <p className="font-serif text-lg text-primary">Witaj, {profil?.full_name || user?.email}</p>
          <p className="text-xs text-muted-foreground">
            {profil?.stanowisko || "Pracownik"} · uprawnienia: {role.map((r) => NAZWY_ROL[r]).join(", ")}
          </p>
        </div>
        <button
          onClick={() => void wyloguj()}
          className="inline-flex items-center gap-2 border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <LogOut className="h-4 w-4" /> Wyloguj
        </button>
      </div>

      {/* Szybkie skróty */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {isAdmin && (
          <Link to="/admin" className={KAFEL}>
            <ShieldCheck className="h-7 w-7" /> Panel administratora – konta
          </Link>
        )}
        <Link to="/wokanda" className={KAFEL}>
          <CalendarDays className="h-7 w-7" /> Zobacz publiczną wokandę
        </Link>
        <Link to="/aktualnosci" className={KAFEL}>
          <Megaphone className="h-7 w-7" /> Zobacz publiczne aktualności
        </Link>
        <Link to="/wydzialy" className={KAFEL}>
          <Gavel className="h-7 w-7" /> Wydziały sądu
        </Link>
      </div>

      {/* Komunikat o sukcesie lub błędzie */}
      {komunikat && (
        <div
          className={`mb-6 flex items-center gap-2 border p-3 text-xs ${
            komunikat.typ === "sukces"
              ? "border-green-600 bg-green-50 text-green-900"
              : "border-red-600 bg-red-50 text-red-900"
          }`}
        >
          {komunikat.typ === "sukces" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span>{komunikat.tekst}</span>
        </div>
      )}

      {/* Zakładki */}
      <div className="mb-6 flex border-b border-border">
        <button
          onClick={() => {
            setAktywnaZakladka("wokanda");
            setKomunikat(null);
          }}
          className={`px-4 py-2 font-serif text-sm font-bold transition-colors ${
            aktywnaZakladka === "wokanda"
              ? "border-b-2 border-primary bg-surface text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Zarządzanie wokandą
        </button>
        <button
          onClick={() => {
            setAktywnaZakladka("aktualnosci");
            setKomunikat(null);
          }}
          className={`px-4 py-2 font-serif text-sm font-bold transition-colors ${
            aktywnaZakladka === "aktualnosci"
              ? "border-b-2 border-primary bg-surface text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Zarządzanie ogłoszeniami
        </button>
      </div>

      {/* SEKCJA WOKANDY */}
      {aktywnaZakladka === "wokanda" && (
        <div className="space-y-6">
          <form onSubmit={handleDodajWokande} className="border border-border bg-surface p-4">
            <h3 className="mb-4 font-serif text-base font-bold text-primary">Dodaj nową sprawę do wokandy</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Sygnatura</label>
                <input
                  required
                  value={sygnatura}
                  onChange={(e) => setSygnatura(e.target.value)}
                  placeholder="np. I C 124/26"
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Data posiedzenia</label>
                <input
                  type="date"
                  required
                  value={dataSprawy}
                  onChange={(e) => setDataSprawy(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Godzina</label>
                <input
                  type="time"
                  required
                  value={godzina}
                  onChange={(e) => setGodzina(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Sala</label>
                <input
                  required
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  placeholder="np. Sala 1"
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Wydział</label>
                <select
                  value={wydzial}
                  onChange={(e) => setWydzial(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                >
                  <option>I Wydział Cywilny</option>
                  <option>II Wydział Karny</option>
                  <option>III Wydział Rodzinny i Nieletnich</option>
                  <option>IV Wydział Ksiąg Wieczystych</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Przewodniczący</label>
                <input
                  required
                  value={sedzia}
                  onChange={(e) => setSedzia(e.target.value)}
                  placeholder="np. SSR Anna Nowak"
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Przedmiot sprawy</label>
                <input
                  required
                  value={rodzajSprawy}
                  onChange={(e) => setRodzajSprawy(e.target.value)}
                  placeholder="np. o zapłatę, o rozwód, z art. 177 k.k."
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Zapisz na wokandzie
            </button>
          </form>

          {/* Tabela wprowadzonych spraw */}
          <div>
            <h3 className="mb-2 font-serif text-sm font-bold text-primary">Sprawy w systemie:</h3>
            {wokandaLoading ? (
              <p className="text-xs text-muted-foreground">Ładowanie...</p>
            ) : wokandy.length === 0 ? (
              <p className="text-xs text-muted-foreground">Brak wpisów w bazie danych.</p>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface font-serif text-primary">
                    <tr>
                      <th className="p-2">Data i godz.</th>
                      <th className="p-2">Sygnatura</th>
                      <th className="p-2">Sala</th>
                      <th className="p-2">Wydział</th>
                      <th className="p-2">Przewodniczący</th>
                      <th className="p-2 text-right">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wokandy.map((w) => (
                      <tr key={w.id} className="border-t border-border hover:bg-surface/50">
                        <td className="p-2 font-mono">
                          {w.data} {w.godzina}
                        </td>
                        <td className="p-2 font-bold">{w.sygnatura}</td>
                        <td className="p-2">{w.sala}</td>
                        <td className="p-2">{w.wydzial}</td>
                        <td className="p-2">{w.przewodniczacy}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => void handleUsunWokande(w.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:underline"
                          >
                            <Trash2 className="h-3 w-3" /> Usuń
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKCJA OGŁOSZEŃ */}
      {aktywnaZakladka === "aktualnosci" && (
        <div className="space-y-6">
          <form onSubmit={handleDodajAktualnosc} className="border border-border bg-surface p-4">
            <h3 className="mb-4 font-serif text-base font-bold text-primary">Dodaj nowe ogłoszenie</h3>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Tytuł ogłoszenia</label>
                  <input
                    required
                    value={tytul}
                    onChange={(e) => setTytul(e.target.value)}
                    placeholder="np. Zmiana godzin urzędowania Biura Obsługi Interesantów"
                    className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Kategoria</label>
                  <select
                    value={kategoria}
                    onChange={(e) => setKategoria(e.target.value)}
                    className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                  >
                    <option>Komunikat</option>
                    <option>Ogłoszenie</option>
                    <option>Konkurs</option>
                    <option>Ważne</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Krótki opis (skrót)</label>
                <textarea
                  required
                  rows={2}
                  value={skrot}
                  onChange={(e) => setSkrot(e.target.value)}
                  placeholder="Krótkie podsumowanie widoczne na liście aktualności..."
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Pełna treść</label>
                <textarea
                  rows={4}
                  value={tresc}
                  onChange={(e) => setTresc(e.target.value)}
                  placeholder="Treść ogłoszenia (opcjonalnie)..."
                  className="w-full border border-border bg-background px-3 py-1.5 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Opublikuj ogłoszenie
            </button>
          </form>

          {/* Tabela wprowadzonych ogłoszeń */}
          <div>
            <h3 className="mb-2 font-serif text-sm font-bold text-primary">Opublikowane ogłoszenia:</h3>
            {aktualnosciLoading ? (
              <p className="text-xs text-muted-foreground">Ładowanie...</p>
            ) : aktualnosci.length === 0 ? (
              <p className="text-xs text-muted-foreground">Brak ogłoszeń w bazie danych.</p>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface font-serif text-primary">
                    <tr>
                      <th className="p-2">Data</th>
                      <th className="p-2">Kategoria</th>
                      <th className="p-2">Tytuł</th>
                      <th className="p-2 text-right">Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aktualnosci.map((a) => (
                      <tr key={a.id} className="border-t border-border hover:bg-surface/50">
                        <td className="p-2 font-mono">{a.data}</td>
                        <td className="p-2 font-bold">{a.kategoria}</td>
                        <td className="p-2">{a.tytul}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => void handleUsunAktualnosc(a.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:underline"
                          >
                            <Trash2 className="h-3 w-3" /> Usuń
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
