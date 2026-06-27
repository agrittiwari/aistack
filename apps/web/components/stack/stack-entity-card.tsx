import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EntityLogoFallback } from "@/lib/entity-logo";
import type { StackEntity } from "@/lib/server/stacks";

export function StackEntityCard({ entity, note }: { entity: StackEntity; note?: string }) {
  const hasDarkBg = entity.is_dark_theme_logo;
  const layerName = entity.layer?.name;

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
            </div>
            {layerName && (
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                {layerName}
              </div>
            )}
          </div>
        </div>

        {note ? (
          <div className="px-5 pb-5">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {note}
            </div>
          </div>
        ) : entity.tagline ? (
          <div className="px-5 pb-5">
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {entity.tagline}
            </p>
          </div>
        ) : null}

        {entity.tags && entity.tags.length > 0 ? (
          <div className="px-5 pb-5 border-t border-border/30 pt-3">
            <div className="flex flex-wrap gap-1.5">
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
      </Card>
    </Link>
  );
}
