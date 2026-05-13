"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationWithContact } from "@/lib/supabase/types";

export function useConversations(mode: "ai" | "human" | "all" = "all", search = "") {
  const [conversations, setConversations] = useState<ConversationWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Erreur réseau");
      const data: ConversationWithContact[] = await res.json();

      let results = data.filter((c) => c.contacts?.name?.trim());
      if (mode !== "all") results = results.filter((c) => c.mode === mode);
      if (search.trim()) {
        const q = search.toLowerCase();
        results = results.filter(
          (c) =>
            c.contacts?.name?.toLowerCase().includes(q) ||
            c.contacts?.phone?.toLowerCase().includes(q)
        );
      }
      setConversations(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [mode, search]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
