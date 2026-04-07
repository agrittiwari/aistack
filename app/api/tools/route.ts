import { NextRequest, NextResponse } from "next/server";
import { getTools, getTrendingTools } from "@/lib/db/queries";


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get("layer") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;
  const trending = searchParams.get("trending");

  try {
    if (trending) {
      const tools = await getTrendingTools(parseInt(trending) || 5);
      return NextResponse.json({ tools, success: true });
    }

    const result = await getTools({ layerSlug: layer, page, limit, search });
    return NextResponse.json({
      tools: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasMore: result.hasMore,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching tools:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools", success: false },
      { status: 500 }
    );
  }
}