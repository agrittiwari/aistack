import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/cli-auth";

export const runtime = "nodejs";

const PERIODS = { day: 1, week: 7, month: 30 } as const;
type Period = keyof typeof PERIODS;

type UserAggregate = {
  user_id: string;
  sessions: number;
  plan_sessions: number;
  active_days: Set<string>;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  agents: Set<string>;
  by_agent: Record<string, { sessions: number; total_tokens: number }>;
  by_day: Record<string, { sessions: number; total_tokens: number }>;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requested = url.searchParams.get("period") as Period | null;
    const period: Period = requested && requested in PERIODS ? requested : "week";
    const source = url.searchParams.get("agent");
    const days = PERIODS[period];
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    const since = start.toISOString().slice(0, 10);
    const admin = createAdminClient();

    // Only profiles that explicitly publish token telemetry can appear here.
    const { data: settings, error: settingsError } = await admin
      .from("profile_usage_settings")
      .select("user_id")
      .eq("visibility", "public")
      .eq("show_tokens", true);
    if (settingsError) throw settingsError;
    const publicUserIds = (settings ?? []).map((row) => row.user_id);
    if (!publicUserIds.length) return NextResponse.json({ period, days, since, agents: [], users: [], agent_options: [] });

    let query = admin
      .from("agent_usage_daily")
      .select("user_id,usage_date,source,category,event_count,plan_event_count,input_tokens,output_tokens,cached_tokens,total_tokens")
      .in("user_id", publicUserIds)
      .gte("usage_date", since)
      .order("usage_date", { ascending: true });
    if (source && source !== "all") query = query.eq("source", source);
    const [{ data: daily, error: dailyError }, { data: profiles, error: profilesError }] = await Promise.all([
      query,
      admin.from("profiles").select("id,username,full_name,avatar_url,headline").in("id", publicUserIds),
    ]);
    if (dailyError) throw dailyError;
    if (profilesError) throw profilesError;

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    const agentOptions = [...new Set((daily ?? []).map((row) => row.source))].sort();
    const byUser = new Map<string, UserAggregate>();

    for (const row of daily ?? []) {
      const current: UserAggregate = byUser.get(row.user_id) ?? {
        user_id: row.user_id,
        sessions: 0,
        plan_sessions: 0,
        active_days: new Set<string>(),
        total_tokens: 0,
        input_tokens: 0,
        output_tokens: 0,
        cached_tokens: 0,
        agents: new Set<string>(),
        by_agent: {} as Record<string, { sessions: number; total_tokens: number }>,
        by_day: {},
      };
      current.sessions += row.event_count ?? 0;
      current.plan_sessions += row.plan_event_count ?? 0;
      current.active_days.add(row.usage_date);
      current.total_tokens += row.total_tokens ?? 0;
      current.input_tokens += row.input_tokens ?? 0;
      current.output_tokens += row.output_tokens ?? 0;
      current.cached_tokens += row.cached_tokens ?? 0;
      current.agents.add(row.source);
      current.by_agent[row.source] ??= { sessions: 0, total_tokens: 0 };
      current.by_agent[row.source].sessions += row.event_count ?? 0;
      current.by_agent[row.source].total_tokens += row.total_tokens ?? 0;
      current.by_day[row.usage_date] ??= { sessions: 0, total_tokens: 0 };
      current.by_day[row.usage_date].sessions += row.event_count ?? 0;
      current.by_day[row.usage_date].total_tokens += row.total_tokens ?? 0;
      byUser.set(row.user_id, current);
    }

    const users = [...byUser.values()]
      // A session without provider token metadata is not a zero-token ranking.
      .filter((user) => user.total_tokens > 0)
      .map((user) => {
        const profile = profileById.get(user.user_id);
        const topAgent = Object.entries(user.by_agent).sort((a, b) => b[1].total_tokens - a[1].total_tokens || b[1].sessions - a[1].sessions)[0];
        return {
          user_id: user.user_id,
          handle: profile?.username || user.user_id,
          full_name: profile?.full_name || profile?.username || "Anonymous builder",
          avatar_url: profile?.avatar_url || null,
          headline: profile?.headline || null,
          sessions: user.sessions,
          plan_sessions: user.plan_sessions,
          active_days: user.active_days.size,
          agents_observed: user.agents.size,
          total_tokens: user.total_tokens,
          input_tokens: user.input_tokens,
          output_tokens: user.output_tokens,
          cached_tokens: user.cached_tokens,
          top_agent: topAgent ? { source: topAgent[0], sessions: topAgent[1].sessions, total_tokens: topAgent[1].total_tokens } : null,
          daily: Object.entries(user.by_day).sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, ...value })),
          agents: Object.entries(user.by_agent).sort((a, b) => b[1].total_tokens - a[1].total_tokens || b[1].sessions - a[1].sessions).map(([source, value]) => ({ source, ...value })),
        };
      })
      .sort((a, b) => b.total_tokens - a.total_tokens || b.sessions - a.sessions)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    return NextResponse.json({ period, days, since, agent: source || "all", agent_options: agentOptions, users });
  } catch (error) {
    console.error("[GET /api/leaderboard] failed:", error);
    return NextResponse.json({ error: "Unable to read public leaderboard" }, { status: 500 });
  }
}
