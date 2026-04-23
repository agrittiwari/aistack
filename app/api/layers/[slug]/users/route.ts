import { NextResponse } from "next/server";
import { getUsersByLayer } from "@/lib/server/layers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const users = await getUsersByLayer(slug);
    return NextResponse.json({ users });
  } catch (error) {
    console.error(`[GET /api/layers/${slug}/users] error:`, error);
    return NextResponse.json(
      { error: "Unable to load users for this layer." },
      { status: 500 }
    );
  }
}
