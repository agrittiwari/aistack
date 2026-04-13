import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowUpRight, ArrowLeft, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEntities, getLayerBySlug } from "@/lib/server/entities";
import { getAllLayers as getLayers, getLayerBySlug as getLayerBySlugServer } from "@/lib/server/layers";
import { getIconByName } from "@/lib/icons";
import { ToolCard } from "@/components/cards/tool-card";

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
    title: `${layer.name} Layer - AiStack 2026`,
    description: layer.description || "",
  };
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
    </div>
  );
}

async function LayerContent({ layerSlug, search }: { layerSlug: string; search?: string }) {
  const [layer, entities] = await Promise.all([
    getLayerBySlugServer(layerSlug),
    getEntities({ layer: layerSlug, limit: 50 }),
  ]);

  if (!layer) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white">Layer not found</h1>
        <Link href="/">
          <Button className="mt-4">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const Icon = getIconByName(layer.icon_name || "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      <div className="lg:col-span-8">
        <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${layer.color_gradient || "from-gray-500 to-gray-400"} p-4 flex items-center justify-center text-black shadow-2xl mb-8`}>
          {Icon && <Icon size={32} strokeWidth={2.5} />}
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4">
          {layer.name}
        </h1>
        <p className="text-xl text-white/60 font-medium leading-relaxed mb-12">
          {layer.description}
        </p>

        {search && (
          <p className="text-sm text-white/40 mb-8">
            Showing results for "<span className="text-white">{search}</span>"
          </p>
        )}

        {entities.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-white/40 text-lg">No tools found</p>
            {search && (
              <Link href={`/${layerSlug}`}>
                <Button variant="outline" className="mt-4">
                  Clear search
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {entities.map((entity) => (
              <ToolCard
                key={entity.id}
                entity={entity as any}
              />
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
        <Card className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Search size={14} className="text-blue-500" /> Search {layer.name}
          </h3>
          <form method="get" action={`/${layerSlug}`}>
            <Input
              name="search"
              type="text"
              placeholder="Search tools..."
              defaultValue={search || ""}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
            />
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform text-6xl font-black">
            AI
          </div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 relative">
            Technical Audit
          </h4>
          <p className="text-xs text-white/40 leading-relaxed relative">
            Request a deep-dive architecture audit of this layer for your 2026 AI roadmap.
          </p>
          <Button variant="ghost" className="mt-6 text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all relative">
            Request Access <ArrowUpRight size={14} />
          </Button>
        </Card>
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
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
      <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-12 transition-colors">
        <ArrowLeft size={14} /> Back to Directory
      </Link>
      <Suspense fallback={<LoadingState />}>
        <LayerContent layerSlug={layerId} search={search} />
      </Suspense>
    </div>
  );
}