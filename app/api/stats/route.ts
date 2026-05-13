import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export const revalidate = 60;

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const today = new Date().toISOString().split("T")[0];

  const [
    { rows: [{ count: totalContacts }] },
    { rows: [{ count: messagesToday }] },
    { rows: [{ count: activeAIConversations }] },
    { rows: [{ count: pendingAppointments }] },
    { rows: [{ count: newContactsToday }] },
  ] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM contacts`),
    pool.query(`SELECT COUNT(*) FROM messages WHERE created_at >= $1`, [today]),
    pool.query(`SELECT COUNT(*) FROM conversations WHERE mode = 'ai'`),
    pool.query(`SELECT COUNT(*) FROM appointments WHERE status = 'pending'`),
    pool.query(`SELECT COUNT(*) FROM contacts WHERE created_at >= $1`, [today]),
  ]);

  return NextResponse.json({
    totalContacts: Number(totalContacts),
    messagesToday: Number(messagesToday),
    activeAIConversations: Number(activeAIConversations),
    pendingAppointments: Number(pendingAppointments),
    newContactsToday: Number(newContactsToday),
  });
}
