import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publishStack } from "@/lib/server/stack";

export async function POST() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await publishStack(user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error publishing stack:", error);
    return NextResponse.json({ error: "Unable to publish your stack. Please try again." }, { status: 500 });
  }
}