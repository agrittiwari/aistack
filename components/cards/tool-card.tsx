import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    redeem_url?: string | null;
    star_count?: number | null;
    type?: string | null;
    layer?: {
      id: number;
      slug: string;
      name: string;
    };
    tags?: string[] | null;
    pricing_model?: string | null;
    is_Dark_theme_logo?: boolean | null;
  };
  isInStack?: boolean;
}

export function ToolCard({ entity, isInStack = false }: ToolCardProps) {
  const displayDescription = entity.tagline || 
    (typeof entity.description === 'string' ? entity.description : null) || 
    "";

  const hasDarkBg = entity.is_Dark_theme_logo;

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        {/* Header — not clickable (has its own buttons) */}
        <div className="flex items-start gap-3 relative z-10">
          <div className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border ${hasDarkBg ? "bg-black border-neutral-800" : "bg-muted border-border/50"}`}>
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
              <h3 className="font-medium text-base text-foreground truncate">
                {entity.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {entity.star_count !== null && entity.star_count !== undefined && entity.star_count > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs">
                      {entity.star_count > 1000 
                        ? `${(entity.star_count / 1000).toFixed(1)}k` 
                        : entity.star_count}
                    </span>
                  </div>
                )}
                {(entity.redeem_url || entity.website_url) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs font-bold underline underline-offset-2 text-foreground hover:text-foreground/80 hover:bg-transparent"
                    asChild
                  >
                    <a
                      href={entity.redeem_url || entity.website_url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      
                    >
                      {entity.redeem_url ? "Redeem" : "Go to Website"}
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            {entity.company_name && (
              <p className="text-xs text-muted-foreground truncate">
                {entity.company_name}
              </p>
            )}
          </div>
        </div>

        {/* Description — clickable, navigates to entity page */}
        <Link href={`/${entity.slug}`} className="block mt-2.5 relative z-0">
          {displayDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
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
        </Link>
        
        {/* Footer — buttons are interactive, rest is static */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between relative z-10">
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
            
            <StackActions 
              entityId={entity.id} 
              initialIsInStack={isInStack} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturedToolCard({ entity, isInStack = false, offerLine }: ToolCardProps & { offerLine: string }) {
  const displayDescription = entity.tagline || 
    (typeof entity.description === 'string' ? entity.description : null) || 
    "";

  const hasDarkBg = entity.is_Dark_theme_logo;

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4">
        {/* Header — not clickable */}
        <div className="flex items-start gap-3 relative z-10">
          <div className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border ${hasDarkBg ? "bg-black border-neutral-800" : "bg-muted border-border/50"}`}>
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
              <h3 className="font-medium text-base text-foreground truncate">
                {entity.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {entity.star_count !== null && entity.star_count !== undefined && entity.star_count > 0 && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={12} className="fill-current" />
                    <span className="text-xs">
                      {entity.star_count > 1000 
                        ? `${(entity.star_count / 1000).toFixed(1)}k` 
                        : entity.star_count}
                    </span>
                  </div>
                )}
                {(entity.redeem_url || entity.website_url) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs font-bold underline underline-offset-2 text-foreground hover:text-foreground/80 hover:bg-transparent"
                    asChild
                  >
                    <a
                      href={entity.redeem_url || entity.website_url || ""}
                      target="_blank"
                      rel="noopener noreferrer"
                      
                    >
                      {entity.redeem_url ? "Redeem" : "Go to Website"}
                    </a>
                  </Button>
                )}
              </div>
            </div>
            
            {entity.company_name && (
              <p className="text-xs text-muted-foreground truncate">
                {entity.company_name}
              </p>
            )}
          </div>
        </div>

        {/* Offer Line — clickable, prominent */}
        {entity.website_url ? (
          <a
            href={entity.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm font-medium text-center hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors relative z-10"
            
          >
            {offerLine}
          </a>
        ) : (
          <div className="block mt-3 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm font-medium text-center relative z-10">
            {offerLine}
          </div>
        )}

        {/* Description — clickable, navigates to entity page */}
        <Link href={`/${entity.slug}`} className="block mt-2.5 relative z-0">
          {displayDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
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
        </Link>
        
        {/* Footer — buttons are interactive, rest is static */}
        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between relative z-10">
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
                
              >
                <ExternalLink size={14} />
              </a>
            )}
            <StackActions 
              entityId={entity.id} 
              initialIsInStack={isInStack} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ToolCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted animate-pulse flex-shrink-0" />
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
