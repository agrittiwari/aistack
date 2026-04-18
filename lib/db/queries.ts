import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";

const DB_PAGE_SIZE = 20;

export type DbEntity = Tables<"entities"> & {
  entity_layers?: { layer: { id: number; slug: string; name: string; description: string | null } | null } | null;
};

export type DbEntityWithLayer = Tables<"entities"> & {
  layer?: { id: number; slug: string; name: string; description: string | null } | null;
};

export type DbLayer = Tables<"layers">;
export type DbEntityLayer = Tables<"entity_layers">;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

type EntityLayerJoinRow = { entity: Record<string, unknown> | null; layer: Record<string, unknown> | null };

export async function getEntities(params: {
  layerSlug?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResult<DbEntityWithLayer>> {
  const supabase = createClient();
  const page = params.page || 1;
  const limit = params.limit || DB_PAGE_SIZE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name,
        company_logo_char, license, is_featured, is_primitive,
        star_count, updated_at, verified_node
      ),
      layer:layers(id, slug, name, description)
    `, { count: "exact" })
    .range(offset, offset + limit - 1);

  if (params.layerSlug) {
    query = query.eq("layer.slug", params.layerSlug);
  }

  if (params.search) {
    query = query.or(`entities.name.ilike.%${params.search}%,entities.tagline.ilike.%${params.search}%`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Supabase error:", error);
    throw error;
  }

  const mappedData = (data || []).map((raw) => {
    const item = raw as unknown as EntityLayerJoinRow;
    return {
      ...(item.entity || {}),
      layer: item.layer,
    };
  });

  return {
    data: mappedData as unknown as DbEntityWithLayer[],
    total: count || 0,
    page,
    pageSize: limit,
    hasMore: offset + limit < (count || 0),
  };
}

export async function getEntityBySlug(slug: string): Promise<DbEntityWithLayer | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name,
        company_logo_char, license, is_featured, is_primitive,
        star_count, updated_at, verified_node
      ),
      layer:layers(id, slug, name, description)
    `)
    .eq("entities.slug", slug)
    .limit(1)
    .single();

  if (error) return null;
  
  return {
    ...(data as unknown as EntityLayerJoinRow)?.entity,
    layer: (data as unknown as EntityLayerJoinRow)?.layer,
  } as unknown as DbEntityWithLayer;
}

export async function getLayers(): Promise<DbLayer[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .order("id", { ascending: true });

  if (error) throw error;
  return data as unknown as DbLayer[];
}

export async function getLayerBySlug(slug: string): Promise<DbLayer | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .eq("slug", slug)
    .limit(1)
    .single();

  if (error) return null;
  return data as unknown as DbLayer;
}

export async function getEntityCountByLayer(layerSlug: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from("entity_layers")
    .select("*", { count: "exact", head: true })
    .eq("layer.slug", layerSlug);

  if (error) throw error;
  return count || 0;
}

export async function getTrendingEntities(limit = 5): Promise<DbEntityWithLayer[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name,
        company_logo_char, license, is_featured, is_primitive,
        star_count, updated_at, verified_node
      ),
      layer:layers(id, slug, name)
    `)
    .order("entities.created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  const mappedData = (data || []).map((raw) => {
    const item = raw as unknown as EntityLayerJoinRow;
    return {
      ...(item.entity || {}),
      layer: item.layer,
    };
  });

  return mappedData as unknown as DbEntityWithLayer[];
}

// Legacy exports for backward compatibility
export const getTools = getEntities;
export const getToolBySlug = getEntityBySlug;
export const getToolCountByLayer = getEntityCountByLayer;
export const getTrendingTools = getTrendingEntities;
