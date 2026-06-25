-- =============================================================================
-- MIGRATION 0007: Candidate notes, documents, activity, and job_candidates
-- =============================================================================

create table public.candidate_notes (
  id           text primary key,
  candidate_id text not null references public.candidates(id) on delete cascade,
  tenant_id    text not null references public.tenants(id) on delete cascade,
  author_id    text references public.platform_users(id),
  author_name  text not null,
  text         text not null,
  created_at   timestamptz not null default now()
);
create index idx_candidate_notes_candidate_id on public.candidate_notes(candidate_id, created_at desc);
alter table public.candidate_notes enable row level security;
create policy "candidate_notes: tenant members can read"
  on public.candidate_notes for select using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text) and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.candidate_documents (
  id            text primary key,
  candidate_id  text not null references public.candidates(id) on delete cascade,
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  size          bigint,
  file_type     text,
  storage_path  text,
  doc_type      text not null default 'other',   -- 'resume', 'cover_letter', 'other'
  uploader_id   text references public.platform_users(id),
  uploader_name text not null,
  created_at    timestamptz not null default now()
);
create index idx_candidate_documents_candidate_id on public.candidate_documents(candidate_id, created_at desc);
alter table public.candidate_documents enable row level security;
create policy "candidate_documents: tenant members can read"
  on public.candidate_documents for select using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text) and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.candidate_activity (
  id           text primary key,
  candidate_id text not null references public.candidates(id) on delete cascade,
  tenant_id    text not null references public.tenants(id) on delete cascade,
  actor_id     text references public.platform_users(id),
  actor_name   text not null,
  action       text not null,
  created_at   timestamptz not null default now()
);
create index idx_candidate_activity_candidate_id on public.candidate_activity(candidate_id, created_at desc);
alter table public.candidate_activity enable row level security;
create policy "candidate_activity: tenant members can read"
  on public.candidate_activity for select using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text) and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.job_candidates (
  id           text primary key,
  job_id       text not null references public.jobs(id) on delete cascade,
  candidate_id text not null references public.candidates(id) on delete cascade,
  tenant_id    text not null references public.tenants(id) on delete cascade,
  stage        text not null default 'sourced'
                 check (stage in ('sourced','qualified','submitted','interview','offer','start')),
  added_by     text references public.platform_users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (job_id, candidate_id)
);
create index idx_job_candidates_candidate_id on public.job_candidates(candidate_id);
create index idx_job_candidates_job_id       on public.job_candidates(job_id);
alter table public.job_candidates enable row level security;
create policy "job_candidates: tenant members can read"
  on public.job_candidates for select using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text) and is_active = true
    )
  );
