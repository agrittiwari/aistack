import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    stack_name: string | null;
    entity_count: number;
  };
}

export function UserCard({ user }: UserCardProps) {
  const displayName = user.full_name || user.username;
  const handle = user.username;

  return (
    <Link href={`/my-ai-stack/${handle}`} className="block">
      <Card className="group h-full overflow-hidden border-border/60 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border/50">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground truncate group-hover:text-foreground/80 transition-colors">
                {displayName}
              </h3>
              {user.headline && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.headline}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
            {user.stack_name && (
              <span className="text-xs text-muted-foreground truncate max-w-[70%]">
                {user.stack_name}
              </span>
            )}
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-muted hover:bg-muted/80 flex items-center gap-1"
            >
              <Layers size={10} />
              {user.entity_count}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function UserCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/60">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
