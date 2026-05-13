"use client";

import { useState } from "react";
import { Search, MessageSquare, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  onSelectConversation: (conversationId: string, contactId: string) => void;
  selectedId?: string;
}

type FilterMode = "all" | "ai" | "human";

const FILTERS: { value: FilterMode; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "ai", label: "IA" },
  { value: "human", label: "Humain" },
];

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const [mode, setMode] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");

  const { conversations, loading } = useConversations(mode, search);

  return (
    <div className="flex flex-col h-full w-[340px] bg-white border-r border-[#E2E8F0] flex-shrink-0">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">Conversations</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {loading ? "…" : `${conversations.length} au total`}
            </p>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#64748B]" />
          <input
            type="text"
            placeholder="Rechercher par nom, numéro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#8B1F1F] focus:ring-1 focus:ring-[#8B1F1F]/20 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setMode(f.value)}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-150",
                mode === f.value
                  ? "bg-white text-[#8B1F1F] shadow-sm border border-[#E2E8F0]"
                  : "text-[#64748B] hover:text-[#0F172A]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-px">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E2E8F0]/60">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-16">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Aucune conversation</p>
              <p className="text-xs text-slate-400 mt-0.5">Modifiez vos filtres</p>
            </div>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={selectedId === conv.id}
              onClick={() => onSelectConversation(conv.id, conv.contact_id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
