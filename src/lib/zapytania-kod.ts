// Kod dostępu do zapytania obywatela. Pokazywany raz po wysłaniu formularza;
// w bazie przechowujemy wyłącznie jego skrót SHA-256.

const ALFABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // bez 0/O i 1/I

export function generujKod(): string {
  const bajty = new Uint8Array(8);
  crypto.getRandomValues(bajty);
  const znaki = Array.from(bajty, (b) => ALFABET[b % ALFABET.length]).join("");
  return `${znaki.slice(0, 4)}-${znaki.slice(4)}`;
}

export function normalizujKod(kod: string): string {
  return kod.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function normalizujNumer(numer: string): string {
  return numer.trim().toUpperCase().replace(/\s+/g, "");
}

export async function hashKod(kod: string): Promise<string> {
  const dane = new TextEncoder().encode(normalizujKod(kod));
  const skrot = await crypto.subtle.digest("SHA-256", dane);
  return Array.from(new Uint8Array(skrot), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function kodPasuje(kod: string, zapisanyHash: string): Promise<boolean> {
  if (normalizujKod(kod).length !== 8) return false;
  const h = await hashKod(kod);
  if (h.length !== zapisanyHash.length) return false;
  let roznica = 0;
  for (let i = 0; i < h.length; i++) roznica |= h.charCodeAt(i) ^ zapisanyHash.charCodeAt(i);
  return roznica === 0;
}
