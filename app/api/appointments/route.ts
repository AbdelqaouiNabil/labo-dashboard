import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 0);
  const pageSize = 10;
  const offset = page * pageSize;

  const conditions = status && status !== "all" ? `WHERE a.status = $1` : "";
  const queryParams = status && status !== "all" ? [status, pageSize, offset] : [pageSize, offset];
  const statusIndex = status && status !== "all" ? 1 : 0;

  const countQ = status && status !== "all"
    ? `SELECT COUNT(*) FROM appointments WHERE status = $1`
    : `SELECT COUNT(*) FROM appointments`;
  const countParams = status && status !== "all" ? [status] : [];

  const [{ rows }, { rows: countRows }] = await Promise.all([
    pool.query(
      `SELECT a.*, ct.name AS contacts_name, ct.phone AS contacts_phone
       FROM appointments a
       LEFT JOIN contacts ct ON ct.id = a.contact_id
       ${conditions}
       ORDER BY a.created_at DESC
       LIMIT $${statusIndex + 1} OFFSET $${statusIndex + 2}`,
      queryParams
    ),
    pool.query(countQ, countParams),
  ]);

  const data = rows.map((r) => ({
    ...r,
    contacts: { name: r.contacts_name, phone: r.contacts_phone },
  }));

  return NextResponse.json({ data, count: Number(countRows[0].count) });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id, ...fields } = await req.json();
  const sets = Object.keys(fields)
    .map((k, i) => `${k} = $${i + 2}`)
    .join(", ");
  const values = [id, ...Object.values(fields)];

  const { rows } = await pool.query(
    `UPDATE appointments SET ${sets} WHERE id = $1 RETURNING *`,
    values
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await req.json();
  await pool.query(`DELETE FROM appointments WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
