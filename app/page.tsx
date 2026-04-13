import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getIconByName } from "@/lib/icons";
import DirectoryContent from "@/components/directory-content";
import { LoadingState } from "@/components/loading-state";

async function getInitialData() {
  const supabase = await createClient();
  
  // Get layers
  const { data: layers } = await supabase
    .from("layers")
    .select("id, slug, name, description, color_gradient, icon_name")
    .order("rank", { ascending: true });

  // Get entities via entity_layers with all fields needed for SEO and card display
  const { data: entityLayers } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(
        id, name, slug, tagline, description, type,
        website_url, github_url, logo_url, company_name, company_logo_char,
        license, star_count, is_featured, is_primitive, verified_node
      ),
      layer:layers(id, slug, name, description),
      tags,
      pricing_model,
      pricing_notes
    `)
    .limit(100);

  // Transform data
  const entities = (entityLayers || []).map((item: any) => ({
    id: item.entity?.id,
    name: item.entity?.name || "",
    slug: item.entity?.slug || "",
    tagline: item.entity?.tagline,
    description: item.entity?.description,
    type: item.entity?.type,
    website_url: item.entity?.website_url,
    github_url: item.entity?.github_url,
    logo_url: item.entity?.logo_url,
    company_name: item.entity?.company_name,
    company_logo_char: item.entity?.company_logo_char,
    license: item.entity?.license,
    star_count: item.entity?.star_count,
    is_featured: item.entity?.is_featured,
    is_primitive: item.entity?.is_primitive,
    verified_node: item.entity?.verified_node,
    layer: item.layer,
    tags: item.tags,
    pricing_model: item.pricing_model,
    pricing_notes: item.pricing_notes,
  }));

  // Add SEO-friendly descriptions to layers
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

  const mappedLayers = (layers || []).map((layer: any) => ({
    id: String(layer.id),
    slug: layer.slug,
    name: layer.name,
    rank: layer.rank || 0,
    iconName: layer.icon_name || null,  // Pass as string, not component
    color: layer.color_gradient,
    description: layerDescriptions[layer.slug] || layer.description,
  }));

  return {
    layers: mappedLayers,
    entities,
  };
}

export async function generateMetadata() {
  return {
    title: "AiStack - The 2026 Intelligence Directory",
    description: "Your AI stack. Discover tools, models, and platforms across Foundation Models, Inference, Training, Data, Orchestration, Design, and more.",
    keywords: ["AI", "AI tools", "LLM", "AI stack", "machine learning", "AI directory", "foundation models", "vector database", "dev tools", "terminal"],
    openGraph: {
      title: "AiStack - The 2026 Intelligence Directory",
      description: "Your AI stack. Curated list of AI tools, models, and platforms for developers and engineers.",
    },
  };
}

export default async function DirectoryPage() {
  const { layers, entities } = await getInitialData();

  return (
    <div className="min-h-screen bg-[#050507] text-[#e2e2e7] selection-bg-blue-500/30 animate-in fade-in duration-700">
      <Suspense fallback={<LoadingState />}>
        <DirectoryContent initialLayers={layers} initialEntities={entities} />
      </Suspense>
    </div>
  );
}