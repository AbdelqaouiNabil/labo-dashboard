import pool from "@/lib/db";
import { MessagesChart } from "@/components/analytics/MessagesChart";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, TrendingUp, Bot, Clock } from "lucide-react";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";

async function getAnalyticsData() {
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
  );

  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  const thisMonthStart = format(new Date(), "yyyy-MM-01");
  const lastMonthStart = format(subDays(new Date(thisMonthStart), 1), "yyyy-MM-01");

  const [
    { rows: msgData },
    { rows: hourData },
    { rows: [{ count: thisMonthCount }] },
    { rows: [{ count: lastMonthCount }] },
    { rows: [{ count: aiConvCount }] },
    { rows: [{ count: humanConvCount }] },
    { rows: topMsgs },
  ] = await Promise.all([
    pool.query(`SELECT created_at, direction FROM messages WHERE created_at >= $1`, [last7Days[0]]),
    pool.query(`SELECT created_at FROM messages WHERE created_at >= $1`, [thirtyDaysAgo]),
    pool.query(`SELECT COUNT(*) FROM messages WHERE created_at >= $1`, [thisMonthStart]),
    pool.query(`SELECT COUNT(*) FROM messages WHERE created_at >= $1 AND created_at < $2`, [lastMonthStart, thisMonthStart]),
    pool.query(`SELECT COUNT(*) FROM conversations WHERE mode = 'ai'`),
    pool.query(`SELECT COUNT(*) FROM conversations WHERE mode = 'human'`),
    pool.query(`SELECT contact_id FROM messages WHERE direction = 'inbound' AND contact_id IS NOT NULL LIMIT 500`),
  ]);

  const chartData = last7Days.map((date) => {
    const dayMsgs = msgData.filter((m) => String(m.created_at).startsWith(date));
    return {
      date: format(new Date(date), "EEE", { locale: fr }),
      inbound: dayMsgs.filter((m) => m.direction === "inbound").length,
      outbound: dayMsgs.filter((m) => m.direction === "outbound").length,
    };
  });

  const heatmapData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourData.filter((m) => new Date(m.created_at).getHours() === i).length,
  }));

  const thisMonth = Number(thisMonthCount);
  const lastMonth = Number(lastMonthCount);
  const variation = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0;

  const totalConv = Number(aiConvCount) + Number(humanConvCount);
  const aiRate = totalConv > 0 ? Math.round((Number(aiConvCount) / totalConv) * 100) : 0;

  const peakHour = heatmapData.reduce((a, b) => (a.count > b.count ? a : b), { hour: 0, count: 0 });

  const countById: Record<string, number> = {};
  topMsgs.forEach((m) => {
    const id = String(m.contact_id);
    countById[id] = (countById[id] ?? 0) + 1;
  });

  const topIds = Object.entries(countById).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);

  let top5: { name: string; count: number }[] = [];
  if (topIds.length > 0) {
    const placeholders = topIds.map((_, i) => `$${i + 1}`).join(",");
    const { rows: topContactsData } = await pool.query(
      `SELECT id, name FROM contacts WHERE id IN (${placeholders})`,
      topIds
    );
    top5 = topIds.map((id) => ({
      name: topContactsData.find((c) => c.id === id)?.name ?? "Inconnu",
      count: countById[id] ?? 0,
    }));
  }

  return { chartData, heatmapData, thisMonthCount: thisMonth, variation, aiRate, peakHour, top5 };
}

export default async function AnalyticsPage() {
  const { chartData, heatmapData, thisMonthCount, variation, aiRate, peakHour, top5 } =
    await getAnalyticsData();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Messages ce mois" value={thisMonthCount} icon={MessageSquare} color="green" trend={{ value: variation, label: "vs mois dernier" }} />
        <StatsCard title="Variation" value={`${variation >= 0 ? "+" : ""}${variation}%`} icon={TrendingUp} color="blue" />
        <StatsCard title="Taux IA" value={`${aiRate}%`} icon={Bot} color="green" />
        <StatsCard title="Heure de pointe" value={`${peakHour.hour}h`} icon={Clock} color="orange" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Messages — 7 derniers jours</CardTitle>
        </CardHeader>
        <CardContent>
          <MessagesChart data={chartData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5">
            <ActivityHeatmap data={heatmapData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top 5 Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            {top5.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {top5.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-800">{c.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{c.count} msg</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
