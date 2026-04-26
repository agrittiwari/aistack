import { Suspense } from "react";
import { getEntities, getFeaturedEntities } from "@/lib/server/entities";
import { getAllLayers } from "@/lib/server/layers";
import DirectoryContent from "@/components/directory-content";
import { LoadingState } from "@/components/loading-state";

interface SearchParams {
  layer?: string;
  search?: string;
}

async function getInitialData(params: SearchParams) {
  const [layers, entities, featured] = await Promise.all([
    getAllLayers(),
    getEntities({ layer: params.layer, search: params.search, limit: 100 }),
    getFeaturedEntities(6),
  ]);

  const mappedLayers = layers.map((layer) => ({
    id: String(layer.id),
    slug: layer.slug,
    name: layer.name,
    rank: layer.rank || 0,
    iconName: layer.icon_name || null,
    color: layer.color_gradient,
    description: layer.description,
  }));

  const featuredIds = new Set(featured.map((f) => f.id));

  const mappedEntities = entities
    .filter((entity) => !featuredIds.has(entity.id))
    .map((entity) => ({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      tagline: entity.tagline,
      description: entity.description,
      type: entity.type,
      website_url: entity.website_url,
      github_url: entity.github_url,
      logo_url: entity.logo_url,
      svg: entity.svg,
      company_name: entity.company_name,
      company_logo_char: entity.company_logo_char,
      license: entity.license,
      star_count: entity.star_count,
      is_featured: entity.is_featured,
      is_primitive: entity.is_primitive,
      verified_node: entity.verified_node,
      is_dark_theme_logo: entity.is_dark_theme_logo,
      layer: entity.layer,
      tags: entity.tags,
      pricing_model: entity.pricing_model,
      pricing_notes: entity.pricing_notes,
      redeem_url: entity.redeem_url,
    }));

  const mappedFeatured = featured.map((entity) => ({
    id: entity.id,
    name: entity.name,
    slug: entity.slug,
    tagline: entity.tagline,
    description: entity.description,
    type: entity.type,
    website_url: entity.website_url,
    github_url: entity.github_url,
    logo_url: entity.logo_url,
    svg: entity.svg,
    company_name: entity.company_name,
    company_logo_char: entity.company_logo_char,
    license: entity.license,
    star_count: entity.star_count,
    is_featured: entity.is_featured,
    is_primitive: entity.is_primitive,
    verified_node: entity.verified_node,
    is_dark_theme_logo: entity.is_dark_theme_logo,
    layer: entity.layer,
    tags: entity.tags,
    pricing_model: entity.pricing_model,
    pricing_notes: entity.pricing_notes,
    redeem_url: entity.redeem_url,
  }));

  return {
    layers: mappedLayers,
    entities: mappedEntities,
    featured: mappedFeatured,
  };
}

export async function generateMetadata() {
  return {
    title: "Build Your AI Stack",
    description: "Discover AI tools, models, and agents across every stack layer. Curated for builders, explorers, and product teams who ship.",
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { layers, entities, featured } = await getInitialData(params);

  return (
    <Suspense fallback={<LoadingState />}>
      <DirectoryContent
        initialLayers={layers}
        initialEntities={entities}
        initialFeatured={featured}
        activeLayer={params.layer || "all"}
        activeSearch={params.search || ""}
      />
    </Suspense>
  );
}
