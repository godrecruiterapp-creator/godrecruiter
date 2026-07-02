-- =============================================================================
-- MIGRATION 0010: Interviews table (public schema, tied to a job submission)
-- =============================================================================
-- An interview belongs to a specific job_candidates row (a candidate's
-- submission to a job) rather than the candidate directly, since scheduling
-- one requires knowing which job it's for.

create table public.interviews (
  id                text primary key,                 -- ULID
  job_candidate_id  text not null references public.job_candidates(id) on delete cascade,
  tenant_id         text not null references public.tenants(id) on delete cascade,
  interview_type    text not null default 'video'
                      check (interview_type in ('phone','video','onsite','technical','panel','hiring_manager')),
  status            text not null default 'scheduled'
                      check (status in ('scheduled','completed','cancelled','no_show')),
  scheduled_at      timestamptz not null,
  duration_minutes  integer not null default 30,
  interviewer_name  text,
  location          text,
  meeting_url       text,
  notes             text,
  created_by        text references public.platform_users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_interviews_job_candidate_id on public.interviews(job_candidate_id);
create index idx_interviews_tenant_id        on public.interviews(tenant_id, scheduled_at desc);

create trigger set_updated_at_interviews
  before update on public.interviews
  for each row execute function public.set_updated_at();

alter table public.interviews enable row level security;

create policy "interviews: tenant members can read"
  on public.interviews for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
