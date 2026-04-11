"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavbarBadge } from "@/components/layout/navbar";
import { LoadingState } from "@/components/loading-state";
import { getIconByName } from "@/lib/icons";
import { createClient } from "@/lib/supabase/client";

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
  tagline?: string | null;
  description?: string | null;
  type?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
  company_name?: string | null;
  company_logo_char?: string | null;
  layer?: { slug?: string | null; name?: string | null; id?: number | null } | null;
};

type PublicStack = {
  id: string;
  name: string | null;
  description: string | null;
  view_count: number | null;
  updated_at: string | null;
  entities_id: string[] | null;
  card_theme_color: string | null;
  user_id: string | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    username: string | null;
  } | null;
};

function LayerPillButton({
  active,
  label,
  onClick,
  iconName,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  iconName?: string | null;
}) {
  const Icon = iconName ? getIconByName(iconName) : null;
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={[
        "w-full justify-start rounded-full px-4 py-6 transition-all border",
        active
          ? "bg-white text-black border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.25)]"
          : "bg-transparent text-white/70 border-white/10 hover:border-white/30 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span
        className={[
          "w-8 h-8 rounded-full flex items-center justify-center border shrink-0",
          active ? "bg-black/5 border-black/10" : "bg-white/5 border-white/10",
        ].join(" ")}
      >
        {Icon ? (
          <Icon
            size={14}
            strokeWidth={2.5}
            className={active ? "text-black" : "text-white/60"}
          />
        ) : (
          <span className={active ? "text-black" : "text-white/60"}>•</span>
        )}
      </span>
      <span className="text-xs font-black uppercase tracking-widest truncate">
        {label}
      </span>
    </Button>
  );
}

function HeroSection({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (next: string) => void;
}) {
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
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <Input
                type="text"
                placeholder="Search tools, stacks, entities..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function EntityCard({
  entity,
  layerBySlug,
}: {
  entity: DirectoryEntity;
  layerBySlug: Map<string, DirectoryLayer>;
}) {
  const layerSlug = entity.layer?.slug || "";
  const layerInfo = layerBySlug.get(layerSlug) || null;
  const gradient =
    layerInfo?.color || "from-gray-500 to-gray-400";
  const subtitle = (entity.tagline || entity.description || "").trim();
  const entityName = entity.name || "";

  const card = (
    <Card className="bg-[#050507] border-white/10 p-6 hover:bg-[#08080c] transition-colors group relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div
            className={[
              "w-10 h-10 rounded-xl bg-gradient-to-br",
              gradient,
              "p-2 flex items-center justify-center text-black shadow-lg",
            ].join(" ")}
          >
            {entity.logo_url ? (
              <img
                src={entity.logo_url}
                alt={entityName}
                className="w-6 h-6 rounded-md object-cover"
              />
            ) : entity.company_logo_char ? (
              <span className="font-black text-sm">{entity.company_logo_char.trim()}</span>
            ) : (
              <span className="font-black">{entityName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {entity.type ? (
            <Badge className="text-[9px] font-bold uppercase tracking-widest bg-white/10 text-white/60 border-white/10">
              {entity.type}
            </Badge>
          ) : null}
        </div>

        <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tighter leading-tight mb-2">
          {entityName}
        </h4>
        {subtitle ? (
          <p className="text-xs text-white/45 leading-relaxed line-clamp-3 font-medium">
            {subtitle}
          </p>
        ) : (
          <p className="text-xs text-white/25 leading-relaxed font-medium">
            No description available.
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.35em]">
            {layerInfo?.name || "Entity"}
          </span>
          {entity.website_url ? (
            <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 group-hover:text-blue-400 transition-colors">
              Visit <ArrowUpRight size={12} />
            </span>
          ) : (
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
              Unlinked
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  return entity.website_url ? (
    <Link
      href={entity.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {card}
    </Link>
  ) : (
    card
  );
}

function StackCard({
  stack,
  entityById,
}: {
  stack: PublicStack;
  entityById: Map<string, DirectoryEntity>;
}) {
  const entityIds = stack.entities_id ?? [];
  const previewIds = entityIds.slice(0, 3);
  const profile = stack.profile;
  const displayName =
    stack.name?.trim() ||
    (profile?.username ? `${profile.username}'s stack` : "Community Stack");
  const description = (stack.description || "").trim();

  return (
    <Card className="bg-[#050507] border-white/10 p-6 hover:bg-[#08080c] transition-colors rounded-2xl relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-0.5 opacity-60"
        style={{ backgroundColor: stack.card_theme_color || "#3b82f6" }}
      />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-tight truncate">
            {displayName}
          </h4>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center text-[10px] font-black text-white/60">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {(profile?.full_name || profile?.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60 truncate">
                {profile?.full_name || profile?.username || "Anonymous"}
              </div>
              {profile?.headline ? (
                <div className="text-[10px] text-white/25 truncate">
                  {profile.headline}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">
            {entityIds.length} Entities
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1">
            {(stack.view_count || 0).toLocaleString()} views
          </div>
        </div>
      </div>

      {description ? (
        <p className="text-xs text-white/45 leading-relaxed font-medium line-clamp-3 mb-5">
          {description}
        </p>
      ) : (
        <p className="text-xs text-white/25 leading-relaxed font-medium mb-5">
          A public stack shared by the community.
        </p>
      )}

      {previewIds.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.35em] mb-3">
            Preview
          </div>
          <div className="space-y-2">
            {previewIds.map((id) => {
              const entity = entityById.get(String(id));
              return (
                <div key={id} className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden text-[10px] font-black text-white/40 shrink-0">
                    {entity?.logo_url ? (
                      <img
                        src={entity.logo_url}
                        alt={entity.name}
                        className="w-full h-full object-cover"
                      />
                    ) : entity?.company_logo_char ? (
                      <span className="text-[8px]">{entity.company_logo_char.trim()}</span>
                    ) : (
                      <span>{(entity?.name || "?").charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="text-xs text-white/55 truncate font-medium">
                    {entity?.name || "Unknown entity"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

interface DirectoryContentProps {
  initialLayers: DirectoryLayer[];
  initialEntities: DirectoryEntity[];
}

function DirectoryContent({ initialLayers, initialEntities }: DirectoryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLayer, setActiveLayer] = useState(() => searchParams.get("layer") || "all");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");

  useEffect(() => {
    const layerParam = searchParams.get("layer") || "all";
    const searchParam = searchParams.get("search") || "";
    setActiveLayer(layerParam);
    setSearch(searchParam);
  }, [searchParams]);

  useEffect(() => {
    const currentLayer = searchParams.get("layer") || "all";
    const currentSearch = searchParams.get("search") || "";
    if (currentLayer === activeLayer && currentSearch === search) return;

    const params = new URLSearchParams(searchParams.toString());
    if (activeLayer === "all") params.delete("layer");
    else params.set("layer", activeLayer);

    if (!search) params.delete("search");
    else params.set("search", search);

    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }, [activeLayer, router, search, searchParams]);

  const [layers] = useState<DirectoryLayer[]>(initialLayers);
  const [entities, setEntities] = useState<DirectoryEntity[]>(initialEntities);
  const [entitiesLoading, setEntitiesLoading] = useState(false);
  const [stacks, setStacks] = useState<PublicStack[]>([]);
  const [stacksLoading, setStacksLoading] = useState(true);

  useEffect(() => {
    let done = false;

    async function fetchEntities() {
      setEntitiesLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeLayer !== "all") params.set("layer", activeLayer);
        if (search.trim()) params.set("search", search.trim());
        params.set("limit", "24");

        const qs = params.toString();
        const res = await fetch(`/api/entities${qs ? `?${qs}` : ""}`);
        if (!res.ok) throw new Error("Entities API failed");
        const data = await res.json();
        
        const rawEntities = data.entities || [];
        const nextEntities: DirectoryEntity[] = rawEntities.map((item: any) => ({
          id: item.entity?.id || item.id,
          name: item.entity?.name || item.name || "",
          tagline: item.entity?.tagline || item.tagline,
          description: item.entity?.description || item.description,
          type: item.entity?.type || item.type,
          website_url: item.entity?.website_url || item.website_url,
          logo_url: item.entity?.logo_url || item.logo_url,
          company_name: item.entity?.company_name || item.company_name,
          company_logo_char: item.entity?.company_logo_char || item.company_logo_char,
          layer: item.layer || item.entity?.layer,
        }));
        
        if (!done) setEntities(nextEntities);
      } catch {
        if (!done) setEntities([]);
      } finally {
        if (!done) setEntitiesLoading(false);
      }
    }

    fetchEntities();
    return () => {
      done = true;
    };
  }, [activeLayer, search]);

  useEffect(() => {
    let done = false;

    async function fetchStacks() {
      setStacksLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_stacks")
          .select(
            "id, name, description, view_count, updated_at, entities_id, card_theme_color, user_id, profile:profiles(full_name, avatar_url, headline, username)",
          )
          .eq("is_public", true)
          .order("view_count", { ascending: false })
          .order("updated_at", { ascending: false })
          .limit(12);

        if (error) throw error;
        if (!done) setStacks((data || []) as unknown as PublicStack[]);
      } catch {
        if (!done) setStacks([]);
      } finally {
        if (!done) setStacksLoading(false);
      }
    }

    fetchStacks();
    return () => {
      done = true;
    };
  }, []);

  const activeLayerInfo = useMemo(() => {
    if (activeLayer === "all") return null;
    return layers.find((l) => l.slug === activeLayer) || null;
  }, [activeLayer, layers]);

  const layerBySlug = useMemo(() => {
    const map = new Map<string, DirectoryLayer>();
    for (const layer of layers) {
      map.set(layer.slug, layer);
    }
    return map;
  }, [layers]);

  const entityById = useMemo(() => {
    const map = new Map<string, DirectoryEntity>();
    for (const entity of entities) {
      map.set(String(entity.id), entity);
    }
    return map;
  }, [entities]);

  const filteredStacks = useMemo(() => {
    const q = search.trim().toLowerCase();
    const layerEntityIds = new Set(entities.map((e) => String(e.id)));
    
    return stacks.filter((stack) => {
      const ids = (stack.entities_id || []).map(String);

      if (activeLayer !== "all") {
        if (!ids.some((id) => layerEntityIds.has(id))) return false;
      }

      if (!q) return true;

      const haystack = [
        stack.name || "",
        stack.description || "",
        stack.profile?.full_name || "",
        stack.profile?.username || "",
      ]
        .join(" ")
        .toLowerCase();

      if (haystack.includes(q)) return true;
      for (const id of ids) {
        const entity = entityById.get(id);
        if (entity?.name && entity.name.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [activeLayer, entityById, search, stacks, entities]);

  const featuredStacks = useMemo(() => filteredStacks.slice(0, 3), [filteredStacks]);
  const showFeaturedSection = stacksLoading || featuredStacks.length > 0;

  return (
    <>
      <HeroSection search={search} onSearchChange={setSearch} />

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto border-t border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-9 lg:divide-x lg:divide-white/10">
            <aside className="lg:col-span-2 py-10 lg:py-14 lg:px-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">
                  AI Stack Layers
                </h2>
              </div>

              <div className="lg:hidden overflow-x-auto no-scrollbar -mx-2 px-2">
                <div className="flex items-center gap-2 min-w-max">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveLayer("all")}
                    className={[
                      "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all",
                      activeLayer === "all"
                        ? "bg-white text-black border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                        : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    All
                  </Button>
                  {layers.map((layer) => (
                    <Button
                      key={layer.id}
                      variant="ghost"
                      onClick={() => setActiveLayer(layer.slug)}
                      className={[
                        "rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                        activeLayer === layer.slug
                          ? "bg-white text-black border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                          : "bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                    >
                      {layer.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block space-y-2">
                <LayerPillButton
                  active={activeLayer === "all"}
                  label="All Layers"
                  onClick={() => setActiveLayer("all")}
                />
                {layers.map((layer) => (
                  <LayerPillButton
                    key={layer.id}
                    active={activeLayer === layer.slug}
                    label={layer.name}
                    iconName={layer.iconName}
                    onClick={() => setActiveLayer(layer.slug)}
                  />
                ))}
              </div>
            </aside>

            <main className="lg:col-span-7 py-10 lg:py-14 lg:px-10">
              {showFeaturedSection ? (
                <div className="mb-14">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                        Featured AI Stack by Community
                      </h2>
                      <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80">
                        {activeLayer === "all" ? "All Layers" : activeLayerInfo?.name || activeLayer}
                      </div>
                    </div>
                  </div>

                  {stacksLoading ? (
                    <LoadingState />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {featuredStacks.map((stack) => (
                        <StackCard key={stack.id} stack={stack} entityById={entityById} />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                <div className="flex items-center justify-between gap-6 mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                      Relevant Entities
                    </h2>
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/80">
                      {activeLayer === "all" ? "All Layers" : activeLayerInfo?.name || activeLayer}
                    </div>
                  </div>

                  {search.trim() ? (
                    <div className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-white/25">
                      Searching:{" "}
                      <span className="text-white/60">{search.trim()}</span>
                    </div>
                  ) : null}
                </div>

                {entitiesLoading ? (
                  <LoadingState />
                ) : entities.length === 0 ? (
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
                      <EntityCard
                        key={String(entity.id)}
                        entity={entity}
                        layerBySlug={layerBySlug}
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