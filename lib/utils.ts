import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("212") && cleaned.length === 12) {
    return `+212 ${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) {
    const distance = formatDistanceToNow(d, { locale: fr });
    return `Il y a ${distance}`;
  }
  if (isYesterday(d)) {
    return "Hier";
  }
  return format(d, "dd/MM/yyyy", { locale: fr });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function truncateMessage(message: string, maxLength = 60): string {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + "…";
}

export function getModeColor(mode: "ai" | "human"): string {
  return mode === "ai"
    ? "bg-green-100 text-green-700"
    : "bg-orange-100 text-orange-700";
}

export function getStatusColor(
  status: "pending" | "confirmed" | "cancelled"
): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
  }
}

export function getDirectionLabel(direction: "inbound" | "outbound"): string {
  return direction === "inbound" ? "📥 Reçu" : "📤 Envoyé";
}

export function hashColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
