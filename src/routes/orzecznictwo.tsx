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
  CheckCircle2,
  FileText,
} from "lucide-react";
import { PageShell } from "@/components/court/PageShell";
import { useWyloguj } from "@/components/court/UserMenu";
import { NAZWY_ROL, useAuth } from "@/hooks/useAuth";

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

export interface OrzeczenieItem {
  id: string;
  sygnatura: string;
  data_orzeczenia: string;
  wydzial: string;
  rodzaj: "Wyrok" | "Postanowienie" | "Uchwała";
  status_prawomocnosci: "PRAWOMOCNE" | "NIEPRAWOMOCNE";
  sedzia: string;
  protokolant: string;
  tryb: "na rozprawie" | "na posiedzeniu niejawnym";
  strony: string;
  przedmiot: string;
  sentencja: string;     // RUBRYKA 1: Treść wyroku / rozstrzygnięcia
  uzasadnienie: string;  // RUBRYKA 2: Treść uzasadnienia
}

function Panel() {
  const { profil, user, role, isAdmin, isPracownik, loading } = useAuth();
  const wyloguj = useWyloguj();

  const [aktywnaZakladka, setAktywnaZakladka] = useState<"wokanda" | "orzecznictwo" | "aktualnosci">("orzecznictwo");

  // Stan wokandy
  const [wokandy, setWokandy] = useState<WokandaItem[]>([]);
  const [sygnatura, setSygnatura] = useState("");
  const [dataSprawy, setDataSprawy] = useState("");
  const [godzina, setGodzina] = useState("");
  const [sala, setSala] = useState("");
  const [wydzial, setWydzial] = useState("I Wydział Cywilny");
  const [sedzia, setSedzia] = useState("");
  const [rodzajSprawy, setRodzajSprawy] = useState("");

  // Stan ogłoszeń
  const [aktualnosci, setAktualnosci] = useState<AktualnoscItem[]>([]);
  const [tytul, setTytul] = useState("");
  const [kategoria, setKategoria] = useState("Komunikat");
  const [skrot, setSkrot] = useState("");

  // Stan orzecznictwa
  const [orzeczenia, setOrzeczenia] = useState<OrzeczenieItem[]>([]);
  const [orzSygnatura, setOrzSygnatura] = useState("");
  const [orzData, setOrzData] = useState("");
  const [orzWydzial, setOrzWydzial] = useState("I Wydział Cywilny");
  const [orzRodzaj, setOrzRodzaj] = useState<"Wyrok" | "Postanowienie">("Wyrok");
  const [orzStatus, setOrzStatus] = useState<"PRAWOMOCNE" | "NIEPRAWOMOCNE">("PRAWOMOCNE");
  const [orzSedzia, setOrzSedzia] = useState("");
  const [orzProtokolant, setOrzProtokolant] = useState("");
  const [orzTryb, setOrzTryb] = useState<"na rozprawie" | "na posiedzeniu niejawnym">("na rozprawie");
  const [orzStrony, setOrzStrony] = useState("");
  const [orzPrzedmiot, setOrzPrzedmiot] = useState("");
  const [orzSentencja, setOrzSentencja] = useState("");       // Sentencja
  const [orzUzasadnienie, setOrzUzasadnienie] = useState(""); // Uzasadnienie

  const [sukcesKomunikat, setSukcesKomunikat] = useState<string | null>(null);

  // Wczytanie z pamięci
  useEffect(() => {
    try {
      const zapisaneWokandy = localStorage.getItem("sad_wokanda");
      if (zapisaneWokandy) setWokandy(JSON.parse(zapisaneWokandy));

      const zapisaneAktualnosci = localStorage.getItem("sad_aktualnosci");
      if (zapisaneAktualnosci) setAktualnosci(JSON.parse(zapisaneAktualnosci));

      const zapisaneOrzeczenia = localStorage.getItem("sad_orzeczenia");
      if (zapisaneOrzeczenia) setOrzeczenia(JSON.parse(zapisaneOrzeczenia));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Dodawanie orzeczenia
  const handleDodajOrzeczenie = (e: React.FormEvent) => {
    e.preventDefault();
    const nowe: OrzeczenieItem = {
      id: Date.now().toString(),
      sygnatura: orzSygnatura.startsWith("Sygn") ? orzSygnatura : `Sygnatura akt ${orzSygnatura}`,
      data_orzeczenia: orzData,
      wydzial: orzWydzial,
      rodzaj: orzRodzaj,
      status_prawomocnosci: orzStatus,
      sedzia: orzSedzia,
      protokolant: orzProtokolant,
      tryb: orzTryb,
      strony: orzStrony,
      przedmiot: orzPrzedmiot,
      sentencja: orzSentencja,
      uzasadnienie: orzUzasadnienie,
    };

    const lista = [nowe, ...orzeczenia];
    setOrzeczenia(lista);
    localStorage.setItem("sad_orzeczenia", JSON.stringify(lista));

    setSukcesKomunikat("Pomyślnie dodano nowe orzeczenie do bazy sądu!");
    setOrzSygnatura("");
    setOrzData("");
    setOrzSedzia("");
    setOrzProtokolant("");
    setOrzStrony("");
    setOrzPrzedmiot("");
    setOrzSentencja("");
    setOrzUzasadnienie("");
    setTimeout(() => setSukcesKomunikat(null), 4000);
  };

  const handleUsunOrzeczenie = (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to orzeczenie z bazy?")) return;
    const lista = orzeczenia.filter((o) => o.id !== id);
    setOrzeczenia(lista);
    localStorage.setItem("sad_orzeczenia", JSON.stringify(lista));
  };

  // Obsługa Wokandy
  const handleDodajWokande = (e: React.FormEvent) => {
    e.preventDefault();
    const nowa: WokandaItem = {
      id: Date.now().toString(),
      sygnatura,
      data: dataSprawy,
      godzina,
      sala,
      wydzial,
      przewodniczacy: sedzia,
      rodzaj_sprawy: rodzajSprawy,
    };
    const lista = [nowa, ...wokandy];
    setWokandy(lista);
    localStorage.setItem("sad_wokanda", JSON.stringify(lista));
    setSukcesKomunikat("Pomyślnie dodano sprawę do wokandy!");
    setSygnatura("");
    setDataSprawy("");
    setGodzina("");
    setSala("");
    setSedzia("");
    setRodzajSprawy("");
    setTimeout(() => setSukcesKomunikat(null), 4000);
  };

  const handleUsunWokande = (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę sprawę z wokandy?")) return;
    const lista = wokandy.filter((w) => w.id !== id);
    setWokandy(lista);
    localStorage.setItem("sad_wokanda", JSON.stringify(lista));
  };

  // Obsługa Aktualności
  const handleDodajAktualnosc = (e: React.FormEvent) => {
    e.preventDefault();
    const nowy: AktualnoscItem = {
      id: Date.now().toString(),
      tytul,
      kategoria,
      skrot,
      data: new Date().toISOString().slice(0, 10),
    };
    const lista = [nowy, ...aktualnosci];
    setAktualnosci(lista);
    localStorage.setItem("sad_aktualnosci", JSON.stringify(lista));
    setSukcesKomunikat("Pomyślnie opublikowano ogłoszenie!");
    setTytul("");
    setSkrot("");
    setTimeout(() => setSukcesKomunikat(null), 4000);
  };

  const handleUsunAktualnosc = (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;
    const lista = aktualnosci.filter((a) => a.id !== id);
    setAktualnosci(lista);
    localStorage.setItem("sad_aktualnosci", JSON.stringify(lista));
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
      {/* Nagłówek pracownika */}
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

      {/* Skróty */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {isAdmin && (
          <Link to="/admin" className={KAFEL}>
            <ShieldCheck className="h-7 w-7" /> Panel administratora – konta
          </Link>
        )}
        <Link to="/orzecznictwo" className={KAFEL}>
          <FileText className="h-7 w-7" /> Przejdź do Portalu Orzeczeń
        </Link>
        <Link to="/wokanda" className={KAFEL}>
          <CalendarDays className="h-7 w-7" /> Przejdź do publicznej wokandy
        </Link>
        <Link to="/aktualnosci" className={KAFEL}>
          <Megaphone className="h-7 w-7" /> Przejdź do publicznych ogłoszeń
        </Link>
      </div>

      {/* Komunikat o sukcesie */}
      {sukcesKomunikat && (
        <div className="mb-6 flex items-center gap-2 border border-green-600 bg-green-50 p-3 text-xs text-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>{sukcesKomunikat}</span>
        </div>
      )}

      {/* Zakładki */}
      <div className="mb-6 flex border-b border-border">
        <button
          onClick={() => {
            setAktywnaZakladka("orzecznictwo");
            setSukcesKomunikat(null);
          }}
          className={`px-4 py-2 font-serif text-sm font-bold transition-colors ${
            aktywnaZakladka === "orzecznictwo"
              ? "border-b-2 border-primary bg-surface text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Zarządzanie orzecznictwem
        </button>
        <button
          onClick={() => {
            setAktywnaZakladka("wokanda");
            setSukcesKomunikat(null);
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
            setSukcesKomunikat(null);
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

      {/* ZARZĄDZANIE ORZECZNICTWEM */}
      {aktywnaZakladka === "orzecznictwo" && (
        <div className="space-y-6">
          <form onSubmit={handleDodajOrzeczenie} className="border border-border bg-surface p-5">
            <h3 className="mb-4 font-serif text-base font-bold text-primary">
              Wprowadź orzeczenie do Portalu Orzeczeń
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {/* Sygnatura */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Sygnatura akt *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. I C 45/25 lub II K 89/26"
                  value={orzSygnatura}
                  onChange={(e) => setOrzSygnatura(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* Data */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Data orzeczenia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. 31 lipca 2025 roku"
                  value={orzData}
                  onChange={(e) => setOrzData(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* Rodzaj */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Rodzaj orzeczenia *
                </label>
                <select
                  value={orzRodzaj}
                  onChange={(e) => setOrzRodzaj(e.target.value as any)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="Wyrok">Wyrok (W imieniu RP)</option>
                  <option value="Postanowienie">Postanowienie</option>
                </select>
              </div>

              {/* Wydział */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Wydział sądu *
                </label>
                <select
                  value={orzWydzial}
                  onChange={(e) => setOrzWydzial(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="I Wydział Cywilny">I Wydział Cywilny</option>
                  <option value="II Wydział Karny">II Wydział Karny</option>
                  <option value="III Wydział Rodzinny i Nieletnich">III Wydział Rodzinny i Nieletnich</option>
                  <option value="IV Wydział Ksiąg Wieczystych">IV Wydział Ksiąg Wieczystych</option>
                </select>
              </div>

              {/* Status prawomocności */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Prawomocność *
                </label>
                <select
                  value={orzStatus}
                  onChange={(e) => setOrzStatus(e.target.value as any)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm font-semibold"
                >
                  <option value="PRAWOMOCNE">ORZECZENIE PRAWOMOCNE</option>
                  <option value="NIEPRAWOMOCNE">ORZECZENIE NIEPRAWOMOCNE</option>
                </select>
              </div>

              {/* Tryb */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Tryb posiedzenia *
                </label>
                <select
                  value={orzTryb}
                  onChange={(e) => setOrzTryb(e.target.value as any)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="na rozprawie">na rozprawie</option>
                  <option value="na posiedzeniu niejawnym">na posiedzeniu niejawnym</option>
                </select>
              </div>

              {/* Sędzia */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Przewodniczący / Sędzia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. sędzia Grzegorz Machynia"
                  value={orzSedzia}
                  onChange={(e) => setOrzSedzia(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* Protokolant */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Protokolant (opcjonalnie)
                </label>
                <input
                  type="text"
                  placeholder="np. starszy sekretarz sądowy Kinga Swat"
                  value={orzProtokolant}
                  onChange={(e) => setOrzProtokolant(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* Przedmiot sprawy */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Przedmiot sprawy *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. o rozwiązanie umowy użytkowania wieczystego"
                  value={orzPrzedmiot}
                  onChange={(e) => setOrzPrzedmiot(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* Oznaczenie stron */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">
                  Oznaczenie stron sprawy *
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. sprawy z powództwa Skarbu Państwa przeciwko (...) S.A. w K."
                  value={orzStrony}
                  onChange={(e) => setOrzStrony(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              {/* RUBRYKA 1: SENTENCJA ROZSTRZYGNIĘCIA */}
              <div className="sm:col-span-2 md:col-span-3 border-t border-border pt-3">
                <label className="mb-1 flex items-center justify-between text-xs font-bold uppercase text-primary">
                  <span>Rubryka 1: Sentencja rozstrzygnięcia (treść wyroku / postanowienia) *</span>
                  <span className="font-normal text-muted-foreground lowercase">to co orzeka sąd (np. rozwiązuje..., zasądza..., umarza...)</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Wpisz treść orzeczenia, np.:&#10;1. rozwiązuje stosunek prawny użytkowania wieczystego działki gruntu...&#10;2. nakazuje pozwanemu wydanie nieruchomości powodowi..."
                  value={orzSentencja}
                  onChange={(e) => setOrzSentencja(e.target.value)}
                  className="w-full border border-border bg-background p-3 font-serif text-sm italic leading-relaxed"
                />
              </div>

              {/* RUBRYKA 2: UZASADNIENIE */}
              <div className="sm:col-span-2 md:col-span-3 border-t border-border pt-3">
                <label className="mb-1 flex items-center justify-between text-xs font-bold uppercase text-primary">
                  <span>Rubryka 2: Uzasadnienie orzeczenia *</span>
                  <span className="font-normal text-muted-foreground lowercase">motywy rozstrzygnięcia, artykuły k.c./k.k., stan faktyczny</span>
                </label>
                <textarea
                  required
                  rows={7}
                  placeholder="Wpisz pełne uzasadnienie orzeczenia, np.:&#10;Pozwem z dnia 17 marca 2025 roku powód Skarb Państwa wniósł o...&#10;&#10;W uzasadnieniu pozwu podniesiono, że... Zgodnie z art. 240 k.c. umowa o oddanie gruntu...&#10;&#10;Sąd Rejonowy po przeprowadzeniu postępowania ustalił, iż..."
                  value={orzUzasadnienie}
                  onChange={(e) => setOrzUzasadnienie(e.target.value)}
                  className="w-full border border-border bg-background p-3 font-serif text-sm italic leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-bold uppercase text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Opublikuj orzeczenie z uzasadnieniem
            </button>
          </form>

          {/* Tabela orzeczeń */}
          <div className="border border-border bg-surface p-4">
            <h3 className="mb-3 font-serif text-base font-bold text-primary">
              Wprowadzone orzeczenia w bazie ({orzeczenia.length})
            </h3>
            {orzeczenia.length === 0 ? (
              <p className="text-xs text-muted-foreground">Brak orzeczeń wprowadzonych przez pracowników.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2">Sygnatura</th>
                      <th className="p-2">Data</th>
                      <th className="p-2">Rodzaj</th>
                      <th className="p-2">Prawomocność</th>
                      <th className="p-2">Sędzia</th>
                      <th className="p-2 text-right">Akcja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orzeczenia.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/20">
                        <td className="p-2 font-mono font-bold">{o.sygnatura}</td>
                        <td className="p-2">{o.data_orzeczenia}</td>
                        <td className="p-2">{o.rodzaj}</td>
                        <td className="p-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              o.status_prawomocnosci === "NIEPRAWOMOCNE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {o.status_prawomocnosci}
                          </span>
                        </td>
                        <td className="p-2">{o.sedzia}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => handleUsunOrzeczenie(o.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Usuń
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

      {/* ZARZĄDZANIE WOKANDĄ */}
      {aktywnaZakladka === "wokanda" && (
        <div className="space-y-6">
          <form onSubmit={handleDodajWokande} className="border border-border bg-surface p-4">
            <h3 className="mb-4 font-serif text-base font-bold text-primary">Dodaj nową sprawę do wokandy</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Sygnatura</label>
                <input
                  type="text"
                  required
                  placeholder="np. I C 145/26"
                  value={sygnatura}
                  onChange={(e) => setSygnatura(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Data posiedzenia</label>
                <input
                  type="date"
                  required
                  value={dataSprawy}
                  onChange={(e) => setDataSprawy(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Godzina</label>
                <input
                  type="time"
                  required
                  value={godzina}
                  onChange={(e) => setGodzina(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Sala</label>
                <input
                  type="text"
                  required
                  placeholder="np. Sala 104"
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Wydział</label>
                <select
                  value={wydzial}
                  onChange={(e) => setWydzial(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="I Wydział Cywilny">I Wydział Cywilny</option>
                  <option value="II Wydział Karny">II Wydział Karny</option>
                  <option value="III Wydział Rodzinny i Nieletnich">III Wydział Rodzinny i Nieletnich</option>
                  <option value="IV Wydział Ksiąg Wieczystych">IV Wydział Ksiąg Wieczystych</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Przewodniczący</label>
                <input
                  type="text"
                  required
                  placeholder="np. SSR Jan Kowalski"
                  value={sedzia}
                  onChange={(e) => setSedzia(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Rodzaj sprawy / Przedmiot</label>
                <input
                  type="text"
                  required
                  placeholder="np. o zapłatę, kradzież z włamaniem"
                  value={rodzajSprawy}
                  onChange={(e) => setRodzajSprawy(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Dodaj do wokandy
            </button>
          </form>

          <div className="border border-border bg-surface p-4">
            <h3 className="mb-3 font-serif text-base font-bold text-primary">
              Wprowadzone sprawy ({wokandy.length})
            </h3>
            {wokandy.length === 0 ? (
              <p className="text-xs text-muted-foreground">Brak wprowadzonych spraw.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-bold uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2">Sygnatura</th>
                      <th className="p-2">Data</th>
                      <th className="p-2">Godz.</th>
                      <th className="p-2">Sala</th>
                      <th className="p-2">Wydział</th>
                      <th className="p-2">Sędzia</th>
                      <th className="p-2 text-right">Akcja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wokandy.map((w) => (
                      <tr key={w.id} className="hover:bg-muted/20">
                        <td className="p-2 font-mono font-bold">{w.sygnatura}</td>
                        <td className="p-2">{w.data}</td>
                        <td className="p-2">{w.godzina}</td>
                        <td className="p-2">{w.sala}</td>
                        <td className="p-2">{w.wydzial}</td>
                        <td className="p-2">{w.przewodniczacy}</td>
                        <td className="p-2 text-right">
                          <button
                            onClick={() => handleUsunWokande(w.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Usuń
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

      {/* ZARZĄDZANIE OGŁOSZENIAMI */}
      {aktywnaZakladka === "aktualnosci" && (
        <div className="space-y-6">
          <form onSubmit={handleDodajAktualnosc} className="border border-border bg-surface p-4">
            <h3 className="mb-4 font-serif text-base font-bold text-primary">Dodaj nowe ogłoszenie</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Tytuł ogłoszenia</label>
                <input
                  type="text"
                  required
                  placeholder="np. Zmiana godzin urzędowania Biura Obsługi Interesantów"
                  value={tytul}
                  onChange={(e) => setTytul(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Kategoria</label>
                <select
                  value={kategoria}
                  onChange={(e) => setKategoria(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="Komunikat">Komunikat</option>
                  <option value="Konkurs">Konkurs</option>
                  <option value="Licytacja">Licytacja</option>
                  <option value="Informacja prezesa">Informacja prezesa</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Treść skrócona</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Wpisz treść komunikatu lub ogłoszenia..."
                  value={skrot}
                  onChange={(e) => setSkrot(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Opublikuj ogłoszenie
            </button>
          </form>

          <div className="border border-border bg-surface p-4">
            <h3 className="mb-3 font-serif text-base font-bold text-primary">
              Opublikowane ogłoszenia ({aktualnosci.length})
            </h3>
            {aktualnosci.length === 0 ? (
              <p className="text-xs text-muted-foreground">Brak dodanych ogłoszeń.</p>
            ) : (
              <div className="divide-y divide-border">
                {aktualnosci.map((a) => (
                  <div key={a.id} className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <span className="mr-2 inline-block bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                        {a.kategoria}
                      </span>
                      <span className="text-xs text-muted-foreground">{a.data}</span>
                      <h4 className="font-serif text-sm font-bold text-primary">{a.tytul}</h4>
                      <p className="text-xs text-muted-foreground">{a.skrot}</p>
                    </div>
                    <button
                      onClick={() => handleUsunAktualnosc(a.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Usuń
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </PageShell>
  );
}
