"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-slate-600">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
      <p className="text-sm text-slate-400">{error.message}</p>
      <Button onClick={reset} variant="outline">Réessayer</Button>
    </div>
  );
}
