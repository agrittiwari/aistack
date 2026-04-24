"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Github, Twitter, ExternalLink, Plus, Check, Loader2, Pencil } from "lucide-react";

interface Profile {
  id: string;
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

interface DbEntity {
  id: string;
  name: string;
  tagline?: string;
  logo_url?: string;
  description?: string;
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
  description?: string | null;
  color_gradient?: string | null;
  icon_name?: string | null;
}

interface ProfileCardProps {
  profile: Profile | null;
  layers?: Layer[];
  editing: boolean;
  form: Partial<Profile>;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (form: Partial<Profile>) => void;
  onSave: () => void;
  onEditStack?: () => void;
  onEditLayers?: () => void;
  saving: boolean;
}

export function ProfileCard({ profile, layers = [], editing, form, onEdit, onCancel, onChange, onSave, onEditStack, onEditLayers, saving }: ProfileCardProps) {
  return (
    <Card className="border-border/60 sticky top-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Profile
          </h2>
          {!editing && (
            <button
              onClick={onEdit}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Full Name
              </Label>
              <Input
                value={form.full_name || ""}
                onChange={(e) => onChange({ ...form, full_name: e.target.value })}
                placeholder="Your name"
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Headline
              </Label>
              <Input
                value={form.headline || ""}
                onChange={(e) => onChange({ ...form, headline: e.target.value })}
                placeholder="e.g. ML Engineer at Company"
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Bio
              </Label>
              <Textarea
                value={form.bio || ""}
                onChange={(e) => onChange({ ...form, bio: e.target.value })}
                placeholder="Brief description about yourself..."
                className="min-h-[80px]"
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                <Github size={14} /> GitHub
              </Label>
              <Input
                value={form.github_handle || ""}
                onChange={(e) => onChange({ ...form, github_handle: e.target.value })}
                placeholder="username"
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                <Twitter size={14} /> Twitter
              </Label>
              <Input
                value={form.twitter_handle || ""}
                onChange={(e) => onChange({ ...form, twitter_handle: e.target.value })}
                placeholder="@username"
                disabled={saving}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-2">
                <ExternalLink size={14} /> Website
              </Label>
              <Input
                value={form.website_url || ""}
                onChange={(e) => onChange({ ...form, website_url: e.target.value })}
                placeholder="https://..."
                disabled={saving}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onSave}
                disabled={saving}
                className="flex-1 gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || "User"}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl">
                      {(profile.full_name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-semibold text-foreground">
                      {profile.full_name || "Anonymous"}
                    </div>
                    {profile.headline && (
                      <div className="text-sm text-muted-foreground">
                        {profile.headline}
                      </div>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-3 pt-2">
                  {profile.github_handle && (
                    <a
                      href={`https://github.com/${profile.github_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Github size={14} /> {profile.github_handle}
                    </a>
                  )}
                  {profile.twitter_handle && (
                    <a
                      href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Twitter size={14} /> {profile.twitter_handle}
                    </a>
                  )}
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink size={14} /> Website
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">No profile yet</p>
                <Button onClick={onEdit}>
                  Create Profile
                </Button>
              </div>
            )}

            {/* Layer Preferences */}
            {profile?.has_completed_onboarding && layers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/60">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Layer Interests
                  </h3>
                  {onEditLayers && (
                    <button
                      onClick={onEditLayers}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {profile.primary_layer_id && (
                  <div className="mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Primary
                    </span>
                    {(() => {
                      const layer = layers.find((l) => l.id === profile.primary_layer_id);
                      if (!layer) return null;
                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r ${layer.color_gradient || "from-blue-500 to-cyan-400"} text-white`}
                        >
                          {layer.name}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {profile.interested_layer_ids && profile.interested_layer_ids.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 block">
                      Following
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interested_layer_ids.map((layerId) => {
                        const layer = layers.find((l) => l.id === layerId);
                        if (!layer) return null;
                        return (
                          <div
                            key={layer.id}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gradient-to-r ${layer.color_gradient || "from-blue-500 to-cyan-400"} text-white`}
                          >
                            {layer.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onEditStack && (
              <div className="mt-6 pt-6 border-t border-border/60">
                <button
                  onClick={onEditStack}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Plus size={14} />
                  Edit Stack
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface EntitySelectorModalProps {
  open: boolean;
  onClose: () => void;
  entities: DbEntity[];
  layers: Layer[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  loading: boolean;
  saving: boolean;
  error?: string | null;
}

export function EntitySelectorModal({
  open,
  onClose,
  entities,
  layers,
  selectedIds,
  onToggle,
  onConfirm,
  loading,
  saving,
  error,
}: EntitySelectorModalProps) {
  const [search, setSearch] = useState("");
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const filteredEntities = entities.filter((e) => {
    const matchesSearch = !search || 
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.tagline?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase());
    const matchesLayer = !selectedLayer || e.layer?.slug === selectedLayer;
    return matchesSearch && matchesLayer;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <Card className="relative w-full max-w-2xl max-h-[80vh] border-border/60 flex flex-col">
        <CardContent className="p-6 border-b border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Select Entities
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X size={24} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedLayer(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedLayer === null
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.slug)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedLayer === layer.slug
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </CardContent>

        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "400px" }}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading entities...</div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No entities found</div>
          ) : (
            <div className="space-y-3">
              {filteredEntities.map((entity) => {
                const isSelected = selectedIds.includes(entity.id);
                const layerColor = entity.layer?.color_gradient || "from-blue-500 to-cyan-400";
                return (
                  <div
                    key={entity.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary/50"
                        : "bg-muted/50 border-border/60"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${layerColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                      >
                        {entity.logo_url ? (
                          <img src={entity.logo_url} alt={entity.name} className="w-6 h-6 rounded-lg" />
                        ) : (
                          entity.name.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{entity.name}</div>
                        {entity.tagline && (
                          <div className="text-xs text-muted-foreground truncate">{entity.tagline}</div>
                        )}
                      </div>
                      {entity.layer && (
                        <div className="text-xs text-muted-foreground hidden sm:block">{entity.layer.name}</div>
                      )}
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => onToggle(entity.id)}
                        className="flex-shrink-0"
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} className="mr-1" /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={14} className="mr-1" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                    {entity.description && (
                      <p className="text-xs text-muted-foreground mt-2 pl-14 line-clamp-2">
                        {entity.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <CardContent className="p-6 border-t border-border/60 flex flex-col gap-2">
          {error && (
            <div className="text-sm text-red-600 text-right">{error}</div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </div>
            <Button
              onClick={onConfirm}
              disabled={saving || selectedIds.length === 0}
            >
              {saving ? "Saving..." : "Save Stack"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}