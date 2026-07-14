alter table public.agent_usage_events
  drop constraint if exists agent_usage_events_source_check,
  add column if not exists category text not null default 'session',
  add column if not exists plan_mode boolean not null default false,
  add column if not exists event_date date,
  add column if not exists total_tokens bigint,
  add column if not exists log_payload jsonb not null default '{}'::jsonb;

alter table public.agent_usage_events
  add constraint agent_usage_events_source_check
  check (source in ('aistack', 'codex_cli', 'codex_cloud', 'open_code', 'claude', 'antigravity', 'copilot', 'other'));

create index if not exists agent_usage_event_date_idx
  on public.agent_usage_events(user_id, event_date desc, source, category);

create table if not exists public.agent_usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  usage_date date not null,
  source text not null,
  category text not null default 'session',
  event_count integer not null default 0,
  plan_event_count integer not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  cached_tokens bigint not null default 0,
  total_tokens bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date, source, category)
);

create index if not exists agent_usage_daily_user_date_idx
  on public.agent_usage_daily(user_id, usage_date desc);

alter table public.agent_usage_daily enable row level security;
create policy agent_usage_daily_owner on public.agent_usage_daily for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.agent_usage_daily from anon;
grant select on public.agent_usage_daily to authenticated;
grant all on public.agent_usage_daily to service_role;
