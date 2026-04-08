"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passkeys do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-[#0a0a0c] border border-white/10 p-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-4">
            New Registration
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
            Request<span className="text-blue-500">.</span>Access
          </h1>
          <p className="text-white/40 text-sm mt-2 font-medium">
            Join the network of AI builders and practitioners.
          </p>
        </div>

        <form onSubmit={handleSignUp}>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Identity
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@stack.io"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Passkey
              </Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repeat-password" className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Confirm Passkey
              </Label>
              <Input
                id="repeat-password"
                type="password"
                required
                placeholder="••••••••••••"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-white text-black font-black tracking-tighter py-3 hover:bg-slate-200 transition-colors"
            >
              {isLoading ? "Processing..." : "Initialize Access"}
            </Button>
          </div>
          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">
              Already connected?{" "}
              <Link href="/auth/login" className="text-blue-500 hover:underline">
                Enter System
              </Link>
            </p>
          </div>
        </form>
      </div>
      
      <div className="text-center">
        <Link href="/" className="text-white/20 text-xs hover:text-white/40 transition-colors">
          ← Return to Directory
        </Link>
      </div>
    </div>
  );
}