// Przykładowa (fikcyjna) wokanda generowana deterministycznie dla danego dnia.

export type Posiedzenie = {
  godzina: string;
  sygnatura: string;
  wydzial: string;
  sala: string;
  rodzaj: string;
  przedmiot: string;
};

const DNI_WOLNE = ["2026-11-10", "2026-11-11", "2026-12-24", "2026-12-25", "2026-12-26"];

const SZABLONY: Record<string, { sale: string[]; rep: Record<string, string[]> }> = {
  "I Wydział Cywilny": {
    sale: ["Sala nr 12, I piętro", "Sala nr 14, I piętro"],
    rep: {
      C: ["o zapłatę", "o zniesienie współwłasności", "o eksmisję", "o ustanowienie służebności drogi koniecznej", "o zachowek"],
      Ns: ["o stwierdzenie nabycia spadku", "o zasiedzenie", "o dział spadku", "o rozgraniczenie"],
      Co: ["o nadanie klauzuli wykonalności", "skarga na czynności komornika"],
      P: ["o przywrócenie do pracy", "o wynagrodzenie za pracę"],
    },
  },
  "II Wydział Karny": {
    sale: ["Sala nr 2, parter (ul. 1 Maja 10)", "Sala nr 5, I piętro (ul. 1 Maja 10)"],
    rep: {
      K: ["art. 178a § 1 kk", "art. 279 § 1 kk", "art. 207 § 1 kk", "art. 157 § 2 kk", "art. 244 kk", "art. 62 ust. 1 ustawy o przeciwdziałaniu narkomanii"],
      W: ["art. 86 § 1 kw", "art. 119 § 1 kw", "art. 92a kw", "art. 124 § 1 kw"],
      Kp: ["zażalenie na postanowienie o umorzeniu dochodzenia", "zażalenie na postanowienie o odmowie wszczęcia"],
    },
  },
  "III Wydział Rodzinny i Nieletnich": {
    sale: ["Sala nr 34, II piętro", "Sala nr 36, II piętro"],
    rep: {
      RC: ["o alimenty", "o podwyższenie alimentów", "o obniżenie alimentów", "o ustalenie ojcostwa"],
      Nsm: ["o ograniczenie władzy rodzicielskiej", "o ustalenie kontaktów z małoletnim", "o ustanowienie rodziny zastępczej"],
      Alk: ["o zobowiązanie do leczenia odwykowego"],
      Nkd: ["w sprawie nieletniego – czyn karalny"],
    },
  },
};

const RODZAJE = ["Rozprawa", "Rozprawa", "Rozprawa", "Posiedzenie jawne", "Rozprawa (kontynuacja)"];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function czyDzienRoboczy(iso: string) {
  const d = new Date(iso + "T12:00:00");
  const wd = d.getDay();
  return wd !== 0 && wd !== 6 && !DNI_WOLNE.includes(iso);
}

/** Najbliższe dni robocze, zaczynając od podanej daty. */
export function najblizszeDni(startISO: string, n: number) {
  const out: string[] = [];
  const d = new Date(startISO + "T12:00:00");
  while (out.length < n) {
    const iso = toISO(d);
    if (czyDzienRoboczy(iso)) out.push(iso);
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function wokandaNaDzien(iso: string): Posiedzenie[] {
  if (!czyDzienRoboczy(iso)) return [];
  const seed = Number(iso.replaceAll("-", ""));
  const r = rng(seed);
  const pick = <T,>(a: T[]): T => a[Math.floor(r() * a.length)] as T;
  const rok = iso.slice(2, 4);
  const lista: Posiedzenie[] = [];

  Object.entries(SZABLONY).forEach(([wydzial, t]) => {
    const numer = wydzial.split(" ")[0];
    const ile = 3 + Math.floor(r() * 5);
    const sala = pick(t.sale);
    let minuty = 8 * 60 + 30 + Math.floor(r() * 4) * 15;
    for (let i = 0; i < ile; i++) {
      const rep = pick(Object.keys(t.rep)) ?? "";
      const nr = 20 + Math.floor(r() * 640);
      lista.push({
        godzina: `${String(Math.floor(minuty / 60)).padStart(2, "0")}:${String(minuty % 60).padStart(2, "0")}`,
        sygnatura: `${numer} ${rep} ${nr}/${r() > 0.8 ? String(Number(rok) - 1).padStart(2, "0") : rok}`,
        wydzial: wydzial.replace(" Wydział ", " Wydz. "),
        sala,
        rodzaj: pick(RODZAJE),
        przedmiot: pick(t.rep[rep] ?? []),
      });
      minuty += 30 + Math.floor(r() * 4) * 15;
    }
  });

  return lista.sort((a, b) => a.godzina.localeCompare(b.godzina));
}
