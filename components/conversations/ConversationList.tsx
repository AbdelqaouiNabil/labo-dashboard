"use client";

import { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "@/hooks/useConversations";

interface ConversationListProps {
  onSelectConversation: (conversationId: string, contactId: string) => void;
  selectedId?: string;
}

export function ConversationList({ onSelectConversation, selectedId }: ConversationListProps) {
  const [mode, setMode] = useState<"ai" | "human" | "all">("all");
  const [search, setSearch] = useState("");

  const { conversations, loading } = useConversations(mode, search);

  return (
    <div className="flex flex-col h-full w-80 border-r border-slate-200 bg-white flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-slate-700">Conversations</h2>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {conversations.length}
          </span>
        </div>
        <Tabs value={mode} onValueChange={(v) => setMode(v as "ai" | "human" | "all")}>
          <TabsList className="w-full h-8">
            <TabsTrigger value="all" className="flex-1 text-xs">Tous</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1 text-xs">IA</TabsTrigger>
            <TabsTrigger value="human" className="flex-1 text-xs">Humain</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Rechercher..."
            className="pl-8 h-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 py-12">
            <MessageSquare className="h-8 w-8 opacity-30" />
            <p className="text-xs">Aucune conversation</p>
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
