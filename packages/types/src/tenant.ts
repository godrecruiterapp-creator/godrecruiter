import type { ULID, Timestamp } from './common'

export type TenantRegion = 'us-east-1' | 'eu-west-1' | 'ap-southeast-1'

export type TenantStatus = 'active' | 'suspended' | 'cancelled' | 'trial'

export type Tenant = {
  id: ULID
  name: string
  slug: string
  schema_name: string
  region: TenantRegion
  status: TenantStatus
  plan_id: ULID
  logo_url: string | null
  custom_domain: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export type TenantContext = {
  tenant_id: ULID
  schema_name: string
  slug: string
  region: TenantRegion
  plan_id: ULID
}
