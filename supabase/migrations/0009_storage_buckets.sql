-- =============================================================================
-- MIGRATION 0009: Storage buckets referenced by candidate/job upload actions
-- =============================================================================
-- Uploads go through the service-role admin client (bypasses storage RLS), and
-- downloads use getPublicUrl(), so these buckets must be public. They already
-- existed but were created private, which makes the public-object endpoint
-- return the same "Bucket not found" error as a genuinely missing bucket.

insert into storage.buckets (id, name, public)
values
  ('candidate-resumes',   'candidate-resumes',   true),
  ('candidate-documents', 'candidate-documents', true),
  ('job-documents',       'job-documents',       true)
on conflict (id) do update set public = true;
