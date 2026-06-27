import {
  Cpu,
  Brain,
  Zap,
  Dna,
  Database,
  GitBranch,
  Code,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";

export interface StackLayer {
  id: string;
  slug: string;
  name: string;
  icon?: LucideIcon;
  color?: string;
  desc?: string;
}

export interface Tool {
  id: number | string;
  name: string;
  layer?: string;
  status?: string;
  critical?: string;
  link?: string;
  year?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  time: string;
  type: string;
  author: string;
}

export interface Meetup {
  id: number;
  name: string;
  city: string;
  date: string;
  host: string;
  attendees: number;
  layer?: string;
}

// Fallback static data (when API unavailable)
const FALLBACK_LAYERS: StackLayer[] = [
  { id: "1", slug: "compute-and-hardware", name: "Compute & Hardware", icon: Cpu, color: "from-blue-500 to-cyan-400", desc: "The physical power (NVIDIA, Cloud GPUs)." },
  { id: "2", slug: "foundation-models", name: "Foundation Models", icon: Brain, color: "from-purple-500 to-indigo-400", desc: "The base Brains (GPT, Claude, Llama)." },
  { id: "3", slug: "inference-and-hosting", name: "Inference & Hosting", icon: Zap, color: "from-yellow-400 to-orange-500", desc: "The Delivery (Groq, Together AI)." },
  { id: "4", slug: "training-and-fine-tuning", name: "Training & Fine-Tuning", icon: Dna, color: "from-pink-500 to-rose-400", desc: "The Optimization (Unsloth, RL Startups)." },
  { id: "5", slug: "data-and-vector", name: "Data & Vector", icon: Database, color: "from-emerald-400 to-teal-500", desc: "The Knowledge Base (Pinecone, LlamaIndex)." },
  { id: "6", slug: "orchestration", name: "Orchestration", icon: GitBranch, color: "from-blue-600 to-indigo-600", desc: "The Agent Logic (AI SDK, LangGraph)." },
  { id: "7", slug: "execution-and-sandbox", name: "Execution & Sandbox", icon: Code, color: "from-orange-400 to-red-500", desc: "The Action Space (E2B, Daytona, Rivet Actors)." },
  { id: "8", slug: "observability-and-safety", name: "Observability & Safety", icon: ShieldCheck, color: "from-red-500 to-orange-600", desc: "The Control Room (LangSmith, Guardrails)." },
];

const FALLBACK_TOOLS: Tool[] = [
  { id: 1, name: "NVIDIA Blackwell", layer: "compute-and-hardware", status: "Dominant", critical: "The backbone of every 2026 sovereign cloud initiative.", link: "#", year: "2026" },
  { id: 2, name: "DeepSeek R1", layer: "foundation-models", status: "Trending", critical: "The open-weights breakthrough.", link: "#", year: "2025" },
  { id: 3, name: "Groq LPU", layer: "inference-and-hosting", status: "Elite", critical: "Sub-millisecond latency.", link: "#", year: "2026" },
  { id: 4, name: "Unsloth", layer: "training-and-fine-tuning", status: "Vital", critical: "Local fine-tuning.", link: "#", year: "2025" },
  { id: 5, name: "Pinecone", layer: "data-and-vector", status: "Stable", critical: "Zero-maintenance vectors.", link: "#", year: "2024" },
  { id: 6, name: "LangGraph", layer: "orchestration", status: "Growing", critical: "Complex workflows.", link: "#", year: "2025" },
  { id: 7, name: "E2B Sandbox", layer: "execution-and-sandbox", status: "Niche", critical: "Safe code execution.", link: "#", year: "2025" },
  { id: 8, name: "Guardrails AI", layer: "observability-and-safety", status: "Mandatory", critical: "Production safety.", link: "#", year: "2026" },
];

const FALLBACK_NEWS: NewsItem[] = [
  { id: 1, title: "Meta releases Llama 4-S", time: "12m ago", type: "Release", author: "Meta AI Team" },
  { id: 2, title: "Inference costs drop 30%", time: "48m ago", type: "Market", author: "Sector Analysis" },
  { id: 3, title: "Mistral Pi-3 benchmark", time: "2h ago", type: "Benchmark", author: "LMSYS" },
];

const FALLBACK_MEETUPS: Meetup[] = [
  { id: 1, name: "SF Agentic Night", city: "San Francisco", date: "April 14, 2026", host: "LangChain", attendees: 450, layer: "orchestration" },
];

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  cpu: Cpu, brain: Brain, zap: Zap, dna: Dna, database: Database,
  "git-branch": GitBranch, code: Code, "shield-check": ShieldCheck,
};

// API base URL
const API_URL = "/api";

// Async API fetchers
type ApiLayer = {
  id: number | string;
  slug: string;
  name: string;
  description?: string | null;
  icon_name?: string | null;
  color_gradient?: string | null;
};

type ApiEntity = {
  id: number | string;
  name: string;
  description?: string | null;
  type?: string | null;
  website_url?: string | null;
  layer?: { slug?: string | null } | null;
  year?: number | string | null;
};

export async function fetchLayers(): Promise<StackLayer[]> {
  try {
    const res = await fetch(`${API_URL}/layers`);
    if (res.ok) {
      const data = (await res.json()) as { data?: ApiLayer[] };
      const rows = Array.isArray(data.data) ? data.data : [];
      return rows.map((l) => ({
        id: String(l.id),
        slug: l.slug,
        name: l.name,
        icon: iconMap[l.icon_name || ""] || undefined,
        color: l.color_gradient || "",
        desc: l.description || "",
      }));
    }
  } catch (e) {
    console.warn("API layers fetch failed, using fallback:", e);
  }
  return FALLBACK_LAYERS;
}

export async function fetchLayerBySlug(slug: string): Promise<StackLayer | undefined> {
  const layers = await fetchLayers();
  return layers.find((l) => l.slug === slug);
}

export async function fetchTools(params?: { layer?: string; search?: string }): Promise<Tool[]> {
  try {
    const query = new URLSearchParams();
    if (params?.layer && params.layer !== "all") query.set("layer", params.layer);
    if (params?.search) query.set("search", params.search);
    
    const res = await fetch(`${API_URL}/tools?${query}`);
    if (res.ok) {
      const data = (await res.json()) as { tools?: ApiEntity[]; data?: ApiEntity[] };
      const rows = (Array.isArray(data.tools) ? data.tools : Array.isArray(data.data) ? data.data : []) as ApiEntity[];
      return rows.map((t) => ({
        id: t.id,
        name: t.name,
        layer: t.layer?.slug || "",
        status: t.type || "active",
        critical: t.description || "",
        link: t.website_url || "",
        year: t.year != null ? String(t.year) : "",
      }));
    }
  } catch (e) {
    console.warn("API tools fetch failed, using fallback:", e);
  }
  
  return FALLBACK_TOOLS.filter((t) => {
    if (params?.layer && params.layer !== "all" && t.layer !== params.layer) return false;
    if (params?.search) {
      const s = params.search.toLowerCase();
      if (!t.name.toLowerCase().includes(s) && !t.critical?.toLowerCase().includes(s)) return false;
    }
    return true;
  });
}

export async function fetchPulseNews(): Promise<NewsItem[]> {
  // TODO: Create /api/pulse endpoint
  return FALLBACK_NEWS;
}

export async function fetchMeetups(): Promise<Meetup[]> {
  // TODO: Create /api/meetups endpoint
  return FALLBACK_MEETUPS;
}

// Legacy sync exports (fallback only - for client components)
export const STACK_LAYERS = FALLBACK_LAYERS;
export const INITIAL_TOOLS = FALLBACK_TOOLS;
export const PULSE_NEWS = FALLBACK_NEWS;
export const MEETUPS = FALLBACK_MEETUPS;

export function getLayerById(id: string): StackLayer | undefined {
  return FALLBACK_LAYERS.find((l) => l.id === id || l.slug === id);
}

export function getLayerBySlug(slug: string): StackLayer | undefined {
  return FALLBACK_LAYERS.find((l) => l.slug === slug);
}

export function getToolsByLayer(layerId: string): Tool[] {
  return FALLBACK_TOOLS.filter((t) => t.layer === layerId);
}

export function filterTools(layer: string | null, search: string): Tool[] {
  return FALLBACK_TOOLS.filter((t) => {
    const matchesLayer = layer === "all" || layer === null || t.layer === layer;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.critical?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesLayer && matchesSearch;
  });
}
