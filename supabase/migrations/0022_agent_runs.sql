-- =============================================================================
-- MIGRATION 0022: Agent run history (public schema, tenant-scoped)
-- Every time an agent executes (on-demand "Run Now" for now) we record one row:
-- what it looked at, what the AI concluded, success/failure. My Agents derives
-- last_run + success_rate from these rows; the History tab lists them.
-- =============================================================================

create table public.agent_runs (
  id            text primary key,                 -- ULID
  agent_id      text not null references public.agents(id) on delete cascade,
  tenant_id     text not null references public.tenants(id) on delete cascade,
  status        text not null default 'running'
                  check (status in ('running','success','failed')),
  trigger       text,                             -- how it was started, e.g. 'Manual'
  output        jsonb,                            -- { summary, items: [...] } from the runner
  error         text,                             -- friendly error message when status = 'failed'
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  created_by    text references public.platform_users(id)
);

create index idx_agent_runs_agent  on public.agent_runs(agent_id, started_at desc);
create index idx_agent_runs_tenant on public.agent_runs(tenant_id, started_at desc);

alter table public.agent_runs enable row level security;

create policy "agent_runs: tenant members can read"
  on public.agent_runs for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
