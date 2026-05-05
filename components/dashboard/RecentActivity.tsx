"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { MessageWithContact } from "@/lib/supabase/types";
import { formatRelativeTime, getInitials, hashColor, truncateMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RecentActivity() {
  const [messages, setMessages] = useState<MessageWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMessages = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*, contacts(*)")
      .eq("direction", "inbound")
      .order("created_at", { ascending: false })
      .limit(10);
    setMessages((data as MessageWithContact[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    const supabase = createClient();
    const channel = supabase
      .channel("recent-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMessages]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return <p className="text-sm text-slate-400 py-4 text-center">Aucune activité récente</p>;
  }

  return (
    <div className="space-y-1">
      {messages.map((msg, i) => {
        const name = msg.contacts?.name ?? "Inconnu";
        const isVeryRecent = new Date().getTime() - new Date(msg.created_at).getTime() < 60_000;
        return (
          <button
            key={msg.id}
            onClick={() => router.push("/conversations")}
            className="w-full flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="relative">
              <Avatar className={cn("h-9 w-9", hashColor(name))}>
                <AvatarFallback className={cn("text-white text-xs", hashColor(name))}>
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              {isVeryRecent && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
              <p className="text-xs text-slate-500 truncate">{truncateMessage(msg.message ?? "", 55)}</p>
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">
              {formatRelativeTime(msg.created_at)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
