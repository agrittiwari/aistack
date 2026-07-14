import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 30), 1), 365);
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: events, error } = await supabase
    .from("agent_usage_events")
    .select("source,status,input_tokens,output_tokens,cached_tokens,total_tokens,cost,started_at,ended_at,event_date,project_key,model,coverage,category,plan_mode")
    .eq("user_id", user.id)
    .gte("started_at", since)
    .order("started_at", { ascending: true })
    .limit(5000);
  if (error) return NextResponse.json({ error: "Unable to read usage report" }, { status: 500 });

  const { data: technologies } = await supabase
    .from("usage_technologies")
    .select("ecosystem,name,version,occurrence_count")
    .eq("user_id", user.id)
    .order("occurrence_count", { ascending: false })
    .limit(80);

  const rows = events ?? [];
  return NextResponse.json({
    days,
    coverage: rows.length ? "observed" : "unsupported",
    events: rows,
    technologies: technologies ?? [],
    totals: {
      runs: rows.length,
      input_tokens: rows.reduce((n, row) => n + (row.input_tokens ?? 0), 0),
      output_tokens: rows.reduce((n, row) => n + (row.output_tokens ?? 0), 0),
    },
  });
}
