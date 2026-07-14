create table public.cli_access_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null,
  user_email text not null,
  token_hash text not null unique,
  name text not null default 'aistack CLI',
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz
);

create index cli_access_tokens_user_id_idx
  on public.cli_access_tokens (user_id);

create table public.cli_auth_requests (
  id uuid primary key default gen_random_uuid(),
  device_code_hash text not null unique,
  user_code text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'complete', 'expired')),
  user_id uuid references auth.users(id) on delete cascade,
  workspace_id uuid,
  user_email text,
  access_token_id uuid references public.cli_access_tokens(id) on delete set null,
  token_ciphertext text,
  poll_interval smallint not null default 5
    check (poll_interval between 2 and 30),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  completed_at timestamptz
);

create index cli_auth_requests_expires_at_idx
  on public.cli_auth_requests (expires_at);

alter table public.cli_access_tokens enable row level security;
alter table public.cli_auth_requests enable row level security;

-- These are backend-only tables. The Next.js routes use SUPABASE_SECRET_KEY.
-- No anon/authenticated policies are intentionally defined.
revoke all on table public.cli_access_tokens from anon, authenticated;
revoke all on table public.cli_auth_requests from anon, authenticated;

grant select, insert, update, delete on table public.cli_access_tokens to service_role;
grant select, insert, update, delete on table public.cli_auth_requests to service_role;
