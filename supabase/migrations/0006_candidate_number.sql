-- =============================================================================
-- MIGRATION 0006: Add short candidate_number (auto-increment display ID)
-- =============================================================================

alter table public.candidates
  add column candidate_number bigserial not null;

create unique index idx_candidates_number on public.candidates(candidate_number);
