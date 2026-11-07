import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Rola = "admin" | "pracownik";

type Profil = { full_name: string; stanowisko: string; email: string };

type AuthState = {
  loading: boolean;
  user: User | null;
  profil: Profil | null;
  role: Rola[];
  isAdmin: boolean;
  isPracownik: boolean;
  odswiez: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [role, setRole] = useState<Rola[]>([]);

  const zaladuj = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) {
      setProfil(null);
      setRole([]);
      setLoading(false);
      return;
    }
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("full_name, stanowisko, email").eq("id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id),
    ]);
    setProfil(p ?? null);
    setRole((r ?? []).map((x) => x.role as Rola));
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED") return;
      // defer DB calls out of the auth callback
      setTimeout(() => void zaladuj(session?.user ?? null), 0);
    });
    supabase.auth.getSession().then(({ data }) => zaladuj(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [zaladuj]);

  const odswiez = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    await zaladuj(data.user ?? null);
  }, [zaladuj]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        profil,
        role,
        isAdmin: role.includes("admin"),
        isPracownik: role.length > 0,
        odswiez,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const NAZWY_ROL: Record<Rola, string> = {
  admin: "Administrator",
  pracownik: "Pracownik",
};
