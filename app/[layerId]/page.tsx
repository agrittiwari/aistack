import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEntities, getLayerBySlug } from "@/lib/server/entities";
import { getLayerBySlug as getLayerBySlugServer } from "@/lib/server/layers";
import { getIconByName } from "@/lib/icons";
import { ToolCard } from "@/components/cards/tool-card";

type ToolCardEntity = React.ComponentProps<typeof ToolCard>["entity"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ layerId: string }>;
}): Promise<Metadata> {
  const { layerId } = await params;
  const layer = await getLayerBySlug(layerId);

  if (!layer) {
    return { title: "Layer Not Found - AiStack" };
  }

  return {
    title: `${layer.name} - AiStack`,
    description: layer.description || ``,
  };
}

async function LayerContent({ layerSlug, search }: { layerSlug: string; search?: string }) {
  const [layer, entities] = await Promise.all([
    getLayerBySlugServer(layerSlug),
    getEntities({ layer: layerSlug, limit: 50 }),
  ]);

  if (!layer) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl font-semibold mb-2">Layer not found</h1>
          <p className="text-muted-foreground text-sm mb-6">
            The layer you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button variant="outline" size="sm">Back to Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getIconByName(layer.icon_name || "");

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Back
      </Link>

      {/* Layer Header */}
      <div className="mb-8 pb-8 border-b border-border">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Icon size={24} className="text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 text-xs">
              Layer
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {layer.name}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              {layer.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {search && (
            <p className="text-xs text-muted-foreground mb-4">
              Results for <span className="font-medium text-foreground">&quot;{search}&quot;</span>
            </p>
          )}

          {entities.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-muted-foreground text-sm">No tools found</p>
              {search && (
                <Link href={`/${layerSlug}`}>
                  <Button variant="outline" size="sm" className="mt-3">Clear search</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entities.map((entity) => (
                <ToolCard
                  key={entity.id}
                  entity={entity as unknown as ToolCardEntity}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Search size={14} />
                Search
              </h3>
              <form method="get" action={`/${layerSlug}`}>
                <Input
                  name="search"
                  type="text"
                  placeholder="Search tools..."
                  defaultValue={search || ""}
                  className="h-9 text-sm bg-background"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function LayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ layerId: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { layerId } = await params;
  const { search } = await searchParams;

  return (
    <div className="animate-in fade-in duration-300">
      <Suspense>
        <LayerContent layerSlug={layerId} search={search} />
      </Suspense>
    </div>
  );
}
