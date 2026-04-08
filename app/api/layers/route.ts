import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/layers?select=id,slug,name,description,color_gradient,icon_name,rank&order=rank.asc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    if (!res.ok) throw new Error("Failed to fetch");
    
    const data = await res.json();
    return NextResponse.json({ data, total: data.length, success: true });
  } catch (error) {
    console.error("Error fetching layers:", error);
    return NextResponse.json(
      { error: "Failed to fetch layers", success: false },
      { status: 500 }
    );
  }
}