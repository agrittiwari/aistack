"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PULSE_NEWS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function PulseNewsItem({
  news,
}: {
  news: (typeof PULSE_NEWS)[number];
}) {
  return (
    <Card className="group border-border/60 hover:border-foreground/20 transition-colors">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="secondary" className="text-xs font-normal">
                {news.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {news.time}
              </span>
            </div>
            <h3 className="text-base font-medium group-hover:text-foreground transition-colors">
              {news.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {news.author}
            </p>
          </div>
          <button className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors self-start md:self-center">
            Read
            <ArrowUpRight size={14} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PulsePage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Pulse
        </h1>
        <p className="text-muted-foreground text-sm">
          Latest updates from the AI ecosystem.
        </p>
      </div>

      <div className="space-y-3">
        {PULSE_NEWS.map((news) => (
          <PulseNewsItem key={news.id} news={news} />
        ))}
      </div>

      {PULSE_NEWS.length === 0 && (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-muted-foreground text-sm">No updates yet</p>
        </div>
      )}
    </div>
  );
}
