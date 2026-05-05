import { Users, MessageSquare, Bot, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhone } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalContacts },
    { count: messagesToday },
    { count: activeAI },
    { count: pendingAppointments },
    { data: recentConversations },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().split("T")[0]),
    supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("mode", "ai"),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("conversations")
      .select("*, contacts(*)")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bonjour 👋</h1>
        <p className="text-slate-500 text-sm mt-0.5">Voici le résumé de votre activité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Contacts"
          value={totalContacts ?? 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Messages Aujourd'hui"
          value={messagesToday ?? 0}
          icon={MessageSquare}
          color="green"
        />
        <StatsCard
          title="Conversations IA Actives"
          value={activeAI ?? 0}
          icon={Bot}
          color="green"
        />
        <StatsCard
          title="Rendez-vous en attente"
          value={pendingAppointments ?? 0}
          icon={Calendar}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Conversations Actives</CardTitle>
            <Link href="/conversations" className="text-xs text-[#00B85F] hover:underline">
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            {!recentConversations || recentConversations.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Aucune conversation</p>
            ) : (
              <div className="space-y-2">
                {recentConversations.map((conv) => {
                  const c = conv as { id: string; mode: string; contacts?: { name?: string; phone?: string } };
                  return (
                    <Link
                      key={c.id}
                      href="/conversations"
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.contacts?.name ?? "Inconnu"}</p>
                        <p className="text-xs text-slate-500">{formatPhone(c.contacts?.phone ?? "")}</p>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          c.mode === "ai" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {c.mode === "ai" ? "🤖 IA" : "👤 Humain"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
