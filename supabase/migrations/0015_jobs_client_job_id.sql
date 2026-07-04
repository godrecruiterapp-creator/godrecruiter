-- =============================================================================
-- MIGRATION 0015: Client Job ID on jobs
-- =============================================================================
-- The client's own requisition/job number (their ATS/VMS req ID), distinct
-- from this app's internal display_id (e.g. JOB-0003).

alter table public.jobs add column client_job_id text;
