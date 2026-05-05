"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { ConversationWithContact } from "@/lib/supabase/types";

export function useConversations(
  mode: "ai" | "human" | "all" = "all",
  search = ""
) {
  const [conversations, setConversations] = useState<ConversationWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let query = supabase
        .from("conversations")
        .select("*, contacts(*)")
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (mode !== "all") {
        query = query.eq("mode", mode);
      }

      const { data, error: err } = await query;
      if (err) throw err;

      let results = (data as ConversationWithContact[]) ?? [];

      // hide contacts without a name
      results = results.filter((c) => c.contacts?.name?.trim());

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
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
}
