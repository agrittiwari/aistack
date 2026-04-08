"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavbarBadge } from "@/components/layout/navbar";
import { ToolCard } from "@/components/cards/tool-card";
import { STACK_LAYERS, type Tool, INITIAL_TOOLS } from "@/lib/data";

function LayerFilter({
  activeLayer,
  onSelect,
}: {
  activeLayer: string;
  onSelect: (layer: string) => void;
}) {
  return (
    <section className="sticky top-[72px] z-40 px-6 py-4 bg-[#050507]/80 backdrop-blur-md border-y border-white/5">
      <div className="max-w-7xl mx-auto overflow-x-auto no-scrollbar flex items-center gap-2">
        <Button
          variant={activeLayer === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect("all")}
          className={`whitespace-nowrap text-xs font-bold transition-all ${
            activeLayer === "all"
              ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
          }`}
        >
          All Layers
        </Button>
        {STACK_LAYERS.map((layer) => (
          <Button
            key={layer.id}
            variant={activeLayer === layer.slug ? "outline" : "ghost"}
            size="sm"
            onClick={() => onSelect(layer.slug)}
            className={`whitespace-nowrap text-xs font-bold transition-all border ${
              activeLayer === layer.slug
                ? "bg-white/10 border-white/20 text-white shadow-xl shadow-blue-500/5"
                : "border-transparent text-white/40 hover:text-white"
            }`}
          >
            {layer.name}
          </Button>
        ))}
      </div>
    </section>
  );
}

function HeroSection() {
  return (
    <header className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-7">
          <NavbarBadge />
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 uppercase">
            The Stack <br /> Is
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              Evolving.
            </span>
          </h1>
          <p className="max-w-lg text-lg text-white/50 leading-relaxed font-medium">
            Mapping the 8 fundamental layers of the AI era. We prioritize
            technical dominance over marketing fluff.
          </p>
        </div>

        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Real-Time Pulse
            </h3>
            <Link href="/pulse" className="text-white/20 hover:text-white transition-colors">
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            <p className="text-sm font-medium text-white/80 leading-tight mb-1">
              Database synced with real-time AI infrastructure updates
            </p>
            <span className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">
              Live
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function ToolsGrid({ tools }: { tools: Tool[] }) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="bento-grid">
        {tools.map((tool) => (
          <div key={tool.id} className="bento-cell">
            <ToolCard tool={tool} />
          </div>
        ))}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    </div>
  );
}

function DirectoryContent() {
  const [activeLayer, setActiveLayer] = useState("all");
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const layerParam = searchParams.get("layer");
    if (layerParam) setActiveLayer(layerParam);
  }, [searchParams]);

  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch("/api/tools");
        if (!res.ok) throw new Error("API failed");
        const data = await res.json();
        setTools(data.tools || data.data || []);
      } catch (e) {
        console.log("Using fallback data");
        setTools(INITIAL_TOOLS);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, [activeLayer]);

  const handleSelect = (layerSlug: string) => {
    setActiveLayer(layerSlug);
    const params = new URLSearchParams(searchParams.toString());
    if (layerSlug === "all") params.delete("layer");
    else params.set("layer", layerSlug);
    router.push(`?${params.toString()}`);
  };

  const filteredTools = useMemo(() => {
    if (activeLayer === "all") return tools;
    return tools.filter((t) => t.layer === activeLayer);
  }, [tools, activeLayer]);

  return (
    <>
      <LayerFilter activeLayer={activeLayer} onSelect={handleSelect} />
      {loading ? <LoadingState /> : <ToolsGrid tools={filteredTools} />}
    </>
  );
}

export default function DirectoryPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-[#e2e2e7] selection-bg-blue-500/30 animate-in fade-in duration-700">
      <HeroSection />
      <Suspense fallback={<LoadingState />}>
        <DirectoryContent />
      </Suspense>
    </div>
  );
}