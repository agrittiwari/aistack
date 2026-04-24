"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Note: Using native img for arbitrary external link-preview images
import { MapPin, Calendar, Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Meetup {
  id: string;
  name: string;
  city: string;
  country_code: string | null;
  start_time: string;
  end_time: string | null;
  host_name: string | null;
  registration_url: string | null;
  slug: string;
  primary_layer_id: number | null;
  metadata?: {
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
    url?: string;
  } | null;
}

interface MeetupsContentProps {
  initialMeetups: Meetup[];
  upcomingCount: number;
  pastCount: number;
  activeFilter: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isUpcoming(startTime: string): boolean {
  return new Date(startTime) >= new Date();
}

function MeetupCard({ meetup }: { meetup: Meetup }) {
  const previewImage = meetup.metadata?.image;
  const previewTitle = meetup.metadata?.title;
  const previewDescription = meetup.metadata?.description;
  const previewSiteName = meetup.metadata?.siteName;
  const upcoming = isUpcoming(meetup.start_time);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/60 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-200 flex flex-col",
        !upcoming && "opacity-80"
      )}
    >
      {/* Link Preview Image — centered at top */}
      {previewImage && (
        <div className="relative w-full h-44 overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt={previewTitle || meetup.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-normal backdrop-blur-sm border-0",
                upcoming
                  ? "bg-emerald-500/90 text-white hover:bg-emerald-500/90"
                  : "bg-black/60 text-white/80 hover:bg-black/60"
              )}
            >
              {upcoming ? "Upcoming" : "Past"}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className={cn("pb-2", !previewImage && "pt-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {!previewImage && (
              <Badge
                variant="secondary"
                className={cn(
                  "mb-2 text-xs font-normal",
                  upcoming
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {upcoming ? "Upcoming" : "Past"}
              </Badge>
            )}
            <h3 className="text-base font-medium text-foreground leading-snug">
              {meetup.name}
            </h3>
            {previewSiteName && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {previewSiteName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        {/* Date & Location */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={13} className="flex-shrink-0" />
            <span>
              {formatDate(meetup.start_time)}
              {meetup.end_time && meetup.end_time !== meetup.start_time && (
                <span className="text-muted-foreground/60">
                  {" "}
                  · {formatTime(meetup.start_time)}
                  {meetup.end_time && (
                    <span>
                      {" "}
                      – {formatTime(meetup.end_time)}
                    </span>
                  )}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin size={13} className="flex-shrink-0" />
            <span>
              {meetup.city}
              {meetup.country_code && (
                <span className="text-muted-foreground/60">
                  {" "}
                  · {meetup.country_code.toUpperCase()}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Description from link preview */}
        {previewDescription && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {previewDescription}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Users size={13} className="text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              Hosted by{" "}
              <span className="font-medium text-foreground">
                {meetup.host_name || "TBA"}
              </span>
            </span>
          </div>

          {upcoming ? (
            meetup.registration_url ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium flex-shrink-0"
                asChild
              >
                <a
                  href={meetup.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  Register
                  <ExternalLink size={12} />
                </a>
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                Registration closed
              </span>
            )
          ) : (
            <span className="text-xs text-muted-foreground/40 italic flex-shrink-0">
              Already happened
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MeetupsContent({
  initialMeetups,
  upcomingCount,
  pastCount,
  activeFilter,
}: MeetupsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(activeFilter);

  const filteredMeetups = useMemo(() => {
    if (filter === "upcoming") {
      return initialMeetups.filter((m) => isUpcoming(m.start_time));
    }
    if (filter === "past") {
      return initialMeetups.filter((m) => !isUpcoming(m.start_time));
    }
    return initialMeetups;
  }, [filter, initialMeetups]);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    const qs = params.toString();
    router.push(qs ? `/meetups?${qs}` : "/meetups", { scroll: false });
  };

  const citiesCount = useMemo(() => {
    const cities = new Set(initialMeetups.map((m) => m.city));
    return cities.size;
  }, [initialMeetups]);

  return (
    <div className="min-h-screen pb-20">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              Meetups
            </h1>
            <p className="text-muted-foreground text-sm">
              Connect with the AI community at upcoming events.
            </p>
          </div>

          {/* Filter Dropdown */}
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px] h-9 text-xs bg-muted border-border/50">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All Events ({initialMeetups.length})
              </SelectItem>
              <SelectItem value="upcoming">
                Upcoming ({upcomingCount})
              </SelectItem>
              <SelectItem value="past">
                Past Events ({pastCount})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-xl font-semibold">{initialMeetups.length}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-xl font-semibold">{upcomingCount}</div>
            <div className="text-xs text-muted-foreground">Upcoming</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="text-xl font-semibold">{citiesCount}+</div>
            <div className="text-xs text-muted-foreground">Cities</div>
          </div>
        </div>

        {/* Meetups Grid */}
        {filteredMeetups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeetups.map((meetup) => (
              <MeetupCard key={meetup.id} meetup={meetup} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-muted-foreground text-sm">
              {filter === "upcoming"
                ? "No upcoming meetups scheduled"
                : filter === "past"
                  ? "No past meetups found"
                  : "No meetups scheduled"}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => handleFilterChange("all")}
                className="text-sm text-foreground hover:underline mt-2 inline-block"
              >
                View all events
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
