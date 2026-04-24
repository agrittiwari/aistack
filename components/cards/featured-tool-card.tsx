"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityLogoFallback } from "@/lib/entity-logo";
import { StackActions } from "@/components/stack/stack-actions";
import { Star, ArrowUpRight, ExternalLink } from "lucide-react";

interface FeaturedToolCardProps {
  entity: {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description?: string | null;
    logo_url?: string | null;
    svg?: string | null;
    company_logo_char?: string | null;
    company_name?: string | null;
    website_url?: string | null;
    redeem_url?: string | null;
    star_count?: number | null;
    type?: string | null;
    layer?: {
      id: number;
      slug: string;
      name: string;
    } | null;
    tags?: string[] | null;
    pricing_model?: string | null;
    is_dark_theme_logo?: boolean | null;
  };
  isInStack?: boolean;
}

export function FeaturedToolCard({ entity, isInStack = false }: FeaturedToolCardProps) {
  const displayDescription =
    entity.tagline ||
    (typeof entity.description === "string" ? entity.description : null) ||
    "";

  const longDescription =
    typeof entity.description === "string" && entity.description.length > displayDescription.length
      ? entity.description
      : displayDescription;

  const hasDarkBg = entity.is_dark_theme_logo;

  return (
    <Card className="group relative h-[160px] overflow-hidden border-border/60 bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="relative h-full p-5 overflow-hidden">
        {/* --- Default content (fades out + slides up on hover) --- */}
        <div className="absolute inset-0 p-5 flex items-center gap-4 transition-all duration-500 ease-out group-hover:opacity-0 group-hover:-translate-y-4">
          {/* Logo */}
          <div
            className={`
              relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden
              transition-transform duration-500
              ${hasDarkBg ? "bg-black border border-neutral-800" : "bg-transparent"}
            `}
          >
            <EntityLogoFallback
              logo_url={entity.logo_url}
              svg={entity.svg}
              name={entity.name}
              company_logo_char={entity.company_logo_char}
              className="w-full h-full object-contain p-1"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-foreground truncate">
                {entity.name}
              </h3>
              {entity.star_count !== null &&
                entity.star_count !== undefined &&
                entity.star_count > 0 && (
                  <div className="flex items-center gap-0.5 text-amber-500 flex-shrink-0">
                    <Star size={11} className="fill-current" />
                    <span className="text-[10px] font-medium">
                      {entity.star_count > 1000
                        ? `${(entity.star_count / 1000).toFixed(1)}k`
                        : entity.star_count}
                    </span>
                  </div>
                )}
            </div>

            {entity.company_name && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {entity.company_name}
              </p>
            )}

            {entity.type && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal mt-1.5 w-fit capitalize"
              >
                {entity.type}
              </Badge>
            )}
          </div>
        </div>

        {/* --- Hover content (slides up from below into the same space) --- */}
        <div className="absolute inset-0 p-5 flex flex-col justify-center transition-all duration-500 ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="space-y-3">
            {/* Description */}
            <Link href={`/${entity.slug}`} className="block">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {longDescription}
              </p>
            </Link>

            {/* Tags */}
            {entity.tags && entity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {entity.tags.slice(0, 4).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                {entity.layer && (
                  <Link href={`/${entity.layer.slug}`}>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal bg-muted hover:bg-muted/80"
                    >
                      {entity.layer.name}
                    </Badge>
                  </Link>
                )}

                {(entity.redeem_url || entity.website_url) && (
                  <a
                    href={entity.redeem_url || entity.website_url || ""}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {entity.redeem_url ? "Redeem" : "Website"}
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Link href={`/${entity.slug}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Details
                    <ArrowUpRight size={12} className="ml-0.5" />
                  </Button>
                </Link>
                <StackActions entityId={entity.id} initialIsInStack={isInStack} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedToolCardSkeleton() {
  return (
    <Card className="h-[160px] overflow-hidden border-border/60">
      <CardContent className="p-5 h-full">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-muted animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-28 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-12 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
