-- =============================================================================
-- MIGRATION 0020: Projects table (public schema, tenant-scoped)
-- Mirrors the jobs table (0003): single public table, tenant_id + RLS.
-- =============================================================================

create table public.projects (
  id            text primary key,                 -- ULID
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  description   text,
  type          text,                             -- human label, e.g. 'Hiring Campaign'
  status        text not null default 'active'
                  check (status in ('active','paused','completed','archived')),
  visibility    text not null default 'team'
                  check (visibility in ('private','team','organization')),
  owner_name    text,                             -- creator's display name
  team          jsonb not null default '[]',      -- array of member display names
  health_score  integer not null default 50,      -- 0-100 (placeholder until analytics exist)
  created_by    text references public.platform_users(id),
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_projects_tenant_id on public.projects(tenant_id) where deleted_at is null;
create index idx_projects_status    on public.projects(tenant_id, status) where deleted_at is null;

create trigger set_updated_at_projects
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "projects: tenant members can read"
  on public.projects for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
