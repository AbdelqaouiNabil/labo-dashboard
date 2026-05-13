import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { rows } = await pool.query(`SELECT * FROM analyses ORDER BY code ASC`);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { code, nom, categorie, sous_categorie, coefficient_b, synonymes } = await req.json();
  const prix = Math.floor(((coefficient_b * 1.1) + 20) / 10) * 10;

  try {
    const { rows } = await pool.query(
      `INSERT INTO analyses (code, nom, categorie, sous_categorie, coefficient_b, prix, synonymes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [code, nom, categorie || null, sous_categorie || null, coefficient_b, prix, synonymes ?? []]
    );
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const { nom, categorie, sous_categorie, coefficient_b, synonymes } = await req.json();
  const prix = Math.floor(((coefficient_b * 1.1) + 20) / 10) * 10;

  const { rows } = await pool.query(
    `UPDATE analyses
     SET nom=$2, categorie=$3, sous_categorie=$4, coefficient_b=$5, prix=$6, synonymes=$7
     WHERE id=$1 RETURNING *`,
    [id, nom, categorie || null, sous_categorie || null, coefficient_b, prix, synonymes ?? []]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  await pool.query(`DELETE FROM analyses WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
