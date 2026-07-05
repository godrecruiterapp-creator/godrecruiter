export const ROLE_LABELS: Record<string, string> = {
  tenant_owner:     'Owner',
  admin:            'Admin',
  senior_recruiter: 'Senior Recruiter',
  recruiter:        'Recruiter',
  sourcer:          'Sourcer',
  interviewer:      'Interviewer',
  client_portal:    'Client',
}

export function roleLabel(role: string | null | undefined) {
  return role ? (ROLE_LABELS[role] ?? role) : null
}
