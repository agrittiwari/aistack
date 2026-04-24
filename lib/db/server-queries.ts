import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Tables } from "@/types/supabase";

const DB_PAGE_SIZE = 20;

export type DbTool = Tables<"entities">;
export type DbLayer = Tables<"layers">;

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

type EntityLayerJoinRow = { entity: Record<string, unknown> | null; layer: Record<string, unknown> | null };

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
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name,
        company_logo_char, license, is_featured, is_primitive,
        star_count, created_at, updated_at, verified_node
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

  if (error) throw error;

  const mappedData = (data || []).map((raw) => {
    const item = raw as unknown as EntityLayerJoinRow;
    return {
      ...(item.entity || {}),
      layer: item.layer,
    };
  });

  return {
    data: mappedData as unknown as DbTool[],
    total: count || 0,
    page,
    pageSize: limit,
    hasMore: offset + limit < (count || 0),
  };
}

export async function getToolBySlug(slug: string): Promise<DbTool | null> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name,
        company_logo_char, license, is_featured, is_primitive,
        star_count, created_at, updated_at, verified_node
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
  } as unknown as DbTool;
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

export async function getToolCountByLayer(layerSlug: string): Promise<number> {
  const supabase = await getServerClient();

  const { count, error } = await supabase
    .from("entity_layers")
    .select("*", { count: "exact", head: true })
    .eq("layer.slug", layerSlug);

  if (error) throw error;
  return count || 0;
}

export async function getTrendingTools(limit = 5): Promise<DbTool[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name,
        company_logo_char, license, is_featured, is_primitive,
        star_count, created_at, updated_at, verified_node
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

  return mappedData as unknown as DbTool[];
}

export interface PulseUpdateWithLogo extends Tables<"pulse_updates"> {
  related_entity?: {
    company?: {
      logo_url: string | null;
      name: string | null;
    } | null;
  } | null;
}

export async function getPulseUpdates(limit = 10): Promise<PulseUpdateWithLogo[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("pulse_updates")
    .select(`
      *,
      related_entity:entities(
        company:companies(logo_url, name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [] as unknown as PulseUpdateWithLogo[];
  return data as unknown as PulseUpdateWithLogo[];
}

export async function getMeetups(limit = 10): Promise<Tables<"meetups">[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("meetups")
    .select("*")
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) return [] as unknown as Tables<"meetups">[];
  return data as unknown as Tables<"meetups">[];
}

export interface MeetupWithMetadata extends Tables<"meetups"> {
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
  } | null;
}

export async function getMeetupsWithMetadata(): Promise<MeetupWithMetadata[]> {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("meetups")
    .select("*")
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching meetups:", error);
    return [];
  }

  return (data || []) as unknown as MeetupWithMetadata[];
}
