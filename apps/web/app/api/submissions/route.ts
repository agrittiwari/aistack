import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/supabase";

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value: unknown): string | null {
  const s = asTrimmedString(value);
  return s ? s : null;
}

function normalizeOptionalUrl(value: unknown): { ok: true; value: string | null } | { ok: false } {
  const s = asTrimmedString(value);
  if (!s) return { ok: true, value: null };

  try {
    const url = new URL(s);
    if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false };
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false };
  }
}

function parseLayerId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number.parseInt(value.trim(), 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const startupName = asTrimmedString(payload.startup_name);
  const criticalPitch = asTrimmedString(payload.critical_pitch);
  const targetLayerId = parseLayerId(payload.target_layer_id);

  if (!startupName) {
    return NextResponse.json({ error: "startup_name is required" }, { status: 400 });
  }
  if (!criticalPitch) {
    return NextResponse.json({ error: "critical_pitch is required" }, { status: 400 });
  }
  if (criticalPitch.length > 140) {
    return NextResponse.json({ error: "critical_pitch must be 140 characters or fewer" }, { status: 400 });
  }
  if (targetLayerId === null) {
    return NextResponse.json({ error: "target_layer_id is required" }, { status: 400 });
  }

  const websiteUrl = normalizeOptionalUrl(payload.website_url);
  if (!websiteUrl.ok) {
    return NextResponse.json({ error: "website_url must be a valid http(s) URL" }, { status: 400 });
  }
  const githubUrl = normalizeOptionalUrl(payload.github_url);
  if (!githubUrl.ok) {
    return NextResponse.json({ error: "github_url must be a valid http(s) URL" }, { status: 400 });
  }
  const logoUrl = normalizeOptionalUrl(payload.logo_url);
  if (!logoUrl.ok) {
    return NextResponse.json({ error: "logo_url must be a valid http(s) URL" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const insert: TablesInsert<"submissions"> = {
      startup_name: startupName,
      company_name: normalizeOptionalString(payload.company_name),
      target_layer_id: targetLayerId,
      critical_pitch: criticalPitch,
      description: normalizeOptionalString(payload.description),
      website_url: websiteUrl.value,
      github_url: githubUrl.value,
      logo_url: logoUrl.value,
      submitter_id: user?.id || null,
    };

    const { data, error } = await supabase
      .from("submissions")
      .insert(insert)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error("Submit failed:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

