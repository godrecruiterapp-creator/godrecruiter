-- =============================================================================
-- MIGRATION 0005: Job notes, documents, and activity log
-- =============================================================================

create table public.job_notes (
  id          text primary key,
  job_id      text not null references public.jobs(id) on delete cascade,
  tenant_id   text not null references public.tenants(id) on delete cascade,
  author_id   text references public.platform_users(id),
  author_name text not null,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index idx_job_notes_job_id on public.job_notes(job_id, created_at desc);

alter table public.job_notes enable row level security;

create policy "job_notes: tenant members can read"
  on public.job_notes for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.job_documents (
  id            text primary key,
  job_id        text not null references public.jobs(id) on delete cascade,
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  size          bigint,
  file_type     text,
  storage_path  text,
  uploader_id   text references public.platform_users(id),
  uploader_name text not null,
  created_at    timestamptz not null default now()
);

create index idx_job_documents_job_id on public.job_documents(job_id, created_at desc);

alter table public.job_documents enable row level security;

create policy "job_documents: tenant members can read"
  on public.job_documents for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.job_activity (
  id          text primary key,
  job_id      text not null references public.jobs(id) on delete cascade,
  tenant_id   text not null references public.tenants(id) on delete cascade,
  actor_id    text references public.platform_users(id),
  actor_name  text not null,
  action      text not null,
  created_at  timestamptz not null default now()
);

create index idx_job_activity_job_id on public.job_activity(job_id, created_at desc);

alter table public.job_activity enable row level security;

create policy "job_activity: tenant members can read"
  on public.job_activity for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
