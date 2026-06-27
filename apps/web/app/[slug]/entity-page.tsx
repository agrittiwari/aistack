import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EntityLogoFallback } from "@/lib/entity-logo";
import { getEntityBySlug } from "@/lib/server/entities";

interface EntityPageProps {
  slug: string;
}

export async function EntityPage({ slug }: EntityPageProps) {
  const entity = await getEntityBySlug(slug);

  if (!entity) {
    notFound();
  }

  const services = entity.services as string[] | null;
  const capabilities = entity.capabilities as string[] | null;
  const use_cases = entity.use_cases as string[] | null;

  return (
    <main className="min-h-screen pb-20">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back
        </Link>

        <Card className="overflow-hidden border-border/60 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-5">
              <div className={`w-16 h-16 rounded-xl overflow-hidden border flex items-center justify-center flex-shrink-0 ${entity.is_dark_theme_logo ? "bg-black border-neutral-800" : "bg-muted border-border/50"}`}>
                {entity.svg ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full text-current"
                    dangerouslySetInnerHTML={{ __html: entity.svg }}
                  />
                ) : entity.logo_url ? (
                  <img
                    src={entity.logo_url}
                    alt={entity.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <EntityLogoFallback
                    logo_url={entity.logo_url}
                    name={entity.name}
                    company_logo_char={entity.company_logo_char}
                    className="w-full h-full object-contain p-2"
                    is_dark_theme_logo={entity.is_dark_theme_logo}
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {entity.type && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {entity.type}
                    </Badge>
                  )}
                  {entity.layer && (
                    <Link href={`/${entity.layer.slug}`}>
                      <Badge 
                        variant="outline" 
                        className="text-xs font-normal cursor-pointer hover:bg-muted"
                      >
                        {entity.layer.name}
                      </Badge>
                    </Link>
                  )}
                  {entity.verified_node && (
                    <Badge variant="outline" className="text-xs font-normal border-emerald-500/30 text-emerald-600">
                      <CheckCircle size={12} className="mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-2xl font-semibold tracking-tight mb-1">
                  {entity.name}
                </h1>
                
                {entity.company_name && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {entity.company_name}
                  </p>
                )}
                
                {entity.tagline && (
                  <p className="text-muted-foreground">
                    {entity.tagline}
                  </p>
                )}

                {entity.tags && entity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {entity.tags.slice(0, 6).map((tag: string, index: number) => (
                      <span 
                        key={index} 
                        className="text-xs text-muted-foreground"
                      >
                        {tag}{index < Math.min(entity.tags!.length, 6) - 1 && <span className="mx-1">·</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>

          <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex flex-wrap items-center gap-3">
            {entity.website_url && (
              <Button asChild size="sm" className="gap-1.5">
                <a href={entity.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                  Website
                </a>
              </Button>
            )}
            
            {entity.github_url && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <a href={entity.github_url} target="_blank" rel="noopener noreferrer">
                  <Github size={14} />
                  GitHub
                </a>
              </Button>
            )}

            {entity.star_count !== null && entity.star_count > 0 && (
              <div className="flex items-center gap-1.5 ml-auto text-amber-500">
                <Star size={16} className="fill-current" />
                <span className="font-medium text-sm">{entity.star_count.toLocaleString()}</span>
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {entity.description && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {typeof entity.description === 'string' 
                    ? entity.description 
                    : JSON.stringify(entity.description)}
                </p>
              </div>
            )}

            <Separator />

            {services && services.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {services.map((service: string, index: number) => (
                    <Badge key={index} variant="secondary" className="font-normal">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {capabilities && capabilities.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap: string, index: number) => (
                    <Badge key={index} variant="outline" className="font-normal">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {use_cases && use_cases.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Use Cases</h2>
                <div className="flex flex-wrap gap-2">
                  {use_cases.map((useCase: string, index: number) => (
                    <Badge key={index} variant="outline" className="font-normal">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {(entity.pricing_model || entity.pricing_notes) && (
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {entity.pricing_model && (
                      <p className="font-medium">{entity.pricing_model}</p>
                    )}
                    {entity.pricing_notes && (
                      <p className="text-sm text-muted-foreground">{entity.pricing_notes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {entity.license && (
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">License</h3>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm">
                    {entity.license === 'open_source' ? 'Open Source' : 
                     entity.license === 'proprietary' ? 'Proprietary' : 'Source Available'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
