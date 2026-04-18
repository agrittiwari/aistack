import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const supabase = createClient();
    
    const { data: layers } = await supabase.from("layers").select("id, slug, name, description").order("id");
    
    const query = supabase
      .from("entity_layers")
      .select(`
        entity:entities(
          id, name, slug, tagline, description, type, 
          website_url, github_url, logo_url, svg, company_name, company_logo_char, 
          license, star_count, is_featured, is_primitive, verified_node
        ),
        layer:layers(id, slug, name, description),
        tags,
        pricing_model,
        pricing_notes
      `)
      .eq("entities.verified_node", true)
      .not("entities.id", "is", null)
      .limit(200);

    const { data, error } = await query;

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    const allData = data || [];
    
    type Row = {
      entity: { name?: string | null; tagline?: string | null; is_featured?: boolean | null } | null;
      layer: { slug?: string | null } | null;
    };

    const entitiesWithEntity = allData
      .map((r) => r as unknown as Row)
      .filter((item) => item.entity !== null);
    const featuredEntities = entitiesWithEntity
      .filter((item) => item.entity?.is_featured === true)
      .slice(0, 6);
    
    const filteredData = entitiesWithEntity
      .filter((item) => {
        if (layer && layer !== "all" && item.layer?.slug !== layer) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!item.entity?.name?.toLowerCase().includes(q) && 
              !item.entity?.tagline?.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => 
        (a.entity?.name || "").localeCompare(b.entity?.name || "")
      )
      .slice(0, limit);

    return NextResponse.json({
      entities: filteredData,
      featured: featuredEntities,
      layers,
      total: filteredData.length,
      success: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
