import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { rows } = await pool.query(`
    SELECT m.*, ct.name AS contacts_name, ct.phone AS contacts_phone
    FROM messages m
    LEFT JOIN contacts ct ON ct.id = m.contact_id
    WHERE m.direction = 'inbound'
    ORDER BY m.created_at DESC
    LIMIT 10
  `);

  const data = rows.map((r) => ({
    ...r,
    contacts: { name: r.contacts_name, phone: r.contacts_phone },
  }));

  return NextResponse.json(data);
}
