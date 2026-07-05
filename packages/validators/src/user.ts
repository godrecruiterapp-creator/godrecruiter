import { z } from 'zod'

// Role is now a per-tenant custom role_id (see tenant_roles), not a fixed enum,
// so it's validated against the tenant's actual roles at the DB layer instead
// of a static schema here.
export const inviteUserSchema = z.object({
  email: z.string().email(),
  role_id: z.string().min(1),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
