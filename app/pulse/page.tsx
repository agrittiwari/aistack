"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PULSE_NEWS } from "@/lib/data";
import { Card } from "@/components/ui/card";

function PulseNewsItem({
  news,
}: {
  news: (typeof PULSE_NEWS)[number];
}) {
  return (
    <Link href="/pulse">
      <Card className="bg-[#050507] border-white/10 p-8 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[10px] font-bold bg-white/10 text-white/60 px-2 py-0.5 rounded-md uppercase tracking-widest">
                {news.type}
              </span>
              <span className="text-[10px] font-medium text-white/20 uppercase tracking-widest">
                {news.time}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-2 uppercase tracking-tighter leading-tight">
              {news.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold text-white/40">
                A
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Source: {news.author}
              </span>
            </div>
          </div>
          <button className="flex items-center gap-2 self-start md:self-center text-xs font-bold text-white/40 group-hover:text-white transition-colors uppercase tracking-widest">
            Full Report <ArrowUpRight size={14} />
          </button>
        </div>
      </Card>
    </Link>
  );
}

export default function PulsePage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-4">
            Live Terminal
          </h2>
          <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">
            The Pulse<span className="text-blue-500">_</span>
          </h1>
        </div>
        <p className="max-w-xs text-white/40 text-sm font-medium leading-relaxed">
          Chronological insights into the 2026 AI infrastructure shift. Curated by
          the community.
        </p>
      </div>

      <div className="space-y-px bg-white/10 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {PULSE_NEWS.map((news) => (
          <PulseNewsItem key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
}