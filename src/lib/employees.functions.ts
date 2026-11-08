import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Rola = "admin" | "pracownik";

export type Pracownik = {
  id: string;
  full_name: string;
  stanowisko: string;
  email: string;
  created_at: string;
  roles: Rola[];
};

const nowyPracownik = z.object({
  email: z.string().trim().email("Nieprawidłowy adres e-mail").max(255),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków").max(72),
  full_name: z.string().trim().min(2, "Podaj imię i nazwisko").max(120),
  stanowisko: z.string().trim().max(120).default(""),
  role: z.enum(["admin", "pracownik"]),
});

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  // has_role is SECURITY DEFINER, callable by any signed-in user; checked as the caller
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Brak uprawnień administratora.");
}

/** Publiczne: czy istnieje już konto administratora (pierwsze uruchomienie). */
export const czyJestAdministrator = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error("Nie udało się sprawdzić konfiguracji.");
  return { jestAdmin: (count ?? 0) > 0 };
});

/** Publiczne, ale działa tylko dopóki nie ma żadnego administratora. */
export const utworzPierwszegoAdministratora = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => nowyPracownik.omit({ role: true }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("Konto administratora już istnieje.");

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, stanowisko: data.stanowisko || "Administrator systemu" },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Nie udało się utworzyć konta.");

    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleErr) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Nie udało się nadać uprawnień.");
    }
    return { ok: true };
  });

export const listaPracownikow = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      context.supabase.from("profiles").select("id, full_name, stanowisko, email, created_at").order("created_at"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pErr || rErr) throw new Error("Nie udało się pobrać listy pracowników.");
    return (profiles ?? []).map<Pracownik>((p) => ({
      ...p,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as Rola),
    }));
  });

export const dodajPracownika = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => nowyPracownik.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, stanowisko: data.stanowisko },
    });
    if (error || !created.user) {
      const msg = error?.message?.includes("already") ? "Konto z tym adresem e-mail już istnieje." : error?.message;
      throw new Error(msg ?? "Nie udało się utworzyć konta.");
    }
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: data.role });
    if (roleErr) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      throw new Error("Nie udało się nadać uprawnień.");
    }
    return { ok: true };
  });

export const zmienRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["admin", "pracownik"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    if (data.userId === context.userId) throw new Error("Nie możesz zmienić własnych uprawnień.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: delErr } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (delErr) throw new Error("Nie udało się zmienić uprawnień.");
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error("Nie udało się zmienić uprawnień.");
    return { ok: true };
  });

export const usunPracownika = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    if (data.userId === context.userId) throw new Error("Nie możesz usunąć własnego konta.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error("Nie udało się usunąć konta.");
    return { ok: true };
  });
