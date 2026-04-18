"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareActions({
  canonicalUrl,
  title,
}: {
  canonicalUrl: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => `${title} ${canonicalUrl}`, [title, canonicalUrl]);
  const xUrl = useMemo(() => {
    const u = new URL("https://twitter.com/intent/tweet");
    u.searchParams.set("text", shareText);
    return u.toString();
  }, [shareText]);
  const linkedInUrl = useMemo(() => {
    const u = new URL("https://www.linkedin.com/sharing/share-offsite/");
    u.searchParams.set("url", canonicalUrl);
    return u.toString();
  }, [canonicalUrl]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="border-border/40 text-foreground/80 hover:text-foreground"
        onClick={onCopy}
      >
        {copied ? "Copied" : "Copy link"}
      </Button>
      <a href={xUrl} target="_blank" rel="noopener noreferrer">
        <Button type="button" variant="outline" className="border-border/40 text-foreground/80 hover:text-foreground">
          Share on X
        </Button>
      </a>
      <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
        <Button type="button" variant="outline" className="border-border/40 text-foreground/80 hover:text-foreground">
          Share on LinkedIn
        </Button>
      </a>
    </div>
  );
}

