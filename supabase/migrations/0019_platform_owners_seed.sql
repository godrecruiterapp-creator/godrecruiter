-- =============================================================================
-- MIGRATION 0019: Seed the first Platform Owner
-- =============================================================================
-- platform_owners has no UI-managed "pending" state (see 0018) — granting is
-- just inserting a row. This seeds the founder account if/when it exists;
-- no-ops harmlessly if the platform_users row hasn't been created yet
-- (it's upserted on first login, so re-running this after that login also works).

insert into public.platform_owners (platform_user_id)
select id from public.platform_users where email = 'bethiarunkumar@gmail.com'
on conflict (platform_user_id) do nothing;
