import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { contactId: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { rows } = await pool.query(
    `SELECT * FROM messages WHERE contact_id = $1 ORDER BY created_at ASC`,
    [params.contactId]
  );

  return NextResponse.json(rows);
}
