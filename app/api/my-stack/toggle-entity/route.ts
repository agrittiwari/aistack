import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleStackEntity } from "@/lib/server/stack";

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entity_id } = body;

  if (!entity_id) {
    return NextResponse.json({ error: "entity_id is required" }, { status: 400 });
  }

  try {
    const result = await toggleStackEntity(user.id, entity_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error toggling stack entity:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}