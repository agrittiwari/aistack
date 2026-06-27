import { Suspense } from "react";
import { getMeetupsWithMetadata } from "@/lib/db/server-queries";
import MeetupsContent from "@/components/meetups-content";
import { LoadingState } from "@/components/loading-state";

interface SearchParams {
  filter?: string;
}

export async function generateMetadata() {
  return {
    title: "Meetups - AI Community Events",
    description: "Connect with the AI community at upcoming meetups, conferences, and events around the world.",
  };
}

async function getInitialData() {
  const meetups = await getMeetupsWithMetadata();

  const now = new Date().toISOString();
  const upcoming = meetups.filter((m) => m.start_time >= now);
  const past = meetups.filter((m) => m.start_time < now);

  // Sort upcoming ascending, past descending
  upcoming.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  past.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  return {
    meetups: [...upcoming, ...past],
    upcomingCount: upcoming.length,
    pastCount: past.length,
  };
}

export default async function MeetupsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { meetups, upcomingCount, pastCount } = await getInitialData();

  return (
    <Suspense fallback={<LoadingState />}>
      <MeetupsContent
        initialMeetups={meetups}
        upcomingCount={upcomingCount}
        pastCount={pastCount}
        activeFilter={params.filter || "all"}
      />
    </Suspense>
  );
}
