import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const DB_PAGE_SIZE = 20;

export interface DbTool {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  layer_id: number | null;
  status: string | null;
  critical_text: string | null;
  website_url: string | null;
  year: number | null;
  created_at: string;
  updated_at: string;
  layer?: { id: number; slug: string; name: string; description: string | null } | null;
}

export interface DbLayer {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

export async function getTools(params: {
  layerSlug?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResult<DbTool>> {
  const supabase = await getServerClient();
  const page = params.page || 1;
  const limit = params.limit || DB_PAGE_SIZE;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("tools")
    .select(
      `
      *,
      layer:layers(id, slug, name, description)
    `,
      { count: "exact" }
    )
    .eq("status", "active")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (params.layerSlug) {
    query = query.eq("layer.slug", params.layerSlug);
  }

  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    );
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
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("tools")
    .select(
      `
      *,
      layer:layers(id, slug, name, description)
    `
    )
    .eq("slug", slug)
    .eq("status", "active")
    .limit(1)
    .single();

  if (error) return null;
  return data as unknown as DbTool;
}

export async function getLayers(): Promise<DbLayer[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .order("id", { ascending: true });

  if (error) throw error;
  return data as unknown as DbLayer[];
}

export async function getLayerBySlug(slug: string): Promise<DbLayer | null> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description")
    .eq("slug", slug)
    .limit(1)
    .single();

  if (error) return null;
  return data as unknown as DbLayer;
}

export async function getTrendingTools(limit = 5): Promise<DbTool[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("tools")
    .select(
      `
      *,
      layer:layers(id, slug, name)
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as unknown as DbTool[];
}