import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EntityLogoFallback } from "@/lib/entity-logo";
import { StackActions } from "@/components/stack/stack-actions";

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
    github_url?: string | null;
    license?: string | null;
    star_count?: number | null;
    type?: string | null;
    layer?: {
      id: number;
      slug: string;
      name: string;
      description?: string | null;
    };
    tags?: string[] | null;
    pricing_model?: string | null;
    pricing_notes?: string | null;
    is_featured?: boolean | null;
    is_primitive?: boolean | null;
    verified_node?: boolean | null;
  };
  isInStack?: boolean;
}

export function ToolCard({ entity, isInStack = false }: ToolCardProps) {
  const displayDescription = entity.tagline || 
    (typeof entity.description === 'string' ? entity.description : null) || 
    "AI-powered solution";

  return (
    <Link href={`/entity/${entity.slug}`} className="block">
      <article className="bg-card border-border flex flex-col overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full rounded-xl">
        <div className="p-6 pb-4 flex flex-col items-center text-center flex-1">
          <div className="h-12 max-w-[140px] mb-4 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
            <EntityLogoFallback
              logo_url={entity.logo_url}
              svg={entity.svg}
              name={entity.name}
              company_logo_char={entity.company_logo_char}
              className="h-full w-auto object-contain"
            />
          </div>
          
          <h2 className="text-xl font-extrabold text-card-foreground tracking-wide mb-2 uppercase line-clamp-1">
            {entity.name}
          </h2>

          {entity.company_name && (
            <p className="text-xs text-muted-foreground mb-3 truncate max-w-full">
              {entity.company_name}
            </p>
          )}
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
          
          {entity.tags && entity.tags.length > 0 && (
            <div className="flex gap-1.5 mb-4 flex-wrap justify-center">
              {entity.tags.slice(0, 3).map((tag: string, index: number) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mt-auto">
            {entity.pricing_model && (
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" x2="7.01" y1="7" y2="7" />
                </svg>
                <span>{entity.pricing_model}</span>
              </div>
            )}
            
            {entity.github_url && (
              <a href={entity.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
                <span>Open Source</span>
              </a>
            )}
            
            {entity.star_count !== null && entity.star_count !== undefined && entity.star_count > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{entity.star_count.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {entity.layer && (
          <Link href={`/${entity.layer.slug}`} className="w-full px-4 pb-4">
            <div className="w-full h-28 rounded-lg overflow-hidden relative border border-border bg-muted flex items-center justify-center hover:border-primary/50 transition-colors">
              <div className="text-center p-3">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  {entity.layer.name}
                </span>
                {entity.layer.description && (
                  <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2 max-w-full">
                    {entity.layer.description}
                  </p>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
            </div>
          </Link>
        )}
        
        <footer className="flex items-center justify-between p-4 border-t border-border text-muted-foreground bg-card/50">
          <div className="flex items-center gap-3">
            {entity.website_url && (
              <a href={entity.website_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium hover:text-foreground transition-colors">
                Visit Website
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <StackActions entityId={entity.id} initialIsInStack={isInStack} />
          </div>
        </footer>
      </article>
    </Link>
  );
}

export function ToolCardSkeleton() {
  return (
    <Card className="bg-[#1c1e26] border-[#3f4b68] p-6 animate-pulse h-full">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gray-700 mb-4" />
        <div className="h-6 w-32 bg-gray-700 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-700 rounded mb-4" />
        <div className="h-4 w-full bg-gray-700 rounded mb-4" />
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-12 bg-gray-700 rounded-full" />
          <div className="h-5 w-12 bg-gray-700 rounded-full" />
        </div>
        <div className="flex gap-4 mt-auto">
          <div className="h-3 w-16 bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-700 rounded" />
        </div>
      </div>
    </Card>
  );
}