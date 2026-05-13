"use client";

import { useState, useTransition } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AIHumanToggleProps {
  conversationId: string;
  currentMode: "ai" | "human";
  onToggle?: (newMode: "ai" | "human") => void;
}

export function AIHumanToggle({ conversationId, currentMode, onToggle }: AIHumanToggleProps) {
  const [mode, setMode] = useState(currentMode);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (newMode: "ai" | "human") => {
    if (newMode === mode || isPending) return;

    startTransition(async () => {
      const res = await fetch(`/api/conversations/${conversationId}/mode`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });

      if (!res.ok) {
        toast({ title: "Erreur", description: "Impossible de changer le mode", variant: "destructive" });
      } else {
        setMode(newMode);
        onToggle?.(newMode);
        toast({
          title: "Mode changé",
          description: newMode === "ai" ? "Mode IA activé" : "Mode Humain activé",
        });
      }
    });
  };

  return (
    <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-1 gap-1">
      <button
        onClick={() => handleToggle("ai")}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
          mode === "ai"
            ? "bg-[#8B1F1F] text-white shadow-sm"
            : "text-[#64748B] hover:text-[#0F172A]"
        )}
      >
        {isPending && mode !== "ai"
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <Bot className="h-3 w-3" />}
        IA
      </button>
      <button
        onClick={() => handleToggle("human")}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
          mode === "human"
            ? "bg-amber-500 text-white shadow-sm"
            : "text-[#64748B] hover:text-[#0F172A]"
        )}
      >
        {isPending && mode !== "human"
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <User className="h-3 w-3" />}
        Humain
      </button>
    </div>
  );
}
