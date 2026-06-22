-- =============================================================================
-- MIGRATION 0003: Jobs table (public schema, tenant-scoped)
-- =============================================================================

create table public.jobs (
  id              text primary key,                 -- ULID
  tenant_id       text not null references public.tenants(id) on delete cascade,
  title           text not null,
  department      text,
  location        text,
  work_mode       text not null default 'onsite'
                    check (work_mode in ('remote','hybrid','onsite')),
  job_type        text not null default 'full_time'
                    check (job_type in ('full_time','part_time','contract','internship')),
  salary_min      integer,                          -- in cents
  salary_max      integer,                          -- in cents
  salary_currency text not null default 'USD',
  description     text,
  requirements    text,
  status          text not null default 'draft'
                    check (status in ('draft','published','paused','closed')),
  openings        integer not null default 1,
  created_by      text references public.platform_users(id),
  published_at    timestamptz,
  closes_at       timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_jobs_tenant_id on public.jobs(tenant_id) where deleted_at is null;
create index idx_jobs_status    on public.jobs(tenant_id, status) where deleted_at is null;

create trigger set_updated_at_jobs
  before update on public.jobs
  for each row execute function public.set_updated_at();

alter table public.jobs enable row level security;

create policy "jobs: tenant members can read"
  on public.jobs for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
