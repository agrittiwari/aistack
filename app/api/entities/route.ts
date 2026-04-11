import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const search = searchParams.get("search") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const supabase = createClient();
    
    // First let's debug what's happening
    console.log("Filter - layer:", layer, "search:", search);
    
    let query = supabase
      .from("entity_layers")
      .select(`
        entity:entities(id, name, slug, tagline, description, type, website_url, logo_url, company_name, company_logo_char, license, is_featured),
        layer:layers(id, slug, name)
      `, { count: "exact" })
      .order("entity:entities.name", { ascending: true })
      .limit(limit);

    if (layer && layer !== "all") {
      // Try direct filter on layer table
      query = query.eq("layers.slug", layer);
    }

    if (search) {
      query = query.or(`entities.name.ilike.%${search}%,entities.tagline.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    // Debug result
    console.log("Results count:", count, "data length:", data?.length);
    if (data && data.length > 0) {
      console.log("First result layer:", JSON.stringify(data[0].layer));
    }

    const { data: layers } = await supabase.from("layers").select("id, slug, name").order("id");

    return NextResponse.json({
      entities: data,
      layers,
      total: count || 0,
      success: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}