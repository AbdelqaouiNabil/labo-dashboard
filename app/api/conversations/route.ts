import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { rows } = await pool.query(`
    SELECT
      c.id, c.contact_id, c.mode, c.assigned_to, c.last_message_at, c.created_at,
      ct.id   AS "contacts_id",
      ct.phone AS "contacts_phone",
      ct.name  AS "contacts_name",
      ct.language AS "contacts_language",
      ct.created_at AS "contacts_created_at"
    FROM conversations c
    LEFT JOIN contacts ct ON ct.id = c.contact_id
    ORDER BY c.last_message_at DESC NULLS LAST
  `);

  const data = rows.map((r) => ({
    id: r.id,
    contact_id: r.contact_id,
    mode: r.mode,
    assigned_to: r.assigned_to,
    last_message_at: r.last_message_at,
    created_at: r.created_at,
    contacts: r.contacts_id
      ? {
          id: r.contacts_id,
          phone: r.contacts_phone,
          name: r.contacts_name,
          language: r.contacts_language,
          created_at: r.contacts_created_at,
        }
      : null,
  }));

  return NextResponse.json(data);
}
