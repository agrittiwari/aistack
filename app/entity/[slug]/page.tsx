import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, Star, CheckCircle } from "lucide-react";
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
      entity:entities(
        id, name, slug, tagline, description, type, 
        website_url, github_url, logo_url, company_name, company_logo_char, 
        license, star_count, is_featured, is_primitive, verified_node
      ),
      layer:layers(id, name, slug, description),
      tags,
      pricing_model,
      pricing_notes,
      services,
      capabilities,
      use_cases,
      documentation_url,
      getting_started_url,
      version,
      is_deprecated,
      last_verified_at
    `)
    .eq("entity.slug", slug)
    .limit(1)
    .single();

  if (error || !entityData || !entityData.entity) {
    notFound();
  }

  const entity = entityData.entity as any;
  const layer = entityData.layer as any;
  const tags = entityData.tags as string[] | null;
  const pricing_model = entityData.pricing_model;
  const pricing_notes = entityData.pricing_notes;
  const services = entityData.services as string[] | null;
  const capabilities = entityData.capabilities as string[] | null;
  const use_cases = entityData.use_cases as string[] | null;

  return (
    <main className="min-h-screen bg-[#050507]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </Link>

        <div className="bg-[#1c1e26] rounded-2xl border border-[#3f4b68] overflow-hidden">
          <div className="p-8 pb-6 flex flex-col items-center text-center border-b border-[#3f4b68]">
            <div className="w-24 h-24 mb-5 rounded-full overflow-hidden bg-[#111827] flex items-center justify-center shadow-lg border border-gray-700">
              {entity.logo_url ? (
                <img 
                  src={entity.logo_url} 
                  alt={entity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-extrabold text-white">
                  {entity.company_logo_char?.trim() || entity.name?.charAt(0)}
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-extrabold text-white uppercase tracking-wide mb-2">
              {entity.name}
            </h1>
            
            {entity.company_name && (
              <p className="text-sm text-gray-500 mb-4">
                by {entity.company_name}
              </p>
            )}
            
            {entity.tagline && (
              <p className="text-lg text-gray-400 mb-6 max-w-2xl">
                {entity.tagline}
              </p>
            )}
            
            <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
              {entity.type && (
                <Badge className="bg-[#2d3342] text-gray-300 border-[#3f4b68]">
                  {entity.type}
                </Badge>
              )}
              {layer && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">
                  {layer.name}
                </Badge>
              )}
              {entity.license && (
                <Badge className="bg-white/5 text-gray-400 border-white/10">
                  {entity.license === 'open_source' ? 'Open Source' : entity.license === 'proprietary' ? 'Proprietary' : 'Source Available'}
                </Badge>
              )}
              {entity.verified_node && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/20">
                  <CheckCircle size={12} className="mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {tags && tags.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                {tags.slice(0, 6).map((tag: string, index: number) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-[#2d3342] text-gray-400 text-sm font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            {(pricing_model || pricing_notes) && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Pricing</h3>
                <div className="flex items-center gap-3">
                  {pricing_model && (
                    <span className="text-lg text-white font-medium">{pricing_model}</span>
                  )}
                  {pricing_notes && (
                    <span className="text-sm text-gray-400">{pricing_notes}</span>
                  )}
                </div>
              </div>
            )}

            {entity.star_count !== null && entity.star_count > 0 && (
              <div className="mb-6 flex items-center gap-2">
                <Star size={20} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xl text-white font-bold">{entity.star_count.toLocaleString()}</span>
                <span className="text-sm text-gray-400">stars</span>
              </div>
            )}

            {entity.description && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">About</h3>
                <p className="text-white/70 leading-relaxed">
                  {typeof entity.description === 'string' ? entity.description : JSON.stringify(entity.description)}
                </p>
              </div>
            )}

            {services && services.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Services</h3>
                <div className="flex flex-wrap gap-2">
                  {services.map((service: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-[#2d3342] text-gray-300 text-sm rounded-lg"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {capabilities && capabilities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-sm rounded-lg border border-blue-500/20"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {use_cases && use_cases.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Use Cases</h3>
                <div className="flex flex-wrap gap-2">
                  {use_cases.map((useCase: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-white/5 text-gray-400 text-sm rounded-lg border border-white/10"
                    >
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {layer && layer.description && (
              <div className="mb-8 p-4 bg-[#111827] rounded-lg border border-[#3f4b68]">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Layer</h3>
                <p className="text-white font-medium">{layer.name}</p>
                <p className="text-sm text-gray-400 mt-1">{layer.description}</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-[#15171e] border-t border-[#3f4b68] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {entity.website_url && (
                <a
                  href={entity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                >
                  <ExternalLink size={16} />
                  Visit Website
                </a>
              )}
              
              {entity.github_url && (
                <a
                  href={entity.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#2d3342] border border-[#3f4b68] text-white px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest hover:border-white/30 transition-all"
                >
                  <Github size={16} />
                  GitHub
                </a>
              )}
            </div>

            <div className="flex items-center gap-4">
              {entity.star_count !== null && entity.star_count > 0 && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{entity.star_count.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}