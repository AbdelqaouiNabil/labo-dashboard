"use client";

import { useState, useTransition } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
      const supabase = createClient();
      const { error } = await supabase
        .from("conversations")
        .update({ mode: newMode })
        .eq("id", conversationId);

      if (error) {
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
    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
      <button
        onClick={() => handleToggle("ai")}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
          mode === "ai"
            ? "bg-green-500 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        {isPending && mode !== "ai" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Bot className="h-3 w-3" />
        )}
        IA
      </button>
      <button
        onClick={() => handleToggle("human")}
        disabled={isPending}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
          mode === "human"
            ? "bg-orange-500 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        {isPending && mode !== "human" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <User className="h-3 w-3" />
        )}
        Humain
      </button>
    </div>
  );
}
