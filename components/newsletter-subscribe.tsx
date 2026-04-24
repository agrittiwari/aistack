"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, Check } from "lucide-react";

interface NewsletterCardProps {
  variant?: "card" | "compact";
}

export function NewsletterCard({ variant = "card" }: NewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      window.open(`https://aistacklayers.substack.com/subscribe?email=${encodeURIComponent(email)}`, "_blank");
      setSubmitted(true);
    }
  };

  if (variant === "compact") {
    return (
      <a
        href="https://aistacklayers.substack.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Mail size={14} />
        Subscribe to Newsletter
        <ArrowRight size={12} />
      </a>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Mail size={16} className="text-muted-foreground" />
          AI Stack Weekly
        </CardTitle>
        <CardDescription className="text-xs">
          Curated AI tools, models, and stack insights delivered to your inbox.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {submitted ? (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <Check size={14} />
            Redirecting to Substack...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-sm flex-1"
              required
            />
            <Button type="submit" size="sm" className="h-9 px-3">
              <ArrowRight size={14} />
            </Button>
          </form>
        )}
        <p className="text-[10px] text-muted-foreground mt-2">
          No spam. Unsubscribe anytime.
        </p>
      </CardContent>
    </Card>
  );
}

export function NewsletterStickyButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href="https://aistacklayers.substack.com/"
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex items-center gap-2 bg-foreground text-background 
          rounded-l-lg shadow-lg transition-all duration-300 ease-out
          ${isHovered ? "pl-4 pr-5 py-3 translate-x-0" : "pl-3 pr-3 py-3 translate-x-0"}
        `}
      >
        <Mail size={18} />
        <span
          className={`
            text-sm font-medium whitespace-nowrap overflow-hidden
            transition-all duration-300 ease-out
            ${isHovered ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"}
          `}
        >
          Subscribe to Newsletter
        </span>
      </a>
    </div>
  );
}
