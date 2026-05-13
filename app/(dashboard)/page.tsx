import { Users, MessageSquare, Bot, Calendar, ArrowRight, Wifi } from "lucide-react";
import Link from "next/link";
import pool from "@/lib/db";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { formatPhone } from "@/lib/utils";

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];

  const [
    { rows: [{ count: totalContacts }] },
    { rows: [{ count: messagesToday }] },
    { rows: [{ count: activeAI }] },
    { rows: [{ count: pendingAppointments }] },
    { rows: [{ count: totalConversations }] },
    { rows: recentConversations },
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM contacts`),
    pool.query(`SELECT COUNT(*) FROM messages WHERE created_at >= $1`, [today]),
    pool.query(`SELECT COUNT(*) FROM conversations WHERE mode = 'ai'`),
    pool.query(`SELECT COUNT(*) FROM appointments WHERE status = 'pending'`),
    pool.query(`SELECT COUNT(*) FROM conversations`),
    pool.query(`
      SELECT c.id, c.mode, c.last_message_at, ct.name AS contact_name, ct.phone AS contact_phone
      FROM conversations c
      LEFT JOIN contacts ct ON ct.id = c.contact_id
      ORDER BY c.last_message_at DESC NULLS LAST
      LIMIT 6
    `),
  ]);

  const aiRate = Number(totalConversations) > 0
    ? Math.round((Number(activeAI) / Number(totalConversations)) * 100)
    : 0;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="h-full overflow-auto">
      <div className="p-7 space-y-7 max-w-[1400px]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">
              {greeting} 👋
            </h1>
            <p className="text-[#64748B] text-sm mt-1">
              Vue d&apos;ensemble de votre plateforme IA
            </p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-[#8B1F1F] px-3 py-1.5 rounded-full text-xs font-medium">
            <Wifi className="h-3.5 w-3.5" />
            Système opérationnel
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Total Contacts"
            value={Number(totalContacts).toLocaleString()}
            icon={Users}
            color="teal"
          />
          <StatsCard
            title="Messages Aujourd'hui"
            value={Number(messagesToday).toLocaleString()}
            icon={MessageSquare}
            color="blue"
          />
          <StatsCard
            title="Taux IA"
            value={`${aiRate}%`}
            subtitle={`${Number(activeAI)} conversations actives`}
            icon={Bot}
            color="green"
          />
          <StatsCard
            title="Rendez-vous en attente"
            value={Number(pendingAppointments).toLocaleString()}
            icon={Calendar}
            color="orange"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">Activité Récente</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Messages entrants en temps réel</p>
              </div>
            </div>
            <div className="p-4">
              <RecentActivity />
            </div>
          </div>

          {/* Active Conversations */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">Conversations Actives</h2>
                <p className="text-xs text-[#64748B] mt-0.5">{Number(totalConversations)} au total</p>
              </div>
              <Link
                href="/conversations"
                className="flex items-center gap-1 text-xs font-medium text-[#8B1F1F] hover:text-[#8B1F1F]/80 transition-colors"
              >
                Voir tout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {recentConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Aucune conversation</p>
                </div>
              ) : (
                recentConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href="/conversations"
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-[#8B1F1F]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#8B1F1F]">
                          {(conv.contact_name ?? "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {conv.contact_name ?? "Inconnu"}
                        </p>
                        <p className="text-xs text-[#64748B] truncate">
                          {formatPhone(conv.contact_phone ?? "")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        conv.mode === "ai"
                          ? "bg-[#8B1F1F]/10 text-[#8B1F1F]"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {conv.mode === "ai" ? "IA" : "Humain"}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
