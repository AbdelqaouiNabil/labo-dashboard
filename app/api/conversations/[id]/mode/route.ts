import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { mode } = await request.json() as { mode: string };

  if (mode !== "ai" && mode !== "human") {
    return NextResponse.json({ error: "Mode invalide. Valeurs acceptées: 'ai' | 'human'" }, { status: 400 });
  }

  const { rows } = await pool.query(
    `UPDATE conversations SET mode = $1 WHERE id = $2 RETURNING *`,
    [mode, params.id]
  );

  return NextResponse.json({ data: rows[0] });
}
