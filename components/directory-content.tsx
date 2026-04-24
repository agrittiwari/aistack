"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { ToolCard } from "@/components/cards/tool-card";
import { FeaturedToolCard } from "@/components/cards/featured-tool-card";

type ToolCardEntity = React.ComponentProps<typeof ToolCard>["entity"];
type FeaturedToolCardEntity = React.ComponentProps<typeof FeaturedToolCard>["entity"];

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
  layer?: { slug?: string | null; name?: string | null; id?: number | null } | null;
  tags?: string[] | null;
  pricing_model?: string | null;
  pricing_notes?: string | null;
  redeem_url?: string | null;
  is_Dark_theme_logo?: boolean | null;
};

interface DirectoryContentProps {
  initialLayers: DirectoryLayer[];
  initialEntities: DirectoryEntity[];
  initialFeatured?: DirectoryEntity[];
  activeLayer: string;
  activeSearch: string;
}

function HeroSection({
  search,
  activeLayer,
}: {
  search: string;
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

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Build Your AI Stack
          </h1>
          <p className="text-muted-foreground mb-8">
            Discover AI tools, models, and agents across every stack layer. Curated for builders, explorers, and product teams who ship.
          </p>

          <form method="get" action="/" onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                type="text"
                name="search"
                placeholder="Search tools, models, frameworks..."
                defaultValue={search}
                className="w-full h-11 pl-10 pr-4 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-foreground/20"
              />
              {activeLayer !== "all" && (
                <input type="hidden" name="layer" value={activeLayer} />
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function DirectoryContent({
  initialLayers,
  initialEntities,
  initialFeatured = [],
  activeLayer,
  activeSearch,
}: DirectoryContentProps) {
  const [layers] = useState<DirectoryLayer[]>(initialLayers);
  const [entities] = useState<DirectoryEntity[]>(initialEntities);
  const [featuredEntities] = useState<DirectoryEntity[]>(initialFeatured);

  const activeLayerInfo = useMemo(() => {
    if (activeLayer === "all") return null;
    return layers.find((l) => l.slug === activeLayer) || null;
  }, [activeLayer, layers]);

  const showFeaturedSection = featuredEntities.length > 0 && !activeSearch && activeLayer === "all";

  return (
    <div className="min-h-screen pb-20">
      <HeroSection search={activeSearch} activeLayer={activeLayer} />

      <section>
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          {/* Layer Filter */}
          <div className="mb-8 pb-6 border-b border-border">
            <div className="flex flex-wrap gap-2">
              <Link href="/">
                <Badge
                  variant={activeLayer === "all" ? "default" : "secondary"}
                  className={`cursor-pointer px-3 py-1 text-xs font-normal ${
                    activeLayer === "all"
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  All
                </Badge>
              </Link>
              {layers.map((layer) => (
                <Link key={layer.id} href={`/${layer.slug}`}>
                  <Badge
                    variant={activeLayer === layer.slug ? "default" : "secondary"}
                    className={`cursor-pointer px-3 py-1 text-xs font-normal ${
                      activeLayer === layer.slug
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {layer.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Section */}
          {showFeaturedSection && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Featured
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredEntities.map((entity) => (
                  <FeaturedToolCard
                    key={String(entity.id)}
                    entity={entity as unknown as FeaturedToolCardEntity}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {activeSearch ? "Search Results" : activeLayerInfo?.name || "All Tools"}
              </h2>
              <span className="text-xs text-muted-foreground">
                {entities.length} {entities.length === 1 ? "tool" : "tools"}
              </span>
            </div>

            {entities.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-muted-foreground">No tools found</p>
                {activeSearch && (
                  <Link href="/" className="text-sm text-foreground hover:underline mt-2 inline-block">
                    Clear search
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entities.map((entity) => (
                  <ToolCard
                    key={String(entity.id)}
                    entity={entity as unknown as ToolCardEntity}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DirectoryContent;
