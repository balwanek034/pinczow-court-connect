import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/** Liczba zapytań obywateli, które czekają na odpowiedź sądu (ostatnia wiadomość od obywatela). */
export function useNoweZapytania() {
  const { isPracownik } = useAuth();
  const { data = 0 } = useQuery({
    queryKey: ["zapytania", "licznik"],
    enabled: isPracownik,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zapytania")
        .select("status, zapytania_wiadomosci(autor, created_at)")
        .neq("status", "zamkniete");
      if (error) throw error;
      return (data ?? []).filter((z) => {
        const ost = [...z.zapytania_wiadomosci].sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1);
        return ost?.autor === "obywatel";
      }).length;
    },
  });
  return isPracownik ? data : 0;
}
