-- =====================================================
-- ADD UNIQUE CONSTRAINT TO user_stacks.user_id
-- Run this in Supabase SQL Editor or psql
-- =====================================================

-- Idempotent: only add the constraint if it doesn't already exist.
-- This fixes the upsert ON CONFLICT error:
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification"

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_stacks_user_id_unique'
    and conrelid = 'public.user_stacks'::regclass
  ) then
    alter table public.user_stacks
    add constraint user_stacks_user_id_unique unique (user_id);
  end if;
end $$;

-- =====================================================
-- VERIFY
-- =====================================================
-- Should now show 'u' (UNIQUE) for user_stacks_user_id_unique:
-- select conname, contype, pg_get_constraintdef(oid)
-- from pg_constraint
-- where conrelid = 'public.user_stacks'::regclass;
