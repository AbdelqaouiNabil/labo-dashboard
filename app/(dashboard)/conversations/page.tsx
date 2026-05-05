"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { ConversationList } from "@/components/conversations/ConversationList";
import { ChatView } from "@/components/conversations/ChatView";
import { useConversations } from "@/hooks/useConversations";

export default function ConversationsPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const { conversations } = useConversations();

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const handleSelectConversation = (conversationId: string, contactId: string) => {
    setSelectedConversationId(conversationId);
    setSelectedContactId(contactId);
  };

  return (
    <div className="flex h-full">
      <ConversationList
        onSelectConversation={handleSelectConversation}
        selectedId={selectedConversationId ?? undefined}
      />

      <div className="flex-1 overflow-hidden">
        {selectedConversationId && selectedContactId && selectedConversation ? (
          <ChatView
            contactId={selectedContactId}
            conversationId={selectedConversationId}
            contactName={selectedConversation.contacts?.name ?? "Inconnu"}
            contactPhone={selectedConversation.contacts?.phone ?? ""}
            conversationMode={selectedConversation.mode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
