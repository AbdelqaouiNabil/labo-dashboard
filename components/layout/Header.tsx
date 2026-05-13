"use client";

import { Bell, Search, Menu } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  onSearch?: (q: string) => void;
}

export function Header({ title, showSearch = false, onSearch }: HeaderProps) {
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500">{capitalizedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showSearch && (
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 w-64"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        )}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8B1F1F]" />
        </Button>
      </div>
    </header>
  );
}
