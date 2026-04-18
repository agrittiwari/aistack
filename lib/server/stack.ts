import { createClient } from "@/lib/supabase/server";

export interface UserStack {
  id: string;
  user_id: string;
  entities_id: string[];
  is_public: boolean;
  name: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserStack(userId: string): Promise<UserStack | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_stacks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data as UserStack | null;
}

export async function getStackById(stackId: string): Promise<UserStack | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_stacks")
    .select("*")
    .eq("id", stackId)
    .eq("is_public", true)
    .single();

  if (error) {
    return null;
  }

  return data as UserStack;
}

export async function getStackEntities(stack: UserStack) {
  if (!stack.entities_id || stack.entities_id.length === 0) {
    return [];
  }

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
      pricing_notes
    `)
    .in("entity.id", stack.entities_id);

  if (error) throw error;

  return (data || []).map((item: any) => ({
    ...item.entity,
    layer: item.layer,
    tags: item.tags,
    pricing_model: item.pricing_model,
    pricing_notes: item.pricing_notes,
  }));
}

export async function toggleStackEntity(
  userId: string, 
  entityId: string
): Promise<{ entities_id: string[] }> {
  const supabase = await createClient();
  
  const { data: existing, error: fetchError } = await supabase
    .from("user_stacks")
    .select("entities_id")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const currentEntities = existing?.entities_id || [];
  const isInStack = currentEntities.includes(entityId);
  
  let newEntities: string[];
  if (isInStack) {
    newEntities = currentEntities.filter((id: string) => id !== entityId);
  } else {
    newEntities = [...currentEntities, entityId];
  }

  const { data, error } = await supabase
    .from("user_stacks")
    .upsert({
      user_id: userId,
      entities_id: newEntities,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id"
    })
    .select("entities_id")
    .single();

  if (error) throw error;

  return { entities_id: data.entities_id };
}

export async function publishStack(userId: string): Promise<{ id: string; is_public: boolean }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("user_stacks")
    .upsert({
      user_id: userId,
      is_public: true,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id"
    })
    .select("id, is_public")
    .single();

  if (error) throw error;

  return { id: data.id, is_public: data.is_public };
}