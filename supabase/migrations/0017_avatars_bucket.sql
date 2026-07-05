-- =============================================================================
-- MIGRATION 0017: Avatars storage bucket
-- =============================================================================
-- Profile photo uploads go through the service-role admin client and are
-- served back via getPublicUrl(), so the bucket must be public.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
