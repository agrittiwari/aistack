import { getPulseUpdates } from "@/lib/db/server-queries";
import type { Metadata } from "next";
import PulseClient from "./pulse-client";

export const metadata: Metadata = {
  title: "Pulse - AiStack",
  description: "Latest updates, releases, benchmarks, and news from the AI ecosystem.",
};

export default async function PulsePage() {
  const news = await getPulseUpdates(50);
  return <PulseClient news={news} />;
}
