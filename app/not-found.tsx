import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-slate-600">
      <p className="text-6xl font-bold text-slate-200">404</p>
      <h2 className="text-lg font-semibold">Page introuvable</h2>
      <p className="text-sm text-slate-400">La page que vous cherchez n&apos;existe pas.</p>
      <Button asChild variant="outline">
        <Link href="/">Retour au Dashboard</Link>
      </Button>
    </div>
  );
}
