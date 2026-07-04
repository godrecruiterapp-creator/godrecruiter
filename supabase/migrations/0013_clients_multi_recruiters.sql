-- =============================================================================
-- MIGRATION 0013: Account owner / recruitment manager / primary recruiter
-- become multi-select (text[]) to match assigned_recruiters
-- =============================================================================
-- Each column used to hold a single free-text name. Existing single values are
-- preserved by wrapping them in a one-element array.

alter table public.clients rename column account_owner to account_owner_old;
alter table public.clients add column account_owner text[] not null default '{}';
update public.clients set account_owner = case when account_owner_old is not null and account_owner_old <> '' then array[account_owner_old] else '{}' end;
alter table public.clients drop column account_owner_old;

alter table public.clients rename column recruitment_manager to recruitment_manager_old;
alter table public.clients add column recruitment_manager text[] not null default '{}';
update public.clients set recruitment_manager = case when recruitment_manager_old is not null and recruitment_manager_old <> '' then array[recruitment_manager_old] else '{}' end;
alter table public.clients drop column recruitment_manager_old;

alter table public.clients rename column primary_recruiter to primary_recruiter_old;
alter table public.clients add column primary_recruiter text[] not null default '{}';
update public.clients set primary_recruiter = case when primary_recruiter_old is not null and primary_recruiter_old <> '' then array[primary_recruiter_old] else '{}' end;
alter table public.clients drop column primary_recruiter_old;
