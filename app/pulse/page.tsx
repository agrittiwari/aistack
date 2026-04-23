import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPulseUpdates } from "@/lib/db/server-queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pulse - AiStack",
  description: "Latest updates, releases, benchmarks, and news from the AI ecosystem.",
};

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
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

function PulseNewsItem({
  news,
}: {
  news: {
    id: string;
    title: string;
    content: string | null;
    type: string;
    url: string | null;
    source_name: string | null;
    created_at: string | null;
    importance_score: number | null;
  };
}) {
  return (
    <Card className="group border-border/60 hover:border-foreground/20 transition-colors">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="secondary" className="text-xs font-normal capitalize">
                {news.type}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={10} />
                {formatRelativeTime(news.created_at)}
              </span>
              {news.importance_score !== null && news.importance_score > 7 && (
                <Badge variant="outline" className="text-xs font-normal border-amber-500/30 text-amber-600">
                  Important
                </Badge>
              )}
            </div>
            <h3 className="text-base font-medium group-hover:text-foreground transition-colors">
              {news.title}
            </h3>
            {news.content && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {news.content}
              </p>
            )}
            {news.source_name && (
              <p className="text-xs text-muted-foreground mt-1">
                via {news.source_name}
              </p>
            )}
          </div>
          {news.url && (
            <Link
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start md:self-center"
            >
              Read
              <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PulsePage() {
  const news = await getPulseUpdates(50);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Pulse
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Latest updates, releases, benchmarks, and news from the AI ecosystem.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pt-8 md:pt-12">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          {news.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-muted-foreground text-sm">No updates yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <PulseNewsItem
                  key={item.id}
                  news={{
                    id: item.id,
                    title: item.title,
                    content: item.content,
                    type: item.type,
                    url: item.url,
                    source_name: item.source_name,
                    created_at: item.created_at,
                    importance_score: item.importance_score,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
