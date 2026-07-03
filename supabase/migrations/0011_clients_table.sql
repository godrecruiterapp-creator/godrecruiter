-- =============================================================================
-- MIGRATION 0011: Clients table + contacts, facilities, notes, activity, docs
-- =============================================================================
-- Mirrors the jobs/candidates pattern: public schema, tenant-scoped via
-- tenant_id, soft delete on the parent, writes go through the service-role
-- admin client (server actions) so only SELECT RLS policies are needed.

create table public.clients (
  id                            text primary key,                 -- ULID
  tenant_id                     text not null references public.tenants(id) on delete cascade,
  name                          text not null,
  display_name                  text,
  legal_name                    text,
  industry                      text not null default 'Other'
                                  check (industry in ('Healthcare','IT','Engineering','Finance','Manufacturing','Government','Professional Services','Other')),
  company_type                  text not null default 'direct'
                                  check (company_type in ('direct','vms')),
  status                        text not null default 'prospect'
                                  check (status in ('active','prospect','inactive')),
  website                       text,
  tax_id                        text,
  company_size                  text,
  city                          text,
  state                         text,
  country                       text not null default 'USA',
  zip                           text,
  timezone                      text,
  account_owner                 text,
  recruitment_manager           text,
  primary_recruiter             text,
  preferred_communication       text,
  preferred_submission_method   text,
  preferred_resume_format       text,
  preferred_interview_process   text,
  special_instructions          text,
  tags                          text[] not null default '{}',
  created_by                    text references public.platform_users(id),
  deleted_at                    timestamptz,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

create index idx_clients_tenant_id on public.clients(tenant_id) where deleted_at is null;
create index idx_clients_name      on public.clients(tenant_id, name) where deleted_at is null;

create trigger set_updated_at_clients
  before update on public.clients
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;

create policy "clients: tenant members can read"
  on public.clients for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.client_contacts (
  id                        text primary key,
  client_id                 text not null references public.clients(id) on delete cascade,
  tenant_id                 text not null references public.tenants(id) on delete cascade,
  name                      text not null,
  title                     text,
  department                text,
  email                     text,
  phone                     text,
  mobile                    text,
  linkedin                  text,
  preferred_contact_method  text,
  decision_maker            boolean not null default false,
  is_primary                boolean not null default false,
  status                    text not null default 'active'
                              check (status in ('active','inactive')),
  notes                     text,
  created_at                timestamptz not null default now()
);

create index idx_client_contacts_client_id on public.client_contacts(client_id, created_at);

alter table public.client_contacts enable row level security;

create policy "client_contacts: tenant members can read"
  on public.client_contacts for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.client_facilities (
  id                text primary key,
  client_id         text not null references public.clients(id) on delete cascade,
  tenant_id         text not null references public.tenants(id) on delete cascade,
  name              text not null,
  type              text not null default 'Hospital'
                      check (type in ('Hospital','Clinic','Laboratory','Rehabilitation','Urgent Care','Skilled Nursing','Home Health')),
  city              text,
  state             text,
  departments       text[] not null default '{}',
  specialties       text[] not null default '{}',
  facility_manager  text,
  primary_contact   text,
  timezone          text,
  notes             text,
  created_at        timestamptz not null default now()
);

create index idx_client_facilities_client_id on public.client_facilities(client_id, created_at);

alter table public.client_facilities enable row level security;

create policy "client_facilities: tenant members can read"
  on public.client_facilities for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.client_notes (
  id          text primary key,
  client_id   text not null references public.clients(id) on delete cascade,
  tenant_id   text not null references public.tenants(id) on delete cascade,
  author_id   text references public.platform_users(id),
  author_name text not null,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index idx_client_notes_client_id on public.client_notes(client_id, created_at desc);

alter table public.client_notes enable row level security;

create policy "client_notes: tenant members can read"
  on public.client_notes for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.client_activity (
  id          text primary key,
  client_id   text not null references public.clients(id) on delete cascade,
  tenant_id   text not null references public.tenants(id) on delete cascade,
  actor_id    text references public.platform_users(id),
  actor_name  text not null,
  action      text not null,
  created_at  timestamptz not null default now()
);

create index idx_client_activity_client_id on public.client_activity(client_id, created_at desc);

alter table public.client_activity enable row level security;

create policy "client_activity: tenant members can read"
  on public.client_activity for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

create table public.client_documents (
  id            text primary key,
  client_id     text not null references public.clients(id) on delete cascade,
  tenant_id     text not null references public.tenants(id) on delete cascade,
  name          text not null,
  size          bigint,
  file_type     text,
  storage_path  text,
  category      text not null default 'Other',
  uploader_id   text references public.platform_users(id),
  uploader_name text not null,
  created_at    timestamptz not null default now()
);

create index idx_client_documents_client_id on public.client_documents(client_id, created_at desc);

alter table public.client_documents enable row level security;

create policy "client_documents: tenant members can read"
  on public.client_documents for select
  using (
    tenant_id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', true)
on conflict (id) do update set public = true;
