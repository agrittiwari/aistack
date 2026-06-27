import { createClient } from "@/lib/supabase/server";

export interface Layer {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  color_gradient: string | null;
  icon_name: string | null;
  rank: number;
}

const layerDescriptions: Record<string, string> = {
  "compute-and-hardware": "GPUs, TPUs, cloud infrastructure, and specialized AI hardware for training and inference.",
  "foundation-models": "Large language models, multimodal models, and AI coding tools from OpenAI, Anthropic, Meta, Google, and more.",
  "inference-and-hosting": "APIs, endpoints, and platforms for serving AI models with low latency and high throughput.",
  "training-and-fine-tuning": "Tools and frameworks for fine-tuning, LoRA, RLHF, and custom model training.",
  "data-and-vector": "Vector databases, RAG frameworks, embeddings, and data pipelines for AI applications.",
  "orchestration": "Agent frameworks, chains, memory systems, and tools for building complex AI workflows.",
  "execution-and-sandbox": "Code execution environments, sandboxes, and dev tools for AI agents.",
  "observability-and-safety": "Monitoring, evaluation, guardrails, and safety tools for production AI systems.",
  "application-agents": "AI agents, copilots, and autonomous AI applications.",
  "terminal-productivity": "Terminal emulators, productivity tools, and command-line utilities for developers.",
  "design-video": "Design tools, screen recording, video editing, and mockup creation.",
  "audio-voice": "Audio tools, voice recording, and speech-to-text applications.",
  "communication": "Team communication platforms and community tools.",
};

export async function getAllLayers(): Promise<Layer[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description, color_gradient, icon_name, rank")
    .order("rank", { ascending: true });

  if (error) throw error;
  
  return (data || []).map((layer) => ({
    ...layer,
    description: layerDescriptions[layer.slug] || layer.description,
  })) as Layer[];
}

export async function getLayerBySlug(slug: string): Promise<Layer | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("layers")
    .select("id, slug, name, description, color_gradient, icon_name, rank")
    .eq("slug", slug)
    .single();

  if (error) return null;
  
  return {
    ...data,
    description: layerDescriptions[data.slug] || data.description,
  } as Layer;
}

export interface LayerUser {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  stack_name: string | null;
  stack_description: string | null;
  entity_count: number;
}

export async function getUsersByLayer(layerSlug: string): Promise<LayerUser[]> {
  const supabase = await createClient();

  // Get layer id
  const { data: layer } = await supabase
    .from("layers")
    .select("id")
    .eq("slug", layerSlug)
    .single();

  if (!layer) return [];

  // Get entities in this layer
  const { data: entityLayers } = await supabase
    .from("entity_layers")
    .select("entity_id")
    .eq("layer_id", layer.id);

  if (!entityLayers || entityLayers.length === 0) return [];

  const entityIds = entityLayers.map((el) => el.entity_id);

  // Get public user stacks that contain any of these entities
  const { data: stacks } = await supabase
    .from("user_stacks")
    .select("user_id, name, description, entities_id")
    .eq("is_public", true)
    .not("user_id", "is", null);

  if (!stacks) return [];

  // Filter stacks that have at least one entity from this layer
  const matchingStacks = stacks.filter(
    (stack) =>
      stack.entities_id &&
      stack.entities_id.some((id: string) => entityIds.includes(id))
  );

  if (matchingStacks.length === 0) return [];

  const userIds = matchingStacks.map((s) => s.user_id);

  // Get profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, headline")
    .in("id", userIds);

  if (!profiles) return [];

  return profiles.map((profile) => {
    const stack = matchingStacks.find((s) => s.user_id === profile.id);
    const stackEntities = stack?.entities_id || [];
    const relevantCount = stackEntities.filter((id: string) =>
      entityIds.includes(id)
    ).length;

    return {
      id: profile.id,
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      headline: profile.headline,
      stack_name: stack?.name || null,
      stack_description: stack?.description || null,
      entity_count: relevantCount,
    };
  });
}