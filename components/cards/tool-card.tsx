"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tool, StackLayer, getLayerById } from "@/lib/data";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const layerInfo = getLayerById(tool.layer);

  return (
    <Link href={`/${tool.layer || layerInfo?.slug}`}>
      <Card className="bg-[#050507] border-white/10 p-8 hover:bg-[#08080c] transition-all group flex flex-col justify-between min-h-[340px] cursor-pointer overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                layerInfo?.color || "from-gray-500 to-gray-400"
              } p-2.5 flex items-center justify-center text-black shadow-lg`}
            >
              {layerInfo?.icon && <layerInfo.icon size={20} strokeWidth={2.5} />}
            </div>
            <span className="text-[10px] font-black text-white/20 italic group-hover:text-white/40 transition-colors uppercase tracking-widest">
              {tool.year}
            </span>
          </div>

          <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-2 italic uppercase leading-none tracking-tighter">
            {tool.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
              {tool.layer}
            </span>
            <div className="w-1 h-1 rounded-full bg-blue-500/50" />
            <Badge
              variant="secondary"
              className="text-[10px] font-bold uppercase tracking-[0.2em] bg-blue-500/20 text-blue-500/80"
            >
              {tool.status}
            </Badge>
          </div>

          <p className="text-sm text-white/50 leading-relaxed font-medium">
            {tool.critical}
          </p>
        </div>

        <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
            Sector Briefing
          </span>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 hover:text-blue-400 transition-colors">
            View Layer <ChevronRight size={12} />
          </span>
        </div>
      </Card>
    </Link>
  );
}

interface LayerCardProps {
  layer: StackLayer;
}

export function LayerCard({ layer }: LayerCardProps) {
  return (
    <Link href={`/${layer.slug}`}>
      <Card className="bg-[#050507] border-white/10 p-6 hover:bg-[#08080c] transition-all group cursor-pointer min-h-[200px] flex flex-col justify-end relative overflow-hidden">
        <div
          className={`absolute -top-4 -right-4 w-24 h-24 rounded-2xl bg-gradient-to-br ${layer.color} opacity-20 group-hover:opacity-40 transition-opacity`}
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${layer.color} p-1.5 flex items-center justify-center text-black`}>
              <layer.icon size={16} strokeWidth={2.5} />
            </div>
          </div>
          
          <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors italic uppercase tracking-tighter mb-1">
            {layer.name}
          </h3>
          
          <p className="text-xs text-white/40">{layer.desc}</p>
        </div>
      </Card>
    </Link>
  );
}