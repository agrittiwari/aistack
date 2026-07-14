alter table public.usage_scans
  add column if not exists scan_kind text not null default 'scan'
    check (scan_kind in ('scan', 'deep_scan')),
  add column if not exists client_run_id text;

create unique index if not exists usage_scans_user_client_run_idx
  on public.usage_scans(user_id, client_run_id)
  where client_run_id is not null;

comment on column public.usage_scans.user_id is
  'Authenticated Supabase auth.users owner. Never accept this value from the CLI payload.';
