"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type ApiLayer = {
  id: number;
  name: string;
  rank: number;
};

type SubmissionResponse = {
  success?: boolean;
  id?: string;
  error?: string;
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function SubmitPage() {
  const [layers, setLayers] = useState<ApiLayer[]>([]);
  const [layersLoading, setLayersLoading] = useState(true);

  const [startupName, setStartupName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [targetLayerId, setTargetLayerId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [criticalPitch, setCriticalPitch] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let done = false;

    async function loadLayers() {
      setLayersLoading(true);
      try {
        const res = await fetch("/api/layers", { signal: controller.signal });
        if (!res.ok) throw new Error("Layers API failed");
        const json = await res.json();
        const rows = (json.data || []) as Array<{ id: number; name: string; rank: number }>;
        const next = rows
          .map((l) => ({
            id: Number(l.id),
            name: String(l.name),
            rank: Number(l.rank),
          }))
          .filter((l) => Number.isFinite(l.id) && !!l.name)
          .sort((a, b) => (a.rank || 0) - (b.rank || 0));

        if (!done) setLayers(next);
      } catch {
        if (!done) setLayers([]);
      } finally {
        if (!done) setLayersLoading(false);
      }
    }

    loadLayers();
    return () => {
      done = true;
      controller.abort();
    };
  }, []);

  const pitchLimit = 140;
  const pitchRemaining = Math.max(0, pitchLimit - criticalPitch.length);

  const isReady = useMemo(() => {
    if (!startupName.trim()) return false;
    if (!criticalPitch.trim()) return false;
    if (!targetLayerId) return false;
    if (criticalPitch.trim().length > pitchLimit) return false;
    if (websiteUrl.trim() && !isValidHttpUrl(websiteUrl.trim())) return false;
    if (githubUrl.trim() && !isValidHttpUrl(githubUrl.trim())) return false;
    if (logoUrl.trim() && !isValidHttpUrl(logoUrl.trim())) return false;
    return true;
  }, [criticalPitch, githubUrl, logoUrl, startupName, targetLayerId, websiteUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSuccessId(null);

    const startup = startupName.trim();
    const pitch = criticalPitch.trim();
    const layer = targetLayerId ? Number.parseInt(targetLayerId, 10) : NaN;

    if (!startup) return setError("Startup name is required.");
    if (!Number.isFinite(layer)) return setError("Target layer is required.");
    if (!pitch) return setError("Critical pitch is required.");
    if (pitch.length > pitchLimit) return setError("Critical pitch must be 140 characters or fewer.");

    const site = websiteUrl.trim();
    if (site && !isValidHttpUrl(site)) return setError("Website URL must be a valid http(s) URL.");
    const git = githubUrl.trim();
    if (git && !isValidHttpUrl(git)) return setError("GitHub URL must be a valid http(s) URL.");
    const logo = logoUrl.trim();
    if (logo && !isValidHttpUrl(logo)) return setError("Logo URL must be a valid http(s) URL.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_name: startup,
          company_name: companyName.trim() || null,
          target_layer_id: layer,
          critical_pitch: pitch,
          description: description.trim() || null,
          website_url: site || null,
          github_url: git || null,
          logo_url: logo || null,
        }),
      });

      const data: SubmissionResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Submission failed.");
        return;
      }

      setSuccessId(data.id || "submitted");
      setStartupName("");
      setCompanyName("");
      setTargetLayerId("");
      setWebsiteUrl("");
      setGithubUrl("");
      setLogoUrl("");
      setCriticalPitch("");
      setDescription("");
    } catch {
      setError("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-40 pb-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
          Submit your Stack to the directory.
        </h1>
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase">
          This is oriented to categorize the Stack in the right AI layer.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-8 bg-[#0a0a0c] border border-white/5 p-12 rounded-3xl shadow-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Startup Name
            </label>
            <Input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. NeuroFlow"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Company Name (Optional)
            </label>
            <Input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. NeuroFlow Inc."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Website URL (Optional)
            </label>
            <Input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              GitHub URL (Optional)
            </label>
            <Input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/org/repo"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Logo URL (Optional)
            </label>
            <Input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              Target Layer
            </label>
            <Select
              value={targetLayerId}
              onValueChange={setTargetLayerId}
              disabled={layersLoading}
            >
              <SelectTrigger className="w-full rounded-xl px-4 py-3 text-sm">
                <SelectValue placeholder={layersLoading ? "Loading layers..." : "Select a layer"} />
              </SelectTrigger>
              <SelectContent>
                {layers.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
              The Critical Pitch (Max 140 char)
            </label>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              {pitchRemaining} left
            </span>
          </div>
          <Textarea
            value={criticalPitch}
            onChange={(e) => setCriticalPitch(e.target.value.slice(0, pitchLimit))}
            placeholder="Why does this matter for the 2026 ecosystem?"
            className="w-full h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] block ml-1">
            Description (Optional)
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does it do? Who is it for?"
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {successId ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Submission received. ID: <span className="font-mono">{successId}</span>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={!isReady || submitting}
          className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] disabled:opacity-60 disabled:hover:bg-white disabled:hover:text-black"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Initiating
            </>
          ) : (
            "Initiate Review Process"
          )}
        </Button>

        <p className="text-center text-[10px] text-white/20 font-medium leading-relaxed uppercase">
          Submissions are audited by the AiStack core contributors.
          <br />
          Estimated review time: 48 hours.
        </p>
      </form>
    </div>
  );
}
