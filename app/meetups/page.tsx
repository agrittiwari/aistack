"use client";

import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STACK_LAYERS, MEETUPS, getLayerById } from "@/lib/data";

function MeetupCard({
  meetup,
}: {
  meetup: (typeof MEETUPS)[number];
}) {
  const layer = getLayerById(meetup.layer || "");

  return (
    <Card className="group relative bg-[#0f0f12] border border-white/5 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500">
      <div className="flex justify-between items-start mb-8">
        <div
          className={`p-3 rounded-2xl bg-gradient-to-br ${
            layer?.color || "from-gray-500 to-gray-400"
          } text-black`}
        >
          {layer?.icon && <layer.icon size={24} />}
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1 italic">
            Date
          </div>
          <div className="text-sm font-bold text-white">{meetup.date}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={12} className="text-purple-500" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
            {meetup.city}
          </span>
        </div>
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none group-hover:text-purple-400 transition-colors">
          {meetup.name}
        </h3>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-0.5">
              Host
            </div>
            <div className="text-xs font-bold text-white italic uppercase">
              {meetup.host}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-0.5">
              Capacity
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-tighter">
              {meetup.attendees} attending
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="bg-white/5 hover:bg-white text-white hover:text-black px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-tighter transition-all"
        >
          Join List
        </Button>
      </div>
    </Card>
  );
}

export default function MeetupsPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-20">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-purple-500 mb-4 italic">
          Global Network
        </h2>
        <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-8">
          Ecosystem Meetups<span className="text-purple-500">.</span>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <p className="text-white/50 text-lg font-medium leading-relaxed">
            The AI Stack is built by people. From local agent hackathons to hardware
            summits, find your layer.
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-black bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white"
                >
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
              1,200+ members attending globally this month
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MEETUPS.map((meetup) => (
          <MeetupCard key={meetup.id} meetup={meetup} />
        ))}
      </div>
    </div>
  );
}