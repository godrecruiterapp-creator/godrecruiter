-- =============================================================================
-- MIGRATION 0008: Job → recruiter FK
-- =============================================================================
-- recruiter_name (free text) already exists live; this adds a real link to
-- platform_users so recruiter matching/workload can be computed from data
-- instead of a name string. recruiter_name is kept as a display fallback for
-- rows assigned before this migration.

alter table public.jobs
  add column recruiter_id text references public.platform_users(id);

create index idx_jobs_recruiter_id on public.jobs(recruiter_id) where deleted_at is null;
