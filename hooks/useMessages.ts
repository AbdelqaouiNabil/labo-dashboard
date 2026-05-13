"use client";

import { useState, useEffect } from "react";
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

    setLoading(true);
    setError(null);

    fetch(`/api/messages/${contactId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [contactId]);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  return { messages, loading, error, addMessage };
}
