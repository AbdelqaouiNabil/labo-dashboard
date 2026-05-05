"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConversationWithContact } from "@/lib/supabase/types";
import { formatPhone, formatRelativeTime, getInitials, truncateMessage, getModeColor, hashColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: ConversationWithContact;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const contact = conversation.contacts;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 hover:bg-slate-50",
        isActive && "bg-green-50 border-l-2 border-l-[#00B85F] pl-[14px] hover:bg-green-50"
      )}
    >
      <Avatar className={`h-10 w-10 flex-shrink-0 ${hashColor(contact?.name || "")}`}>
        <AvatarFallback className={`text-white text-xs ${hashColor(contact?.name || "")}`}>
          {getInitials(contact?.name || "?")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-sm text-slate-900 truncate">{contact?.name || "Inconnu"}</p>
          <span className="text-[10px] text-slate-400 flex-shrink-0">
            {conversation.last_message_at ? formatRelativeTime(conversation.last_message_at) : ""}
          </span>
        </div>
        <p className="text-xs text-slate-500 truncate mt-0.5">{formatPhone(contact?.phone || "")}</p>
        <div className="flex items-center justify-between mt-1">
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", getModeColor(conversation.mode))}>
            {conversation.mode === "ai" ? "🤖 IA" : "👤 Humain"}
          </span>
        </div>
      </div>
    </button>
  );
}
