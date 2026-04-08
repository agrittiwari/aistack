"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Github } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    const supabase = createClient();
    setIsOAuthLoading(provider);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-[#0a0a0c] border border-white/10 p-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">
            Access Granted
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Join the<span className="text-blue-500">.</span>Network
          </h1>
          <p className="text-white/40 text-sm mt-2 font-medium">
            Connect via your provider to access the intelligence directory.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 mb-6">
            <p className="text-red-400 text-xs font-mono">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isOAuthLoading !== null}
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 py-6"
          >
            {isOAuthLoading === "github" ? (
              <span className="animate-pulse">Connecting to GitHub...</span>
            ) : (
              <>
                <Github className="w-5 h-5 mr-3" />
                <span className="font-medium">Continue with GitHub</span>
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isOAuthLoading !== null}
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 py-6"
          >
            {isOAuthLoading === "google" ? (
              <span className="animate-pulse">Connecting to Google...</span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Continue with Google</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="text-center">
        <Link href="/" className="text-white/20 text-xs hover:text-white/40 transition-colors">
          ← Return to Directory
        </Link>
      </div>
    </div>
  );
}