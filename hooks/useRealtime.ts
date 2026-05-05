"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message, Conversation } from "@/lib/supabase/types";

export function useRealtime(
  contactId: string | null,
  onNewMessage: (message: Message) => void
) {
  useEffect(() => {
    if (!contactId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${contactId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `contact_id=eq.${contactId}`,
        },
        (payload) => {
          onNewMessage(payload.new as Message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId, onNewMessage]);
}

export function useConversationRealtime(
  conversationId: string | null,
  onModeChange: (conversation: Conversation) => void
) {
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`conversations:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          onModeChange(payload.new as Conversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onModeChange]);
}
