import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { mode } = body as { mode: string };

  if (mode !== "ai" && mode !== "human") {
    return NextResponse.json(
      { error: "Mode invalide. Valeurs acceptées: 'ai' | 'human'" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("conversations")
    .update({ mode })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 200 });
}
