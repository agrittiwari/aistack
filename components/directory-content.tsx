"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NavbarBadge } from "@/components/layout/navbar";
import { LoadingState } from "@/components/loading-state";
import { ToolCard } from "@/components/cards/tool-card";

type ToolCardEntity = React.ComponentProps<typeof ToolCard>["entity"];

type DirectoryLayer = {
  id: string;
  slug: string;
  name: string;
  rank: number;
  iconName?: string | null;
  color?: string | null;
};

type DirectoryEntity = {
  id: string | number;
  name: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  type?: string | null;
  website_url?: string | null;
  github_url?: string | null;
  logo_url?: string | null;
  svg?: string | null;
  company_name?: string | null;
  company_logo_char?: string | null;
  license?: string | null;
  star_count?: number | null;
  is_featured?: boolean | null;
  verified_node?: boolean | null;
  layer?: { slug?: string | null; name?: string | null; id?: number | null; description?: string | null } | null;
  tags?: string[] | null;
  pricing_model?: string | null;
  pricing_notes?: string | null;
};

function HeroSection({
  search,
  layers,
  activeLayer,
}: {
  search: string;
  layers: DirectoryLayer[];
  activeLayer: string;
}) {
  const router = useRouter();
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search") as string;
    const params = new URLSearchParams();
    if (activeLayer !== "all") params.set("layer", activeLayer);
    if (searchValue.trim()) params.set("search", searchValue.trim());
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const handleLayerClick = (layerSlug: string) => {
    const params = new URLSearchParams();
    if (layerSlug !== "all") params.set("layer", layerSlug);
    if (search.trim()) params.set("search", search.trim());
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  return (
    <header className="pt-24 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <NavbarBadge />
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.95] tracking-tighter mb-4 uppercase">
            Grow Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              AI Stack
            </span>
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-white/50 leading-relaxed font-medium mb-7">
            Curated list of AI stack layers.
          </p>

          <div className="w-full max-w-2xl">
            <form method="get" action="/" onSubmit={handleSearchSubmit}>
              <div className="relative group">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors"
                  size={16}
                />
                <Input
                  type="text"
                  name="search"
                  placeholder="Search tools, stacks, entities..."
                  defaultValue={search}
                  className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-2xl"
                />
                {activeLayer !== "all" && (
                  <input type="hidden" name="layer" value={activeLayer} />
                )}
              </div>
            </form>
          </div>

          
        </div>
      </div>
    </header>
  );
}

interface DirectoryContentProps {
  initialLayers: DirectoryLayer[];
  initialEntities: DirectoryEntity[];
  initialFeatured?: DirectoryEntity[];
  activeLayer: string;
  activeSearch: string;
}

function DirectoryContent({ initialLayers, initialEntities, initialFeatured = [], activeLayer, activeSearch }: DirectoryContentProps) {
  const [layers] = useState<DirectoryLayer[]>(initialLayers);
  const [entities] = useState<DirectoryEntity[]>(initialEntities);
  const [featuredEntities] = useState<DirectoryEntity[]>(initialFeatured);

  const activeLayerInfo = useMemo(() => {
    if (activeLayer === "all") return null;
    return layers.find((l) => l.slug === activeLayer) || null;
  }, [activeLayer, layers]);

  const showFeaturedSection = featuredEntities.length > 0;

  return (
    <>
      <HeroSection 
        search={activeSearch} 
        layers={layers}
        activeLayer={activeLayer}
      />

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-9 lg:divide-x lg:divide-white/10">
            <main className="lg:col-span-9 py-10 lg:py-14 lg:px-10">
              {showFeaturedSection ? (
                <div className="mb-14">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                        Featured Entities
                      </h2>
                      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80">
                        {activeLayer === "all" ? "All Layers" : activeLayerInfo?.name || activeLayer}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {featuredEntities.map((entity) => (
                      <ToolCard
                        key={String(entity.id)}
                        entity={entity as unknown as ToolCardEntity}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                      {activeSearch ? "Search Results" : "AI Tools, Agents & Artifacts"}
                    </h2>
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80">
                      {activeLayer === "all" ? "All Layers" : activeLayerInfo?.name || activeLayer}
                    </div>
                  </div>

                  {activeSearch.trim() ? (
                    <div className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-white/25">
                      Searching:{" "}
                      <span className="text-white/60">{activeSearch.trim()}</span>
                    </div>
                  ) : null}
                </div>

                {entities.length === 0 ? (
                  <Card className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
                    <div className="text-white/60 text-sm font-medium mb-2">
                      No entities found.
                    </div>
                    <div className="text-white/35 text-xs font-medium">
                      Try a different layer or search term.
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {entities.map((entity) => (
                      <ToolCard
                        key={String(entity.id)}
                        entity={entity as unknown as ToolCardEntity}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </section>
    </>
  );
}

export default DirectoryContent;