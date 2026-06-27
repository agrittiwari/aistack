"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Authenticating...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }

        if (data.session) {
          setStatus("success");
          setMessage("Authentication successful!");
          
          setTimeout(() => {
            router.push("/my-stack");
          }, 1500);
        } else {
          setStatus("error");
          setMessage("No session found. Please try again.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-[#0a0a0c] border border-white/10 p-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                Authenticating
              </h1>
              <p className="text-white/40">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                Welcome<span className="text-green-500">.</span>
              </h1>
              <p className="text-white/40">{message}</p>
              <p className="text-white/20 text-sm mt-4">Redirecting to My Stack...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
                Access<span className="text-red-500">.</span>Denied
              </h1>
              <p className="text-white/40 mb-4">{message}</p>
              <button
                onClick={() => router.push("/auth/login")}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                Return to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}