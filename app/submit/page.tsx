"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { STACK_LAYERS } from "@/lib/data";

export default function SubmitPage() {
  return (
    <div className="pt-40 pb-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
          Submit to the Stack
        </h1>
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
          The directory is peer-reviewed. Submit your tool for indexation.
        </p>
      </div>

      <div className="space-y-8 bg-[#0a0a0c] border border-white/5 p-12 rounded-3xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Startup Name
            </label>
            <Input
              type="text"
              placeholder="e.g. NeuroFlow"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Target Layer
            </label>
            <Select>
              <SelectTrigger className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-white/50">
                <SelectValue placeholder="Select a layer" />
              </SelectTrigger>
              <SelectContent>
                {STACK_LAYERS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
            The Critical Pitch (Max 140 char)
          </label>
          <Textarea
            placeholder="Why does this matter for the 2026 ecosystem?"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
        <Button className="w-full bg-white text-black py-4 rounded-xl font-black italic uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          INITIATE REVIEW PROCESS
        </Button>
        <p className="text-center text-[10px] text-white/20 font-medium leading-relaxed italic uppercase">
          Submissions are audited by the AiStack core contributors.
          <br />
          Estimated review time: 48 hours.
        </p>
      </div>
    </div>
  );
}