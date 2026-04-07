import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { ArrowUpRight, ArrowLeft, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTools, getLayerBySlug } from "@/lib/db/server-queries";
import { STACK_LAYERS } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ layerId: string }>;
}): Promise<Metadata> {
  const { layerId } = await params;
  const layerData = STACK_LAYERS.find((l) => l.slug === layerId);

  if (!layerData) {
    return { title: "Layer Not Found - AiStack" };
  }

  return {
    title: `${layerData.name} Layer - AiStack 2026`,
    description: layerData.desc,
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
  const layerData = STACK_LAYERS.find((l) => l.slug === layerSlug);
  const dbLayer = await getLayerBySlug(layerSlug);
  const toolsData = await getTools({ layerSlug, search, limit: 50 });

  if (!layerData) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white">Layer not found</h1>
        <Link href="/">
          <Button className="mt-4">Back to Directory</Button>
        </Link>
      </div>
    );
  }

  const layerTools = toolsData.data.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    layer: t.layer?.slug || "",
    status: t.status || "active",
    critical: t.critical_text || t.description || "",
    link: t.website_url || `/tool/${t.slug}`,
    year: t.year?.toString() || "2026",
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
      <div className="lg:col-span-8">
        <div
          className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${layerData.color} p-4 flex items-center justify-center text-black shadow-2xl mb-8`}
        >
          <span className="text-2xl font-black italic uppercase">
            {layerData.name[0]}
          </span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
          {dbLayer?.name || layerData.name}
        </h1>
        <p className="text-xl text-white/60 font-medium leading-relaxed mb-12">
          {dbLayer?.description || layerData.desc}
        </p>

        {search && (
          <p className="text-sm text-white/40 mb-8">
            Showing results for "<span className="text-white">{search}</span>"
          </p>
        )}

        {layerTools.length === 0 ? (
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
          <div className="bento-grid">
            {layerTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.link}
                className="bento-cell hover:bg-white/[0.02] group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors italic uppercase tracking-tighter">
                    {tool.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-bold text-blue-500/80 uppercase"
                  >
                    {tool.status}
                  </Badge>
                </div>
                <p className="text-sm text-white/50 line-clamp-2">
                  {tool.critical}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/30">{tool.year}</span>
                  <span className="text-[10px] text-white/40 group-hover:text-white transition-colors flex items-center gap-1">
                    View <ArrowUpRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
        <Card className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 italic">
            <Search size={14} className="text-blue-500" /> Search {dbLayer?.name}
          </h3>
          <form method="get" action={`/directory/${layerSlug}`}>
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
          <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform text-6xl font-black italic">
            AI
          </div>
          <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 italic relative">
            Technical Audit
          </h4>
          <p className="text-xs text-white/40 leading-relaxed relative">
            Request a deep-dive architecture audit of this layer for your 2026 AI roadmap.
          </p>
          <Button
            variant="ghost"
            className="mt-6 text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all relative"
          >
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
      <Link
        href="/"
        className="flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-12 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Directory
      </Link>

      <Suspense fallback={<LoadingState />}>
        <LayerContent layerSlug={layerId} search={search} />
      </Suspense>
    </div>
  );
}