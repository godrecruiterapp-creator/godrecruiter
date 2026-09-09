-- =============================================================================
-- MIGRATION 0023: Automations + run log (public schema, tenant-scoped)
-- Automations are event-driven "when X happens, do Y" rules built in the
-- automation builder. They fire in realtime when a matching domain event occurs
-- (e.g. a candidate is added). Each firing records one automation_runs row with
-- the per-action outcome, so My Automations stats and History are real.
-- =============================================================================

create table public.automations (
  id            text primary key,                 -- ULID
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  status        text not null default 'on'
                  check (status in ('on','off')),
  category      text,
  trigger       text,                             -- trigger event id, e.g. 'candidate_added'
  summary       text,                             -- plain-English summary from the builder
  config        jsonb not null default '{}',      -- full builder state: { blocks: [...] }
  owner_name    text,
  created_by    text references public.platform_users(id),
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_automations_tenant  on public.automations(tenant_id) where deleted_at is null;
create index idx_automations_trigger on public.automations(tenant_id, trigger, status) where deleted_at is null;

create trigger set_updated_at_automations
  before update on public.automations
  for each row execute function public.set_updated_at();

alter table public.automations enable row level security;

create policy "automations: tenant members can read"
  on public.automations for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- One row per firing.
create table public.automation_runs (
  id             text primary key,                -- ULID
  automation_id  text not null references public.automations(id) on delete cascade,
  tenant_id      text not null references public.tenants(id) on delete cascade,
  trigger        text,
  subject_label  text,                            -- e.g. the candidate's name
  status         text not null                    -- success | partial | skipped | failed
                   check (status in ('success','partial','skipped','failed')),
  steps          jsonb not null default '[]',     -- [{ action, status, detail }]
  created_at     timestamptz not null default now()
);

create index idx_automation_runs_auto   on public.automation_runs(automation_id, created_at desc);
create index idx_automation_runs_tenant on public.automation_runs(tenant_id, created_at desc);

alter table public.automation_runs enable row level security;

create policy "automation_runs: tenant members can read"
  on public.automation_runs for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );
