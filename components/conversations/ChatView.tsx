"use client";

import { useEffect, useRef, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { AIHumanToggle } from "./AIHumanToggle";
import { MessageBubble } from "./MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessages } from "@/hooks/useMessages";
import { useRealtime } from "@/hooks/useRealtime";
import { Message } from "@/lib/supabase/types";
import { formatPhone, getInitials, hashColor } from "@/lib/utils";

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

export function ChatView({ contactId, conversationId, contactName, contactPhone, conversationMode }: ChatViewProps) {
  const { messages, loading, addMessage } = useMessages(contactId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback(
    (msg: Message) => addMessage(msg),
    [addMessage]
  );

  useRealtime(contactId, handleNewMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className={`h-9 w-9 ${hashColor(contactName)}`}>
            <AvatarFallback className={`text-white text-xs ${hashColor(contactName)}`}>
              {getInitials(contactName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm text-slate-900">{contactName}</p>
            <p className="text-xs text-slate-500">{formatPhone(contactPhone)}</p>
          </div>
        </div>
        <AIHumanToggle conversationId={conversationId} currentMode={conversationMode} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-1">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <MessageSquare className="h-10 w-10 opacity-30" />
            <p className="text-sm">Aucun message</p>
          </div>
        ) : (
          groups.map(({ date, messages: dayMessages }) => (
            <div key={date}>
              <div className="flex items-center justify-center my-3">
                <span className="bg-slate-200 text-slate-500 text-xs px-3 py-1 rounded-full">
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
    </div>
  );
}
