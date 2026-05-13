"use client";

import { ConversationWithContact } from "@/lib/supabase/types";
import { formatPhone, formatRelativeTime, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ConversationItemProps {
  conversation: ConversationWithContact;
  isActive: boolean;
  onClick: () => void;
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-[#8B1F1F]",
  "bg-rose-500", "bg-amber-500", "bg-indigo-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const contact = conversation.contacts;
  const name = contact?.name ?? "Inconnu";
  const initials = getInitials(name);
  const isAI = conversation.mode === "ai";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all duration-150 border-b border-[#E2E8F0]/60",
        isActive
          ? "bg-[#8B1F1F]/5 border-l-2 border-l-[#8B1F1F]"
          : "hover:bg-[#F8FAFC] border-l-2 border-l-transparent"
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold",
            avatarColor(name)
          )}
        >
          {initials}
        </div>
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center",
            isAI ? "bg-[#8B1F1F]" : "bg-amber-500"
          )}
        >
          {isAI
            ? <Bot className="h-2 w-2 text-white" />
            : <User className="h-2 w-2 text-white" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <p className={cn("text-sm font-semibold truncate", isActive ? "text-[#8B1F1F]" : "text-[#0F172A]")}>
            {name}
          </p>
          <span className="text-[10px] text-[#64748B] flex-shrink-0">
            {conversation.last_message_at ? formatRelativeTime(conversation.last_message_at) : ""}
          </span>
        </div>
        <p className="text-[11px] text-[#64748B] truncate">
          {formatPhone(contact?.phone ?? "")}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
              isAI
                ? "bg-[#8B1F1F]/10 text-[#8B1F1F]"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {isAI ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
            {isAI ? "IA" : "Humain"}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
            WhatsApp
          </span>
        </div>
      </div>
    </button>
  );
}
