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
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const res = await fetch("/api/my-stack");
        const data = await res.json();
        if (data.stack?.entities_id?.includes(entityId)) {
          setIsInStack(true);
        }
      }
      setLoading(false);
    }
    checkUser();
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

  if (loading) {
    return <Button variant="outline" size="sm" disabled className="h-8">
      <Loader2 className="w-4 h-4 animate-spin" />
    </Button>;
  }

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
          {toggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4 mr-1" />
              In Stack
            </>
          )}
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleEntity} 
          disabled={toggling}
          className="h-8"
        >
          {toggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add to Stack
            </>
          )}
        </Button>
      )}
    </>
  );
}
