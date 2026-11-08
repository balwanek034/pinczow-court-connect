// Dane teleadresowe pochodzą z publicznie dostępnych informacji o Sądzie Rejonowym w Pińczowie.

export const SAD = {
  nazwa: "Sąd Rejonowy w Pińczowie",
  nadrzedny: "Sąd Okręgowy w Kielcach",
  apelacja: "Apelacja krakowska",
  adres: "ul. 3 Maja 12a",
  kod: "28-400 Pińczów",
  centrala: "",
  informacja: "",
  faksAdm: "",
  faksKarny: "",
  email: "",
  nip: "662-181-85-10",
  regon: "000322293-00068",
  oficjalnaStrona: "",
  portal: "",
};

export const GODZINY = [
  { dzien: "Poniedziałek", urzedowanie: "7:45 – 18:00", interesanci: "9:00 – 18:00" },
  { dzien: "Wtorek – Piątek", urzedowanie: "7:45 – 15:45", interesanci: "8:15 – 15:15" },
];

export type Wydzial = {
  id: string;
  numer: string;
  nazwa: string;
  skrot: string;
  sekretariat: string;
  adres: string;
  tel: string;
  faks: string;
  email: string;
  przewodniczacy: string;
  wlasciwosc: string;
};

export const WYDZIALY: Wydzial[] = [
  {
    id: "cywilny",
    przewodniczacy: "vacat",
    numer: "I",
    nazwa: "Wydział Cywilny",
    skrot: "C",
    adres: "ul. 3 Maja 12a",
    wlasciwosc:
      "Rozpoznawanie spraw cywilnych w I instancji, w tym spraw o zapłatę, z zakresu prawa pracy, spadkowych, nieprocesowych oraz postępowanie zabezpieczające i egzekucyjne.",
  },
  {
    id: "karny",
    przewodniczacy: "SSR Marcin Dziedzic",
    numer: "II",
    nazwa: "Wydział Karny",
    skrot: "K",
    sekretariat: "pok. nr 1, parter",
    adres: "ul. 1 Maja 10",
    tel: "(41) 246-22-41",
    faks: "(41) 246-22-52",
    email: "karny@pinczow.sr.gov.pl",
    wlasciwosc:
      "Rozpoznawanie spraw karnych I instancji, rozstrzyganie w II instancji środków odwoławczych od orzeczeń prokuratorskich oraz postępowanie wykonawcze w zakresie wydawanych w wydziale orzeczeń.",
  },
  {
    id: "rodzinny",
    przewodniczacy: "SSR Joanna Pawlik",
    numer: "III",
    nazwa: "Wydział Rodzinny i Nieletnich",
    skrot: "RC / Nkd",
    sekretariat: "pok. nr 37, II piętro",
    adres: "ul. 3 Maja 12a",
    tel: "(41) 246-22-08",
    faks: "(41) 246-22-12",
    email: "rodzinny@pinczow.sr.gov.pl",
    wlasciwosc:
      "Sprawy z zakresu prawa rodzinnego i opiekuńczego, sprawy nieletnich, sprawy osób uzależnionych od alkoholu i środków odurzających oraz sprawy z ustawy o ochronie zdrowia psychicznego.",
  },
  {
    id: "ksiegi",
    przewodniczacy: "SSR Ewa Bednarska",
    numer: "IV",
    nazwa: "Wydział Ksiąg Wieczystych",
    skrot: "Kw",
    sekretariat: "pok. nr 1, parter",
    adres: "ul. 3 Maja 12a",
    tel: "(41) 246-22-34",
    faks: "(41) 246-22-12",
    email: "ksiegi@pinczow.sr.gov.pl",
    wlasciwosc:
      "Prowadzenie ksiąg wieczystych dla nieruchomości położonych na obszarze właściwości Sądu, zakładanie ksiąg, dokonywanie wpisów oraz wydawanie odpisów i wyciągów.",
  },
];

// Imiona i nazwiska kierownictwa są przykładowe (strona demonstracyjna).
export type Funkcja = { funkcja: string; osoba: string; opis: string; przyjecia?: string };

// Kolejność: Prezes, Wiceprezes, pozostali.
export const KIEROWNICTWO: [Funkcja, Funkcja, ...Funkcja[]] = [
  {
    funkcja: "Prezes Sądu Rejonowego w Pińczowie",
    osoba: "SSR Anna Wójcik-Malec",
    opis: "Kieruje sądem i reprezentuje go na zewnątrz, sprawuje nadzór administracyjny nad działalnością wydziałów oraz pełni czynności zwierzchnika służbowego sędziów i asesorów.",
    przyjecia: "Skargi i wnioski: poniedziałek 15:00 – 17:00, pok. nr 30, I piętro (ul. 3 Maja 12a)",
  },
  {
    funkcja: "Wiceprezes Sądu Rejonowego w Pińczowie",
    osoba: "SSR Tomasz Kubicki",
    opis: "Zastępuje Prezesa Sądu w czasie jego nieobecności oraz wykonuje czynności z zakresu nadzoru administracyjnego powierzone zarządzeniem Prezesa.",
    przyjecia: "W zastępstwie Prezesa – w tych samych godzinach, pok. nr 30",
  },
  {
    funkcja: "Kierownik Finansowy",
    osoba: "mgr Beata Sobczyk",
    opis: "Kieruje działalnością administracyjną i finansową sądu, w tym gospodarką finansową, majątkiem i inwestycjami.",
  },
];

export const OBSZAR = "miasto Pińczów oraz gminy: Pińczów, Działoszyce, Kije, Michałów, Złota";

export type Aktualnosc = {
  id: string;
  data: string; // ISO
  tytul: string;
  lead: string;
  kategoria: "Komunikat" | "Ogłoszenie" | "Wydarzenie" | "Zarządzenie" | "Praca";
  wazne?: boolean;
};

export const AKTUALNOSCI: Aktualnosc[] = [
  {
    id: "11-listopada-2026",
    data: "2026-11-06",
    tytul: "Komunikat w sprawie pracy Sądu w dniu 11 listopada 2026 r.",
    lead:
      "Uprzejmie informujemy, że w dniu 11 listopada 2026 r. (środa) – Narodowe Święto Niepodległości – Sąd Rejonowy w Pińczowie będzie nieczynny. Biuro Podawcze oraz Punkt Informacyjny wznowią pracę 12 listopada 2026 r. od godz. 7:45.",
    kategoria: "Komunikat",
    wazne: true,
  },
  {
    id: "staz-2026",
    data: "2026-11-03",
    tytul: "Ogłoszenie o naborze na stanowisko stażysty w II Wydziale Karnym (nr ref. Adm-1110-4/26)",
    lead:
      "Prezes Sądu Rejonowego w Pińczowie ogłasza nabór na 1 stanowisko stażysty w pełnym wymiarze czasu pracy. Termin składania dokumentów upływa 20 listopada 2026 r. (decyduje data wpływu do Sądu).",
    kategoria: "Praca",
  },
  {
    id: "portal-informacyjny",
    data: "2026-10-28",
    tytul: "Przypomnienie o możliwości korzystania z Portalu Informacyjnego Sądów Powszechnych",
    lead:
      "Strony, pełnomocnicy i obrońcy mogą uzyskać dostęp do informacji o stanie sprawy, terminach posiedzeń oraz elektronicznych doręczeń za pośrednictwem Portalu Informacyjnego. Logowanie możliwe jest m.in. przez profil zaufany.",
    kategoria: "Komunikat",
  },
  {
    id: "dzien-mediacji-2026",
    data: "2026-10-12",
    tytul: "Międzynarodowy Dzień Mediacji – dyżury mediatorów w budynku Sądu",
    lead:
      "W dniu 16 października 2026 r. w godzinach 9:00–14:00 w holu Sądu przy ul. 3 Maja 12a dyżurować będą mediatorzy stali, którzy bezpłatnie udzielą informacji o mediacji w sprawach cywilnych, rodzinnych i karnych.",
    kategoria: "Wydarzenie",
  },
  {
    id: "zarzadzenie-wigilia",
    data: "2026-10-05",
    tytul: "Zarządzenie Prezesa Sądu w sprawie ustalenia dni wolnych od pracy w 2026 r.",
    lead:
      "Na podstawie art. 130 § 2 Kodeksu pracy, w zamian za święto 15 sierpnia 2026 r. przypadające w sobotę, ustala się dzień 10 listopada 2026 r. dniem wolnym od pracy dla pracowników Sądu. W tym dniu sprawy pilne obsługiwane będą przez dyżur.",
    kategoria: "Zarządzenie",
  },
  {
    id: "przetarg-opal",
    data: "2026-09-22",
    tytul: "Zapytanie ofertowe na dostawę materiałów biurowych i tonerów w 2027 r.",
    lead:
      "Sąd Rejonowy w Pińczowie zaprasza do złożenia oferty na sukcesywną dostawę materiałów biurowych oraz materiałów eksploatacyjnych do urządzeń drukujących. Oferty należy składać do 6 października 2026 r.",
    kategoria: "Ogłoszenie",
  },
];

export function formatDataPL(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}
