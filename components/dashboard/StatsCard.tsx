import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "teal" | "green" | "blue" | "orange" | "red" | "purple";
}

const colorMap = {
  teal:   { bg: "bg-red-50",    icon: "text-[#8B1F1F]",  badge: "bg-[#8B1F1F]/10" },
  green:  { bg: "bg-red-50",     icon: "text-[#8B1F1F]",  badge: "bg-red-100" },
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   badge: "bg-blue-100" },
  orange: { bg: "bg-amber-50",  icon: "text-amber-600",  badge: "bg-amber-100" },
  red:    { bg: "bg-red-50",    icon: "text-red-600",    badge: "bg-red-100" },
  purple: { bg: "bg-violet-50", icon: "text-violet-600", badge: "bg-violet-100" },
};

export function StatsCard({
  title, value, subtitle, icon: Icon, trend, color = "teal",
}: StatsCardProps) {
  const colors = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.value >= 0
                ? "bg-red-50 text-[#8B1F1F]"
                : "bg-red-50 text-red-600"
            )}
          >
            {trend.value >= 0
              ? <TrendingUp className="h-3 w-3" />
              : <TrendingDown className="h-3 w-3" />}
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-[#0F172A] tracking-tight">{value}</p>
      <p className="text-sm text-[#64748B] font-medium mt-1">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      {trend && (
        <p className="text-xs text-slate-400 mt-2">{trend.label}</p>
      )}
    </div>
  );
}
