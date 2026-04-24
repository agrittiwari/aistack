import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "12");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const supabase = await createClient();

    const { data: layers } = await supabase
      .from("layers")
      .select("id, slug, name, description")
      .order("id");

    let query = supabase
      .from("entity_layers")
      .select(
        `
        entity:entities(
          id, name, slug, tagline, description, type,
          website_url, github_url, logo_url, svg, company_name, company_logo_char,
          license, star_count, is_featured, is_primitive, verified_node
        ),
        layer:layers(id, slug, name, description),
        tags,
        pricing_model,
        pricing_notes
      `
      )
      .eq("entities.verified_node", true)
      .not("entities.id", "is", null);

    if (layer && layer !== "all") {
      query = query.eq("layer.slug", layer);
    }

    if (search) {
      const searchTerm = search.trim();
      if (searchTerm) {
        query = query.or(
          `entities.name.ilike.%${searchTerm}%,entities.tagline.ilike.%${searchTerm}%`
        );
      }
    }

    query = query.order("entities.name", { ascending: true });
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 500 }
      );
    }

    const allData = data || [];

    type Row = {
      entity: {
        id?: string;
        name?: string | null;
        tagline?: string | null;
        is_featured?: boolean | null;
      } | null;
      layer: { slug?: string | null } | null;
      tags?: string[] | null;
      pricing_model?: string | null;
      pricing_notes?: string | null;
    };

    const entitiesWithEntity = allData
      .map((r) => r as unknown as Row)
      .filter((item) => item.entity !== null);

    const seen = new Set<string>();
    const deduped = entitiesWithEntity.filter((item) => {
      const id = item.entity?.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    const mappedEntities = deduped.map((item) => ({
      ...item.entity,
      layer: item.layer,
      tags: item.tags ?? null,
      pricing_model: item.pricing_model ?? null,
      pricing_notes: item.pricing_notes ?? null,
    }));

    return NextResponse.json({
      entities: mappedEntities,
      layers,
      hasMore: deduped.length === limit,
      success: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
