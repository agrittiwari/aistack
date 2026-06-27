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

const iconMap: Record<string, LucideIcon> = {
  cpu: Cpu,
  brain: Brain,
  zap: Zap,
  dna: Dna,
  database: Database,
  "git-branch": GitBranch,
  code: Code,
  "shield-check": ShieldCheck,
};

export function getIconByName(name: string | null): LucideIcon | null {
  if (!name) return null;
  return iconMap[name.toLowerCase()] || null;
}