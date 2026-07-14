import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PERIODS = {
  day: 1,
  week: 7,
  month: 30,
} as const;

type Period = keyof typeof PERIODS;

type AgentAggregate = {
  source: string;
  sessions: number;
  plan_sessions: number;
  active_days: Set<string>;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  total_tokens: number;
  categories: Record<string, number>;
};

function sourceLabel(source: string) {
  return source.replaceAll("_", " ");
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const requested = url.searchParams.get("period") as Period | null;
  const period: Period = requested && requested in PERIODS ? requested : "week";
  const days = PERIODS[period];
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const since = start.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("agent_usage_daily")
    .select("usage_date,source,category,event_count,plan_event_count,input_tokens,output_tokens,cached_tokens,total_tokens")
    .eq("user_id", user.id)
    .gte("usage_date", since)
    .order("usage_date", { ascending: true });
  if (error) return NextResponse.json({ error: "Unable to read leaderboard" }, { status: 500 });

  const byAgent = new Map<string, AgentAggregate>();

  for (const row of data ?? []) {
    const current: AgentAggregate = byAgent.get(row.source) ?? {
      source: row.source,
      sessions: 0,
      plan_sessions: 0,
      active_days: new Set<string>(),
      input_tokens: 0,
      output_tokens: 0,
      cached_tokens: 0,
      total_tokens: 0,
      categories: {} as Record<string, number>,
    };
    current.sessions += row.event_count ?? 0;
    current.plan_sessions += row.plan_event_count ?? 0;
    current.active_days.add(row.usage_date);
    current.input_tokens += row.input_tokens ?? 0;
    current.output_tokens += row.output_tokens ?? 0;
    current.cached_tokens += row.cached_tokens ?? 0;
    current.total_tokens += row.total_tokens ?? 0;
    const category = String(row.category ?? "session");
    current.categories[category] = (current.categories[category] ?? 0) + (row.event_count ?? 0);
    byAgent.set(row.source, current);
  }

  const agents = [...byAgent.values()]
    .map((agent) => ({ ...agent, label: sourceLabel(agent.source), active_days: agent.active_days.size }))
    .sort((a, b) => b.total_tokens - a.total_tokens || b.sessions - a.sessions)
    .map((agent, index) => ({ ...agent, rank: index + 1 }));

  return NextResponse.json({ period, days, since, agents });
}
