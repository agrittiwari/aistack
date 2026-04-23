"use client";

import { MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MEETUPS, getLayerById } from "@/lib/data";

function MeetupCard({
  meetup,
}: {
  meetup: (typeof MEETUPS)[number];
}) {
  const layer = getLayerById(meetup.layer || "");

  return (
    <Card className="border-border/60 hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2 text-xs font-normal">
              {meetup.date}
            </Badge>
            <h3 className="text-base font-medium">
              {meetup.name}
            </h3>
          </div>
          {layer && (
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
              {layer.icon && <layer.icon size={16} className="text-muted-foreground" />}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            {meetup.city}
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            {meetup.attendees} attending
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">
            Hosted by <span className="font-medium text-foreground">{meetup.host}</span>
          </span>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Join
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MeetupsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Meetups
        </h1>
        <p className="text-muted-foreground text-sm">
          Connect with the AI community at upcoming events.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="text-xl font-semibold">1,200+</div>
          <div className="text-xs text-muted-foreground">Members</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="text-xl font-semibold">{MEETUPS.length}</div>
          <div className="text-xs text-muted-foreground">Events</div>
        </div>
        <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
          <div className="text-xl font-semibold">15+</div>
          <div className="text-xs text-muted-foreground">Cities</div>
        </div>
      </div>

      {/* Meetups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEETUPS.map((meetup) => (
          <MeetupCard key={meetup.id} meetup={meetup} />
        ))}
      </div>

      {MEETUPS.length === 0 && (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-border/50">
          <p className="text-muted-foreground text-sm">No meetups scheduled</p>
        </div>
      )}
    </div>
  );
}
