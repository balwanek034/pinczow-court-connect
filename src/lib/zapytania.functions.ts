import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generujKod, hashKod, kodPasuje, normalizujNumer } from "@/lib/zapytania-kod";

export type StatusZapytania = "nowe" | "w_toku" | "zamkniete";

export type WiadomoscZapytania = {
  id: string;
  autor: "obywatel" | "sad";
  autor_nazwa: string;
  tresc: string;
  created_at: string;
};

export type ZapytanieObywatela = {
  numer: string;
  temat: string;
  kategoria: string;
  wydzial: string;
  sygnatura: string;
  imie_nazwisko: string;
  status: StatusZapytania;
  created_at: string;
  wiadomosci: WiadomoscZapytania[];
};

const noweZapytanie = z.object({
  imie_nazwisko: z.string().trim().min(3, "Podaj imię i nazwisko").max(120),
  kontakt: z.string().trim().max(160).default(""),
  kategoria: z.string().trim().min(2).max(80),
  wydzial: z.string().trim().max(80).default(""),
  sygnatura: z.string().trim().max(60).default(""),
  temat: z.string().trim().min(5, "Temat musi mieć co najmniej 5 znaków").max(160),
  tresc: z.string().trim().min(20, "Opis sprawy musi mieć co najmniej 20 znaków").max(5000),
  // Pole-pułapka na boty: prawdziwy użytkownik go nie widzi.
  strona_www: z.string().max(0, "Nieprawidłowe zgłoszenie").default(""),
});

const dostep = z.object({
  numer: z.string().trim().min(5).max(30),
  kod: z.string().trim().min(8).max(12),
});

const BLAD_DOSTEPU = "Nie znaleziono zapytania o podanym numerze i kodzie dostępu.";

async function znajdzZapytanie(numer: string, kod: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("zapytania")
    .select("id, numer, kod_hash, temat, kategoria, wydzial, sygnatura, imie_nazwisko, status, created_at")
    .eq("numer", normalizujNumer(numer))
    .maybeSingle();
  if (error) throw new Error("Nie udało się połączyć z systemem. Spróbuj ponownie.");
  if (!data || !(await kodPasuje(kod, data.kod_hash))) throw new Error(BLAD_DOSTEPU);
  return { supabaseAdmin, zapytanie: data };
}

/** Publiczne: obywatel wysyła zapytanie przez formularz kontaktowy. */
export const wyslijZapytanie = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => noweZapytanie.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const kod = generujKod();
    const { data: zap, error } = await supabaseAdmin
      .from("zapytania")
      .insert({
        kod_hash: await hashKod(kod),
        imie_nazwisko: data.imie_nazwisko,
        kontakt: data.kontakt,
        kategoria: data.kategoria,
        wydzial: data.wydzial,
        sygnatura: data.sygnatura,
        temat: data.temat,
      })
      .select("id, numer")
      .single();
    if (error || !zap) throw new Error("Nie udało się wysłać zapytania. Spróbuj ponownie.");

    const { error: msgErr } = await supabaseAdmin.from("zapytania_wiadomosci").insert({
      zapytanie_id: zap.id,
      autor: "obywatel",
      autor_nazwa: data.imie_nazwisko,
      tresc: data.tresc,
    });
    if (msgErr) {
      await supabaseAdmin.from("zapytania").delete().eq("id", zap.id);
      throw new Error("Nie udało się wysłać zapytania. Spróbuj ponownie.");
    }
    return { numer: zap.numer, kod };
  });

/** Publiczne: podgląd zapytania i odpowiedzi sądu po numerze + kodzie dostępu. */
export const pobierzZapytanie = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => dostep.parse(d))
  .handler(async ({ data }): Promise<ZapytanieObywatela> => {
    const { supabaseAdmin, zapytanie } = await znajdzZapytanie(data.numer, data.kod);
    const { data: wiad, error } = await supabaseAdmin
      .from("zapytania_wiadomosci")
      .select("id, autor, autor_nazwa, tresc, created_at")
      .eq("zapytanie_id", zapytanie.id)
      .order("created_at");
    if (error) throw new Error("Nie udało się wczytać korespondencji.");
    const { id: _id, kod_hash: _h, ...reszta } = zapytanie;
    return {
      ...reszta,
      status: reszta.status as StatusZapytania,
      wiadomosci: (wiad ?? []) as WiadomoscZapytania[],
    };
  });

/** Publiczne: obywatel dopisuje kolejną wiadomość do otwartego zapytania. */
export const dopiszDoZapytania = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    dostep.extend({ tresc: z.string().trim().min(2, "Wpisz treść wiadomości").max(5000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, zapytanie } = await znajdzZapytanie(data.numer, data.kod);
    if (zapytanie.status === "zamkniete") {
      throw new Error("Sprawa została zamknięta. Aby kontynuować, wyślij nowe zapytanie.");
    }
    const { error } = await supabaseAdmin.from("zapytania_wiadomosci").insert({
      zapytanie_id: zapytanie.id,
      autor: "obywatel",
      autor_nazwa: zapytanie.imie_nazwisko,
      tresc: data.tresc,
    });
    if (error) throw new Error("Nie udało się wysłać wiadomości.");
    await supabaseAdmin
      .from("zapytania")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", zapytanie.id);
    return { ok: true };
  });
