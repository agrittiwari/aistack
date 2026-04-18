"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Copy, Link2 } from "lucide-react";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stackId?: string;
}

export function ShareModal({ open, onOpenChange, stackId }: ShareModalProps) {
  const supabase = createClient();
  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(stackId || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && !publishedId) {
      publishStack();
    }
  }, [open]);

  const publishStack = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/my-stack/publish", {
        method: "POST",
      });
      const data = await res.json();
      if (data.id) {
        setPublishedId(data.id);
      }
    } catch (error) {
      console.error("Failed to publish stack:", error);
    }
    setPublishing(false);
  };

  const shareUrl = publishedId ? `${window.location.origin}/stack/${publishedId}` : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent("Check out my AI stack!");
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-wider">
            Share Your Stack
          </DialogTitle>
          <DialogDescription>
            Share your AI stack with the community.
          </DialogDescription>
        </DialogHeader>

        {publishing ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Publishing...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                {copied ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareToX}
              >
                Share on X
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareToLinkedIn}
              >
                LinkedIn
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}