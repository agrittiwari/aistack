"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ExternalLink, Loader2, Copy, Globe, Github, Linkedin } from "lucide-react";
import { ProfileCard, EntitySelectorModal } from "@/components/my-stack-components";
import { OnboardingModal } from "@/components/onboarding-modal";
import { EntityLogoFallback } from "@/lib/entity-logo";
import type { DbEntity } from "@/components/my-stack-components";
import { DailyTokenUsage, type DailyUsageEvent } from "@/components/usage/daily-token-usage";

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  github_handle?: string;
  twitter_handle?: string;
  headline?: string;
  website_url?: string;
  primary_layer_id?: number | null;
  interested_layer_ids?: number[] | null;
  has_completed_onboarding?: boolean | null;
}

interface Layer {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  color_gradient?: string | null;
  icon_name?: string | null;
}

export default function MyStackPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [stackName, setStackName] = useState<string>("");
  const [stackDescription, setStackDescription] = useState<string>("");
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<Profile>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
   
  const [entities, setEntities] = useState<DbEntity[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isPublicSaved, setIsPublicSaved] = useState(false);
  const [entityNotes, setEntityNotes] = useState<Record<string, string>>({});
  const [editingStack, setEditingStack] = useState(false);
  const [usage, setUsage] = useState<{ days: number; events: DailyUsageEvent[] } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const hasStack = selectedEntities.length > 0;
  const shareHandle = profile?.username || user?.id;

  useEffect(() => {
    if (shareHandle && typeof window !== "undefined") {
      const origin = window.location.origin;
      setShareUrl(`${origin}/my-ai-stack/${shareHandle}`);
    }
  }, [shareHandle]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      
      const [response, usageResponse] = await Promise.all([
        fetch("/api/my-stack"),
        fetch("/api/usage/me?days=30"),
      ]);
      const data = await response.json();
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage({ days: usageData.days ?? 30, events: usageData.events ?? [] });
      }
      if (data.stack?.entities_id) {
        setSelectedEntities(data.stack.entities_id);
      }
      if (data.stack?.name) setStackName(String(data.stack.name));
      if (data.stack?.description) setStackDescription(String(data.stack.description));
      const publicState = Boolean(data.stack?.is_public);
      setIsPublic(publicState);
      setIsPublicSaved(publicState);
      if (data.profile) {
        setProfile(data.profile);
        setProfileForm(data.profile);
      }
      if (data.stack?.entity_notes && typeof data.stack.entity_notes === "object") {
        setEntityNotes(data.stack.entity_notes as Record<string, string>);
      } else {
        setEntityNotes({});
      }
      if (data.layers) {
        setLayers(data.layers);
      }
      
      // Show onboarding only for users who haven't completed it
      const isOnboarded = data.profile?.has_completed_onboarding === true;
      if (!isOnboarded) {
        setShowOnboarding(true);
      }
      
      // Fetch entities if we have selected ones so they render on the page
      if (data.stack?.entities_id && data.stack.entities_id.length > 0) {
        await fetchEntities();
      }
      
      setLoading(false);
    };
    getUser();
  }, [supabase, router]);

  const fetchEntities = async () => {
    setEntityLoading(true);
    try {
      const response = await fetch("/api/entities?limit=200");
      const data = await response.json();
      
      if (data.error) {
        console.error("API error:", data.error);
        setEntityLoading(false);
        return;
      }
      
      if (data.entities) {
        type ApiEntity = {
          id?: string;
          name?: string | null;
          slug?: string;
          tagline?: string | null;
          description?: string | null;
          logo_url?: string | null;
          svg?: string | null;
          company_logo_char?: string | null;
          type?: string | null;
          website_url?: string | null;
          is_dark_theme_logo?: boolean | null;
          layer?: { slug?: string | null; name?: string | null } | null;
        };
        const transformedEntities = (data.entities as unknown as ApiEntity[]).map((item) => ({
          id: item.id || "",
          name: item.name || "Unknown",
          tagline: item.tagline,
          description: item.description,
          logo_url: item.logo_url,
          svg: item.svg,
          company_logo_char: item.company_logo_char,
          website_url: item.website_url,
          is_dark_theme_logo: item.is_dark_theme_logo,
          layer: item.layer
            ? {
                slug: item.layer.slug || "",
                name: item.layer.name || "",
                color_gradient: undefined,
              }
            : undefined,
        }));
        setEntities(transformedEntities);
      }
      
      if (data.layers) {
        setLayers(data.layers);
      }
    } catch (error) {
      console.error("Failed to fetch entities:", error);
    }
    setEntityLoading(false);
  };

  const openEntityModal = () => {
    if (entities.length === 0) {
      fetchEntities();
    }
    setShowEntityModal(true);
  };

  const toggleEntity = (entityId: string) => {
    const next = selectedEntities.includes(entityId)
      ? selectedEntities.filter((id) => id !== entityId)
      : [...selectedEntities, entityId];
    setSelectedEntities(next);
    setSaved(false);
  };

  const updateEntityNote = (entityId: string, note: string) => {
    setEntityNotes((prev) => ({ ...prev, [entityId]: note }));
    setSaved(false);
  };

  const togglePublic = (value: boolean) => {
    setIsPublic(value);
    setSaved(false);
  };

  const handleProfileEdit = () => {
    setEditingProfile(true);
    setProfileForm(profile || {});
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    setProfileForm(profile || {});
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/my-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profile: profileForm
        }),
      });
      if (response.ok) {
        await refreshData();
        setEditingProfile(false);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
    setSaving(false);
  };

  const refreshData = async () => {
    try {
      const response = await fetch("/api/my-stack");
      const data = await response.json();
      if (data.stack?.entities_id) {
        setSelectedEntities(data.stack.entities_id);
      }
      if (data.stack?.name) setStackName(String(data.stack.name));
      if (data.stack?.description) setStackDescription(String(data.stack.description ?? ""));
      const publicState = Boolean(data.stack?.is_public);
      setIsPublic(publicState);
      setIsPublicSaved(publicState);
      if (data.profile) {
        setProfile(data.profile);
        setProfileForm(data.profile);
      }
      if (data.stack?.entity_notes && typeof data.stack.entity_notes === "object") {
        setEntityNotes(data.stack.entity_notes as Record<string, string>);
      } else {
        setEntityNotes({});
      }
      if (data.layers) {
        setLayers(data.layers);
      }
    } catch {
      // silently ignore refresh errors
    }
  };

  const handleStackSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, unknown> = { 
        entity_ids: selectedEntities,
        is_public: isPublic,
        name: stackName,
        description: stackDescription,
        entity_notes: entityNotes,
      };
      if (profile) {
        payload.profile = profile;
      } else if (profileForm && Object.keys(profileForm).length > 0) {
        payload.profile = profileForm;
      }

      const response = await fetch("/api/my-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSaved(true);
        setSaveError(null);
        setShowEntityModal(false);
        await refreshData();
      } else {
        const data = await response.json().catch(() => ({}));
        console.error("Stack save failed:", response.status, data);
        setSaveError(data.details || data.error || "Failed to save stack");
      }
    } catch (error) {
      setSaveError("Failed to save stack");
      console.error("Failed to save stack:", error);
    }
    setSaving(false);
  };

  const handleOnboardingComplete = async (data: {
    interested_layer_ids: number[];
    primary_layer_id: number | null;
  }) => {
    setSaving(true);
    try {
      const response = await fetch("/api/my-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interested_layer_ids: data.interested_layer_ids,
          primary_layer_id: data.primary_layer_id,
          has_completed_onboarding: true,
        }),
      });
      const responseData = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Onboarding save failed:", response.status, responseData);
        setShowOnboarding(true); // reopen if it failed
        return;
      }
      await refreshData();
      setShowOnboarding(false);
    } catch (error) {
      console.error("Failed to save onboarding:", error);
      setShowOnboarding(true); // reopen on network error
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Personal Dashboard
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3">
                My AI Stack
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Manage your stack and coding-agent activity here. Your public profile lives at the shareable My AI Stack URL.
              </p>
            </div>
            {hasStack && isPublicSaved && shareUrl && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button asChild size="sm">
                  <Link href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                    View public profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(shareUrl);
                    } catch {}
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Copy size={14} className="mr-1.5" />
                  Copy Link
                </Button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my AI stack!`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                    <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share
                  </Button>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Linkedin size={14} className="mr-1.5" />
                    Share
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>

        {usage ? <DailyTokenUsage events={usage.events} days={usage.days} /> : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!hasStack && !showEntityModal && (
              <Card className="border-border/60">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                    Create Your Stack
                  </h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Select the AI tools and platforms you use to build your personalized stack.
                  </p>
                  <Button onClick={openEntityModal}>
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            )}

            {hasStack && !showEntityModal && (
              <Card className="border-border/60">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Your Stack ({selectedEntities.length})
                      {saved && (
                        <span className="ml-2 text-green-600 normal-case">
                          Saved
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-4">
                      {editingStack ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={isPublic}
                              onCheckedChange={(v) => togglePublic(Boolean(v))}
                            />
                            <span className="text-sm text-muted-foreground">Public</span>
                          </div>
                          <Button
                            variant="outline"
                            onClick={openEntityModal}
                            size="sm"
                          >
                            Add More
                          </Button>
                          <Button
                            onClick={() => setEditingStack(false)}
                            size="sm"
                          >
                            Done
                          </Button>
                        </>
                      ) : (
                        <>
                          {hasStack && isPublicSaved && shareUrl && (
                            <Link
                              href={shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                              <Globe size={14} />
                              View public profile
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => setEditingStack(true)}
                            size="sm"
                          >
                            Edit Stack
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entities.filter(e => selectedEntities.includes(e.id)).map((entity) => {
                      const hasDarkBg = entity.is_dark_theme_logo;
                      const hasNote = entityNotes[entity.id] && entityNotes[entity.id].length > 0;
                      return (
                        <Card
                          key={entity.id}
                          className={`group border-border/60 bg-card hover:border-foreground/20 transition-all ${hasNote ? "border-primary/20" : ""}`}
                        >
                          <CardContent className="p-4 relative">
                            {editingStack && (
                              <button
                                onClick={() => toggleEntity(entity.id)}
                                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                            <div className="flex items-center gap-3">
                              <div className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border ${hasDarkBg ? "bg-black border-neutral-800" : "bg-muted border-border/50"}`}>
                                <EntityLogoFallback
                                  logo_url={entity.logo_url}
                                  name={entity.name}
                                  className="w-full h-full object-contain p-1.5"
                                  is_dark_theme_logo={hasDarkBg}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground truncate">
                                  {entity.name}
                                </div>
                                {entity.layer && (
                                  <div className="text-xs text-muted-foreground">
                                    {entity.layer.name}
                                  </div>
                                )}
                              </div>
                            </div>
                            {entity.tagline && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {entity.tagline}
                              </p>
                            )}
                            {hasNote && (
                              <div className="mt-2 pt-2 border-t border-border/40">
                                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                                  Your notes
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">
                                  {entityNotes[entity.id]}
                                </p>
                              </div>
                            )}
                            {entity.website_url && (
                              <a
                                href={entity.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute bottom-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <ProfileCard
              profile={profile}
              layers={layers}
              editing={editingProfile}
              form={profileForm}
              onEdit={handleProfileEdit}
              onCancel={handleProfileCancel}
              onChange={setProfileForm}
              onSave={handleProfileSave}
              onEditStack={openEntityModal}
              onEditLayers={() => setShowOnboarding(true)}
              saving={saving}
            />
          </div>
        </div>
      </div>

      <EntitySelectorModal
        open={showEntityModal}
        onClose={() => setShowEntityModal(false)}
        entities={entities}
        layers={layers}
        selectedIds={selectedEntities}
        onToggle={toggleEntity}
        onConfirm={handleStackSave}
        loading={entityLoading}
        saving={saving}
        error={saveError}
        entityNotes={entityNotes}
        onUpdateNote={updateEntityNote}
        isPublic={isPublic}
        onTogglePublic={togglePublic}
      />

      {showOnboarding && (
        <OnboardingModal
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
          layers={layers}
          onComplete={handleOnboardingComplete}
          saving={saving}
        />
      )}
    </div>
  );
}
