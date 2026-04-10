import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get entity layers with entity and layer data
    const { data, error } = await supabase
      .from("entity_layers")
      .select(`
        entity:entities(id, name, slug, tagline, description, type, website_url, logo_url, company_name, company_logo_char, license, is_featured),
        layer:layers(id, slug, name)
      `)
      .limit(5);

    if (error) {
      console.error("Select error:", error);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
    }

    const { data: layers } = await supabase.from("layers").select("id, slug, name");

    return NextResponse.json({
      entities: data,
      layers,
      total: data?.length || 0,
      success: true,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}