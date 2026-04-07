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
  longDesc?: string;
  challenges?: string[];
  metrics?: {
    efficiency: string;
    adoption: string;
    outlook: string;
  };
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

export const STACK_LAYERS: StackLayer[] = [
  { id: "1", slug: "compute-and-hardware", name: "Compute & Hardware", icon: Cpu, color: "from-blue-500 to-cyan-400", desc: "The physical power (NVIDIA, Cloud GPUs)." },
  { id: "2", slug: "foundation-models", name: "Foundation Models", icon: Brain, color: "from-purple-500 to-indigo-400", desc: "The base Brains (GPT, Claude, Llama)." },
  { id: "3", slug: "inference-and-hosting", name: "Inference & Hosting", icon: Zap, color: "from-yellow-400 to-orange-500", desc: "The Delivery (Groq, Together AI)." },
  { id: "4", slug: "training-and-fine-tuning", name: "Training & Fine-Tuning", icon: Dna, color: "from-pink-500 to-rose-400", desc: "The Optimization (Unsloth, RL Startups)." },
  { id: "5", slug: "data-and-vector", name: "Data & Vector", icon: Database, color: "from-emerald-400 to-teal-500", desc: "The Knowledge Base (Pinecone, LlamaIndex)." },
  { id: "6", slug: "orchestration", name: "Orchestration", icon: GitBranch, color: "from-blue-600 to-indigo-600", desc: "The Agent Logic (AI SDK, LangGraph)." },
  { id: "7", slug: "execution-and-sandbox", name: "Execution & Sandbox", icon: Code, color: "from-orange-400 to-red-500", desc: "The Action Space (E2B, Daytona, Rivet Actors)." },
  { id: "8", slug: "observability-and-safety", name: "Observability & Safety", icon: ShieldCheck, color: "from-red-500 to-orange-600", desc: "The Control Room (LangSmith, Guardrails)." },
];

export const INITIAL_TOOLS: Tool[] = [
  { id: 1, name: "NVIDIA Blackwell", layer: "compute-and-hardware", status: "Dominant", critical: "The backbone of every 2026 sovereign cloud initiative.", link: "#", year: "2026" },
  { id: 2, name: "DeepSeek R1", layer: "foundation-models", status: "Trending", critical: "The open-weights breakthrough.", link: "#", year: "2025" },
  { id: 3, name: "Groq LPU", layer: "inference-and-hosting", status: "Elite", critical: "Sub-millisecond latency.", link: "#", year: "2026" },
  { id: 4, name: "Unsloth", layer: "training-and-fine-tuning", status: "Vital", critical: "Local fine-tuning.", link: "#", year: "2025" },
  { id: 5, name: "Pinecone", layer: "data-and-vector", status: "Stable", critical: "Zero-maintenance vectors.", link: "#", year: "2024" },
  { id: 6, name: "LangGraph", layer: "orchestration", status: "Growing", critical: "Complex workflows.", link: "#", year: "2025" },
  { id: 7, name: "E2B Sandbox", layer: "execution-and-sandbox", status: "Niche", critical: "Safe code execution.", link: "#", year: "2025" },
  { id: 8, name: "Guardrails AI", layer: "observability-and-safety", status: "Mandatory", critical: "Production safety.", link: "#", year: "2026" },
];

export const PULSE_NEWS: NewsItem[] = [
  { id: 1, title: "Meta releases Llama 4-S", time: "12m ago", type: "Release", author: "Meta AI Team" },
  { id: 2, title: "Inference costs drop 30%", time: "48m ago", type: "Market", author: "Sector Analysis" },
  { id: 3, title: "Mistral Pi-3 benchmark", time: "2h ago", type: "Benchmark", author: "LMSYS" },
];

export const MEETUPS: Meetup[] = [
  { id: 1, name: "SF Agentic Night", city: "San Francisco", date: "April 14, 2026", host: "LangChain", attendees: 450, layer: "orchestration" },
];

export function getLayerById(id: string): StackLayer | undefined {
  return STACK_LAYERS.find((l) => l.id === id || l.slug === id);
}

export function getLayerBySlug(slug: string): StackLayer | undefined {
  return STACK_LAYERS.find((l) => l.slug === slug);
}

export function getToolsByLayer(layerId: string): Tool[] {
  return INITIAL_TOOLS.filter((t) => t.layer === layerId);
}

export function filterTools(layer: string | null, search: string): Tool[] {
  return INITIAL_TOOLS.filter((t) => {
    const matchesLayer = layer === "all" || layer === null || t.layer === layer;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.critical?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesLayer && matchesSearch;
  });
}