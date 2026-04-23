import { notFound } from "next/navigation";
import { getLayerBySlug as getLayerBySlugServer } from "@/lib/server/layers";
import { getEntityBySlug } from "@/lib/server/entities";
import LayerPageContent from "./layer-content";
import EntityPageContent from "./entity-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const layer = await getLayerBySlugServer(slug);

  if (layer) {
    return {
      title: `${layer.name} - AiStack`,
      description: layer.description || "",
    };
  }

  const entity = await getEntityBySlug(slug);
  if (entity) {
    return {
      title: `${entity.name} - AiStack`,
      description: entity.tagline || `${entity.name} - ${entity.type}`,
    };
  }

  return { title: "Not Found - AiStack" };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ search?: string }>;
}) {
  const { slug } = await params;
  const { search } = await searchParams;

  const layer = await getLayerBySlugServer(slug);
  if (layer) {
    return <LayerPageContent layerSlug={slug} search={search} />;
  }

  const entity = await getEntityBySlug(slug);
  if (entity) {
    return <EntityPageContent slug={slug} />;
  }

  notFound();
}
