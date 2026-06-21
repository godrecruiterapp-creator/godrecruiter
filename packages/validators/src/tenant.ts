import { z } from 'zod'

export const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  region: z.enum(['us-east-1', 'eu-west-1', 'ap-southeast-1']).default('us-east-1'),
})

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logo_url: z.string().url().nullable().optional(),
  custom_domain: z.string().nullable().optional(),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
