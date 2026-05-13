"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  MessageSquare, Phone, MoreVertical, Bot, User,
  Smile, Paperclip, Send, Mic,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { AIHumanToggle } from "./AIHumanToggle";
import { MessageBubble } from "./MessageBubble";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/hooks/useMessages";
import { useRealtime } from "@/hooks/useRealtime";
import { Message } from "@/lib/supabase/types";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChatViewProps {
  contactId: string;
  conversationId: string;
  contactName: string;
  contactPhone: string;
  conversationMode: "ai" | "human";
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Aujourd'hui";
  if (isYesterday(d)) return "Hier";
  return format(d, "d MMMM yyyy", { locale: fr });
}

function groupByDate(messages: Message[]): { date: string; messages: Message[] }[] {
  const groups: Map<string, Message[]> = new Map();
  for (const msg of messages) {
    const key = format(new Date(msg.created_at), "yyyy-MM-dd");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(msg);
  }
  return Array.from(groups.entries()).map(([date, messages]) => ({ date, messages }));
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

export function ChatView({
  contactId, conversationId, contactName, contactPhone, conversationMode,
}: ChatViewProps) {
  const { messages, loading, addMessage } = useMessages(contactId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((msg: Message) => addMessage(msg), [addMessage]);
  useRealtime(contactId, handleNewMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groups = groupByDate(messages);
  const isAI = conversationMode === "ai";

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-white border-b border-[#E2E8F0] px-5 py-3.5 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold", avatarColor(contactName))}>
              {getInitials(contactName)}
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-slate-400 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#0F172A]">{contactName}</p>
              <span className={cn(
                "flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                isAI ? "bg-[#8B1F1F]/10 text-[#8B1F1F]" : "bg-amber-50 text-amber-700"
              )}>
                {isAI ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                {isAI ? "IA" : "Humain"}
              </span>
            </div>
            <p className="text-xs text-[#64748B]">WhatsApp · {contactPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AIHumanToggle conversationId={conversationId} currentMode={conversationMode} />
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            <Phone className="h-3.5 w-3.5" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className={cn("h-12 rounded-2xl", i % 2 === 0 ? "w-52" : "w-36")} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <div className="h-16 w-16 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm">
              <MessageSquare className="h-7 w-7 opacity-30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Aucun message</p>
              <p className="text-xs text-slate-400 mt-1">Les messages apparaîtront ici</p>
            </div>
          </div>
        ) : (
          groups.map(({ date, messages: dayMessages }) => (
            <div key={date}>
              <div className="flex items-center justify-center my-4">
                <span className="bg-white border border-[#E2E8F0] text-[#64748B] text-xs px-3 py-1 rounded-full shadow-sm">
                  {getDateLabel(dayMessages[0].created_at)}
                </span>
              </div>
              <div className="space-y-1.5">
                {dayMessages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Composer ── */}
      <div className="bg-white border-t border-[#E2E8F0] px-4 py-3 flex-shrink-0">
        {isAI && (
          <div className="flex items-center gap-2 mb-2.5 px-3 py-2 rounded-xl bg-[#8B1F1F]/5 border border-[#8B1F1F]/10">
            <Bot className="h-3.5 w-3.5 text-[#8B1F1F] flex-shrink-0" />
            <p className="text-[11px] text-[#8B1F1F] font-medium">
              L&apos;IA gère cette conversation. Passez en mode Humain pour répondre manuellement.
            </p>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-end gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl px-3 py-2 focus-within:border-[#8B1F1F] focus-within:ring-1 focus-within:ring-[#8B1F1F]/20 transition-all">
            <button className="text-[#64748B] hover:text-[#0F172A] transition-colors mb-0.5">
              <Smile className="h-4.5 w-4.5" />
            </button>
            <textarea
              placeholder={isAI ? "Mode IA actif…" : "Écrire un message…"}
              disabled={isAI}
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#0F172A] placeholder:text-slate-400 outline-none resize-none min-h-[24px] max-h-[120px] py-0.5 disabled:cursor-not-allowed"
              style={{ lineHeight: "1.5" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
            />
            <button className="text-[#64748B] hover:text-[#0F172A] transition-colors mb-0.5">
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
          <button className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#8B1F1F] text-white hover:bg-[#8B1F1F]/90 transition-colors shadow-sm disabled:opacity-40">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-2 px-1">
          <button className="flex items-center gap-1 text-[10px] text-[#64748B] hover:text-[#0F172A] transition-colors">
            <Mic className="h-3 w-3" />
            Audio
          </button>
          <span className="text-[#E2E8F0]">·</span>
          <button className="flex items-center gap-1 text-[10px] text-[#64748B] hover:text-[#0F172A] transition-colors">
            <Bot className="h-3 w-3" />
            Suggestion IA
          </button>
        </div>
      </div>
    </div>
  );
}
