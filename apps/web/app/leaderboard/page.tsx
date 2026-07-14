"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type Period = "day" | "week" | "month";
type AgentRow = {
  source: string;
  label: string;
  rank: number;
  sessions: number;
  plan_sessions: number;
  active_days: number;
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  total_tokens: number;
  categories: Record<string, number>;
};

const PERIODS: Array<{ value: Period; label: string; description: string }> = [
  { value: "day", label: "Daily", description: "Today" },
  { value: "week", label: "Weekly", description: "Last 7 days" },
  { value: "month", label: "Monthly", description: "Last 30 days" },
];

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/leaderboard?period=${period}`)
      .then(async (response) => {
        if (response.status === 401) { setUnauthorized(true); return null; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load leaderboard");
        return data;
      })
      .then((data) => { if (!cancelled && data) { setAgents(data.agents ?? []); setUnauthorized(false); } })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Unable to load leaderboard"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period]);

  const visibleAgents = useMemo(() => selectedAgent === "all" ? agents : agents.filter((agent) => agent.source === selectedAgent), [agents, selectedAgent]);
  const totalTokens = visibleAgents.reduce((sum, agent) => sum + agent.total_tokens, 0);
  const totalSessions = visibleAgents.reduce((sum, agent) => sum + agent.sessions, 0);
  const maxTokens = Math.max(1, ...visibleAgents.map((agent) => agent.total_tokens));

  return (
    <main className="min-h-screen bg-background px-6 pb-20 pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Your agent telemetry</div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground md:text-6xl">Usage leaderboard</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">Compare your coding agents by token burn, sessions, and planning activity. This is a private foundation for your builder profile.</p>
          </div>
          <Link href="/my-stack" className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Manage privacy in My Stack →</Link>
        </div>

        <Card className="mb-6 rounded-3xl border-border/40 bg-card/20">
          <CardContent className="p-5 md:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {PERIODS.map((option) => <button key={option.value} type="button" onClick={() => { setPeriod(option.value); setSelectedAgent("all"); }} className={`shrink-0 rounded-full border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${period === option.value ? "border-foreground bg-foreground text-background" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}><span>{option.label}</span><span className="ml-2 opacity-60">{option.description}</span></button>)}
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button type="button" onClick={() => setSelectedAgent("all")} className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider ${selectedAgent === "all" ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-border/40 text-muted-foreground"}`}>All agents</button>
                {agents.map((agent) => <button key={agent.source} type="button" onClick={() => setSelectedAgent(agent.source)} className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-wider ${selectedAgent === agent.source ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-border/40 text-muted-foreground"}`}>{agent.label}</button>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {unauthorized ? <Card className="rounded-3xl border-border/40 bg-card/20"><CardContent className="p-12 text-center"><h2 className="text-2xl font-black text-foreground">Sign in to see your leaderboard</h2><p className="mt-2 text-sm text-muted-foreground">Usage is private by default and tied to your authenticated profile.</p><Link href="/auth/login" className="mt-6 inline-block rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background">Sign in</Link></CardContent></Card> : null}
        {error ? <Card className="rounded-3xl border-destructive/30 bg-destructive/5"><CardContent className="p-6 text-sm text-destructive">{error}</CardContent></Card> : null}
        {!unauthorized && !error ? <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"><Stat label="Token burn" value={formatTokens(totalTokens)} /><Stat label="Sessions" value={totalSessions.toLocaleString()} /><Stat label="Agents observed" value={visibleAgents.length.toString()} /></div>
          <Card className="overflow-hidden rounded-3xl border-border/40 bg-card/20"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-border/40 bg-muted/15 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground"><tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4">Coding agent</th><th className="px-6 py-4">Token burn</th><th className="px-6 py-4">Sessions</th><th className="px-6 py-4">Plan mode</th><th className="px-6 py-4">Active days</th><th className="px-6 py-4">Share</th></tr></thead><tbody className="divide-y divide-border/30">{loading ? <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">Loading usage…</td></tr> : visibleAgents.length ? visibleAgents.map((agent) => <tr key={agent.source} className="transition-colors hover:bg-muted/10"><td className="px-6 py-5 text-lg font-black text-muted-foreground">#{agent.rank}</td><td className="px-6 py-5"><div className="font-black capitalize text-foreground">{agent.label}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{Object.entries(agent.categories).slice(0, 2).map(([name, count]) => `${name} ${count}`).join(" · ") || "No category data"}</div></td><td className="px-6 py-5"><div className="font-black text-foreground">{formatTokens(agent.total_tokens)}</div><div className="mt-2 h-1.5 w-28 rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.max(4, agent.total_tokens / maxTokens * 100)}%` }} /></div></td><td className="px-6 py-5 font-semibold text-foreground">{agent.sessions.toLocaleString()}</td><td className="px-6 py-5 text-foreground">{agent.plan_sessions.toLocaleString()}</td><td className="px-6 py-5 text-foreground">{agent.active_days}</td><td className="px-6 py-5 text-muted-foreground">{totalTokens ? `${Math.round(agent.total_tokens / totalTokens * 100)}%` : "—"}</td></tr>) : <tr><td colSpan={7} className="px-6 py-16 text-center"><div className="text-lg font-black text-foreground">No usage in this period</div><p className="mt-2 text-sm text-muted-foreground">Run <code className="rounded bg-muted px-1.5 py-0.5">aistack deepscan</code> to import coding-agent sessions.</p></td></tr>}</tbody></table></div></Card>
        </> : null}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card className="rounded-2xl border-border/40 bg-card/20"><CardContent className="p-5"><div className="text-2xl font-black text-foreground">{value}</div><div className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{label}</div></CardContent></Card>;
}
