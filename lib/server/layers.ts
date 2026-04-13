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