"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { CompanySelector } from "@/components/company-selector";
import { LayerSelector } from "@/components/layer-selector";
import { NewsletterCard } from "@/components/newsletter-subscribe";

type ApiLayer = {
  id: number;
  name: string;
  rank: number;
};

type Company = {
  id: string;
  name: string;
  logo_url?: string | null;
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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const [startupName, setStartupName] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>("");
  const [targetLayerId, setTargetLayerId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [criticalPitch, setCriticalPitch] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Load layers
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

  // Load companies
  useEffect(() => {
    const controller = new AbortController();
    let done = false;

    async function loadCompanies() {
      setCompaniesLoading(true);
      try {
        const res = await fetch("/api/companies", { signal: controller.signal });
        if (!res.ok) throw new Error("Companies API failed");
        const json = await res.json();
        if (!done) setCompanies(json.companies || []);
      } catch {
        if (!done) setCompanies([]);
      } finally {
        if (!done) setCompaniesLoading(false);
      }
    }

    loadCompanies();
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

  const handleCompanySelect = (companyId: string | null, companyName: string) => {
    setSelectedCompanyId(companyId);
    setSelectedCompanyName(companyName);
  };

  const handleAddCompany = async (name: string, logoUrl?: string): Promise<string> => {
    // Since there's no separate companies table, we just return the name as the ID
    // The company will be created when the submission is made
    const newCompany: Company = {
      id: name,
      name: name,
      logo_url: logoUrl || null,
    };
    
    // Add to local list
    setCompanies((prev) => [...prev, newCompany]);
    
    return name;
  };

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
          company_name: selectedCompanyName.trim() || null,
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
      setSelectedCompanyId(null);
      setSelectedCompanyName("");
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
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Submit a Tool
        </h1>
        <p className="text-muted-foreground text-sm">
          Help us build the most comprehensive AI Stack directory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Tool Details</CardTitle>
              <CardDescription className="text-sm">
                Fill out the form below to submit your tool for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="startupName" className="text-sm">
                  Tool Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="startupName"
                  type="text"
                  value={startupName}
                  onChange={(e) => setStartupName(e.target.value)}
                  placeholder="e.g., NeuroFlow"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Company</Label>
                <CompanySelector
                  companies={companies}
                  selectedCompanyId={selectedCompanyId}
                  selectedCompanyName={selectedCompanyName}
                  onSelect={handleCompanySelect}
                  onAddCompany={handleAddCompany}
                  disabled={companiesLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl" className="text-sm">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="text-sm">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLayer" className="text-sm">
                  Layer <span className="text-destructive">*</span>
                </Label>
                <LayerSelector
                  layers={layers}
                  selectedLayerId={targetLayerId}
                  onSelect={setTargetLayerId}
                  loading={layersLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="criticalPitch" className="text-sm">
                  Tagline <span className="text-destructive">*</span>
                </Label>
                <span className={`text-xs ${pitchRemaining < 20 ? "text-amber-600" : "text-muted-foreground"}`}>
                  {pitchRemaining}
                </span>
              </div>
              <Textarea
                id="criticalPitch"
                value={criticalPitch}
                onChange={(e) => setCriticalPitch(e.target.value.slice(0, pitchLimit))}
                placeholder="Why does this matter?"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="description" className="text-sm">Description</Label>
                <span className="text-xs text-muted-foreground">(supports Markdown)</span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does it do? Who is it for?"
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {successId && (
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600">
                Submission received! ID: <span className="font-mono font-medium">{successId}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={!isReady || submitting}
              className="w-full gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Submissions are reviewed within 48 hours.
            </p>
          </form>
        </CardContent>
      </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-24 space-y-4">
            {/* <NewsletterCard /> */}

            <Card className="border-border/60">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold mb-3">Need faster listing?</h3>
              <p className="text-xs text-muted-foreground mb-4">
                DM for faster listing of your stack.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://www.x.com/agrit_tiwari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Reach out on X
                </a>
                <a
                  href="https://www.linkedin.com/in/agrittiwari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
