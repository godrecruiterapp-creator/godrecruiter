import type { ULID, Timestamp } from './common'

export type PlatformUser = {
  id: ULID
  email: string
  full_name: string
  avatar_url: string | null
  created_at: Timestamp
}

// Role is now a per-tenant custom name (see tenant_roles), not a fixed enum.
export type TenantUser = {
  id: ULID
  platform_user_id: ULID
  email: string
  full_name: string
  avatar_url: string | null
  role_id: ULID
  role_name: string
  is_active: boolean
  last_seen_at: Timestamp | null
  created_at: Timestamp
}

export type AuthUser = PlatformUser & {
  tenant_id: ULID
  schema_name: string
  role_id: ULID
  role_name: string
}
