import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicStackById, getStackEntities } from "@/lib/server/stacks";
import { Card } from "@/components/ui/card";
import { ShareActions } from "@/components/stack/share-actions";
import { StackEntityCard } from "@/components/stack/stack-entity-card";

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
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const stack = await getPublicStackById(id);
  if (!stack) return { title: "Stack Not Found - AiStack" };

  const profile = stack.profile;
  const canonical = profile?.username ? `/my-ai-stack/${profile.username}` : undefined;
  const title = `${stack.name || "AI Stack"} - AiStack`;
  const description = stack.description || "Public AI stack";

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
  };
}

export default async function PublicStackByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stack = await getPublicStackById(id);
  if (!stack || !stack.entities_id || stack.entities_id.length === 0) notFound();

  const entities = await getStackEntities(stack.entities_id);
  if (entities.length === 0) notFound();

  const profile = stack.profile;
  const canonicalPath =
    profile?.username ? `/my-ai-stack/${profile.username}` : `/stack/${stack.id}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const pageTitle = stack.name || `${profile?.username || "Community"} AI Stack`;

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex flex-col gap-6">
        <Card className="bg-card/20 border-border/40 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                Public Stack
              </div>
              <h1 className="mt-3 text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-none">
                {pageTitle}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                {stack.description || "Curated AI tools and platforms used in the wild."}
              </p>
              {profile ? (
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
              ) : null}
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <ShareActions canonicalUrl={canonicalUrl} title={pageTitle} />
              {profile?.username ? (
                <a href={`/my-ai-stack/${profile.username}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  View canonical link
                </a>
              ) : null}
            </div>
          </div>
        </Card>
      </div>

      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            Entities ({entities.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {entities.map((e) => (
            <StackEntityCard key={e.id} entity={e} />
          ))}
        </div>
      </section>
    </div>
  );
}

