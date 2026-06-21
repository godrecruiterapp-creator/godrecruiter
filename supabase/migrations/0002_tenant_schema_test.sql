-- =============================================================================
-- MIGRATION 0002: Tenant Schema Template
-- God Recruiter â€” executed once per tenant inside their own schema
-- Replace tenant_test with the actual schema name before running
-- All ADR decisions (R2-R10) are reflected here
-- =============================================================================

-- NOTE: This file is a template. The schema provisioning Edge Function
-- substitutes tenant_test and executes this via the admin client.

-- Create the schema first
create schema if not exists tenant_test;

-- =============================================================================
-- USERS & ROLES  (tenant-scoped)
-- =============================================================================
create table tenant_test.users (
  id                  text primary key,           -- ULID (ADR R2)
  platform_user_id    text not null unique,        -- FK to public.platform_users
  email               text not null unique,
  full_name           text not null,
  avatar_url          text,
  role                text not null default 'recruiter'
                        check (role in ('tenant_owner','admin','senior_recruiter','recruiter','sourcer','interviewer','client_portal')),
  is_active           boolean not null default true,
  notification_prefs  jsonb not null default '{}',
  last_seen_at        timestamptz,
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_users_email       on tenant_test.users(email) where deleted_at is null;
create index idx_users_role        on tenant_test.users(role) where deleted_at is null;
create index idx_users_platform_id on tenant_test.users(platform_user_id);

-- =============================================================================
-- CUSTOM FIELDS SCHEMA  (tenant-defined field definitions â€” ADR R5)
-- =============================================================================
create table tenant_test.custom_fields_schema (
  id            text primary key,                 -- ULID
  entity_type   text not null
                  check (entity_type in ('candidate','job','application','client')),
  field_key     text not null,
  field_label   text not null,
  field_type    text not null
                  check (field_type in ('text','number','date','boolean','select','multi_select','url')),
  options       jsonb default '[]',               -- for select/multi_select
  is_required   boolean not null default false,
  is_default    boolean not null default false,   -- pre-seeded defaults (ADR R5)
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (entity_type, field_key)
);

-- Seed 5 default staffing custom fields (ADR R5)
insert into tenant_test.custom_fields_schema
  (id, entity_type, field_key, field_label, field_type, options, is_required, is_default, sort_order)
values
  (gen_random_uuid()::text, 'candidate', 'visa_status',        'Visa Status',         'select',
   '["Citizen","PR","H1B","H4 EAD","OPT","CPT","GC EAD","TN","No Sponsorship Required"]', false, true, 1),
  (gen_random_uuid()::text, 'candidate', 'notice_period',      'Notice Period',        'select',
   '["Immediate","1 Week","2 Weeks","1 Month","2 Months","3 Months"]',                    false, true, 2),
  (gen_random_uuid()::text, 'candidate', 'current_ctc',        'Current CTC',          'number',
   '[]',                                                                                  false, true, 3),
  (gen_random_uuid()::text, 'candidate', 'expected_ctc',       'Expected CTC',         'number',
   '[]',                                                                                  false, true, 4),
  (gen_random_uuid()::text, 'candidate', 'willing_to_relocate','Willing to Relocate',  'boolean',
   '[]',                                                                                  false, true, 5);

-- =============================================================================
-- CANDIDATES  (first-class entity â€” ADR R3)
-- =============================================================================
create table tenant_test.candidates (
  id                text primary key,             -- ULID (ADR R2)
  first_name        text not null,
  last_name         text not null,
  email             text not null unique,
  phone             text,
  candidate_type    text not null default 'unknown'
                      check (candidate_type in ('permanent','contract','temp','unknown')),
  linkedin_url      text,
  github_url        text,
  portfolio_url     text,
  current_title     text,
  current_company   text,
  location          text,
  resume_url        text,
  resume_text       text,                         -- extracted plain text for FTS
  search_vector     tsvector,                     -- FTS index (ADR R10)
  embedding         vector(1536),                 -- AI vector â€” nullable until AI enabled (ADR R10)
  custom_fields     jsonb not null default '{}',  -- ADR R5
  source            text,                         -- 'linkedin','referral','inbound','import', etc.
  source_detail     text,
  is_do_not_contact boolean not null default false,
  deleted_at        timestamptz,                  -- ADR R8: soft delete
  created_by        text references tenant_test.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Partial indexes â€” only active records (ADR R8)
create index idx_candidates_email       on tenant_test.candidates(email) where deleted_at is null;
create index idx_candidates_created_at  on tenant_test.candidates(created_at desc) where deleted_at is null;
create index idx_candidates_type        on tenant_test.candidates(candidate_type) where deleted_at is null;
create index idx_candidates_fts         on tenant_test.candidates using gin(search_vector);
create index idx_candidates_custom      on tenant_test.candidates using gin(custom_fields);
create index idx_candidates_embedding   on tenant_test.candidates using ivfflat(embedding vector_cosine_ops)
  with (lists = 100);                             -- ADR R10: ready for semantic search

-- Auto-update search_vector on insert/update
create or replace function tenant_test.update_candidate_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.first_name, '') || ' ' || coalesce(new.last_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.email, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.current_title, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.current_company, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.resume_text, '')), 'D');
  return new;
end;
$$;

create trigger trg_candidate_search_vector
  before insert or update on tenant_test.candidates
  for each row execute function tenant_test.update_candidate_search_vector();

-- =============================================================================
-- JOBS
-- =============================================================================
create table tenant_test.jobs (
  id                text primary key,             -- ULID
  title             text not null,
  department        text,
  location          text,
  job_type          text not null
                      check (job_type in ('full_time','part_time','contract','temp','internship')),
  work_mode         text not null default 'onsite'
                      check (work_mode in ('onsite','remote','hybrid')),
  status            text not null default 'draft'
                      check (status in ('draft','open','paused','closed','cancelled')),
  description       text,
  description_html  text,
  search_vector     tsvector,                     -- ADR R10
  salary_min        integer,                      -- cents
  salary_max        integer,                      -- cents
  salary_currency   text not null default 'USD',
  is_confidential   boolean not null default false,
  is_published      boolean not null default false,
  published_at      timestamptz,
  target_hire_date  date,
  filled_at         timestamptz,
  custom_fields     jsonb not null default '{}',  -- ADR R5
  pipeline_template_id text,
  client_id         text,                         -- CRM: which client this job is for
  created_by        text references tenant_test.users(id),
  deleted_at        timestamptz,                  -- ADR R8
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_jobs_status       on tenant_test.jobs(status) where deleted_at is null;
create index idx_jobs_created_at   on tenant_test.jobs(created_at desc) where deleted_at is null;
create index idx_jobs_fts          on tenant_test.jobs using gin(search_vector);
create index idx_jobs_custom       on tenant_test.jobs using gin(custom_fields);

create or replace function tenant_test.update_job_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.department, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.location, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'D');
  return new;
end;
$$;

create trigger trg_job_search_vector
  before insert or update on tenant_test.jobs
  for each row execute function tenant_test.update_job_search_vector();

-- =============================================================================
-- PIPELINE STAGES
-- =============================================================================
create table tenant_test.pipeline_stages (
  id            text primary key,                 -- ULID
  job_id        text references tenant_test.jobs(id) on delete cascade,
                                                  -- null = template/default stage
  name          text not null,
  stage_type    text not null
                  check (stage_type in ('sourced','applied','screening','interview','offer','hired','rejected','withdrawn')),
  color         text not null default '#8b5cf6',
  sort_order    integer not null default 0,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index idx_pipeline_stages_job on tenant_test.pipeline_stages(job_id);

-- =============================================================================
-- APPLICATIONS  (join between candidates and jobs â€” ADR R3)
-- =============================================================================
create table tenant_test.applications (
  id                    text primary key,         -- ULID
  candidate_id          text not null references tenant_test.candidates(id),
  job_id                text not null references tenant_test.jobs(id),
  current_stage_id      text references tenant_test.pipeline_stages(id),
                                                  -- materialized shortcut â€” truth is in events (ADR R4)
  status                text not null default 'active'
                          check (status in ('active','rejected','withdrawn','hired','on_hold')),
  source                text,                     -- 'career_page','linkedin','referral','import', etc.
  source_detail         text,
  rejection_reason      text,
  offer_amount          integer,                  -- cents
  offer_currency        text default 'USD',
  hired_at              timestamptz,
  custom_fields         jsonb not null default '{}', -- ADR R5
  deleted_at            timestamptz,              -- ADR R8
  created_by            text references tenant_test.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (candidate_id, job_id)
);

create index idx_apps_candidate    on tenant_test.applications(candidate_id) where deleted_at is null;
create index idx_apps_job          on tenant_test.applications(job_id) where deleted_at is null;
create index idx_apps_stage        on tenant_test.applications(current_stage_id) where deleted_at is null;
create index idx_apps_status       on tenant_test.applications(status) where deleted_at is null;

-- =============================================================================
-- APPLICATION STAGE EVENTS  (immutable event log â€” ADR R4)
-- =============================================================================
create table tenant_test.application_stage_events (
  id                text primary key,             -- ULID
  application_id    text not null references tenant_test.applications(id),
  from_stage_id     text references tenant_test.pipeline_stages(id),
  to_stage_id       text references tenant_test.pipeline_stages(id),
  actor_id          text references tenant_test.users(id),
  event_type        text not null default 'move'
                      check (event_type in ('move','correction','hire','reject','withdraw')),
  note              text,
  created_at        timestamptz not null default now()
  -- NO updated_at â€” this table is append-only, never updated
);

create index idx_stage_events_app    on tenant_test.application_stage_events(application_id, created_at desc);
create index idx_stage_events_actor  on tenant_test.application_stage_events(actor_id);

-- =============================================================================
-- NOTES
-- =============================================================================
create table tenant_test.notes (
  id              text primary key,               -- ULID
  entity_type     text not null
                    check (entity_type in ('candidate','application','job','client')),
  entity_id       text not null,
  body            text not null,
  is_pinned       boolean not null default false,
  author_id       text references tenant_test.users(id),
  deleted_at      timestamptz,                    -- ADR R8
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_notes_entity on tenant_test.notes(entity_type, entity_id) where deleted_at is null;

-- =============================================================================
-- INTERVIEWS
-- =============================================================================
create table tenant_test.interviews (
  id                text primary key,             -- ULID
  application_id    text not null references tenant_test.applications(id),
  interview_type    text not null
                      check (interview_type in ('phone','video','onsite','technical','panel','hiring_manager')),
  status            text not null default 'scheduled'
                      check (status in ('scheduled','completed','cancelled','no_show')),
  scheduled_at      timestamptz,
  duration_minutes  integer default 60,
  location          text,
  meeting_url       text,
  notes             text,
  scorecard_id      text,
  deleted_at        timestamptz,                  -- ADR R8
  created_by        text references tenant_test.users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_interviews_app      on tenant_test.interviews(application_id) where deleted_at is null;
create index idx_interviews_date     on tenant_test.interviews(scheduled_at) where deleted_at is null;

create table tenant_test.interview_participants (
  id              text primary key,               -- ULID
  interview_id    text not null references tenant_test.interviews(id) on delete cascade,
  user_id         text not null references tenant_test.users(id),
  role            text not null default 'interviewer'
                    check (role in ('interviewer','shadow','organizer')),
  created_at      timestamptz not null default now(),
  unique (interview_id, user_id)
);

-- =============================================================================
-- SCORECARDS
-- =============================================================================
create table tenant_test.scorecards (
  id              text primary key,               -- ULID
  interview_id    text references tenant_test.interviews(id),
  application_id  text not null references tenant_test.applications(id),
  author_id       text not null references tenant_test.users(id),
  overall_rating  text check (overall_rating in ('strong_yes','yes','no','strong_no')),
  summary         text,
  responses       jsonb not null default '[]',    -- array of {question, rating, notes}
  submitted_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_scorecards_app on tenant_test.scorecards(application_id);

-- =============================================================================
-- AUDIT EVENTS  (write-once, tamper-evident â€” ADR R4 principle extended)
-- =============================================================================
create table tenant_test.audit_events (
  id                text primary key,             -- ULID
  actor_id          text,                         -- null for system events
  actor_type        text not null default 'user'
                      check (actor_type in ('user','system','api')),
  event_type        text not null,
  entity_type       text,
  entity_id         text,
  entity_display    text,
  payload           jsonb default '{}',
  ip_address        inet,
  user_agent        text,
  created_at        timestamptz not null default now()
  -- NO updated_at, NO deleted_at â€” immutable
);

create index idx_audit_actor      on tenant_test.audit_events(actor_id, created_at desc);
create index idx_audit_entity     on tenant_test.audit_events(entity_type, entity_id, created_at desc);
create index idx_audit_event_type on tenant_test.audit_events(event_type, created_at desc);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
create table tenant_test.notifications (
  id              text primary key,               -- ULID
  user_id         text not null references tenant_test.users(id),
  type            text not null,
  title           text not null,
  body            text,
  entity_type     text,
  entity_id       text,
  is_read         boolean not null default false,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index idx_notifs_user_unread on tenant_test.notifications(user_id, created_at desc)
  where is_read = false;

-- =============================================================================
-- WORKSPACE SETTINGS
-- =============================================================================
create table tenant_test.workspace_settings (
  id            text primary key default 'singleton',  -- only one row per tenant
  name          text not null,
  timezone      text not null default 'UTC',
  date_format   text not null default 'MMM D, YYYY',
  currency      text not null default 'USD',
  career_page   jsonb not null default '{}',
  email_config  jsonb not null default '{}',
  settings      jsonb not null default '{}',
  updated_at    timestamptz not null default now()
);

insert into tenant_test.workspace_settings (id, name)
  values ('singleton', 'My Workspace');

-- =============================================================================
-- UPDATED_AT triggers (reuse platform helper isn't available in tenant schema)
-- =============================================================================
create or replace function tenant_test.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_users
  before update on tenant_test.users
  for each row execute function tenant_test.set_updated_at();

create trigger set_updated_at_candidates
  before update on tenant_test.candidates
  for each row execute function tenant_test.set_updated_at();

create trigger set_updated_at_jobs
  before update on tenant_test.jobs
  for each row execute function tenant_test.set_updated_at();

create trigger set_updated_at_applications
  before update on tenant_test.applications
  for each row execute function tenant_test.set_updated_at();

create trigger set_updated_at_interviews
  before update on tenant_test.interviews
  for each row execute function tenant_test.set_updated_at();

create trigger set_updated_at_scorecards
  before update on tenant_test.scorecards
  for each row execute function tenant_test.set_updated_at();

