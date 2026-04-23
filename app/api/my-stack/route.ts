import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLayers } from "@/lib/db/queries";

export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: stackData, error: stackError } = await supabase
    .from("user_stacks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (stackError && stackError.code !== "PGRST116") {
    console.error("[GET /api/my-stack] stack error:", stackError);
    return NextResponse.json({ error: "Unable to load your stack. Please try again." }, { status: 500 });
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("[GET /api/my-stack] profile error:", profileError);
    return NextResponse.json({ error: "Unable to load your profile. Please try again." }, { status: 500 });
  }

  const layers = await getLayers();

  return NextResponse.json({ stack: stackData, profile: profileData, layers });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entity_ids, profile, is_public, name, description } = body;

  if (profile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert([{
        id: user.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        github_handle: profile.github_handle,
        twitter_handle: profile.twitter_handle,
        headline: profile.headline,
        website_url: profile.website_url,
        updated_at: new Date().toISOString(),
      }], {
        onConflict: "id",
        defaultToNull: false,
      });

    if (profileError) {
      console.error("[POST /api/my-stack] profile upsert error:", profileError);
      return NextResponse.json({ error: "Unable to save your profile. Please try again." }, { status: 500 });
    }
  }

  if (entity_ids) {
    const { data, error } = await supabase
      .from("user_stacks")
      .upsert([{
        user_id: user.id,
        entities_id: entity_ids,
        is_public: typeof is_public === "boolean" ? is_public : undefined,
        name: typeof name === "string" && name.trim() ? name.trim() : undefined,
        description: typeof description === "string" ? description.trim() : undefined,
        updated_at: new Date().toISOString(),
      }], {
        onConflict: "user_id",
        defaultToNull: false,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/my-stack] stack upsert error:", error);
      return NextResponse.json({ error: "Unable to save your stack. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ stack: data });
  }

  return NextResponse.json({ success: true });
}
