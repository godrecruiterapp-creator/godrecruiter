-- =============================================================================
-- MIGRATION 0004: Candidates table (public schema, tenant-scoped)
-- =============================================================================

create table public.candidates (
  id               text primary key,                 -- ULID
  tenant_id        text not null references public.tenants(id) on delete cascade,
  first_name       text not null,
  last_name        text not null,
  email            text not null,
  phone            text,
  current_title    text,
  current_company  text,
  location         text,
  linkedin_url     text,
  resume_url       text,
  source           text,                             -- 'linkedin','referral','inbound','import', etc.
  candidate_type   text not null default 'unknown'
                     check (candidate_type in ('permanent','contract','temp','unknown')),
  notice_period    text,
  current_ctc      bigint,                           -- in rupees/cents
  expected_ctc     bigint,
  is_do_not_contact boolean not null default false,
  notes            text,
  created_by       text references public.platform_users(id),
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (tenant_id, email)
);

create index idx_candidates_tenant_id  on public.candidates(tenant_id) where deleted_at is null;
create index idx_candidates_email      on public.candidates(tenant_id, email) where deleted_at is null;
create index idx_candidates_created_at on public.candidates(tenant_id, created_at desc) where deleted_at is null;

create trigger set_updated_at_candidates
  before update on public.candidates
  for each row execute function public.set_updated_at();

alter table public.candidates enable row level security;

create policy "candidates: tenant members can read"
  on public.candidates for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
