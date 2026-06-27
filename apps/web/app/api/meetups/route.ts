import { NextRequest, NextResponse } from "next/server";
import { getMeetupsWithMetadata } from "@/lib/db/server-queries";
import { getCachedLinkPreview } from "@/lib/link-preview";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const filter = searchParams.get("filter") || "all";

  try {
    const meetups = await getMeetupsWithMetadata();

    // Enrich with link previews on-demand if missing
    const enrichedMeetups = await Promise.all(
      meetups.map(async (meetup) => {
        if (meetup.registration_url && (!meetup.metadata || !meetup.metadata.title)) {
          const preview = await getCachedLinkPreview(meetup.id, meetup.registration_url);
          return { ...meetup, metadata: preview || meetup.metadata };
        }
        return meetup;
      })
    );

    // Split into upcoming and past
    const now = new Date().toISOString();
    const upcoming = enrichedMeetups.filter((m) => m.start_time >= now);
    const past = enrichedMeetups.filter((m) => m.start_time < now);

    // Sort upcoming ascending, past descending
    upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    past.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    let result = enrichedMeetups;
    if (filter === "upcoming") {
      result = upcoming;
    } else if (filter === "past") {
      result = past;
    } else {
      result = [...upcoming, ...past];
    }

    return NextResponse.json({
      meetups: result,
      upcomingCount: upcoming.length,
      pastCount: past.length,
      total: enrichedMeetups.length,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching meetups:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetups", success: false },
      { status: 500 }
    );
  }
}
