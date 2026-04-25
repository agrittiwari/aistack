import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EntityLogoFallback } from "@/lib/entity-logo";
import type { StackEntity } from "@/lib/server/stacks";

export function StackEntityCard({ entity, note }: { entity: StackEntity; note?: string }) {
  const description =
    entity.tagline ||
    (typeof entity.description === "string" ? entity.description : null) ||
    "AI-powered solution";

  const hasDarkBg = entity.is_dark_theme_logo;

  return (
    <Link href={`/${entity.slug}`} className="block">
      <Card className="group h-full bg-card/30 border-border/40 hover:border-border/70 transition-colors rounded-2xl overflow-hidden">
        <div className="p-5 flex items-start gap-4">
          <div className={`relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border ${hasDarkBg ? "bg-black border-neutral-800" : "bg-muted/30 border-border/40"}`}>
            <EntityLogoFallback
              logo_url={entity.logo_url}
              svg={entity.svg}
              name={entity.name}
              company_logo_char={entity.company_logo_char}
              className="w-full h-full object-contain p-1.5"
              is_dark_theme_logo={hasDarkBg}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight uppercase text-foreground truncate">
                {entity.name}
              </h3>
              {entity.verified_node ? (
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  Verified
                </span>
              ) : null}
            </div>
            {entity.company_name ? (
              <div className="text-xs text-muted-foreground truncate">{entity.company_name}</div>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              {entity.layer?.name ? (
                <span className="uppercase tracking-widest font-black text-foreground/70">
                  {entity.layer.name}
                </span>
              ) : null}
              {entity.pricing_model ? <span>{entity.pricing_model}</span> : null}
              {typeof entity.star_count === "number" && entity.star_count > 0 ? (
                <span>{entity.star_count.toLocaleString()} stars</span>
              ) : null}
            </div>
          </div>
        </div>
        {entity.tags && entity.tags.length > 0 ? (
          <div className="px-5 pb-5">
            <div className="flex flex-wrap gap-2">
              {entity.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-full bg-muted/30 border border-border/30 text-[10px] uppercase tracking-widest text-foreground/70"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {note ? (
          <div className="px-5 pb-5 border-t border-border/30 pt-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
              How they use it
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {note}
            </div>
          </div>
        ) : null}
      </Card>
    </Link>
  );
}

