"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ExternalLink, Loader2, Copy, Globe } from "lucide-react";
import { ProfileCard, EntitySelectorModal } from "@/components/my-stack-components";

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
}

interface DbEntity {
  id: string;
  name: string;
  tagline?: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_dark_theme_logo?: boolean | null;
  layer?: {
    slug: string;
    name: string;
    color_gradient?: string;
  };
}

interface Layer {
  id: number;
  slug: string;
  name: string;
  color_gradient?: string;
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
  const [shareUrl, setShareUrl] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const hasStack = selectedEntities.length > 0;
  const shareHandle = profile?.username || user?.id;

  useEffect(() => {
    if (shareHandle && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/my-ai-stack/${shareHandle}`);
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
      
      const response = await fetch("/api/my-stack");
      const data = await response.json();
      if (data.stack?.entities_id) {
        setSelectedEntities(data.stack.entities_id);
      }
      if (data.stack?.name) setStackName(String(data.stack.name));
      if (data.stack?.description) setStackDescription(String(data.stack.description));
      setIsPublic(Boolean(data.stack?.is_public));
      if (data.profile) {
        setProfile(data.profile);
        setProfileForm(data.profile);
      }
      if (data.layers) {
        setLayers(data.layers);
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
        type ApiRow = {
          entity?: {
            id?: string;
            name?: string;
            slug?: string;
            tagline?: string;
            description?: string;
            logo_url?: string;
            type?: string;
            website_url?: string;
            is_dark_theme_logo?: boolean | null;
          } | null;
          layer?: { slug?: string; name?: string } | null;
        };
        const transformedEntities = (data.entities as unknown as ApiRow[]).map((item) => ({
          id: item.entity?.id || "",
          name: item.entity?.name || "Unknown",
          tagline: item.entity?.tagline,
          description: item.entity?.description,
          logo_url: item.entity?.logo_url,
          website_url: item.entity?.website_url,
          is_dark_theme_logo: item.entity?.is_dark_theme_logo,
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
          entity_ids: selectedEntities,
          profile: profileForm
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || profileForm as Profile);
        setEditingProfile(false);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
    setSaving(false);
  };

  const handleStackSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/my-stack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          entity_ids: selectedEntities,
          profile: profile ? undefined : profileForm,
          is_public: isPublic,
          name: stackName,
          description: stackDescription,
        }),
      });
      if (response.ok) {
        setSaved(true);
        setSaveError(null);
        setShowEntityModal(false);
        if (!profile && profileForm) {
          setProfile(profileForm as Profile);
        }
      } else {
        const data = await response.json().catch(() => ({}));
        setSaveError(data.error || "Failed to save stack");
      }
    } catch (error) {
      setSaveError("Failed to save stack");
      console.error("Failed to save stack:", error);
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
          <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Personal Dashboard
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3">
            My AI Stack
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Build your personalized AI stack. Select the tools and platforms you use.
          </p>
        </div>

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
                      {hasStack && isPublic && shareUrl && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(shareUrl);
                              } catch {}
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy size={14} className="mr-1" />
                            Copy Link
                          </Button>
                          <Link
                            href={shareUrl}
                            target="_blank"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          >
                            <Globe size={14} />
                            View Public Page
                          </Link>
                        </div>
                      )}
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
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entities.filter(e => selectedEntities.includes(e.id)).map((entity) => {
                      const layerColor = entity.layer?.color_gradient || "from-blue-500 to-cyan-400";
                      return (
                        <Card
                          key={entity.id}
                          className="group border-border/60 bg-card hover:border-foreground/20 transition-all"
                        >
                          <CardContent className="p-4 relative">
                            <button
                              onClick={() => toggleEntity(entity.id)}
                              className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X size={16} />
                            </button>
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${layerColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                {entity.logo_url ? (
                                  <img src={entity.logo_url} alt="" className="w-8 h-8 object-contain" />
                                ) : (
                                  entity.name.charAt(0)
                                )}
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
              editing={editingProfile}
              form={profileForm}
              onEdit={handleProfileEdit}
              onCancel={handleProfileCancel}
              onChange={setProfileForm}
              onSave={handleProfileSave}
              onEditStack={openEntityModal}
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
      />
    </div>
  );
}