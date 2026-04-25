import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";

export type PublicProfile = Pick<
  Tables<"profiles">,
  "id" | "username" | "full_name" | "avatar_url" | "headline"
> & {
  github_handle?: string | null;
  twitter_handle?: string | null;
  website_url?: string | null;
};

export type PublicUserStack = Pick<
  Tables<"user_stacks">,
  "id" | "user_id" | "name" | "description" | "entities_id" | "updated_at" | "view_count" | "is_public" | "entity_notes"
> & {
  profile?: PublicProfile | null;
};

export type StackEntity = {
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
  is_dark_theme_logo?: boolean | null;
  tags?: string[] | null;
  pricing_model?: string | null;
  pricing_notes?: string | null;
  layer?: {
    id: number;
    slug: string;
    name: string;
    description: string | null;
  } | null;
};

async function getProfileByHandle(handle: string): Promise<PublicProfile | null> {
  const supabase = await createClient();

  const byUsername = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, headline, github_handle, twitter_handle, website_url")
    .eq("username", handle)
    .maybeSingle();

  if (byUsername.data) return byUsername.data as PublicProfile;

  const byId = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, headline, github_handle, twitter_handle, website_url")
    .eq("id", handle)
    .maybeSingle();

  if (byId.data) return byId.data as PublicProfile;
  return null;
}

export async function getPublicStackByHandle(handle: string): Promise<{
  profile: PublicProfile;
  stack: PublicUserStack | null;
  matchedBy: "username" | "id";
}> {
  const profile = await getProfileByHandle(handle);
  if (!profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  const matchedBy: "username" | "id" = profile.username === handle ? "username" : "id";

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_stacks")
    .select("id, user_id, name, description, entities_id, updated_at, view_count, is_public, entity_notes")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    profile,
    stack: (data ? { ...(data as PublicUserStack), profile } : null) as PublicUserStack | null,
    matchedBy,
  };
}

export async function getPublicStackById(id: string): Promise<PublicUserStack | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_stacks")
    .select(
      "id, user_id, name, description, entities_id, updated_at, view_count, is_public, profile:profiles(id, username, full_name, avatar_url, headline)",
    )
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (error) return null;
  if (!data) return null;

  const row = data as unknown as (PublicUserStack & { profile: PublicProfile | null });
  return { ...row, profile: row.profile || null };
}

type EntityLayerJoinRow = {
  entity: StackEntity | null;
  layer: StackEntity["layer"] | null;
  tags?: unknown;
  pricing_model?: string | null;
  pricing_notes?: string | null;
  is_primary?: boolean | null;
  entity_id?: string;
};

function pickPrimary(rows: EntityLayerJoinRow[]): EntityLayerJoinRow[] {
  // Deduplicate by entity.id, preferring is_primary=true.
  const byId = new Map<string, EntityLayerJoinRow>();
  for (const r of rows) {
    const e = r.entity;
    if (!e?.id) continue;
    const existing = byId.get(e.id);
    if (!existing) {
      byId.set(e.id, r);
      continue;
    }
    if (existing.is_primary !== true && r.is_primary === true) {
      byId.set(e.id, r);
    }
  }
  return Array.from(byId.values());
}

export async function getStackEntities(entityIds: string[]): Promise<StackEntity[]> {
  if (!entityIds || entityIds.length === 0) return [];

  const supabase = await createClient();

  console.log("[getStackEntities] Input entityIds:", entityIds);

  const baseSelect = `
    entity:entities(
      id, name, slug, tagline, description, type,
      website_url, github_url, logo_url, svg, company_name, company_logo_char,
      license, star_count, is_featured, is_primitive, verified_node, is_Dark_theme_logo
    ),
    layer:layers(id, slug, name, description),
    tags,
    pricing_model,
    pricing_notes,
    is_primary,
    entity_id
  `;

  // First pass: prefer primary layer entries.
  const primary = await supabase
    .from("entity_layers")
    .select(baseSelect)
    .in("entity_id", entityIds)
    .eq("is_primary", true);

  console.log("[getStackEntities] Primary query result count:", primary.data?.length || 0, "error:", primary.error?.message);

  const primaryRows = (primary.data || [])
    .map((r) => r as unknown as EntityLayerJoinRow)
    .filter((r) => r.entity);
  const primaryPicked = pickPrimary(primaryRows);
  const foundIds = new Set(primaryPicked.map((r) => r.entity!.id));

  console.log("[getStackEntities] Found after primary pass:", Array.from(foundIds));

  // Second pass: fill gaps (non-primary rows) for missing entities.
  const missing = entityIds.filter((id) => !foundIds.has(String(id)));
  let allRows = primaryPicked;
  if (missing.length > 0) {
    console.log("[getStackEntities] Missing after primary, querying secondary:", missing);
    const secondary = await supabase
      .from("entity_layers")
      .select(baseSelect)
      .in("entity_id", missing);
    console.log("[getStackEntities] Secondary query result count:", secondary.data?.length || 0, "error:", secondary.error?.message);
    const secondaryRows = (secondary.data || [])
      .map((r) => r as unknown as EntityLayerJoinRow)
      .filter((r) => r.entity);
    allRows = pickPrimary([...primaryPicked, ...secondaryRows]);
  }

  // Third pass: query entities table directly for any still-missing entities
  const stillMissing = entityIds.filter((id) => !allRows.some((r) => String(r.entity?.id) === String(id)));
  if (stillMissing.length > 0) {
    console.log("[getStackEntities] Still missing, querying entities table directly:", stillMissing);
    const directEntities = await supabase
      .from("entities")
      .select("id, name, slug, tagline, description, type, website_url, github_url, logo_url, svg, company_name, company_logo_char, license, star_count, is_featured, is_primitive, verified_node, is_Dark_theme_logo")
      .in("id", stillMissing);
    console.log("[getStackEntities] Direct entities query result count:", directEntities.data?.length || 0, "error:", directEntities.error?.message);
    for (const e of (directEntities.data || [])) {
      allRows.push({
        entity: { ...e, is_dark_theme_logo: e.is_Dark_theme_logo ?? null } as StackEntity,
        layer: null,
        tags: null,
        pricing_model: null,
        pricing_notes: null,
        is_primary: null,
        entity_id: e.id,
      });
    }
  }

  console.log("[getStackEntities] Total rows before mapping:", allRows.length);

  const mapped = allRows
    .filter((r) => Boolean(r.entity))
    .map((r) => {
      const e = r.entity as Record<string, unknown>;
      return {
        ...(e as StackEntity),
        is_dark_theme_logo: e.is_Dark_theme_logo ?? e.is_dark_theme_logo ?? null,
        layer: r.layer ?? null,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : ((r.tags ?? null) as string[] | null),
        pricing_model: r.pricing_model ?? null,
        pricing_notes: r.pricing_notes ?? null,
      };
    }) as StackEntity[];

  console.log("[getStackEntities] Mapped entities:", mapped.map(e => ({ id: e.id, name: e.name })));

  // Preserve original ordering (best-effort).
  const idx = new Map(entityIds.map((id, i) => [String(id), i]));
  mapped.sort((a, b) => (idx.get(String(a.id)) ?? 1e9) - (idx.get(String(b.id)) ?? 1e9));

  return mapped;
}
