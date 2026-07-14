"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export type AgentUsageEvent = {
  source?: string | null;
  category?: string | null;
  status?: string | null;
  model?: string | null;
  project_key?: string | null;
  started_at?: string | null;
  plan_mode?: boolean | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cached_tokens?: number | null;
  total_tokens?: number | null;
};

export type UsageTechnology = {
  ecosystem: string;
  name: string;
  version?: string | null;
  occurrence_count?: number | null;
};

function label(value: string | null | undefined) {
  return (value || "unknown").replaceAll("_", " ");
}

function tokens(event: AgentUsageEvent) {
  return event.total_tokens ?? (event.input_tokens ?? 0) + (event.output_tokens ?? 0) + (event.cached_tokens ?? 0);
}

function Breakdown({ title, values, tone = "muted" }: { title: string; values: Record<string, number>; tone?: "muted" | "green" }) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{title}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.length ? entries.map(([name, count]) => (
          <span key={name} className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${tone === "green" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-border/40 bg-muted/20 text-muted-foreground"}`}>
            {label(name)} · {count}
          </span>
        )) : <span className="text-xs text-muted-foreground">No observed data yet.</span>}
      </div>
    </div>
  );
}

function Metric({ label: name, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-xs text-muted-foreground">{name}</span><span className="text-lg font-black text-foreground">{value}</span></div>;
}

function AgentDetail({ events, showTokens, days }: { events: AgentUsageEvent[]; showTokens: boolean; days: number }) {
  const categories: Record<string, number> = {};
  const models: Record<string, number> = {};
  const projects = new Set<string>();
  const byDay = new Map<string, number>();
  let plans = 0;
  let completed = 0;
  let totalTokens = 0;

  for (const event of events) {
    const category = label(event.category);
    categories[category] = (categories[category] ?? 0) + 1;
    if (event.model) models[event.model] = (models[event.model] ?? 0) + 1;
    if (event.project_key) projects.add(event.project_key);
    if (event.plan_mode) plans += 1;
    if (event.status === "completed") completed += 1;
    totalTokens += tokens(event);
    if (event.started_at) {
      const day = event.started_at.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
  }

  const timeline = Array.from(byDay.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-14);
  const maxDay = Math.max(1, ...timeline.map(([, count]) => count));

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-2xl border-border/40 bg-background/20 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Agent profile</div>
            <h3 className="mt-1 text-lg font-black text-foreground">Usage signature</h3>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
            <div className="text-lg font-black text-emerald-300">{events.length}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-300/70">sessions</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniMetric label="Completed" value={`${completed}/${events.length}`} />
          <MiniMetric label="Plan mode" value={`${plans}`} />
          <MiniMetric label="Projects" value={`${projects.size}`} />
          <MiniMetric label="Tokens" value={showTokens ? totalTokens.toLocaleString() : "Hidden"} />
        </div>
        <div className="mt-6"><Breakdown title="Work categories" values={categories} tone="green" /></div>
        {Object.keys(models).length ? <div className="mt-6"><Breakdown title="Models" values={models} /></div> : null}
      </Card>

      <Card className="rounded-2xl border-border/40 bg-background/20 p-5">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Recent activity</div>
        <h3 className="mt-1 text-lg font-black text-foreground">Sessions by day</h3>
        {timeline.length ? (
          <div className="mt-6 flex h-28 items-end gap-1.5 border-b border-border/40">
            {timeline.map(([day, count]) => (
              <div key={day} className="group relative flex h-full flex-1 items-end" title={`${day}: ${count} sessions`}>
                <div className="w-full rounded-t-sm bg-emerald-400/75 group-hover:bg-emerald-300" style={{ height: `${Math.max(10, count / maxDay * 100)}%` }} />
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-border/50 bg-popover px-2 py-1 text-[9px] text-popover-foreground group-hover:block">{day} · {count}</div>
              </div>
            ))}
          </div>
        ) : <p className="mt-6 text-xs text-muted-foreground">No timestamped sessions in this window.</p>}
        <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground"><span>{timeline[0]?.[0] ?? `${days}d window`}</span><span>{timeline.at(-1)?.[0] ?? "—"}</span></div>
      </Card>
    </div>
  );
}

function MiniMetric({ label: name, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border/40 bg-muted/15 p-3"><div className="text-sm font-black text-foreground">{value}</div><div className="mt-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground">{name}</div></div>;
}

export function AgentUsageSummary({
  events,
  technologies,
  showTokens = true,
  days,
}: {
  events: AgentUsageEvent[];
  technologies: UsageTechnology[];
  showTokens?: boolean;
  days: number;
}) {
  const sources = [...new Set(events.map((event) => label(event.source)))].sort();
  const [selectedSource, setSelectedSource] = useState("all");
  const selectedEvents = selectedSource === "all" ? events : events.filter((event) => label(event.source) === selectedSource);
  const sourceCounts = events.reduce<Record<string, number>>((counts, event) => {
    const source = label(event.source);
    counts[source] = (counts[source] ?? 0) + 1;
    return counts;
  }, {});
  const categories = selectedEvents.reduce<Record<string, number>>((counts, event) => {
    const category = label(event.category);
    counts[category] = (counts[category] ?? 0) + 1;
    return counts;
  }, {});
  const totalTokens = selectedEvents.reduce((sum, event) => sum + tokens(event), 0);
  const plans = selectedEvents.filter((event) => event.plan_mode).length;
  const completed = selectedEvents.filter((event) => event.status === "completed").length;

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.6fr]">
      <Card className="rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Coding agents</div><h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">How the work is segmented</h2><p className="mt-1 text-xs text-muted-foreground">Switch agents to inspect their individual working signature.</p></div>
          <div className="rounded-2xl border border-border/40 bg-muted/20 px-3 py-2 text-right"><div className="text-xl font-black text-foreground">{selectedEvents.length}</div><div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">sessions</div></div>
        </div>
        <div className="mt-7 flex gap-2 overflow-x-auto border-b border-border/40 pb-3">
          {["all", ...sources].map((source) => (
            <button key={source} type="button" onClick={() => setSelectedSource(source)} className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${selectedSource === source ? "border-foreground bg-foreground text-background" : "border-border/40 bg-muted/20 text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>
              {source === "all" ? "All agents" : label(source)}{source !== "all" ? ` · ${sourceCounts[source] ?? 0}` : ` · ${events.length}`}
            </button>
          ))}
        </div>
        <AgentDetail events={selectedEvents} showTokens={showTokens} days={days} />
        {selectedSource === "all" ? <div className="mt-6"><Breakdown title="Work categories across all agents" values={categories} tone="green" /></div> : null}
      </Card>

      <Card className="rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Selected signal</div>
        <div className="mt-5 space-y-4">
          <Metric label="Completed sessions" value={`${completed}/${selectedEvents.length}`} />
          <Metric label="Plan-mode sessions" value={`${plans}`} />
          <Metric label="Window" value={`${days} days`} />
          {showTokens ? <Metric label="Tokens burned" value={totalTokens.toLocaleString()} /> : null}
        </div>
        <p className="mt-7 border-t border-border/30 pt-4 text-[10px] leading-relaxed text-muted-foreground">{showTokens ? "Token totals are provider metadata reported by supported agents." : "Token totals are hidden by this profile's privacy settings."}</p>
      </Card>

      <Card className="xl:col-span-2 rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="flex items-end justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Scraped from package manifests</div><h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Stack fingerprints</h2></div><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">metadata only</span></div>
        {technologies.length ? <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">{technologies.slice(0, 20).map((technology) => <div key={`${technology.ecosystem}:${technology.name}:${technology.version ?? ""}`} className="rounded-2xl border border-border/40 bg-background/30 p-4"><div className="truncate text-sm font-black text-foreground">{technology.name}</div><div className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{technology.ecosystem}{technology.version ? ` · ${technology.version}` : ""}</div>{technology.occurrence_count ? <div className="mt-2 text-[9px] text-muted-foreground">seen {technology.occurrence_count}×</div> : null}</div>)}</div> : <p className="mt-6 text-xs text-muted-foreground">Run <code className="rounded bg-muted px-1.5 py-0.5">aistack deepscan</code> to populate package.json fingerprints.</p>}
      </Card>
    </div>
  );
}
