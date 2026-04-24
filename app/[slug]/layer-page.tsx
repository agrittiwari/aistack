import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/cards/tool-card";
import { UserCard } from "@/components/cards/user-card";
import { getLayerBySlug, getUsersByLayer } from "@/lib/server/layers";
import { getLayerEntities } from "@/lib/server/entities";

type ToolCardEntity = React.ComponentProps<typeof ToolCard>["entity"];

interface LayerPageProps {
  slug: string;
  search?: string;
}

export async function LayerPage({ slug, search }: LayerPageProps) {
  const [layer, entities, users] = await Promise.all([
    getLayerBySlug(slug),
    getLayerEntities(slug),
    getUsersByLayer(slug),
  ]);

  if (!layer) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-20">
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Directory
          </Link>

          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="text-xs">
                Layer
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              {layer.name}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              {layer.description}
            </p>
          </div>
        </div>
      </section>

      <section className="pt-8 md:pt-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-12">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Tools in this layer
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {entities.length} {entities.length === 1 ? "tool" : "tools"}
                  </span>
                </div>

                {search && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Results for <span className="font-medium text-foreground">&quot;{search}&quot;</span>
                  </p>
                )}

                {entities.length === 0 ? (
                  <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-muted-foreground text-sm">No tools found</p>
                    {search && (
                      <Link href={`/${slug}`}>
                        <Button variant="outline" size="sm" className="mt-3">Clear search</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entities.map((item) => (
                      <ToolCard
                        key={item.id}
                        entity={{
                          ...item,
                          layer: item.layer ?? undefined,
                          tags: item.tags,
                          pricing_model: item.pricing_model,
                        } as unknown as ToolCardEntity}
                      />
                    ))}
                  </div>
                )}
              </div>

              {users.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Users size={14} />
                      Builders using this layer
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {users.length} {users.length === 1 ? "builder" : "builders"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <Search size={14} />
                    Search
                  </h3>
                  <form method="get" action={`/${slug}`}>
                    <Input
                      name="search"
                      type="text"
                      placeholder="Search tools..."
                      defaultValue={search || ""}
                      className="h-9 text-sm bg-background"
                    />
                  </form>
                </div>

                {users.length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <Users size={14} />
                      Builders
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {users.length} {users.length === 1 ? "builder" : "builders"} have tools from this layer in their public stack.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
