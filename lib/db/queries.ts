import { createClient } from "@/lib/supabase/client";
import type { Tables, TablesUpdate } from "@/types/supabase";

const DB_PAGE_SIZE = 20;

export type DbTool = Tables<"entities"> & {
  layer?: { id: number; slug: string; name: string; description: string | null } | null;
};

export type DbLayer = Tables<"layers">;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getTools(params: {
  layerSlug?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResult<DbTool>> {
  const supabase = createClient();
  const page = params.page || 1;
  const limit = params.limit || DB_PAGE_SIZE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("tools")
    .select(`
      *,
      layer:layers(id, slug, name, description)
    `, { count: "exact" })
    .eq("status", "active")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (params.layerSlug) {
    query = query.eq("layer.slug", params.layerSlug);
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    data: data as unknown as DbTool[],
    total: count || 0,
    page,
    pageSize: limit,
    hasMore: offset + limit < (count || 0),
  };
}

export async function getToolBySlug(slug: string): Promise<DbTool | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("tools")
    .select(`
      *,
      layer:layers(id, slug, name, description)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .limit(1)
    .single();

  if (error) return null;
  return data as unknown as DbTool;
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

export async function getToolCountByLayer(layerSlug: string): Promise<number> {
  const supabase = createClient();
  
  const { count, error } = await supabase
    .from("tools")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .eq("layer.slug", layerSlug);

  if (error) throw error;
  return count || 0;
}

export async function getTrendingTools(limit = 5): Promise<DbTool[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("tools")
    .select(`
      *,
      layer:layers(id, slug, name)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as DbTool[];
}