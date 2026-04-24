"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2 } from "lucide-react";
import Link from "next/link";

interface StackActionsProps {
  entityId: string;
  initialIsInStack?: boolean;
}

export function StackActions({ entityId, initialIsInStack = false }: StackActionsProps) {
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isInStack, setIsInStack] = useState(initialIsInStack);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      try {
        // Use getSession() to avoid server lock contention; getUser() hits the server
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          const res = await fetch("/api/my-stack");
          const data = await res.json();
          if (cancelled) return;

          if (data.stack?.entities_id?.includes(entityId)) {
            setIsInStack(true);
          }
        }
      } catch (err) {
        // Silently fail auth check — treat as logged out
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [entityId, supabase]);

  const toggleEntity = async () => {
    if (!user) return;
    setToggling(true);
    try {
      const res = await fetch("/api/my-stack/toggle-entity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_id: entityId }),
      });
      const data = await res.json();
      if (data.entities_id) {
        setIsInStack(data.entities_id.includes(entityId));
      }
    } catch (error) {
      console.error("Failed to toggle entity:", error);
    }
    setToggling(false);
  };

  
  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="w-4 h-4 mr-1" />
          Add to Stack
        </Button>
      </Link>
    );
  }

  return (
    <>
      {isInStack ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleEntity} 
          disabled={toggling}
          className="h-8 border-green-500/50 text-green-500 hover:bg-green-500/10"
        >
        
            <>
              <Check className="w-4 h-4 mr-1" />
              In Stack
            </>
         
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleEntity} 
          disabled={toggling}
          className="h-8"
        >
         
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add to Stack
            </>
        
        </Button>
      )}
    </>
  );
}
