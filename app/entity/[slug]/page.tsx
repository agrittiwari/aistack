import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: entity } = await supabase
    .from("entities")
    .select("name, tagline, description, website_url, type, company_name")
    .eq("slug", slug)
    .single();

  if (!entity) {
    return { title: "Entity Not Found" };
  }

  const ent = entity as any;
  return {
    title: `${ent.name} - AI Stack`,
    description: ent.tagline || ent.description || `${ent.name} - ${ent.type} by ${ent.company_name}`,
    openGraph: {
      title: ent.name,
      description: ent.tagline || ent.description || `${ent.name} - ${ent.type}`,
      type: "website",
      url: `/entity/${slug}`,
    },
  };
}

export default async function EntityPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: entityData, error } = await supabase
    .from("entity_layers")
    .select(`
      entity:entities(id, name, slug, tagline, description, type, website_url, github_url, logo_url, company_name, company_logo_char, license, star_count),
      layer:layers(id, name, slug)
    `)
    .eq("entity.slug", slug)
    .limit(1)
    .single();

  if (error || !entityData) {
    notFound();
  }

  const entity = entityData.entity as any;
  const layer = entityData.layer as any;

  return (
    <main className="min-h-screen bg-[#050507]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </Link>

        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
            {entity.logo_url ? (
              <img 
                src={entity.logo_url} 
                alt={entity.name}
                className="w-14 h-14 object-contain"
              />
            ) : (
              <span className="text-2xl font-black text-white">
                {entity.company_logo_char?.trim() || entity.name?.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              {entity.name}
            </h1>
            
            <div className="flex items-center gap-3 flex-wrap">
              {entity.type && (
                <Badge className="bg-white/10 text-white/60 border-white/10">
                  {entity.type}
                </Badge>
              )}
              {layer && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                  {layer.name}
                </Badge>
              )}
              {entity.license && (
                <Badge className="bg-white/5 text-white/40 border-white/10">
                  {entity.license}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {entity.tagline && (
          <p className="text-xl text-white/60 font-medium mb-6">
            {entity.tagline}
          </p>
        )}

        {entity.description && (
          <p className="text-white/40 leading-relaxed mb-8">
            {entity.description}
          </p>
        )}

        <div className="flex items-center gap-4">
          {entity.website_url && (
            <a
              href={entity.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
            >
              Visit Website
            </a>
          )}
          
          {entity.github_url && (
            <a
              href={entity.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-white px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest hover:border-white/20 transition-all"
            >
              GitHub
            </a>
          )}
        </div>

        {entity.company_name && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-white/40">
              Built by <span className="text-white font-medium">{entity.company_name}</span>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}