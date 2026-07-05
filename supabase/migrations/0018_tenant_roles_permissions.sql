-- =============================================================================
-- MIGRATION 0018: Real per-tenant custom roles + module-level permissions
-- =============================================================================
-- Replaces the fixed 7-value `platform_user_tenants.role` text enum with a
-- proper per-tenant roles system:
--   - platform_owners: God Recruiter's own internal staff, cross-tenant,
--     completely separate from anything a tenant can see/grant.
--   - tenant_roles: every tenant gets exactly one auto-created, undeletable
--     "Super Admin" role (is_system = true). Every other role is created by
--     that tenant's own Super Admin(s) from scratch — there are no other
--     defaults.
--   - role_permissions: view/create/edit/delete per module per role.
--
-- The backfill below preserves current behavior exactly: since no permission
-- enforcement exists anywhere today (every active tenant member already has
-- equal data access), every role created during backfill gets full
-- permissions on every module. Nothing about any existing user's access
-- changes the moment this migration runs.

-- ── Platform-wide Owner allowlist ───────────────────────────────────────────
-- No UI ships for this table in this pass — it's a handful of internal staff,
-- managed by hand for now. Add a UI if that ever stops being true.
create table public.platform_owners (
  platform_user_id text primary key references public.platform_users(id) on delete cascade,
  granted_by       text references public.platform_users(id),
  created_at       timestamptz not null default now()
);

alter table public.platform_owners enable row level security;

create policy "platform_owners: no client access"
  on public.platform_owners for all
  using (false);

-- ── Tenant-scoped roles ──────────────────────────────────────────────────────
create table public.tenant_roles (
  id         text primary key,
  tenant_id  text not null references public.tenants(id) on delete cascade,
  name       text not null,
  is_system  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create index idx_tenant_roles_tenant_id on public.tenant_roles(tenant_id);

alter table public.tenant_roles enable row level security;

create policy "tenant_roles: tenant members can read"
  on public.tenant_roles for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ── Module-level permissions per role ───────────────────────────────────────
create table public.role_permissions (
  role_id    text not null references public.tenant_roles(id) on delete cascade,
  module     text not null check (module in (
               'clients', 'jobs', 'candidates', 'placements', 'projects',
               'reports', 'ai_agents', 'automation', 'settings'
             )),
  can_view   boolean not null default false,
  can_create boolean not null default false,
  can_edit   boolean not null default false,
  can_delete boolean not null default false,
  primary key (role_id, module)
);

alter table public.role_permissions enable row level security;

create policy "role_permissions: tenant members can read"
  on public.role_permissions for select
  using (
    role_id in (
      select id from public.tenant_roles
      where tenant_id in (
        select tenant_id from public.platform_user_tenants
        where platform_user_id = (select auth.uid()::text)
          and is_active = true
      )
    )
  );

-- ── Migrate platform_user_tenants.role (text enum) -> role_id (FK) ─────────
alter table public.platform_user_tenants add column role_id text references public.tenant_roles(id);

do $$
declare
  r record;
  new_role_id text;
  role_label text;
begin
  -- One row per (tenant_id, distinct role value) currently in use.
  for r in
    select distinct tenant_id, role from public.platform_user_tenants
  loop
    role_label := case r.role
      when 'tenant_owner'     then 'Super Admin'
      when 'admin'            then 'Admin'
      when 'senior_recruiter' then 'Senior Recruiter'
      when 'recruiter'        then 'Recruiter'
      when 'sourcer'          then 'Sourcer'
      when 'interviewer'      then 'Interviewer'
      when 'client_portal'    then 'Client'
      else initcap(replace(r.role, '_', ' '))
    end;

    new_role_id := gen_random_uuid()::text;

    insert into public.tenant_roles (id, tenant_id, name, is_system)
    values (new_role_id, r.tenant_id, role_label, r.role = 'tenant_owner');

    insert into public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
    select new_role_id, m, true, true, true, true
    from unnest(array['clients','jobs','candidates','placements','projects',
                       'reports','ai_agents','automation','settings']) as m;

    update public.platform_user_tenants
    set role_id = new_role_id
    where tenant_id = r.tenant_id and role = r.role;
  end loop;

  -- Defensive: any tenant with members but no 'tenant_owner' role value
  -- (shouldn't happen — provisioning always creates one) still gets a Super
  -- Admin role so the tenant is never left without one.
  for r in
    select t.id as tenant_id
    from public.tenants t
    where not exists (
      select 1 from public.tenant_roles tr
      where tr.tenant_id = t.id and tr.is_system = true
    )
    and exists (
      select 1 from public.platform_user_tenants put where put.tenant_id = t.id
    )
  loop
    new_role_id := gen_random_uuid()::text;

    insert into public.tenant_roles (id, tenant_id, name, is_system)
    values (new_role_id, r.tenant_id, 'Super Admin', true);

    insert into public.role_permissions (role_id, module, can_view, can_create, can_edit, can_delete)
    select new_role_id, m, true, true, true, true
    from unnest(array['clients','jobs','candidates','placements','projects',
                       'reports','ai_agents','automation','settings']) as m;
  end loop;
end $$;

alter table public.platform_user_tenants alter column role_id set not null;
alter table public.platform_user_tenants drop column role;
