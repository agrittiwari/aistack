import Link from "next/link";
import { STACK_LAYERS } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#08080a] py-20 px-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-black italic text-[10px]">
                AS
              </div>
              <span className="font-bold text-white uppercase italic tracking-tighter">
                AiStack Directory
              </span>
            </div>
            <p className="text-white/30 text-xs max-w-sm mb-8 leading-relaxed font-medium">
              The terminal for the modularization of AI. 2026 Archive System. No
              noise, just architecture.
            </p>
            <div className="flex items-center gap-3">
              {["𝕏", "In", "Gh"].map((soc) => (
                <div
                  key={soc}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40 hover:text-white hover:border-white/40 cursor-pointer transition-all uppercase tracking-tighter"
                >
                  {soc}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6 italic">
              The 8 Layers
            </h4>
            <ul className="space-y-3 text-[10px] text-white/30 font-bold uppercase tracking-widest">
              {STACK_LAYERS.map((l) => (
                <li
                  key={l.id}
                  className="hover:text-blue-500 cursor-pointer transition-colors"
                >
                  <Link href={`/${l.slug}`}>{l.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6 italic">
              Pulse Briefing
            </h4>
            <p className="text-[10px] text-white/40 mb-4 font-medium leading-relaxed">
              Direct transmission to your inbox.
            </p>
            <form className="flex gap-2" action="https://aistacklayers.substack.com/subscribe" method="post" target="_blank">
              <input
                type="email"
                name="email"
                placeholder="terminal@stack.com"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase italic tracking-tighter hover:bg-blue-500 hover:text-white transition-colors"
              >
                SUB
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
            © 2026 AI STACK DIRECTORY SYSTEM
          </span>
          <div className="flex gap-6 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
            <span className="hover:text-white cursor-pointer transition-colors italic">
              Privacy
            </span>
            <span className="hover:text-white cursor-pointer transition-colors italic">
              Sitemap
            </span>
            <span className="hover:text-white cursor-pointer transition-colors italic">
              Node: 7A-X9
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}