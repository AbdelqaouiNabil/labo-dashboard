"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ConversationsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <p className="text-sm">Erreur lors du chargement des conversations</p>
      <Button onClick={reset} variant="outline" size="sm">Réessayer</Button>
    </div>
  );
}
