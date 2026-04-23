"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-white mb-4">Error</h1>
        <p className="text-white/60 mb-8">
          Something went wrong. Please try again or return to the homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="outline" className="border-white/20">
            Try Again
          </Button>
          <Link href="/">
            <Button className="bg-white text-black hover:bg-white/90">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
