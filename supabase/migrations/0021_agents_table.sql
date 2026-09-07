-- =============================================================================
-- MIGRATION 0021: AI Agents table (public schema, tenant-scoped)
-- Mirrors the projects table (0020): single public table, tenant_id + RLS.
-- Stores the agent CONFIG built by the Create Agent wizard. Run history and
-- metrics stay empty until an execution engine exists.
-- =============================================================================

create table public.agents (
  id            text primary key,                 -- ULID
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  description   text,
  category      text,                             -- Recruiting, Compliance, ...
  status        text not null default 'draft'
                  check (status in ('draft','active','paused')),
  trigger       text,                             -- Manual, Daily, Event Based, ...
  config        jsonb not null default '{}',      -- full wizard state (sources, filters, actions, schedule, notifications)
  owner_name    text,                             -- creator's display name
  created_by    text references public.platform_users(id),
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_agents_tenant_id on public.agents(tenant_id) where deleted_at is null;
create index idx_agents_status    on public.agents(tenant_id, status) where deleted_at is null;

create trigger set_updated_at_agents
  before update on public.agents
  for each row execute function public.set_updated_at();

alter table public.agents enable row level security;

create policy "agents: tenant members can read"
  on public.agents for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
