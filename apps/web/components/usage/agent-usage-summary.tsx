import { Card } from "@/components/ui/card";

export type AgentUsageEvent = {
  source?: string | null;
  category?: string | null;
  status?: string | null;
  model?: string | null;
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
  const sources: Record<string, number> = {};
  const categories: Record<string, number> = {};
  const models: Record<string, number> = {};
  let plans = 0;
  let completed = 0;
  let totalTokens = 0;
  for (const event of events) {
    const source = label(event.source);
    const category = label(event.category);
    sources[source] = (sources[source] ?? 0) + 1;
    categories[category] = (categories[category] ?? 0) + 1;
    if (event.model) models[event.model] = (models[event.model] ?? 0) + 1;
    if (event.plan_mode) plans += 1;
    if (event.status === "completed") completed += 1;
    totalTokens += tokens(event);
  }

  return (
    <div className="mb-10 grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-4">
      <Card className="rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Agent usage</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">How the work is segmented</h2>
            <p className="mt-1 text-xs text-muted-foreground">Source and intent breakdown across the last {days} days.</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-muted/20 px-3 py-2 text-right">
            <div className="text-xl font-black text-foreground">{events.length}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">sessions</div>
          </div>
        </div>
        <div className="mt-7 space-y-6">
          <Breakdown title="Coding agents" values={sources} />
          <Breakdown title="Work categories" values={categories} tone="green" />
          {Object.keys(models).length ? <Breakdown title="Models observed" values={models} /> : null}
        </div>
      </Card>

      <Card className="rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Signal</div>
        <div className="mt-5 space-y-4">
          <Metric label="Completed sessions" value={`${completed}/${events.length}`} />
          <Metric label="Plan-mode sessions" value={`${plans}`} />
          <Metric label="Package fingerprints" value={`${technologies.length}`} />
          {showTokens ? <Metric label="Tokens burned" value={totalTokens.toLocaleString()} /> : null}
        </div>
        <p className="mt-7 border-t border-border/30 pt-4 text-[10px] leading-relaxed text-muted-foreground">
          {showTokens ? "Tokens come from provider metadata reported by each supported agent." : "Token totals are hidden by this profile's privacy settings."}
        </p>
      </Card>

      <Card className="xl:col-span-2 rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Scraped from package manifests</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Stack fingerprints</h2>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">metadata only</span>
        </div>
        {technologies.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {technologies.slice(0, 20).map((technology) => (
              <div key={`${technology.ecosystem}:${technology.name}:${technology.version ?? ""}`} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                <div className="truncate text-sm font-black text-foreground">{technology.name}</div>
                <div className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {technology.ecosystem}{technology.version ? ` · ${technology.version}` : ""}
                </div>
                {technology.occurrence_count ? <div className="mt-2 text-[9px] text-muted-foreground">seen {technology.occurrence_count}×</div> : null}
              </div>
            ))}
          </div>
        ) : <p className="mt-6 text-xs text-muted-foreground">Run <code className="rounded bg-muted px-1.5 py-0.5">aistack deepscan</code> to populate package.json fingerprints.</p>}
      </Card>
    </div>
  );
}

function Metric({ label: name, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-xs text-muted-foreground">{name}</span><span className="text-lg font-black text-foreground">{value}</span></div>;
}
