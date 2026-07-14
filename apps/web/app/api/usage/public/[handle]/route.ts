import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/cli-auth";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ handle: string }> }) {
  try {
    const { handle } = await params;
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("id,username,full_name,headline").eq("username", handle).maybeSingle();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    const { data: settings } = await admin.from("profile_usage_settings").select("visibility,show_tokens,show_projects,window_days").eq("user_id", profile.id).maybeSingle();
    if (settings?.visibility !== "public") return NextResponse.json({ error: "Usage is private" }, { status: 404 });

    const days = settings.window_days ?? 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const selection = settings.show_tokens
      ? "source,status,input_tokens,output_tokens,started_at,project_key,model,coverage"
      : "source,status,started_at,project_key,model,coverage";
    const { data: events, error } = await admin.from("agent_usage_events").select(selection).eq("user_id", profile.id).gte("started_at", since).order("started_at", { ascending: true }).limit(5000);
    if (error) throw error;
    return NextResponse.json({ profile, days, events: events ?? [], show_tokens: settings.show_tokens, show_projects: settings.show_projects });
  } catch (error) {
    console.error("[GET /api/usage/public/[handle]] failed:", error);
    return NextResponse.json({ error: "Unable to read public usage" }, { status: 500 });
  }
}
