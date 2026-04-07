import { NextRequest, NextResponse } from "next/server";
import { getLayers, getLayerBySlug } from "@/lib/db/queries";



export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      const layer = await getLayerBySlug(slug);
      if (!layer) {
        return NextResponse.json(
          { error: "Layer not found", success: false },
          { status: 404 }
        );
      }
      return NextResponse.json({ layer, success: true });
    }

    const layers = await getLayers();
    return NextResponse.json({ layers, success: true });
  } catch (error) {
    console.error("Error fetching layers:", error);
    return NextResponse.json(
      { error: "Failed to fetch layers", success: false },
      { status: 500 }
    );
  }
}