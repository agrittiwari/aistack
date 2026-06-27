import { getLinkPreview } from "link-preview-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface LinkPreviewMetadata {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  url?: string;
}

async function getServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

export async function scrapeLinkPreview(url: string): Promise<LinkPreviewMetadata | null> {
  try {
    const preview = await getLinkPreview(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; AiStackBot/1.0)",
      },
      timeout: 10000,
      followRedirects: "follow",
    });

    if (preview && "title" in preview) {
      return {
        title: preview.title || undefined,
        description: preview.description || undefined,
        image: preview.images?.[0] || undefined,
        siteName: preview.siteName || undefined,
        url: preview.url || url,
      };
    }
  } catch (error) {
    console.warn(`Failed to scrape link preview for ${url}:`, error);
  }
  return null;
}

export async function getCachedLinkPreview(
  meetupId: string,
  url: string
): Promise<LinkPreviewMetadata | null> {
  const supabase = await getServerClient();

  // Check if metadata is already cached
  const { data: meetup, error } = await supabase
    .from("meetups")
    .select("metadata")
    .eq("id", meetupId)
    .single();

  if (error) {
    console.error("Error fetching cached metadata:", error);
    return null;
  }

  // Return cached metadata if available
  if (meetup?.metadata && typeof meetup.metadata === "object") {
    const metadata = meetup.metadata as LinkPreviewMetadata;
    if (metadata.title || metadata.description || metadata.image) {
      return metadata;
    }
  }

  // Scrape and cache if missing
  const preview = await scrapeLinkPreview(url);
  if (preview) {
    await supabase
      .from("meetups")
      .update({ metadata: preview as unknown as Record<string, unknown> })
      .eq("id", meetupId);
  }

  return preview;
}
