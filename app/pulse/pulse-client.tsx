"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PulseUpdateWithLogo } from "@/lib/db/server-queries";

const NEWS_TYPES = [
  { value: "all", label: "All" },
  { value: "release", label: "Release" },
  { value: "benchmark", label: "Benchmark" },
  { value: "market", label: "Market" },
  { value: "policy", label: "Policy" },
  { value: "security", label: "Security" },
  { value: "feature", label: "Feature" },
] as const;

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function PulseNewsItem({ news }: { news: PulseUpdateWithLogo }) {
  const [isOpen, setIsOpen] = useState(false);

  const logoUrl = news.related_entity?.company?.logo_url || null;
  const sourceName = news.source_name || news.related_entity?.company?.name;

  return (
    <Card className="group border-border/60 hover:border-foreground/20 transition-colors">
      <CardContent className="p-5">
        {/* Header row with logo, chips, meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={sourceName || ""}
                width={20}
                height={20}
                className="rounded-sm object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-sm bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                {sourceName?.charAt(0) || "?"}
              </div>
            )}
            <Badge variant="secondary" className="text-xs font-normal capitalize">
              {news.type}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={10} />
              {formatRelativeTime(news.created_at)}
            </span>
            {news.importance_score !== null && news.importance_score > 7 && (
              <Badge
                variant="outline"
                className="text-xs font-normal border-amber-500/30 text-amber-600"
              >
                Important
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {news.url && (
              <Link
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Read
                <ArrowUpRight size={14} />
              </Link>
            )}
            <button
              onClick={() => setIsOpen((v) => !v)}
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <>
                  Less <ChevronUp size={14} />
                </>
              ) : (
                <>
                  More <ChevronDown size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-medium group-hover:text-foreground transition-colors mt-2">
          {news.title}
        </h3>

        {/* Collapsible content */}
        {news.content && (
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isOpen ? "max-h-[2000px] opacity-100 mt-3" : "max-h-0 opacity-0"
            }`}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {news.content}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Source footer */}
        {sourceName && (
          <p className="text-xs text-muted-foreground mt-3">
            via {sourceName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function PulseClient({
  news,
}: {
  news: PulseUpdateWithLogo[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const filteredNews = useMemo(() => {
    if (filter === "all") return news;
    return news.filter((item) => item.type === filter);
  }, [news, filter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: news.length };
    for (const item of news) {
      counts[item.type] = (counts[item.type] || 0) + 1;
    }
    return counts;
  }, [news]);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                Pulse
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Latest updates, releases, benchmarks, and news from the AI
                ecosystem.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={14} className="text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px] h-9 text-xs">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  {NEWS_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}{" "}
                      <span className="text-muted-foreground ml-1">
                        ({typeCounts[t.value] || 0})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pt-8 md:pt-12">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          {filteredNews.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-muted-foreground text-sm">
                No updates{" "}
                {filter !== "all" ? `for "${filter}"` : "yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((item) => (
                <PulseNewsItem key={item.id} news={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
