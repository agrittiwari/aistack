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

export async function getEntities(params?: {
  layer?: string;
  search?: string;
  limit?: number;
}): Promise<DbEntityWithLayer[]> {
  const supabase = await createClient();
  type EntityLayerRow = {
    entity: Record<string, unknown> | null;
    layer: Record<string, unknown> | null;
    tags?: unknown;
    pricing_model?: string | null;
    pricing_notes?: string | null;
  };
  
  let query = supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, svg, company_name, company_logo_char,
        license, star_count, is_featured, is_primitive, verified_node
      ),
      layer:layers(id, slug, name, description),
      tags,
      pricing_model,
      pricing_notes
    `)
    .eq("entities.verified_node", true)
    .limit(params?.limit || 100);

  if (params?.layer && params.layer !== "all") {
    query = query.eq("layer.slug", params.layer);
  }

  if (params?.search) {
    const searchTerm = params.search.trim();
    if (searchTerm) {
      query = query.or(`entities.name.ilike.%${searchTerm}%,entities.tagline.ilike.%${searchTerm}%`);
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || [])
    .map((raw) => raw as unknown as EntityLayerRow)
    .filter((item) => item.entity !== null)
    .map((item) => ({
      ...(item.entity as unknown as DbEntity),
      layer: item.layer as unknown as DbLayer,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : (item.tags as unknown as string[] | null),
      pricing_model: item.pricing_model ?? null,
      pricing_notes: item.pricing_notes ?? null,
    })) as DbEntityWithLayer[];
}

export async function getFeaturedEntities(limit = 6): Promise<DbEntityWithLayer[]> {
  const supabase = await createClient();
  type EntityLayerRow = {
    entity: Record<string, unknown> | null;
    layer: Record<string, unknown> | null;
    tags?: unknown;
    pricing_model?: string | null;
    pricing_notes?: string | null;
  };
  
  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, svg, company_name, company_logo_char,
        license, star_count, is_featured, is_primitive, verified_node
      ),
      layer:layers(id, slug, name, description),
      tags,
      pricing_model,
      pricing_notes
    `)
    .eq("entities.verified_node", true)
    .eq("entities.is_featured", true)
    .limit(limit);

  if (error) throw error;

  return (data || [])
    .map((raw) => raw as unknown as EntityLayerRow)
    .filter((item) => item.entity !== null)
    .map((item) => ({
      ...(item.entity as unknown as DbEntity),
      layer: item.layer as unknown as DbLayer,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : (item.tags as unknown as string[] | null),
      pricing_model: item.pricing_model ?? null,
      pricing_notes: item.pricing_notes ?? null,
    })) as DbEntityWithLayer[];
}

export async function getEntityBySlug(slug: string): Promise<DbEntityWithLayer | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, svg, company_name, company_logo_char,
        license, star_count, is_featured, is_primitive, verified_node
      ),
      layer:layers(id, slug, name, description),
      tags,
      pricing_model,
      pricing_notes,
      services,
      capabilities,
      use_cases,
      documentation_url,
      getting_started_url,
      version,
      is_deprecated,
      last_verified_at
    `)
    .eq("entity.slug", slug)
    .single();

  if (error || !data || !data.entity) return null;

  return {
    ...data.entity,
    layer: data.layer,
    tags: data.tags,
    pricing_model: data.pricing_model,
    pricing_notes: data.pricing_notes,
    services: data.services,
    capabilities: data.capabilities,
    use_cases: data.use_cases,
    documentation_url: data.documentation_url,
    getting_started_url: data.getting_started_url,
    version: data.version,
    is_deprecated: data.is_deprecated,
    last_verified_at: data.last_verified_at,
  } as unknown as DbEntityWithLayer;
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
  type EntityLayerRow = {
    entity: Record<string, unknown> | null;
    layer: Record<string, unknown> | null;
    tags?: unknown;
    pricing_model?: string | null;
    pricing_notes?: string | null;
  };
  
  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, svg, company_name, company_logo_char,
        license, star_count, is_featured, is_primitive, verified_node
      ),
      layer:layers(id, slug, name, description),
      tags,
      pricing_model,
      pricing_notes
    `)
    .eq("entities.verified_node", true)
    .or(`entities.name.ilike.%${query}%,entities.tagline.ilike.%${query}%`)
    .limit(limit);

  if (error) throw error;

  return (data || [])
    .map((raw) => raw as unknown as EntityLayerRow)
    .filter((item) => item.entity !== null)
    .map((item) => ({
      ...(item.entity as unknown as DbEntity),
      layer: item.layer as unknown as DbLayer,
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : (item.tags as unknown as string[] | null),
      pricing_model: item.pricing_model ?? null,
      pricing_notes: item.pricing_notes ?? null,
    })) as DbEntityWithLayer[];
}
