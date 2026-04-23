import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntityLogoFallback } from "@/lib/entity-logo";
import { StackActions } from "@/components/stack/stack-actions";
import { ExternalLink, Star } from "lucide-react";

interface ToolCardProps {
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
    star_count?: number | null;
    type?: string | null;
    layer?: {
      id: number;
      slug: string;
      name: string;
    };
    tags?: string[] | null;
    pricing_model?: string | null;
  };
  isInStack?: boolean;
}

export function ToolCard({ entity, isInStack = false }: ToolCardProps) {
  const displayDescription = entity.tagline || 
    (typeof entity.description === 'string' ? entity.description : null) || 
    "";

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
            <EntityLogoFallback
              logo_url={entity.logo_url}
              svg={entity.svg}
              name={entity.name}
              company_logo_char={entity.company_logo_char}
              className="w-full h-full object-contain p-1.5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm text-foreground truncate">
                {entity.name}
              </h3>
              {entity.star_count !== null && entity.star_count !== undefined && entity.star_count > 0 && (
                <div className="flex items-center gap-1 text-amber-500 flex-shrink-0">
                  <Star size={12} className="fill-current" />
                  <span className="text-xs">
                    {entity.star_count > 1000 
                      ? `${(entity.star_count / 1000).toFixed(1)}k` 
                      : entity.star_count}
                  </span>
                </div>
              )}
            </div>
            
            {entity.company_name && (
              <p className="text-xs text-muted-foreground truncate">
                {entity.company_name}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {displayDescription && (
          <p className="mt-2.5 text-sm text-muted-foreground line-clamp-2">
            {displayDescription}
          </p>
        )}
        
        {/* Tags */}
        {entity.tags && entity.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {entity.tags.slice(0, 2).map((tag: string, index: number) => (
              <span 
                key={index} 
                className="text-xs text-muted-foreground"
              >
                {tag}{index < Math.min(entity.tags!.length, 2) - 1 && <span className="mx-1">·</span>}
              </span>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {entity.layer && (
              <Link href={`/${entity.layer.slug}`}>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-normal bg-muted hover:bg-muted/80"
                >
                  {entity.layer.name}
                </Badge>
              </Link>
            )}
            
            {entity.pricing_model && (
              <span className="text-xs text-muted-foreground">
                {entity.pricing_model}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {entity.website_url && (
              <a 
                href={entity.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            )}
            <StackActions entityId={entity.id} initialIsInStack={isInStack} />
          </div>
        </div>
      </CardContent>

      {/* Clickable overlay */}
      <Link 
        href={`/entity/${entity.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${entity.name}`}
      />
    </Card>
  );
}

export function ToolCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="mt-2.5 space-y-1.5">
          <div className="h-3.5 w-full bg-muted rounded animate-pulse" />
          <div className="h-3.5 w-2/3 bg-muted rounded animate-pulse" />
        </div>
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
