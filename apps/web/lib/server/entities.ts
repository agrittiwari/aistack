import { createClient } from "@/lib/supabase/server";

export interface DbEntity {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  type: string | null;
  website_url: string | null;
  github_url: string | null;
  logo_url: string | null;
  svg: string | null;
  company_name: string | null;
  company_logo_char: string | null;
  license: string | null;
  star_count: number | null;
  is_featured: boolean | null;
  is_primitive: boolean | null;
  verified_node: boolean | null;
  redeem_url: string | null;
  is_dark_theme_logo: boolean | null;
}

export interface DbLayer {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface DbEntityWithLayer extends DbEntity {
  layer?: DbLayer | null;
  tags?: string[] | null;
  pricing_model?: string | null;
  pricing_notes?: string | null;
  services?: string[] | null;
  capabilities?: string[] | null;
  use_cases?: string[] | null;
  documentation_url?: string | null;
  getting_started_url?: string | null;
  version?: string | null;
  is_deprecated?: boolean | null;
  last_verified_at?: string | null;
}

type EntityLayerJoin = {
  entity_id: string;
  layer: DbLayer | null;
  tags: unknown;
  pricing_model: string | null;
  pricing_notes: string | null;
};

function buildLayerMap(
  rows: EntityLayerJoin[]
): Map<string, Omit<DbEntityWithLayer, keyof DbEntity>> {
  const map = new Map<string, Omit<DbEntityWithLayer, keyof DbEntity>>();
  for (const row of rows) {
    if (map.has(row.entity_id)) continue;
    map.set(row.entity_id, {
      layer: row.layer,
      tags: Array.isArray(row.tags)
        ? (row.tags as string[])
        : (row.tags as string[] | null),
      pricing_model: row.pricing_model ?? null,
      pricing_notes: row.pricing_notes ?? null,
    });
  }
  return map;
}

export async function getEntities(params?: {
  layer?: string;
  search?: string;
  limit?: number;
}): Promise<DbEntityWithLayer[]> {
  const supabase = await createClient();

  let query = supabase
    .from("entities")
    .select("*")
    .eq("verified_node", true)
    .order("name", { ascending: true })
    .limit(params?.limit || 100);

  if (params?.search) {
    const searchTerm = params.search.trim();
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,tagline.ilike.%${searchTerm}%`
      );
    }
  }

  const { data: entitiesData, error: entitiesError } = await query;
  if (entitiesError) throw entitiesError;

  let entities = (entitiesData || []).map((e) => ({
    ...(e as object),
    is_dark_theme_logo: (e as Record<string, unknown>).is_Dark_theme_logo ?? null,
  })) as DbEntity[];

  // Fetch layer join data for these entities
  if (entities.length > 0) {
    const entityIds = entities.map((e) => e.id);
    const { data: layerData, error: layerError } = await supabase
      .from("entity_layers")
      .select(
        "entity_id, layer:layers(id, slug, name, description), tags, pricing_model, pricing_notes"
      )
      .in("entity_id", entityIds);

    if (layerError) throw layerError;

    const layerMap = buildLayerMap((layerData || []) as unknown as EntityLayerJoin[]);

    // Filter by layer slug if requested
    if (params?.layer && params.layer !== "all") {
      const idsInLayer = new Set(
        (layerData || [])
          .filter(
            (row: unknown) =>
              (row as unknown as { layer?: { slug?: string } }).layer?.slug ===
              params.layer
          )
          .map(
            (row: unknown) =>
              (row as unknown as { entity_id: string }).entity_id
          )
      );
      entities = entities.filter((e) => idsInLayer.has(e.id));
    }

    return entities.map((entity) => ({
      ...entity,
      ...layerMap.get(entity.id),
    })) as DbEntityWithLayer[];
  }

  return entities as DbEntityWithLayer[];
}

export async function getFeaturedEntities(limit = 6): Promise<DbEntityWithLayer[]> {
  const supabase = await createClient();

  const { data: entitiesData, error: entitiesError } = await supabase
    .from("entities")
    .select("*")
    .eq("verified_node", true)
    .eq("is_featured", true)
    .order("name", { ascending: true })
    .limit(limit);

  if (entitiesError) throw entitiesError;

  const entities = (entitiesData || []).map((e) => ({
    ...(e as object),
    is_dark_theme_logo: (e as Record<string, unknown>).is_Dark_theme_logo ?? null,
  })) as DbEntity[];

  if (entities.length === 0) return [];

  const entityIds = entities.map((e) => e.id);
  const { data: layerData, error: layerError } = await supabase
    .from("entity_layers")
    .select(
      "entity_id, layer:layers(id, slug, name, description), tags, pricing_model, pricing_notes"
    )
    .in("entity_id", entityIds);

  if (layerError) throw layerError;

  const layerMap = buildLayerMap((layerData || []) as unknown as EntityLayerJoin[]);

  return entities.map((entity) => ({
    ...entity,
    ...layerMap.get(entity.id),
  })) as DbEntityWithLayer[];
}

export async function getEntityBySlug(slug: string): Promise<DbEntityWithLayer | null> {
  const supabase = await createClient();

  const { data: entityData, error: entityError } = await supabase
    .from("entities")
    .select("*")
    .eq("slug", slug)
    .eq("verified_node", true)
    .single();

  if (entityError || !entityData) return null;

  const { data: entityLayerData, error: entityLayerError } = await supabase
    .from("entity_layers")
    .select(
      "layer:layers(id, slug, name, description), tags, pricing_model, pricing_notes, services, capabilities, use_cases, documentation_url, getting_started_url, version, is_deprecated, last_verified_at"
    )
    .eq("entity_id", entityData.id)
    .maybeSingle();

  if (entityLayerError) return null;

  return {
    ...entityData,
    is_dark_theme_logo: (entityData as Record<string, unknown>).is_Dark_theme_logo ?? null,
    layer: entityLayerData?.layer ?? null,
    tags: entityLayerData?.tags ?? null,
    pricing_model: entityLayerData?.pricing_model ?? null,
    pricing_notes: entityLayerData?.pricing_notes ?? null,
    services: entityLayerData?.services ?? null,
    capabilities: entityLayerData?.capabilities ?? null,
    use_cases: entityLayerData?.use_cases ?? null,
    documentation_url: entityLayerData?.documentation_url ?? null,
    getting_started_url: entityLayerData?.getting_started_url ?? null,
    version: entityLayerData?.version ?? null,
    is_deprecated: entityLayerData?.is_deprecated ?? null,
    last_verified_at: entityLayerData?.last_verified_at ?? null,
  } as unknown as DbEntityWithLayer;
}

export async function getLayerEntities(layerSlug: string): Promise<DbEntityWithLayer[]> {
  const supabase = await createClient();

  // 1. Get layer ID from slug
  const { data: layerData, error: layerError } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .eq("slug", layerSlug)
    .single();

  if (layerError || !layerData) return [];

  const layer = layerData as DbLayer;

  // 2. Find entity IDs in this layer
  const { data: entityLayerData, error: entityLayerError } = await supabase
    .from("entity_layers")
    .select("entity_id, tags, pricing_model, pricing_notes")
    .eq("layer_id", layer.id);

  if (entityLayerError) throw entityLayerError;

  const rows = (entityLayerData || []) as unknown as EntityLayerJoin[];
  const entityIds = rows.map((r) => r.entity_id);
  if (entityIds.length === 0) return [];

  // 3. Fetch verified entities for those IDs
  const { data: entitiesData, error: entitiesError } = await supabase
    .from("entities")
    .select("*")
    .eq("verified_node", true)
    .in("id", entityIds)
    .order("name", { ascending: true });

  if (entitiesError) throw entitiesError;

  const entities = (entitiesData || []).map((e) => ({
    ...(e as object),
    is_dark_theme_logo: (e as Record<string, unknown>).is_Dark_theme_logo ?? null,
  })) as DbEntity[];

  // 4. Build pricing/tags map
  const metaMap = new Map<
    string,
    { tags: string[] | null; pricing_model: string | null; pricing_notes: string | null }
  >();
  for (const r of rows) {
    if (metaMap.has(r.entity_id)) continue;
    metaMap.set(r.entity_id, {
      tags: Array.isArray(r.tags)
        ? (r.tags as string[])
        : (r.tags as string[] | null),
      pricing_model: r.pricing_model ?? null,
      pricing_notes: r.pricing_notes ?? null,
    });
  }

  return entities.map((entity) => {
    const meta = metaMap.get(entity.id);
    return {
      ...entity,
      layer,
      tags: meta?.tags ?? null,
      pricing_model: meta?.pricing_model ?? null,
      pricing_notes: meta?.pricing_notes ?? null,
    } as DbEntityWithLayer;
  });
}

export async function getLayers(): Promise<DbLayer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .order("rank", { ascending: true });

  if (error) throw error;

  return data as DbLayer[];
}

export async function getLayerBySlug(slug: string): Promise<DbLayer | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .eq("slug", slug)
    .single();

  if (error) return null;

  return data as DbLayer;
}

export async function searchEntities(query: string, limit = 20): Promise<DbEntityWithLayer[]> {
  const supabase = await createClient();

  const { data: entitiesData, error: entitiesError } = await supabase
    .from("entities")
    .select("*")
    .eq("verified_node", true)
    .or(`name.ilike.%${query}%,tagline.ilike.%${query}%`)
    .limit(limit);

  if (entitiesError) throw entitiesError;

  const entities = (entitiesData || []).map((e) => ({
    ...(e as object),
    is_dark_theme_logo: (e as Record<string, unknown>).is_Dark_theme_logo ?? null,
  })) as DbEntity[];

  if (entities.length === 0) return [];

  const entityIds = entities.map((e) => e.id);
  const { data: layerData, error: layerError } = await supabase
    .from("entity_layers")
    .select(
      "entity_id, layer:layers(id, slug, name, description), tags, pricing_model, pricing_notes"
    )
    .in("entity_id", entityIds);

  if (layerError) throw layerError;

  const layerMap = buildLayerMap((layerData || []) as unknown as EntityLayerJoin[]);

  return entities.map((entity) => ({
    ...entity,
    ...layerMap.get(entity.id),
  })) as DbEntityWithLayer[];
}
