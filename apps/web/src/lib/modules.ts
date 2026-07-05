// Mirrors the `module` check constraint in role_permissions
// (supabase/migrations/0018_tenant_roles_permissions.sql) 1:1.
export const MODULES = [
  { key: 'clients',    label: 'Clients' },
  { key: 'jobs',       label: 'Jobs' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'placements', label: 'Placements' },
  { key: 'projects',   label: 'Projects' },
  { key: 'reports',    label: 'Reports' },
  { key: 'ai_agents',  label: 'AI Agent Hub' },
  { key: 'automation', label: 'Automation' },
  { key: 'settings',   label: 'Settings' },
] as const

export type ModuleKey = typeof MODULES[number]['key']
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'
