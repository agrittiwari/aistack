import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get unique companies from entities
    const { data, error } = await supabase
      .from("entities")
      .select("company_name, company_logo_char")
      .not("company_name", "is", null)
      .order("company_name");

    if (error) throw error;

    // Create unique list with IDs
    const companiesMap = new Map();
    data?.forEach((item) => {
      if (!companiesMap.has(item.company_name)) {
        companiesMap.set(item.company_name, {
          id: item.company_name, // Use name as ID since there's no separate table
          name: item.company_name,
          logo_url: item.company_logo_char,
        });
      }
    });

    const companies = Array.from(companiesMap.values());
    
    return NextResponse.json({ companies, success: true });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies", success: false },
      { status: 500 }
    );
  }
}
