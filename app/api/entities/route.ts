import { NextRequest, NextResponse } from "next/server";
import { getTools, getLayers } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "100");
  const search = searchParams.get("search") || undefined;

  try {
    const result = await getTools({ layerSlug: layer, page, limit, search });
    const layers = await getLayers();
    
    return NextResponse.json({
      entities: result.data,
      layers: layers,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json(
      { error: "Failed to fetch entities", success: false },
      { status: 500 }
    );
  }
}