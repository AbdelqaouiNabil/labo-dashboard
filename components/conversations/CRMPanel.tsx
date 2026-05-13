"use client";

import { useState } from "react";
import {
  Phone, Globe, Bot, User, Calendar, ChevronDown, ChevronUp,
  Sparkles, TrendingUp, MessageSquare, Clock,
} from "lucide-react";
import { ConversationWithContact } from "@/lib/supabase/types";
import { formatPhone } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CRMPanelProps {
  conversation: ConversationWithContact;
}

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E2E8F0] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-[#64748B]" />
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-[#64748B]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
        )}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className="text-xs font-medium text-[#0F172A] text-right max-w-[55%] truncate">{value}</span>
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-[#8B1F1F]",
  "bg-rose-500", "bg-amber-500", "bg-indigo-500",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function CRMPanel({ conversation }: CRMPanelProps) {
  const contact = conversation.contacts;
  const name = contact?.name ?? "Inconnu";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const isAI = conversation.mode === "ai";

  return (
    <div className="flex flex-col h-full w-[300px] bg-white border-l border-[#E2E8F0] flex-shrink-0 overflow-y-auto">

      {/* Profile header */}
      <div className="px-5 py-5 border-b border-[#E2E8F0] bg-gradient-to-b from-[#F8FAFC] to-white">
        <div className="flex flex-col items-center gap-3">
          <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm", avatarColor(name))}>
            {initials}
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-[#0F172A]">{name}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">{formatPhone(contact?.phone ?? "")}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full",
              isAI ? "bg-[#8B1F1F]/10 text-[#8B1F1F]" : "bg-amber-50 text-amber-700"
            )}>
              {isAI ? <Bot className="h-3 w-3" /> : <User className="h-3 w-3" />}
              {isAI ? "Géré par IA" : "Géré par humain"}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <Section title="Profil Contact" icon={User}>
        <div className="divide-y divide-[#E2E8F0]/60">
          <InfoRow label="Téléphone" value={formatPhone(contact?.phone ?? "—")} />
          <InfoRow label="Langue" value={contact?.language ?? "—"} />
          <InfoRow label="Canal" value="WhatsApp" />
          <InfoRow
            label="Membre depuis"
            value={contact?.created_at
              ? new Date(contact.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
              : "—"}
          />
        </div>
      </Section>

      {/* Conversation Info */}
      <Section title="Conversation" icon={MessageSquare}>
        <div className="divide-y divide-[#E2E8F0]/60">
          <InfoRow label="Statut" value={isAI ? "IA Active" : "Support humain"} />
          <InfoRow
            label="Dernière activité"
            value={conversation.last_message_at
              ? new Date(conversation.last_message_at).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })
              : "—"}
          />
          <InfoRow
            label="Créée le"
            value={new Date(conversation.created_at).toLocaleDateString("fr-FR", {
              day: "numeric", month: "short", year: "numeric",
            })}
          />
        </div>
      </Section>

      {/* AI Insights */}
      <Section title="Insights IA" icon={Sparkles}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B]">Sentiment</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[#8B1F1F] rounded-full" />
              </div>
              <span className="text-[10px] font-medium text-[#8B1F1F]">Positif</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#64748B]">Confiance IA</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full w-5/6 bg-[#8B1F1F] rounded-full" />
              </div>
              <span className="text-[10px] font-medium text-[#8B1F1F]">85%</span>
            </div>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-[#8B1F1F]/5 border border-[#8B1F1F]/10">
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#8B1F1F]" />
              <span className="text-[11px] font-semibold text-[#8B1F1F]">Intention détectée</span>
            </div>
            <p className="text-xs text-[#64748B]">
              {isAI ? "Prise de rendez-vous ou demande d'information médicale" : "Assistance humaine requise"}
            </p>
          </div>
        </div>
      </Section>

      {/* Quick Actions */}
      <Section title="Actions Rapides" icon={Clock} defaultOpen={false}>
        <div className="space-y-2">
          <a
            href={`tel:${contact?.phone ?? ""}`}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-[#8B1F1F]" />
            Appeler le contact
          </a>
          <a
            href="/appointments"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-[#8B1F1F]" />
            Voir les rendez-vous
          </a>
          <a
            href="/analyses"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-[#8B1F1F]" />
            Voir les analyses
          </a>
        </div>
      </Section>
    </div>
  );
}
