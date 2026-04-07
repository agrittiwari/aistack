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
  icon: LucideIcon;
  color: string;
  desc: string;
  longDesc: string;
  challenges: string[];
  metrics: {
    efficiency: string;
    adoption: string;
    outlook: string;
  };
}

export interface Tool {
  id: number;
  name: string;
  layer: string;
  status: string;
  critical: string;
  link: string;
  year: string;
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
  layer: string;
}

export const STACK_LAYERS: StackLayer[] = [
  {
    id: "1",
    slug: "compute-and-hardware",
    name: "Compute & Hardware",
    icon: Cpu,
    color: "from-blue-500 to-cyan-400",
    desc: "The physical power (NVIDIA, Cloud GPUs).",
    longDesc:
      "The physical foundation of intelligence. In 2026, the focus has shifted from raw FLOPS to energy efficiency and sovereign silicon. As transformer-specific ASICs dominate, the boundary between hardware and software continues to blur.",
    challenges: [
      "Thermal management at 1.2kW per chip",
      "Inter-DC optical interconnect latency",
      "Sovereign supply chain resilience",
    ],
    metrics: { efficiency: "+40% YoY", adoption: "Enterprise High", outlook: "Critical" },
  },
  {
    id: "2",
    slug: "foundation-models",
    name: "Foundation Models",
    icon: Brain,
    color: "from-purple-500 to-indigo-400",
    desc: "The base Brains (GPT, Claude, Llama).",
    longDesc:
      "The core reasoning engines. We are seeing a divergence between 'Goliath' frontier models and 'David' efficient, task-specific weights. Multimodality is no longer a feature—it is the default architecture.",
    challenges: [
      "Reasoning consistency in logic tasks",
      "Long-context window retrieval accuracy",
      "Copyright-safe training data synthesis",
    ],
    metrics: { efficiency: "+120% YoY", adoption: "Ubiquitous", outlook: "Dynamic" },
  },
  {
    id: "3",
    slug: "inference-and-hosting",
    name: "Inference & Hosting",
    icon: Zap,
    color: "from-yellow-400 to-orange-500",
    desc: "The Delivery (Groq, Together AI).",
    longDesc:
      "Where intelligence meets reality. Inference optimization has become the primary battleground for startups, moving away from general-purpose GPUs toward specialized LPUs and edge-compute clusters.",
    challenges: [
      "Sub-100ms real-time audio/visual loops",
      "Batch size optimization for long-tail queries",
      "Quantization loss in specialized domains",
    ],
    metrics: {
      efficiency: "+300% YoY",
      adoption: "Market High",
      outlook: "Aggressive",
    },
  },
  {
    id: "4",
    slug: "training-and-fine-tuning",
    name: "Training & Fine-Tuning",
    icon: Dna,
    color: "from-pink-500 to-rose-400",
    desc: "The Optimization (Unsloth, RL Startups).",
    longDesc:
      "The science of post-training and alignment. Direct Preference Optimization (DPO) and Reinforcement Learning from Verifiable Feedback (RLVF) have replaced standard fine-tuning as the standard for enterprise models.",
    challenges: [
      "Reward model collapse",
      "Catastrophic forgetting in incremental learning",
      "Synthetic data loop contamination",
    ],
    metrics: { efficiency: "+25% YoY", adoption: "Specialized", outlook: "High-Bar" },
  },
  {
    id: "5",
    slug: "data-and-vector",
    name: "Data & Vector",
    icon: Database,
    color: "from-emerald-400 to-teal-500",
    desc: "The Knowledge Base (Pinecone, LlamaIndex).",
    longDesc:
      "The oxygen of the stack. Modern data architectures prioritize 'Graph-RAG' where vector memory is combined with knowledge graphs to provide agents with perfect episodic and semantic recall.",
    challenges: [
      "Privacy-preserving retrieval (PPR)",
      "Graph-Vector hybrid consistency",
      "Dynamic context pruning for cost control",
    ],
    metrics: {
      efficiency: "+60% YoY",
      adoption: "Enterprise Base",
      outlook: "Stable",
    },
  },
  {
    id: "6",
    slug: "orchestration",
    name: "Orchestration",
    icon: GitBranch,
    color: "from-blue-600 to-indigo-600",
    desc: "The Agent Logic (AI SDK, LangGraph).",
    longDesc:
      "The central nervous system. This layer manages the flow between models, tools, and memory. In 2026, orchestration has moved from linear chains to self-correcting, autonomous multi-agent swarms.",
    challenges: [
      "Multi-agent loop termination logic",
      "Task decomposition for complex planning",
      "Inter-agent communication standard protocols",
    ],
    metrics: {
      efficiency: "+200% YoY",
      adoption: "High Growth",
      outlook: "Explosive",
    },
  },
  {
    id: "7",
    slug: "execution-and-sandbox",
    name: "Execution & Sandbox",
    icon: Code,
    color: "from-orange-400 to-red-500",
    desc: "The Action Space (E2B, Daytona, Rivet Actors).",
    longDesc:
      "Granting models the ability to act. Secure execution environments allow agents to write, debug, and run code in isolated sandboxes, bridging the gap between 'thinking' and 'doing.'",
    challenges: [
      "Sandbox breakout prevention",
      "Ephemeral environment startup latency",
      "Secure API credential management",
    ],
    metrics: { efficiency: "+50% YoY", adoption: "Growing", outlook: "Crucial" },
  },
  {
    id: "8",
    slug: "observability-and-safety",
    name: "Observability & Safety",
    icon: ShieldCheck,
    color: "from-red-500 to-orange-600",
    desc: "The Control Room (LangSmith, Guardrails).",
    longDesc:
      "The vital layer of trust. Observability in 2026 goes beyond logging; it involves real-time 'Guardrails' that intercept and sanitize model outputs before they reach the end user.",
    challenges: [
      "Real-time hallucination detection",
      "Explainability in deep-reasoning chains",
      "Bias drift monitoring in live swarms",
    ],
    metrics: {
      efficiency: "+15% YoY",
      adoption: "Mandatory",
      outlook: "Regulatory",
    },
  },
];

export const INITIAL_TOOLS: Tool[] = [
  {
    id: 1,
    name: "NVIDIA Blackwell",
    layer: "compute-and-hardware",
    status: "Dominant",
    critical: "The backbone of every 2026 sovereign cloud initiative.",
    link: "#",
    year: "2026",
  },
  {
    id: 2,
    name: "DeepSeek R1",
    layer: "foundation-models",
    status: "Trending",
    critical:
      "The open-weights breakthrough that challenged the reasoning status quo.",
    link: "#",
    year: "2025",
  },
  {
    id: 3,
    name: "Groq LPU",
    layer: "inference-and-hosting",
    status: "Elite",
    critical: "Sub-millisecond latency for real-time agentic conversations.",
    link: "#",
    year: "2026",
  },
  {
    id: 4,
    name: "Unsloth",
    layer: "training-and-fine-tuning",
    status: "Vital",
    critical: "Local fine-tuning is now viable for every startup.",
    link: "#",
    year: "2025",
  },
  {
    id: 5,
    name: "Pinecone Serverless",
    layer: "data-and-vector",
    status: "Stable",
    critical: "Standardizing the RAG stack with zero-maintenance vectors.",
    link: "#",
    year: "2024",
  },
  {
    id: 6,
    name: "LangGraph",
    layer: "orchestration",
    status: "Growing",
    critical: "Orchestrating complex, cyclic workflows at scale.",
    link: "#",
    year: "2025",
  },
  {
    id: 7,
    name: "E2B Sandbox",
    layer: "execution-and-sandbox",
    status: "Niche",
    critical: "The safest environment for agents to run untrusted code.",
    link: "#",
    year: "2025",
  },
  {
    id: 8,
    name: "Guardrails AI",
    layer: "observability-and-safety",
    status: "Mandatory",
    critical:
      "Because hallucinations are no longer acceptable in production.",
    link: "#",
    year: "2026",
  },
  {
    id: 9,
    name: "Anthropic Claude 4",
    layer: "foundation-models",
    status: "Hot",
    critical: "Setting new benchmarks in visual reasoning and complex planning.",
    link: "#",
    year: "2026",
  },
  {
    id: 10,
    name: "CoreWeave",
    layer: "compute-and-hardware",
    status: "Dominant",
    critical: "Specialized GPU cloud infrastructure for frontier scale.",
    link: "#",
    year: "2025",
  },
  {
    id: 11,
    name: "Mistral Large 3",
    layer: "foundation-models",
    status: "Elite",
    critical: "European sovereignty for high-tier reasoning.",
    link: "#",
    year: "2026",
  },
];

export const PULSE_NEWS: NewsItem[] = [
  {
    id: 1,
    title: "Meta releases Llama 4-S (Small) with native multi-modal support",
    time: "12m ago",
    type: "Release",
    author: "Meta AI Team",
  },
  {
    id: 2,
    title: "Inference costs drop another 30% as ASIC adoption spikes",
    time: "48m ago",
    type: "Market",
    author: "Sector Analysis",
  },
  {
    id: 3,
    title: "Mistral Pi-3 outperforms GPT-4o in mathematical reasoning",
    time: "2h ago",
    type: "Benchmark",
    author: "LMSYS",
  },
  {
    id: 4,
    title: 'Pinecone announces native "Graph Memory" for persistent agents',
    time: "4h ago",
    type: "Feature",
    author: "Pinecone Eng",
  },
  {
    id: 5,
    title: 'US Government announces $50B "Sovereign Silicon" Grant',
    time: "6h ago",
    type: "Policy",
    author: "DC Bureau",
  },
  {
    id: 6,
    title: "Agentic Code Execution: New security protocols leaked",
    time: "8h ago",
    type: "Security",
    author: "OpenSource Watch",
  },
];

export const MEETUPS: Meetup[] = [
  {
    id: 1,
    name: "SF Agentic Architecture Night",
    city: "San Francisco",
    date: "April 14, 2026",
    host: "LangChain & CrewAI",
    attendees: 450,
    layer: "orchestration",
  },
  {
    id: 2,
    name: "The GPU Scarcity Summit",
    city: "Berlin",
    date: "April 22, 2026",
    host: "Lambda Labs",
    attendees: 200,
    layer: "compute-and-hardware",
  },
  {
    id: 3,
    name: "RAG vs Long-Context Debate",
    city: "Austin",
    date: "May 05, 2026",
    host: "Pinecone",
    attendees: 300,
    layer: "data-and-vector",
  },
  {
    id: 4,
    name: "Inference at the Edge Workshop",
    city: "Tokyo",
    date: "May 12, 2026",
    host: "Groq",
    attendees: 150,
    layer: "inference-and-hosting",
  },
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

export function filterTools(
  layer: string | null,
  search: string
): Tool[] {
  return INITIAL_TOOLS.filter((t) => {
    const matchesLayer = layer === "all" || layer === null || t.layer === layer;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.critical.toLowerCase().includes(search.toLowerCase());
    return matchesLayer && matchesSearch;
  });
}