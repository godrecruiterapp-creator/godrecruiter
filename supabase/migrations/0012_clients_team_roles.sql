-- =============================================================================
-- MIGRATION 0012: Client team roles (team lead + assigned recruiters)
-- =============================================================================
-- account_owner and recruitment_manager already exist (migration 0011). This
-- adds the remaining two roles surfaced in the client workspace's team panel.

alter table public.clients
  add column team_lead          text,
  add column assigned_recruiters text[] not null default '{}';
