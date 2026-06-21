import { z } from 'zod'

export const createCandidateSchema = z.object({
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).nullable().optional(),
  candidate_type: z.enum(['permanent', 'contract', 'temp', 'unknown']).default('unknown'),
  linkedin_url: z.string().url().nullable().optional(),
  current_title: z.string().max(150).nullable().optional(),
  current_company: z.string().max(150).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  custom_fields: z.record(z.unknown()).default({}),
})

export const updateCandidateSchema = createCandidateSchema.partial()

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>
