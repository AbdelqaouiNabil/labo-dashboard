import { Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "confirmed" | "cancelled";
  size?: "sm" | "md";
}

const config = {
  pending: {
    label: "En attente",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Confirmé",
    icon: CheckCircle,
    className: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Annulé",
    icon: XCircle,
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const { label, icon: Icon, className } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
      {label}
    </span>
  );
}
