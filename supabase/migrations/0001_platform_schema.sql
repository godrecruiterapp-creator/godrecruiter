-- =============================================================================
-- MIGRATION 0001: Platform Schema (public)
-- God Recruiter — tables that span all tenants
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";
create extension if not exists "pg_trgm";

-- =============================================================================
-- SUBSCRIPTION PLANS
-- =============================================================================
create table public.subscription_plans (
  id                  text primary key,           -- e.g. 'starter', 'growth', 'enterprise'
  name                text not null,
  description         text,
  price_monthly       integer,                    -- cents (null = custom/contact us pricing)
  price_yearly        integer,                    -- cents (null = custom/contact us pricing)
  max_users           integer,                    -- null = unlimited
  max_jobs            integer,                    -- null = unlimited
  features            jsonb not null default '{}',
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

insert into public.subscription_plans (id, name, description, price_monthly, price_yearly, max_users, max_jobs, features) values
  ('trial',      'Trial',      '14-day free trial',               0,      0,      5,    10,  '{"ats": true, "crm": false, "ai": false}'),
  ('starter',    'Starter',    'For small teams',              4900,  49000,    10,    25,  '{"ats": true, "crm": false, "ai": false}'),
  ('growth',     'Growth',     'For growing agencies',         9900,  99000,    50,   null, '{"ats": true, "crm": true, "ai": false}'),
  ('enterprise', 'Enterprise', 'Unlimited scale + SSO + SLA',  null,   null, null,   null, '{"ats": true, "crm": true, "ai": true, "sso": true, "custom_roles": true}');

-- =============================================================================
-- TENANTS
-- =============================================================================
create table public.tenants (
  id                  text primary key,           -- ULID
  name                text not null,
  slug                text not null unique,        -- URL-safe identifier
  schema_name         text not null unique,        -- tenant_{ulid} or pool_XXX
  region              text not null default 'us-east-1',
  status              text not null default 'trial'
                        check (status in ('trial','active','suspended','cancelled')),
  plan_id             text not null references public.subscription_plans(id) default 'trial',
  logo_url            text,
  custom_domain       text unique,
  stripe_customer_id  text unique,
  trial_ends_at       timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_tenants_slug         on public.tenants(slug) where deleted_at is null;
create index idx_tenants_custom_domain on public.tenants(custom_domain) where custom_domain is not null;
create index idx_tenants_status        on public.tenants(status) where deleted_at is null;

-- =============================================================================
-- PLATFORM USERS  (identity — exists once across all tenants)
-- =============================================================================
create table public.platform_users (
  id                  text primary key,           -- ULID — mirrors auth.users
  email               text not null unique,
  full_name           text not null,
  avatar_url          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- =============================================================================
-- PLATFORM USER ↔ TENANT  (membership + role)
-- =============================================================================
create table public.platform_user_tenants (
  id                  text primary key,           -- ULID
  platform_user_id    text not null references public.platform_users(id) on delete cascade,
  tenant_id           text not null references public.tenants(id) on delete cascade,
  role                text not null default 'recruiter'
                        check (role in ('tenant_owner','admin','senior_recruiter','recruiter','sourcer','interviewer','client_portal')),
  is_active           boolean not null default true,
  invited_by          text references public.platform_users(id),
  invited_at          timestamptz,
  joined_at           timestamptz,
  created_at          timestamptz not null default now(),
  unique (platform_user_id, tenant_id)
);

create index idx_put_user_id   on public.platform_user_tenants(platform_user_id);
create index idx_put_tenant_id on public.platform_user_tenants(tenant_id);

-- =============================================================================
-- TENANT SUBSCRIPTIONS
-- =============================================================================
create table public.tenant_subscriptions (
  id                    text primary key,           -- ULID
  tenant_id             text not null references public.tenants(id) on delete cascade,
  plan_id               text not null references public.subscription_plans(id),
  stripe_subscription_id text unique,
  status                text not null default 'active'
                          check (status in ('active','past_due','cancelled','paused')),
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at             timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_ts_tenant_id on public.tenant_subscriptions(tenant_id);

-- =============================================================================
-- FEATURE FLAGS  (per-tenant overrides)
-- =============================================================================
create table public.feature_flags (
  id          text primary key,                   -- ULID
  tenant_id   text references public.tenants(id) on delete cascade,
                                                  -- null = platform-wide default
  flag_key    text not null,
  is_enabled  boolean not null default false,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now(),
  unique (tenant_id, flag_key)
);

create index idx_ff_tenant_key on public.feature_flags(tenant_id, flag_key);

-- Default platform-wide flags
insert into public.feature_flags (id, tenant_id, flag_key, is_enabled) values
  ('flag_crm_default',   null, 'crm_module',    false),
  ('flag_ai_default',    null, 'ai_features',   false),
  ('flag_vms_default',   null, 'vms_module',    false),
  ('flag_api_default',   null, 'public_api',    false);

-- =============================================================================
-- SCHEMA POOL  (pre-warmed empty schemas for instant tenant provisioning — ADR R1)
-- =============================================================================
create table public.pool_schemas (
  id            text primary key,                 -- ULID
  schema_name   text not null unique,             -- e.g. 'pool_01ARZ3N...'
  is_available  boolean not null default true,
  created_at    timestamptz not null default now(),
  assigned_at   timestamptz,
  assigned_to   text references public.tenants(id)
);

create index idx_pool_available on public.pool_schemas(is_available) where is_available = true;

-- =============================================================================
-- USAGE EVENTS  (silent telemetry — ADR R9)
-- =============================================================================
create table public.usage_events (
  id            text primary key,                 -- ULID
  tenant_id     text not null references public.tenants(id) on delete cascade,
  event_type    text not null,
                -- candidates_added | jobs_published | emails_sent | ai_credits_used
                -- storage_bytes | api_calls | applications_processed | interviews_scheduled
  quantity      integer not null default 1,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now()
) partition by range (created_at);

-- Partition by month for efficient querying + archiving
create table public.usage_events_2026_01 partition of public.usage_events
  for values from ('2026-01-01') to ('2026-02-01');
create table public.usage_events_2026_06 partition of public.usage_events
  for values from ('2026-06-01') to ('2026-07-01');
create table public.usage_events_2026_07 partition of public.usage_events
  for values from ('2026-07-01') to ('2026-08-01');
create table public.usage_events_2026_08 partition of public.usage_events
  for values from ('2026-08-01') to ('2026-09-01');
create table public.usage_events_default  partition of public.usage_events default;

create index idx_ue_tenant_type_date
  on public.usage_events(tenant_id, event_type, created_at desc);

-- =============================================================================
-- TENANT DOMAINS  (custom domain mapping)
-- =============================================================================
create table public.tenant_domains (
  id            text primary key,                 -- ULID
  tenant_id     text not null references public.tenants(id) on delete cascade,
  domain        text not null unique,
  is_verified   boolean not null default false,
  verified_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- UPDATED_AT trigger helper
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_tenants
  before update on public.tenants
  for each row execute function public.set_updated_at();

create trigger set_updated_at_platform_users
  before update on public.platform_users
  for each row execute function public.set_updated_at();

create trigger set_updated_at_tenant_subscriptions
  before update on public.tenant_subscriptions
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY  (defense-in-depth layer — ADR R6)
-- Primary isolation is schema-per-tenant. RLS is a second layer only.
-- =============================================================================
alter table public.tenants               enable row level security;
alter table public.platform_users        enable row level security;
alter table public.platform_user_tenants enable row level security;
alter table public.tenant_subscriptions  enable row level security;
alter table public.feature_flags         enable row level security;
alter table public.usage_events          enable row level security;

-- Platform users can only read their own record
create policy "platform_users: read own"
  on public.platform_users for select
  using (id = (select auth.uid()::text));

-- Users can read tenants they belong to
create policy "tenants: read own memberships"
  on public.tenants for select
  using (
    id in (
      select tenant_id from public.platform_user_tenants
      where platform_user_id = (select auth.uid()::text)
        and is_active = true
    )
  );

-- Users can read their own tenant memberships
create policy "put: read own"
  on public.platform_user_tenants for select
  using (platform_user_id = (select auth.uid()::text));
