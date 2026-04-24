import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ data: [], total: 0, success: true });
  }

  const { slug } = await params;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const layerRes = await fetch(
      `${SUPABASE_URL}/rest/v1/layers?slug=eq.${encodeURIComponent(slug)}&select=id`,
      {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        signal: controller.signal,
      }
    );

    if (!layerRes.ok) throw new Error(`Failed to fetch layer: ${layerRes.status}`);

    const layers = await layerRes.json();
    if (!layers || layers.length === 0) {
      return NextResponse.json({ data: [], total: 0, success: true });
    }

    const layerId = layers[0].id;

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/entity_layers?layer_id=eq.${layerId}&entity.verified_node=eq.true&select=entity:entities(id,name,slug,tagline,description,type,website_url,github_url,logo_url,svg,company_name,company_logo_char,license,star_count,is_featured,verified_node,redeem_url),layer:layers(id,slug,name,description),tags,pricing_model,pricing_notes`,
      {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

    const data = await res.json();
    return NextResponse.json({ data, total: data.length, success: true });
  } catch (error) {
    console.error(`[GET /api/layers/${slug}] error:`, error);
    return NextResponse.json(
      { error: "Unable to load layer entities.", success: false },
      { status: 500 }
    );
  }
}
