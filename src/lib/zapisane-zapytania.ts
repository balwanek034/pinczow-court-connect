// Numer i kod zapytania zapamiętane w przeglądarce obywatela, żeby po powrocie
// na stronę od razu zobaczył odpowiedź sądu bez ponownego wpisywania danych.

export type ZapisaneZapytanie = { numer: string; kod: string; temat: string; przeczytane: number };

const KLUCZ = "sr-zapytania";

export function wczytajZapisane(): ZapisaneZapytanie[] {
  try {
    const v = JSON.parse(localStorage.getItem(KLUCZ) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function zapiszZapytanie(z: ZapisaneZapytanie) {
  const lista = wczytajZapisane().filter((x) => x.numer !== z.numer);
  localStorage.setItem(KLUCZ, JSON.stringify([z, ...lista].slice(0, 20)));
}

export function oznaczPrzeczytane(numer: string, liczbaOdpowiedzi: number) {
  const lista = wczytajZapisane().map((x) => (x.numer === numer ? { ...x, przeczytane: liczbaOdpowiedzi } : x));
  localStorage.setItem(KLUCZ, JSON.stringify(lista));
}

export function usunZapisane(numer: string) {
  localStorage.setItem(KLUCZ, JSON.stringify(wczytajZapisane().filter((x) => x.numer !== numer)));
}
