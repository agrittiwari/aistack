import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPublicStackByHandle, getStackEntities } from "@/lib/server/stacks";
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
    const title = `${stack.name || `${profile.username}'s AI Stack`} - AiStack`;
    const description = stack.description || `Explore ${profile.username}'s curated AI stack.`;
    return {
      title,
      description,
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
  } catch {
    notFound();
  }

  const { profile, stack, matchedBy } = resolved!;
  if (matchedBy === "id" && profile.username && profile.username !== handle) {
    redirect(`/my-ai-stack/${profile.username}`);
  }
  if (!stack || !stack.entities_id || stack.entities_id.length === 0) {
    notFound();
  }

  const entities = await getStackEntities(stack.entities_id);
  if (entities.length === 0) notFound();

  const canonicalPath = `/my-ai-stack/${profile.username || profile.id}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const pageTitle = stack.name || `${profile.username}'s AI Stack`;

  // Best-effort viewer auth: used only to show a CTA, not to fetch data.
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
                Public Stack
              </div>
              <h1 className="mt-3 text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground leading-none">
                {pageTitle}
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
