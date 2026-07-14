import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicStackByHandle, getPublicUsageByUserId, getStackEntities } from "@/lib/server/stacks";
import { Card } from "@/components/ui/card";
import { ShareActions } from "@/components/stack/share-actions";
import { StackEntityCard } from "@/components/stack/stack-entity-card";
import { EntityLogoFallback } from "@/lib/entity-logo";
import { DailyTokenUsage } from "@/components/usage/daily-token-usage";
import { Github, Globe, Linkedin } from "lucide-react";

function absoluteUrl(path: string) {
  const base =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  try {
    const { profile, stack } = await getPublicStackByHandle(handle);
    if (!stack) {
      return {
        title: `${profile.username} - AiStack`,
        description: "Public AI stack",
      };
    }

    const entities = stack.entities_id ? await getStackEntities(stack.entities_id) : [];
    const entityNames = entities.slice(0, 5).map((e) => e.name).join(", ");
    const layers = entities
      .filter((e) => e.layer)
      .map((e) => e.layer!.name)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)
      .join(", ");

    const title = stack.name
      ? `${stack.name} - ${profile.username}'s AI Stack`
      : `${profile.username}'s AI Stack`;

    const descriptionParts = [];
    if (layers) descriptionParts.push(`Layers: ${layers}`);
    if (entityNames) descriptionParts.push(`Tools: ${entityNames}`);
    const description =
      stack.description ||
      (descriptionParts.length > 0
        ? descriptionParts.join(" · ")
        : `Explore ${profile.username}'s curated AI stack.`);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      alternates: {
        canonical: `/my-ai-stack/${profile.username}`,
      },
    };
  } catch {
    return { title: "Stack Not Found - AiStack" };
  }
}

export default async function PublicStackByHandlePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let resolved;
  try {
    resolved = await getPublicStackByHandle(handle);
  } catch (err) {
    console.error("[my-ai-stack] getPublicStackByHandle error:", err);
    notFound();
  }

  const { profile, stack, matchedBy } = resolved!;
  if (matchedBy === "id" && profile.username && profile.username !== handle) {
    redirect(`/my-ai-stack/${profile.username}`);
  }

  if (!stack) {
    notFound();
  }

  if (!stack.is_public) {
    notFound();
  }

  if (!stack.entities_id || stack.entities_id.length === 0) {
    notFound();
  }

  const entities = await getStackEntities(stack.entities_id);
  const usage = await getPublicUsageByUserId(profile.id);

  const entityNotes = (stack.entity_notes as Record<string, string>) || {};

  const canonicalPath = `/my-ai-stack/${profile.username || profile.id}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const pageTitle = stack.name || `${profile.username}'s AI Stack`;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const isViewerLoggedIn = Boolean(auth?.user);

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex flex-col gap-6">
        <Card className="bg-card/20 border-border/40 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                Here is
              </div>
              <h1 className="mt-3 text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-none">
                My AI Stack
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                {stack.description || "Curated AI tools and platforms used in the wild."}
              </p>
              <div className="mt-4 flex items-center gap-3">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    className="w-10 h-10 rounded-full object-cover border border-border/40"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted/30 border border-border/40 flex items-center justify-center text-foreground font-black">
                    {(profile.full_name || profile.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-black text-foreground truncate">
                    {profile.full_name || profile.username}
                  </div>
                  {profile.headline ? (
                    <div className="text-xs text-muted-foreground truncate">{profile.headline}</div>
                  ) : null}
                </div>
              </div>

              {(profile.github_handle || profile.twitter_handle || profile.website_url) && (
                <div className="mt-3 flex items-center gap-2">
                  {profile.github_handle && (
                    <a
                      href={`https://github.com/${profile.github_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  {profile.twitter_handle && (
                    <a
                      href={`https://x.com/${profile.twitter_handle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                  )}
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Globe size={14} />
                    </a>
                  )}
                  <a
                    href={`https://www.linkedin.com/in/${profile.full_name?.toLowerCase().replace(/\s+/g, "-") || profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md bg-muted/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Linkedin size={14} />
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <ShareActions canonicalUrl={canonicalUrl} title={pageTitle} />
              {!isViewerLoggedIn ? (
                <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Join community to build your stack
                </Link>
              ) : (
                <Link href="/my-stack" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Build your stack
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>

      <section>
        {usage ? (
          <>
            <DailyTokenUsage events={usage.events} days={usage.days} showTokens={usage.show_tokens} />
            <PublicActivity usage={usage} />
          </>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {entities.map((e) => (
            <StackEntityCard key={e.id} entity={e} note={entityNotes[e.id]} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PublicActivity({ usage }: { usage: NonNullable<Awaited<ReturnType<typeof getPublicUsageByUserId>>> }) {
  const eventsByDay = new Map<string, number>();
  for (const event of usage.events) {
    if (!event.started_at) continue;
    const day = event.started_at.slice(0, 10);
    eventsByDay.set(day, (eventsByDay.get(day) ?? 0) + 1);
  }
  const today = new Date();
  const days = Array.from({ length: usage.days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (usage.days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return { key, count: eventsByDay.get(key) ?? 0 };
  });
  const sourceCounts = usage.events.reduce<Record<string, number>>((counts, event) => {
    counts[event.source] = (counts[event.source] ?? 0) + 1;
    return counts;
  }, {});
  const categoryCounts = usage.events.reduce<Record<string, number>>((counts, event) => {
    counts[event.category] = (counts[event.category] ?? 0) + 1;
    return counts;
  }, {});
  const totalTokens = usage.events.reduce((total, event) => total + (event.total_tokens ?? ((event.input_tokens ?? 0) + (event.output_tokens ?? 0) + (event.cached_tokens ?? 0))), 0);
  const totalRuns = usage.events.length;
  const completedRuns = usage.events.filter((event) => event.status === "completed").length;
  const maxDay = Math.max(1, ...days.map((day) => day.count));

  return (
    <div className="mb-10 grid grid-cols-1 xl:grid-cols-[1.4fr_0.6fr] gap-4">
      <Card className="rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Agent activity</div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">How they build</h2>
            <p className="mt-1 text-xs text-muted-foreground">A {usage.days}-day view of recorded coding-agent work.</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-muted/20 px-3 py-2 text-right">
            <div className="text-xl font-black text-foreground">{totalRuns}</div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">runs</div>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-7 sm:grid-cols-10 md:grid-cols-15 gap-1.5">
          {days.map((day) => {
            const intensity = day.count === 0 ? "bg-muted/20" : day.count / maxDay > 0.66 ? "bg-emerald-400" : day.count / maxDay > 0.33 ? "bg-emerald-400/60" : "bg-emerald-400/30";
            return <div key={day.key} title={`${day.key}: ${day.count} runs`} className={`aspect-square rounded-sm ${intensity}`} />;
          })}
        </div>
        <div className="mt-3 flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground"><span>{days[0]?.key}</span><span>{days.at(-1)?.key}</span></div>
        <div className="mt-7 flex flex-wrap gap-2">
          {Object.entries(sourceCounts).map(([source, count]) => <span key={source} className="rounded-full border border-border/40 bg-muted/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">{source.replaceAll("_", " ")} · {count}</span>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(categoryCounts).map(([category, count]) => <span key={category} className="rounded-full border border-border/40 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-300">{category} · {count}</span>)}
        </div>
      </Card>

      <Card className="rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">Signal</div>
        <div className="mt-5 space-y-4">
          <Metric label="Completed runs" value={`${completedRuns}/${totalRuns}`} />
          <Metric label="Active days" value={`${eventsByDay.size}`} />
          <Metric label="Tracked tools" value={`${usage.technologies.length}`} />
          {usage.show_tokens ? <Metric label="Tokens burned" value={totalTokens.toLocaleString()} /> : null}
        </div>
        <p className="mt-7 border-t border-border/30 pt-4 text-[10px] leading-relaxed text-muted-foreground">Activity is based on connected sources and may not represent every agent session. {usage.show_tokens ? "Token totals are based on reported provider metadata." : "Token totals are hidden by this profile."}</p>
      </Card>

      {usage.technologies.length > 0 ? <Card className="xl:col-span-2 rounded-3xl border-border/40 bg-card/20 p-6 md:p-8">
        <div className="flex items-end justify-between gap-4"><div><div className="text-[10px] font-black uppercase tracking-[0.35em] text-muted-foreground">From CLI scans</div><h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">Stack fingerprints</h2></div><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">metadata only</span></div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">{usage.technologies.slice(0, 20).map((technology) => <div key={`${technology.ecosystem}:${technology.name}`} className="rounded-2xl border border-border/40 bg-background/30 p-4"><div className="truncate text-sm font-black text-foreground">{technology.name}</div><div className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{technology.ecosystem}{technology.version ? ` · ${technology.version}` : ""}</div></div>)}</div>
      </Card> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-xs text-muted-foreground">{label}</span><span className="text-lg font-black text-foreground">{value}</span></div>;
}
