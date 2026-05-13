"use client";

import { useEffect, useRef } from "react";
import { Message, Conversation } from "@/lib/supabase/types";

export function useRealtime(
  contactId: string | null,
  onNewMessage: (message: Message) => void
) {
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!contactId) return;

    const poll = async () => {
      const res = await fetch(`/api/messages/${contactId}`);
      if (!res.ok) return;
      const msgs: Message[] = await res.json();
      if (!msgs.length) return;

      const latest = msgs[msgs.length - 1];
      if (lastIdRef.current && latest.id !== lastIdRef.current) {
        const newMsgs = msgs.filter(
          (m) => new Date(m.created_at) > new Date(msgs.find((x) => x.id === lastIdRef.current)?.created_at ?? 0)
        );
        newMsgs.forEach(onNewMessage);
      }
      lastIdRef.current = latest.id;
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [contactId, onNewMessage]);
}

export function useConversationRealtime(
  conversationId: string | null,
  onModeChange: (conversation: Conversation) => void
) {
  const lastModeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const poll = async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const convs: (Conversation & { contacts: unknown })[] = await res.json();
      const conv = convs.find((c) => c.id === conversationId);
      if (!conv) return;
      if (lastModeRef.current !== null && conv.mode !== lastModeRef.current) {
        onModeChange(conv);
      }
      lastModeRef.current = conv.mode;
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [conversationId, onModeChange]);
}
