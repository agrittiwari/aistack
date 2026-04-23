import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLayerBySlug } from "@/lib/server/layers";
import { getEntityBySlug } from "@/lib/server/entities";
import { LayerPage } from "./layer-page";
import { EntityPage } from "./entity-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const layer = await getLayerBySlug(slug);
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

  const layer = await getLayerBySlug(slug);
  if (layer) {
    return <LayerPage slug={slug} search={search} />;
  }

  const entity = await getEntityBySlug(slug);
  if (entity) {
    return <EntityPage slug={slug} />;
  }

  notFound();
}
