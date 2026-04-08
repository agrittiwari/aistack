"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Search, X, Plus, Github, Twitter, ExternalLink } from "lucide-react";

interface Profile {
  id: string;
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

interface ProfileCardProps {
  profile: Profile | null;
  editing: boolean;
  form: Partial<Profile>;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (form: Partial<Profile>) => void;
  onSave: () => void;
  saving: boolean;
}

export function ProfileCard({ profile, editing, form, onEdit, onCancel, onChange, onSave, saving }: ProfileCardProps) {
  const displayProfile = editing ? form : profile;

  return (
    <div className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
          Profile
        </h2>
        {!editing && (
          <button
            onClick={onEdit}
            className="text-[10px] text-blue-500 hover:text-blue-400 uppercase font-black tracking-widest"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <Label className="text-[10px] font-black uppercase text-white/60 mb-2 block">
              Full Name
            </Label>
            <Input
              value={form.full_name || ""}
              onChange={(e) => onChange({ ...form, full_name: e.target.value })}
              placeholder="Your name"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-white/60 mb-2 block">
              Headline
            </Label>
            <Input
              value={form.headline || ""}
              onChange={(e) => onChange({ ...form, headline: e.target.value })}
              placeholder="e.g. ML Engineer at Company"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-white/60 mb-2 block">
              Bio
            </Label>
            <Textarea
              value={form.bio || ""}
              onChange={(e) => onChange({ ...form, bio: e.target.value })}
              placeholder="Brief description about yourself..."
              className="bg-white/5 border-white/10 text-white min-h-[80px]"
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-white/60 mb-2 block flex items-center gap-2">
              <Github size={12} /> GitHub
            </Label>
            <Input
              value={form.github_handle || ""}
              onChange={(e) => onChange({ ...form, github_handle: e.target.value })}
              placeholder="username"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-white/60 mb-2 block flex items-center gap-2">
              <Twitter size={12} /> Twitter
            </Label>
            <Input
              value={form.twitter_handle || ""}
              onChange={(e) => onChange({ ...form, twitter_handle: e.target.value })}
              placeholder="@username"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-[10px] font-black uppercase text-white/60 mb-2 block flex items-center gap-2">
              <ExternalLink size={12} /> Website
            </Label>
            <Input
              value={form.website_url || ""}
              onChange={(e) => onChange({ ...form, website_url: e.target.value })}
              placeholder="https://..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onSave}
              disabled={saving}
              className="flex-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest"
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
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/60 font-black text-xl">
                    {(profile.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-lg font-black text-white uppercase">
                    {profile.full_name || "Anonymous"}
                  </div>
                  {profile.headline && (
                    <div className="text-xs text-white/40">
                      {profile.headline}
                    </div>
                  )}
                </div>
              </div>
              {profile.bio && (
                <p className="text-sm text-white/60">{profile.bio}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                {profile.github_handle && (
                  <a
                    href={`https://github.com/${profile.github_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                  >
                    <Github size={14} /> {profile.github_handle}
                  </a>
                )}
                {profile.twitter_handle && (
                  <a
                    href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                  >
                    <Twitter size={14} /> {profile.twitter_handle}
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
                  >
                    <ExternalLink size={14} /> Website
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm mb-4">No profile yet</p>
              <Button
                onClick={onEdit}
                className="bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest"
              >
                Create Profile
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
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
  saving
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-[#0a0a0c] border border-white/10 rounded-3xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">
              Select Entities
            </h2>
            <button onClick={onClose} className="text-white/40 hover:text-white">
              <X size={24} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedLayer(null)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedLayer === null
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
              }`}
            >
              All
            </button>
            {layers.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.slug)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedLayer === layer.slug
                    ? "bg-blue-500 text-white"
                    : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: "400px" }}>
          {loading ? (
            <div className="text-center py-8 text-white/40">Loading entities...</div>
          ) : filteredEntities.length === 0 ? (
            <div className="text-center py-8 text-white/40">No entities found</div>
          ) : (
            <div className="space-y-2">
              {filteredEntities.map((entity) => {
                const isSelected = selectedIds.includes(entity.id);
                const layerColor = entity.layer?.color_gradient || "from-blue-500 to-cyan-400";
                return (
                  <div
                    key={entity.id}
                    onClick={() => onToggle(entity.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/50"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${layerColor} flex items-center justify-center text-black font-black text-sm`}
                    >
                      {entity.logo_url ? (
                        <img src={entity.logo_url} alt={entity.name} className="w-6 h-6 rounded-lg" />
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
                    {entity.layer && (
                      <div className="text-[10px] text-white/40 uppercase">{entity.layer.name}</div>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/40">
            {selectedIds.length} selected
          </div>
          <Button
            onClick={onConfirm}
            disabled={saving || selectedIds.length === 0}
            className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
          >
            {saving ? "Saving..." : "Create My Stack"}
          </Button>
        </div>
      </div>
    </div>
  );
}