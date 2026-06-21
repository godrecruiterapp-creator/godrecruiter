-- Run via Supabase Dashboard → Edge Functions → Cron
-- Or via pg_cron extension (Supabase Pro+)

-- Replenish the schema pool every 2 minutes (ADR R1)
select cron.schedule(
  'replenish-schema-pool',
  '*/2 * * * *',
  $$
    select net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/provision-tenant-schema',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

-- Helper function: rename a schema (called during tenant provisioning)
create or replace function public.rename_schema(old_name text, new_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute format('alter schema %I rename to %I', old_name, new_name);
end;
$$;

-- Helper function: execute arbitrary SQL (used by Edge Function for schema provisioning)
-- Only callable with service role key — never exposed publicly
create or replace function public.exec_sql(sql text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute sql;
end;
$$;

revoke all on function public.exec_sql(text) from public, anon, authenticated;
