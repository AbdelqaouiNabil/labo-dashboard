"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/lib/supabase/types";

export function useMessages(contactId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contactId) {
      setMessages([]);
      return;
    }

    const supabase = createClient();
    setLoading(true);
    setError(null);

    supabase
      .from("messages")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setMessages((data as Message[]) ?? []);
        }
        setLoading(false);
      });
  }, [contactId]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  return { messages, loading, error, addMessage };
}
