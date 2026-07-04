-- =============================================================================
-- MIGRATION 0014: Client description field + private document storage
-- =============================================================================
-- Adds a free-text description shown on the client Overview tab.
-- client-documents was public (migration 0009), which meant anyone with a
-- storage URL could fetch a client's documents with no auth check at all.
-- Flip it private; the app now issues short-lived signed URLs on demand
-- instead of permanent public links.

alter table public.clients add column description text;

update storage.buckets set public = false where id = 'client-documents';
