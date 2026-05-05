import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalContacts },
    { count: messagesToday },
    { count: activeAIConversations },
    { count: pendingAppointments },
    { count: newContactsToday },
  ] = await Promise.all([
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("mode", "ai"),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("contacts").select("*", { count: "exact", head: true }).gte("created_at", today),
  ]);

  return NextResponse.json({
    totalContacts: totalContacts ?? 0,
    messagesToday: messagesToday ?? 0,
    activeAIConversations: activeAIConversations ?? 0,
    pendingAppointments: pendingAppointments ?? 0,
    newContactsToday: newContactsToday ?? 0,
  });
}
