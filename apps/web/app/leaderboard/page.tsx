"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type Period = "day" | "week" | "month";
type UserRow = {
  handle: string;
  full_name: string;
  headline: string | null;
  avatar_url: string | null;
  rank: number;
  sessions: number;
  plan_sessions: number;
  active_days: number;
  agents_observed: number;
  total_tokens: number;
  top_agent: { source: string; sessions: number; total_tokens: number } | null;
};

const PERIODS = [
  { value: "day" as const, label: "Daily", description: "Today" },
  { value: "week" as const, label: "Weekly", description: "Last 7 days" },
  { value: "month" as const, label: "Monthly", description: "Last 30 days" },
];

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

function sourceLabel(source: string) {
  return source.replaceAll("_", " ");
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [agent, setAgent] = useState("all");
  const [agentOptions, setAgentOptions] = useState<string[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/leaderboard?period=${period}${agent !== "all" ? `&agent=${encodeURIComponent(agent)}` : ""}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load leaderboard");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setUsers(data.users ?? []);
        setAgentOptions(data.agent_options ?? []);
      })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load leaderboard"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, agent]);

  const totalTokens = users.reduce((sum, user) => sum + user.total_tokens, 0);
  const totalSessions = users.reduce((sum, user) => sum + user.sessions, 0);
  const maxTokens = Math.max(1, ...users.map((user) => user.total_tokens));
  const periodLabel = PERIODS.find((item) => item.value === period)?.description;

  const subtitle = useMemo(() => agent === "all" ? "Across all publicly reported coding agents" : `Filtered to ${sourceLabel(agent)}`, [agent]);

  return (
    <main className="min-h-screen bg-background px-6 pb-20 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">AiStack community</div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-6xl">Token burn leaderboard</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{subtitle}. Rankings include only users who have explicitly made token telemetry public.</p>
          </div>
          <Link href="/my-stack" className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Publish your usage →</Link>
        </div>

        <Card className="mb-6 rounded-3xl border-border/40 bg-card/20"><CardContent className="p-5 md:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto">{PERIODS.map((option) => <button key={option.value} type="button" onClick={() => setPeriod(option.value)} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${period === option.value ? "border-foreground bg-foreground text-background" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>{option.label}<span className="ml-2 opacity-60">{option.description}</span></button>)}</div><div className="flex gap-2 overflow-x-auto"><button type="button" onClick={() => setAgent("all")} className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider ${agent === "all" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-border/40 text-muted-foreground"}`}>All agents</button>{agentOptions.map((option) => <button key={option} type="button" onClick={() => setAgent(option)} className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider ${agent === option ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-border/40 text-muted-foreground"}`}>{sourceLabel(option)}</button>)}</div></div></CardContent></Card>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat label="Public token burn" value={formatTokens(totalTokens)} /><Stat label="Reported sessions" value={totalSessions.toLocaleString()} /><Stat label="Ranked builders" value={users.length.toString()} /></div>

        {error ? <Card className="rounded-3xl border-destructive/30 bg-destructive/5"><CardContent className="p-6 text-sm text-destructive">{error}</CardContent></Card> : <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/20"><div className="flex items-center justify-between border-b border-border/40 px-6 py-4"><div><div className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Community ranking</div><div className="mt-1 text-sm text-muted-foreground">{periodLabel} · ranked by reported token burn</div></div><div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Public profiles only</div></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-border/40 bg-muted/15 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground"><tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4">Builder</th><th className="px-6 py-4">Top agent</th><th className="px-6 py-4">Token burn</th><th className="px-6 py-4">Sessions</th><th className="px-6 py-4">Agents</th><th className="px-6 py-4">Active days</th></tr></thead><tbody className="divide-y divide-border/30">{loading ? <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">Loading public telemetry…</td></tr> : users.length ? users.map((user) => <tr key={user.handle} className="transition-colors hover:bg-muted/10"><td className="px-6 py-5 text-lg font-black text-muted-foreground">#{user.rank}</td><td className="px-6 py-5"><Link href={`/my-ai-stack/${encodeURIComponent(user.handle)}`} className="flex items-center gap-3 group">{user.avatar_url ? <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-black text-muted-foreground">{user.full_name.charAt(0).toUpperCase()}</div>}<div><div className="font-black text-foreground group-hover:underline">{user.full_name}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">View My AI Stack →</div></div></Link></td><td className="px-6 py-5"><div className="font-semibold capitalize text-foreground">{user.top_agent ? sourceLabel(user.top_agent.source) : "—"}</div><div className="mt-1 text-[10px] text-muted-foreground">{user.top_agent ? `${formatTokens(user.top_agent.total_tokens)} tokens` : "No attribution"}</div></td><td className="px-6 py-5"><div className="font-black text-foreground">{formatTokens(user.total_tokens)}</div><div className="mt-2 h-1.5 w-28 rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.max(4, user.total_tokens / maxTokens * 100)}%` }} /></div></td><td className="px-6 py-5 font-semibold text-foreground">{user.sessions.toLocaleString()}</td><td className="px-6 py-5 text-foreground">{user.agents_observed}</td><td className="px-6 py-5 text-foreground">{user.active_days}</td></tr>) : <tr><td colSpan={7} className="px-6 py-16 text-center"><div className="text-lg font-black text-foreground">No public token telemetry yet</div><p className="mt-2 text-sm text-muted-foreground">Builders appear after they enable public token visibility and upload usage.</p></td></tr>}</tbody></table></div></Card>}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card className="rounded-2xl border-border/40 bg-card/20"><CardContent className="p-5"><div className="text-2xl font-black text-foreground">{value}</div><div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{label}</div></CardContent></Card>;
}
