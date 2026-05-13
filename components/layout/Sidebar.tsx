"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard, MessageSquare, Calendar, BarChart3,
  FlaskConical, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/appointments", label: "Rendez-vous", icon: Calendar },
  { href: "/analyses", label: "Analyses", icon: FlaskConical },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="flex h-screen w-[210px] flex-col bg-[#0F172A] py-5 flex-shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Maghreb Lab"
            width={36}
            height={36}
            className="object-contain"
            onError={() => {}}
          />
        </div>
        <div>
          <p className="text-white text-sm font-bold leading-tight tracking-wide">MAGHREB</p>
          <p className="text-[#8B1F1F] text-xs font-semibold tracking-widest">LAB</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-xl transition-all duration-150 text-sm font-medium",
                isActive
                  ? "bg-[#8B1F1F] text-white shadow-md shadow-red-900/40"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3">
        <div className="w-full h-px bg-slate-800 mb-3" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 h-10 w-full px-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all duration-150"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
