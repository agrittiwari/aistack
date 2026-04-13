import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");
  const includeUnverified = searchParams.get("includeUnverified") === "true"; // Optional: include unverified

  try {
    const supabase = createClient();
    
    const { data: layers } = await supabase.from("layers").select("id, slug, name, description").order("id");
    
    let query = supabase
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
      .limit(200);

    // By default, only fetch verified entities
    if (!includeUnverified) {
      query = query.eq("entities.verified_node", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    // Separate featured and regular entities
    const allEntities = [...(data || [])];
    const featuredEntities = allEntities
      .filter((item: any) => item.entity?.is_featured === true)
      .slice(0, 6);
    
    const filteredData = allEntities
      .filter((item: any) => {
        if (layer && layer !== "all" && item.layer?.slug !== layer) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!item.entity?.name?.toLowerCase().includes(q) && 
              !item.entity?.tagline?.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a: any, b: any) => 
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