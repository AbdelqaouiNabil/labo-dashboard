"use client";

import { useState } from "react";
import { MessageSquare, Inbox } from "lucide-react";
import { ConversationList } from "@/components/conversations/ConversationList";
import { ChatView } from "@/components/conversations/ChatView";
import { CRMPanel } from "@/components/conversations/CRMPanel";
import { useConversations } from "@/hooks/useConversations";

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const { conversations } = useConversations();

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSelect = (conversationId: string, contactId: string) => {
    setSelectedConversationId(conversationId);
    setSelectedContactId(contactId);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Panel 1 — Conversation list */}
      <ConversationList
        onSelectConversation={handleSelect}
        selectedId={selectedConversationId ?? undefined}
      />

      {/* Panel 2 — Chat window */}
      <div className="flex-1 overflow-hidden min-w-0">
        {selectedConversationId && selectedContactId && selectedConversation ? (
          <ChatView
            contactId={selectedContactId}
            conversationId={selectedConversationId}
            contactName={selectedConversation.contacts?.name ?? "Inconnu"}
            contactPhone={selectedConversation.contacts?.phone ?? ""}
            conversationMode={selectedConversation.mode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-[#F8FAFC] gap-4">
            <div className="h-20 w-20 rounded-3xl bg-white border border-[#E2E8F0] flex items-center justify-center shadow-sm">
              <Inbox className="h-9 w-9 text-[#8B1F1F] opacity-60" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-base font-semibold text-[#0F172A]">
                Sélectionnez une conversation
              </p>
              <p className="text-sm text-[#64748B] mt-1.5">
                Choisissez une conversation dans le panneau de gauche pour afficher les messages.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] bg-white border border-[#E2E8F0] rounded-xl px-4 py-2.5 shadow-sm">
              <MessageSquare className="h-3.5 w-3.5 text-[#8B1F1F]" />
              Conversations WhatsApp en temps réel
            </div>
          </div>
        )}
      </div>

      {/* Panel 3 — CRM details */}
      {selectedConversation ? (
        <CRMPanel conversation={selectedConversation} />
      ) : (
        <div className="w-[300px] bg-white border-l border-[#E2E8F0] flex-shrink-0 hidden xl:flex flex-col items-center justify-center gap-3 text-slate-300">
          <div className="h-12 w-12 rounded-2xl border border-[#E2E8F0] flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <p className="text-xs text-[#64748B] text-center px-6">
            Sélectionnez une conversation pour voir les détails
          </p>
        </div>
      )}
    </div>
  );
}
