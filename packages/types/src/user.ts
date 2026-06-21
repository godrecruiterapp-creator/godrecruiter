import type { ULID, Timestamp } from './common'

export type UserRole =
  | 'tenant_owner'
  | 'admin'
  | 'senior_recruiter'
  | 'recruiter'
  | 'sourcer'
  | 'interviewer'
  | 'client_portal'

export type PlatformUser = {
  id: ULID
  email: string
  full_name: string
  avatar_url: string | null
  created_at: Timestamp
}

export type TenantUser = {
  id: ULID
  platform_user_id: ULID
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  last_seen_at: Timestamp | null
  created_at: Timestamp
}

export type AuthUser = PlatformUser & {
  tenant_id: ULID
  schema_name: string
  role: UserRole
}
