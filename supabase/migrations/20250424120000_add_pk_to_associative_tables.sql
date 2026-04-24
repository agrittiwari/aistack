-- Add primary keys to associative entities that lack stable row identity.
-- Handles existing composite PKs gracefully.

-- ============================================
-- 1. entity_layers
-- ============================================

-- Add id column if missing (populates existing rows via default)
alter table public.entity_layers
add column if not exists id uuid default gen_random_uuid();

-- Backfill any rows that somehow got NULL ids
update public.entity_layers
set id = gen_random_uuid()
where id is null;

-- Make id non-nullable
alter table public.entity_layers
alter column id set not null;

-- Drop existing composite PK if present (defensive)
alter table public.entity_layers
  drop constraint if exists entity_layers_pkey,
  drop constraint if exists entity_layers_entity_id_layer_id_pkey;

-- Add primary key on id
alter table public.entity_layers
add constraint entity_layers_pkey primary key (id);

-- Prevent duplicate entity-layer pairs
alter table public.entity_layers
drop constraint if exists entity_layers_entity_layer_unique;

alter table public.entity_layers
add constraint entity_layers_entity_layer_unique unique (entity_id, layer_id);

-- ============================================
-- 2. stack_compositions
-- ============================================

alter table public.stack_compositions
add column if not exists id uuid default gen_random_uuid();

update public.stack_compositions
set id = gen_random_uuid()
where id is null;

alter table public.stack_compositions
alter column id set not null;

alter table public.stack_compositions
  drop constraint if exists stack_compositions_pkey,
  drop constraint if exists stack_compositions_entity_id_layer_id_stack_id_pkey;

alter table public.stack_compositions
add constraint stack_compositions_pkey primary key (id);

alter table public.stack_compositions
drop constraint if exists stack_compositions_unique;

alter table public.stack_compositions
add constraint stack_compositions_unique unique (entity_id, layer_id, stack_id);

-- ============================================
-- 3. user_endorsements
-- ============================================

alter table public.user_endorsements
add column if not exists id uuid default gen_random_uuid();

update public.user_endorsements
set id = gen_random_uuid()
where id is null;

alter table public.user_endorsements
alter column id set not null;

alter table public.user_endorsements
  drop constraint if exists user_endorsements_pkey,
  drop constraint if exists user_endorsements_entity_id_user_id_pkey;

alter table public.user_endorsements
add constraint user_endorsements_pkey primary key (id);

alter table public.user_endorsements
drop constraint if exists user_endorsements_unique;

alter table public.user_endorsements
add constraint user_endorsements_unique unique (entity_id, user_id);
