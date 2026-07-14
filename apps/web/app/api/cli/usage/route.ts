import { NextResponse } from "next/server";
import { authenticateCliRequest } from "@/lib/cli-auth";

export const runtime = "nodejs";

const MAX_BATCH = 5000;

function list(value: unknown) {
  return Array.isArray(value) ? value.slice(0, MAX_BATCH) : [];
}

const AGENT_SOURCES = new Set(["aistack", "codex_cli", "codex_cloud", "open_code", "claude", "antigravity", "copilot", "other"]);

function normalizeSource(value: unknown) {
  const source = String(value ?? "other");
  if (source === "codex") return "codex_cli";
  if (source === "opencode") return "open_code";
  return AGENT_SOURCES.has(source) ? source : "other";
}

export async function POST(request: Request) {
  let stage = "request";
  try {
    stage = "authenticate";
    const auth = await authenticateCliRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = (await request.json()) as Record<string, unknown>;
    const scan = body.scan && typeof body.scan === "object" ? (body.scan as Record<string, unknown>) : null;
    const projects = list(body.projects) as Record<string, unknown>[];
    const technologies = list(body.technologies) as Record<string, unknown>[];
    const events = list(body.events) as Record<string, unknown>[];
    if (!scan && events.length === 0) {
      return NextResponse.json({ error: "scan or events are required" }, { status: 400 });
    }

    let scanId: string | undefined;
    if (scan) {
      stage = "insert_scan";
      const { data, error } = await auth.admin.from("usage_scans").insert({
        user_id: auth.token.user_id,
        workspace_id: auth.token.workspace_id,
        source: scan.scan_kind === "deep_scan" ? "cli_deep_scan" : "cli_scan",
        scan_kind: scan.scan_kind === "deep_scan" ? "deep_scan" : "scan",
        client_run_id: scan.client_run_id ?? null,
        root_path_hash: scan.root_path_hash ?? null,
        hostname_hash: scan.hostname_hash ?? null,
        status: scan.status ?? "completed",
        started_at: scan.started_at ?? new Date().toISOString(),
        completed_at: scan.completed_at ?? new Date().toISOString(),
        project_count: projects.length,
        manifest_count: Number(scan.manifest_count ?? 0),
        error_count: Number(scan.error_count ?? 0),
        coverage: scan.coverage ?? "observed",
        metadata: scan.metadata ?? {},
      }).select("id").single();
      if (error) throw error;
      scanId = data.id;
    }

    if (scanId && projects.length) {
      stage = "insert_projects";
      const rows = projects.map((project) => ({
        scan_id: scanId,
        user_id: auth.token.user_id,
        project_key: String(project.project_key ?? project.name ?? crypto.randomUUID()),
        project_name: project.project_name ?? project.name ?? null,
        project_root_hash: project.project_root_hash ?? null,
        workspace_type: project.workspace_type ?? null,
        stack_summary: project.stack_summary ?? {},
      }));
      const { data: inserted, error } = await auth.admin.from("usage_projects").insert(rows).select("id,project_key");
      if (error) throw error;
      const projectIds = new Map((inserted ?? []).map((row) => [row.project_key, row.id]));
      if (technologies.length) {
        const techRows = technologies.flatMap((tech) => {
          const projectId = projectIds.get(String(tech.project_key ?? ""));
          return projectId ? [{ project_id: projectId, user_id: auth.token.user_id, ecosystem: String(tech.ecosystem ?? "unknown"), name: String(tech.name ?? "unknown"), version: tech.version ?? null, evidence_kind: tech.evidence_kind ?? "manifest", occurrence_count: Number(tech.occurrence_count ?? 1) }] : [];
        });
        const uniqueTechRows = [...new Map(techRows.map((row) => [`${row.project_id}:${row.ecosystem}:${row.name}:${row.version ?? ""}`, row])).values()];
        if (uniqueTechRows.length) { stage = "insert_technologies"; const { error } = await auth.admin.from("usage_technologies").upsert(uniqueTechRows, { onConflict: "project_id,ecosystem,name,version" }); if (error) throw error; }
      }
    }

    if (events.length) {
      stage = "insert_events";
      const rows = events.map((event) => ({ ...event, source: normalizeSource(event.source), user_id: auth.token.user_id, workspace_id: event.workspace_id ?? auth.token.workspace_id }));
      const { error } = await auth.admin.from("agent_usage_events").upsert(rows, { onConflict: "user_id,source,external_id" });
      if (error) throw error;

      const daily = new Map<string, Record<string, unknown>>();
      for (const event of events) {
        const usageDate = String(event.event_date ?? String(event.started_at ?? new Date().toISOString()).slice(0, 10));
        if (usageDate === "unknown") continue;
        const source = normalizeSource(event.source);
        const category = String(event.category ?? "session");
        const key = `${usageDate}:${source}:${category}`;
        const current = daily.get(key) ?? { user_id: auth.token.user_id, workspace_id: auth.token.workspace_id, usage_date: usageDate, source, category, event_count: 0, plan_event_count: 0, input_tokens: 0, output_tokens: 0, cached_tokens: 0, total_tokens: 0, metadata: { imported_by: "cli_deepscan" } };
        current.event_count = Number(current.event_count) + 1;
        current.plan_event_count = Number(current.plan_event_count) + (event.plan_mode === true ? 1 : 0);
        current.input_tokens = Number(current.input_tokens) + Number(event.input_tokens ?? 0);
        current.output_tokens = Number(current.output_tokens) + Number(event.output_tokens ?? 0);
        current.cached_tokens = Number(current.cached_tokens) + Number(event.cached_tokens ?? 0);
        current.total_tokens = Number(current.total_tokens) + Number(event.total_tokens ?? (Number(event.input_tokens ?? 0) + Number(event.output_tokens ?? 0) + Number(event.cached_tokens ?? 0)));
        daily.set(key, current);
      }
      if (daily.size) {
        stage = "insert_daily";
        const { error: dailyError } = await auth.admin.from("agent_usage_daily").upsert([...daily.values()], { onConflict: "user_id,usage_date,source,category" });
        if (dailyError) throw dailyError;
      }
    }
    return NextResponse.json({ accepted: { scan: Boolean(scanId), projects: projects.length, technologies: technologies.length, events: events.length } });
  } catch (error) {
    console.error("[POST /api/cli/usage] failed:", error);
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Unable to store usage report", code: "CLI_USAGE_DATABASE", stage, details: process.env.NODE_ENV === "development" ? details : undefined }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const auth = await authenticateCliRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = new URL(request.url);
    const days = Math.min(Math.max(Number(url.searchParams.get("days") ?? 30), 1), 365);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await auth.admin.from("agent_usage_events").select("source,status,input_tokens,output_tokens,cached_tokens,total_tokens,started_at,event_date,project_key,model,coverage,category,plan_mode").eq("user_id", auth.token.user_id).gte("started_at", since).order("started_at", { ascending: true }).limit(5000);
    if (error) throw error;
    const { data: daily } = await auth.admin.from("agent_usage_daily").select("usage_date,source,category,event_count,plan_event_count,input_tokens,output_tokens,cached_tokens,total_tokens").eq("user_id", auth.token.user_id).gte("usage_date", since.slice(0, 10)).order("usage_date", { ascending: true }).limit(5000);
    const events = data ?? [];
    return NextResponse.json({ days, coverage: events.length ? "observed" : "unsupported", events, daily: daily ?? [], totals: { runs: events.length, input_tokens: events.reduce((n, e) => n + (e.input_tokens ?? 0), 0), output_tokens: events.reduce((n, e) => n + (e.output_tokens ?? 0), 0) } });
  } catch (error) {
    console.error("[GET /api/cli/usage] failed:", error);
    return NextResponse.json({ error: "Unable to read usage report" }, { status: 500 });
  }
}
