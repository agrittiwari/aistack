import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const supabase = createClient();
    
    let query = supabase
      .from("entity_layers")
      .select(`
        entity:entities(id, name, slug, tagline, description, type, website_url, logo_url, company_name, company_logo_char, license, is_featured),
        layer:layers(id, slug, name)
      `, { count: "exact" })
      .limit(limit);

    if (layer && layer !== "all") {
      query = query.eq("layer.slug", layer);
    }

    if (search) {
      query = query.or(`entities.name.ilike.%${search}%,entities.tagline.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    const { data: layers } = await supabase.from("layers").select("id, slug, name").order("id");

    // Sort results by entity name client-side
    const sortedData = [...(data || [])].sort((a: any, b: any) => 
      (a.entity?.name || "").localeCompare(b.entity?.name || "")
    );

    return NextResponse.json({
      entities: sortedData,
      layers,
      total: count || 0,
      success: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}