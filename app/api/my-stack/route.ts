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

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email?: string
) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return;

  const username = email
    ? email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") + "_" + userId.slice(0, 6)
    : userId.slice(0, 12);

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    username,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[ensureProfile] failed:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entity_ids, profile, is_public, name, description, entity_notes, interested_layer_ids, primary_layer_id, has_completed_onboarding } = body;

    console.log("[POST /api/my-stack] body:", JSON.stringify(body, null, 2));

    // ── Profile save ──────────────────────────────────────────────
    const needsProfileSave =
      profile ||
      interested_layer_ids !== undefined ||
      primary_layer_id !== undefined ||
      has_completed_onboarding !== undefined;

    if (needsProfileSave) {
      const updatePayload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (profile) {
        if (profile.full_name !== undefined) updatePayload.full_name = profile.full_name;
        if (profile.avatar_url !== undefined) updatePayload.avatar_url = profile.avatar_url;
        if (profile.bio !== undefined) updatePayload.bio = profile.bio;
        if (profile.github_handle !== undefined) updatePayload.github_handle = profile.github_handle;
        if (profile.twitter_handle !== undefined) updatePayload.twitter_handle = profile.twitter_handle;
        if (profile.headline !== undefined) updatePayload.headline = profile.headline;
        if (profile.website_url !== undefined) updatePayload.website_url = profile.website_url;
      }

      if (interested_layer_ids !== undefined) {
        updatePayload.interested_layer_ids = interested_layer_ids;
      }
      if (primary_layer_id !== undefined) {
        updatePayload.primary_layer_id = primary_layer_id;
      }
      if (has_completed_onboarding !== undefined) {
        updatePayload.has_completed_onboarding = has_completed_onboarding;
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      let profileError;
      if (existingProfile) {
        const { error } = await supabase
          .from("profiles")
          .update(updatePayload)
          .eq("id", user.id);
        profileError = error;
      } else {
        const username = user.email
          ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") + "_" + user.id.slice(0, 6)
          : user.id.slice(0, 12);

        const { error } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            username,
            ...updatePayload,
          });
        profileError = error;
      }

      // Fallback: if new columns don't exist yet, retry without them
      if (profileError && (
        profileError.message?.includes("interested_layer_ids") ||
        profileError.message?.includes("has_completed_onboarding") ||
        profileError.message?.includes("primary_layer_id")
      )) {
        console.warn("[POST /api/my-stack] missing columns, retrying without new fields:", profileError.message);
        const safePayload = { ...updatePayload };
        delete safePayload.interested_layer_ids;
        delete safePayload.has_completed_onboarding;
        delete safePayload.primary_layer_id;

        if (existingProfile) {
          const { error: retryError } = await supabase
            .from("profiles")
            .update(safePayload)
            .eq("id", user.id);
          profileError = retryError;
        } else {
          const username = user.email
            ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") + "_" + user.id.slice(0, 6)
            : user.id.slice(0, 12);
          const { error: retryError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username,
              ...safePayload,
            });
          profileError = retryError;
        }
      }

      if (profileError) {
        console.error("[POST /api/my-stack] profile save error:", profileError);
        return NextResponse.json(
          { error: "Profile save failed", details: profileError.message, code: profileError.code },
          { status: 500 }
        );
      }
    }

    // ── Stack save ────────────────────────────────────────────────
    if (entity_ids) {
      // user_stacks.user_id is a FK to profiles.id — ensure row exists
      await ensureProfile(supabase, user.id, user.email ?? undefined);

      const stackPayload: Record<string, unknown> = {
        user_id: user.id,
        entities_id: entity_ids,
        is_public: typeof is_public === "boolean" ? is_public : false,
        name: typeof name === "string" && name.trim() ? name.trim() : "My Stack",
        description: typeof description === "string" ? description.trim() : null,
        updated_at: new Date().toISOString(),
      };

      if (entity_notes && typeof entity_notes === "object") {
        stackPayload.entity_notes = entity_notes;
      }

      console.log("[POST /api/my-stack] stack payload:", stackPayload);

      const { data, error } = await supabase
        .from("user_stacks")
        .upsert([stackPayload], {
          onConflict: "user_id",
          defaultToNull: false,
        })
        .select()
        .single();

      if (error) {
        console.error("[POST /api/my-stack] stack upsert error:", error);
        return NextResponse.json(
          { error: "Unable to save your stack. Please try again.", details: error.message, code: error.code },
          { status: 500 }
        );
      }

      return NextResponse.json({ stack: data });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/my-stack] uncaught error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
