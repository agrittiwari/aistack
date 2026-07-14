import { Card } from "@/components/ui/card";

export type DailyUsageEvent = {
  started_at: string | null;
  ended_at?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cached_tokens?: number | null;
  total_tokens?: number | null;
  source?: string | null;
};

function eventTokens(event: DailyUsageEvent) {
  return event.total_tokens ??
    (event.input_tokens ?? 0) + (event.output_tokens ?? 0) + (event.cached_tokens ?? 0);
}

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString();
}

export function DailyTokenUsage({
  events,
  days = 30,
  showTokens = true,
}: {
  events: DailyUsageEvent[];
  days?: number;
  showTokens?: boolean;
}) {
  const byDay = new Map<string, { tokens: number; runs: number; minutes: number }>();
  for (const event of events) {
    if (!event.started_at) continue;
    const key = event.started_at.slice(0, 10);
    const day = byDay.get(key) ?? { tokens: 0, runs: 0, minutes: 0 };
    day.tokens += eventTokens(event);
    day.runs += 1;
    if (event.ended_at) {
      const minutes = (Date.parse(event.ended_at) - Date.parse(event.started_at)) / 60000;
      if (Number.isFinite(minutes) && minutes > 0 && minutes < 24 * 60) day.minutes += minutes;
    }
    byDay.set(key, day);
  }

  const today = new Date();
  const timeline = Array.from({ length: Math.max(1, days) }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (Math.max(1, days) - index - 1));
    const key = date.toISOString().slice(0, 10);
    return { key, ...(byDay.get(key) ?? { tokens: 0, runs: 0, minutes: 0 }) };
  });
  const maxTokens = Math.max(1, ...timeline.map((day) => day.tokens));
  const totalTokens = timeline.reduce((sum, day) => sum + day.tokens, 0);
  const totalMinutes = timeline.reduce((sum, day) => sum + day.minutes, 0);
  const activeDays = timeline.filter((day) => day.runs > 0).length;

  return (
    <Card className="mb-8 rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Coding agent usage</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Daily token timeline</h2>
          <p className="mt-1 text-xs text-muted-foreground">{days}-day view of recorded agent sessions and token burn.</p>
        </div>
        <div className="flex gap-5 text-right">
          <div><div className="text-xl font-black text-foreground">{showTokens ? formatTokens(totalTokens) : "—"}</div><div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">tokens</div></div>
          <div><div className="text-xl font-black text-foreground">{activeDays}</div><div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">active days</div></div>
          <div><div className="text-xl font-black text-foreground">{Math.round(totalMinutes)}m</div><div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">tracked time</div></div>
        </div>
      </div>

      <div className="mt-8 flex h-44 items-end gap-1 border-b border-border/40 pb-0 sm:gap-1.5">
        {timeline.map((day) => {
          const height = day.tokens > 0 ? Math.max(8, (day.tokens / maxTokens) * 100) : 3;
          return (
            <div key={day.key} className="group relative flex h-full flex-1 items-end" title={`${day.key}: ${showTokens ? `${day.tokens.toLocaleString()} tokens, ` : ""}${day.runs} runs`}>
              <div className={`w-full rounded-t-sm transition-all group-hover:bg-emerald-300 ${day.tokens > 0 ? "bg-emerald-400/75" : "bg-muted/30"}`} style={{ height: `${height}%` }} />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/50 bg-popover px-2.5 py-1.5 text-[10px] text-popover-foreground shadow-lg group-hover:block">
                {day.key} · {showTokens ? `${day.tokens.toLocaleString()} tokens · ` : ""}{day.runs} runs
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        <span>{timeline[0]?.key}</span><span>{timeline.at(-1)?.key}</span>
      </div>
      {!showTokens ? <p className="mt-4 text-[10px] text-muted-foreground">Token totals are hidden by this profile&apos;s privacy settings.</p> : null}
    </Card>
  );
}
