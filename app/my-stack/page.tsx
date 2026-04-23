"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProfileCard, EntitySelectorModal } from "@/components/my-stack-components";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  
  const [entities, setEntities] = useState<DbEntity[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [entityLoading, setEntityLoading] = useState(false);
  const [showEntityModal, setShowEntityModal] = useState(false);

  const router = useRouter();
  const supabase = createClient();

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
          } | null;
          layer?: { slug?: string; name?: string } | null;
        };
        const transformedEntities = (data.entities as unknown as ApiRow[]).map((item) => ({
          id: item.entity?.id || "",
          name: item.entity?.name || "Unknown",
          tagline: item.entity?.tagline,
          description: item.entity?.description,
          logo_url: item.entity?.logo_url,
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
    setSelectedEntities((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId]
    );
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
        setShowEntityModal(false);
        if (!profile && profileForm) {
          setProfile(profileForm as Profile);
        }
      }
    } catch (error) {
      console.error("Failed to save stack:", error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-32">
          <div className="text-white/20 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  const hasStack = selectedEntities.length > 0;
  const shareHandle = profile?.username || user?.id;
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (shareHandle && typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/my-ai-stack/${shareHandle}`);
    }
  }, [shareHandle]);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-4">
          Personal Dashboard
        </div>
        <h1 className="text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">
          My AI Stack<span className="text-blue-500">.</span>
        </h1>
        <p className="text-white/40 text-lg max-w-2xl">
          Build your personalized AI stack by selecting the tools and platforms you use.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  Stack Settings
                </h2>
                <p className="text-xs text-white/40 mt-2">
                  Make your stack public to get a shareable link.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isPublic}
                  onCheckedChange={(v) => setIsPublic(Boolean(v))}
                  className="border-white/20 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <span className="text-xs text-white/60">Public</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">
                  Name
                </div>
                <Input
                  value={stackName}
                  onChange={(e) => setStackName(e.target.value)}
                  placeholder="e.g. My Production AI Stack"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-2">
                  Description
                </div>
                <Input
                  value={stackDescription}
                  onChange={(e) => setStackDescription(e.target.value)}
                  placeholder="One-liner about what you build with this stack"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                className="border-white/10 text-white/60 hover:text-white hover:border-white/30"
                onClick={handleStackSave}
                disabled={saving || selectedEntities.length === 0}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              {isPublic && shareUrl ? (
                <>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white/60 hover:text-white hover:border-white/30"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                      } catch {}
                    }}
                  >
                    Copy Share Link
                  </Button>
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                  >
                    Open public page
                  </a>
                </>
              ) : (
                <span className="text-xs text-white/30">
                  Turn on Public to enable sharing.
                </span>
              )}
            </div>
          </div>

          {!hasStack && !showEntityModal && (
            <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
                Create Your Stack
              </h2>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Select the AI tools, platforms, and frameworks you use to build your personalized stack.
              </p>
              <Button
                onClick={openEntityModal}
                className="bg-white text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
              >
                Start Building
              </Button>
            </div>
          )}

          {hasStack && !showEntityModal && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                  Your Stack ({selectedEntities.length} entities)
                </h2>
                <Button
                  variant="outline"
                  onClick={openEntityModal}
                  className="text-[10px] font-black uppercase tracking-widest border-white/10 text-white/40 hover:text-white hover:border-white/30"
                >
                  Add More
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entities.filter(e => selectedEntities.includes(e.id)).map((entity) => {
                  const layerColor = entity.layer?.color_gradient || "from-blue-500 to-cyan-400";
                  return (
                    <Card
                      key={entity.id}
                      className="bg-[#050507] border border-white/10 p-4 flex items-center gap-4"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layerColor} flex items-center justify-center text-black font-black`}
                      >
                        {entity.logo_url ? (
                          <img src={entity.logo_url} alt={entity.name} className="w-8 h-8 object-contain" />
                        ) : (
                          entity.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-white uppercase">{entity.name}</div>
                        {entity.tagline && (
                          <div className="text-xs text-white/40 truncate">{entity.tagline}</div>
                        )}
                      </div>
                      <button
                        onClick={() => toggleEntity(entity.id)}
                        className="text-white/40 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </Card>
                  );
                })}
              </div>

              {saved && (
                <div className="mt-8 flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white/40 hover:text-white hover:border-white/30"
                    onClick={() => router.push("/")}
                  >
                    View My Stack
                  </Button>
                </div>
              )}
            </div>
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
            saving={saving}
          />
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
      />
    </div>
  );
}
