import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, ShieldCheck, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { NAZWY_ROL, useAuth } from "@/hooks/useAuth";

export function useWyloguj() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/logowanie", replace: true });
  };
}

export function UserMenu() {
  const { user, profil, role, isAdmin, loading } = useAuth();
  const wyloguj = useWyloguj();

  if (loading) return <div className="h-[34px] w-40" aria-hidden />;

  if (!user) {
    return (
      <Link
        to="/logowanie"
        className="flex items-center gap-1.5 border border-primary px-3 py-1.5 text-xs font-bold uppercase text-primary hover:bg-primary hover:text-primary-foreground"
      >
        <LogIn className="h-4 w-4" /> Logowanie pracowników
      </Link>
    );
  }

  const nazwa = profil?.full_name || user.email || "Użytkownik";
  const rola = role[0] ? NAZWY_ROL[role[0]] : "Brak uprawnień";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 border border-primary bg-surface px-3 py-1 text-left text-primary hover:bg-secondary focus:outline-none">
        <UserRound className="h-5 w-5" />
        <span className="leading-tight">
          <span className="block max-w-[180px] truncate text-xs font-bold">{nazwa}</span>
          <span className="block text-[10px] uppercase text-muted-foreground">{rola}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-none">
        <DropdownMenuLabel className="font-normal">
          <div className="text-sm font-bold">{nazwa}</div>
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/panel" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" /> Panel pracownika
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" /> Panel administratora
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void wyloguj()} className="cursor-pointer text-destructive">
          <LogOut className="mr-2 h-4 w-4" /> Wyloguj się
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
