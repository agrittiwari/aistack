import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const supabase = createClient();
    
    const { data: layers } = await supabase.from("layers").select("id, slug, name").order("id");
    
    const { data, error } = await supabase
      .from("entity_layers")
      .select(`
        entity:entities(id, name, slug, tagline, description, type, website_url, logo_url, company_name, company_logo_char, license, is_featured),
        layer:layers(id, slug, name)
      `)
      .limit(200);

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    const filteredData = [...(data || [])]
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
      layers,
      total: filteredData.length,
      success: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}