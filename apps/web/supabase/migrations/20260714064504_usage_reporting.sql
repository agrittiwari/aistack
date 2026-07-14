-- Usage reporting is intentionally metadata-only: prompts, source files, and
-- raw paths must never be uploaded by the CLI.
create table if not exists public.usage_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  source text not null default 'cli_scan',
  root_path_hash text,
  hostname_hash text,
  status text not null default 'completed' check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  project_count integer not null default 0,
  manifest_count integer not null default 0,
  error_count integer not null default 0,
  coverage text not null default 'observed' check (coverage in ('observed', 'partial', 'estimated')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_projects (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.usage_scans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_key text not null,
  project_name text,
  project_root_hash text,
  workspace_type text,
  stack_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (scan_id, project_key)
);

create table if not exists public.usage_technologies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.usage_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ecosystem text not null,
  name text not null,
  version text,
  evidence_kind text not null default 'manifest',
  occurrence_count integer not null default 1,
  created_at timestamptz not null default now(),
  unique (project_id, ecosystem, name, version)
);

create table if not exists public.agent_usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  source text not null check (source in ('aistack', 'codex_cli', 'codex_cloud', 'open_code', 'other')),
  external_id text not null,
  project_key text,
  agent_name text,
  model text,
  started_at timestamptz,
  ended_at timestamptz,
  status text,
  input_tokens bigint,
  output_tokens bigint,
  cached_tokens bigint,
  cost numeric,
  currency text,
  tool_call_count integer,
  files_changed integer,
  lines_added integer,
  lines_deleted integer,
  commits integer,
  pull_requests integer,
  coverage text not null default 'observed' check (coverage in ('observed', 'partial', 'estimated', 'unsupported')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, source, external_id)
);

create table if not exists public.profile_usage_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'summary', 'public')),
  show_tokens boolean not null default false,
  show_projects boolean not null default true,
  window_days integer not null default 30 check (window_days in (7, 30, 90, 365)),
  updated_at timestamptz not null default now()
);

create index if not exists usage_scans_user_created_idx on public.usage_scans(user_id, created_at desc);
create index if not exists usage_projects_user_idx on public.usage_projects(user_id, created_at desc);
create index if not exists usage_technologies_user_idx on public.usage_technologies(user_id, created_at desc);
create index if not exists agent_usage_user_started_idx on public.agent_usage_events(user_id, started_at desc);
create index if not exists agent_usage_source_idx on public.agent_usage_events(user_id, source, started_at desc);

alter table public.usage_scans enable row level security;
alter table public.usage_projects enable row level security;
alter table public.usage_technologies enable row level security;
alter table public.agent_usage_events enable row level security;
alter table public.profile_usage_settings enable row level security;

create policy usage_scans_owner on public.usage_scans for select using (auth.uid() = user_id);
create policy usage_projects_owner on public.usage_projects for select using (auth.uid() = user_id);
create policy usage_technologies_owner on public.usage_technologies for select using (auth.uid() = user_id);
create policy agent_usage_owner on public.agent_usage_events for select using (auth.uid() = user_id);
create policy usage_settings_owner on public.profile_usage_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke all on public.usage_scans, public.usage_projects, public.usage_technologies, public.agent_usage_events, public.profile_usage_settings from anon;
grant select on public.usage_scans, public.usage_projects, public.usage_technologies, public.agent_usage_events, public.profile_usage_settings to authenticated;
grant all on public.usage_scans, public.usage_projects, public.usage_technologies, public.agent_usage_events, public.profile_usage_settings to service_role;
