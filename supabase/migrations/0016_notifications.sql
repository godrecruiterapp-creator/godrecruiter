-- =============================================================================
-- MIGRATION 0016: Notifications
-- =============================================================================
-- Per-user notification feed (recruiter assigned, note added, candidate
-- submitted, interview scheduled, etc). Delivered live via Supabase Realtime —
-- the browser subscribes filtered to its own recipient_id.

create table public.notifications (
  id            text primary key,                 -- ULID
  tenant_id     text not null references public.tenants(id) on delete cascade,
  recipient_id  text not null references public.platform_users(id) on delete cascade,
  actor_id      text references public.platform_users(id),
  actor_name    text,
  type          text not null,
  title         text not null,
  body          text,
  link          text,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index idx_notifications_recipient on public.notifications(recipient_id, created_at desc);
create index idx_notifications_recipient_unread on public.notifications(recipient_id) where read_at is null;

alter table public.notifications enable row level security;

create policy "notifications: recipient can read own"
  on public.notifications for select
  using (recipient_id = (select auth.uid()::text));

-- Realtime: broadcast inserts so the bell updates instantly without polling.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;
