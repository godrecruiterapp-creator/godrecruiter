import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(2).max(200),
  department: z.string().max(100).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'temp', 'internship']),
  work_mode: z.enum(['onsite', 'remote', 'hybrid']).default('onsite'),
  description: z.string().nullable().optional(),
  salary_min: z.number().positive().nullable().optional(),
  salary_max: z.number().positive().nullable().optional(),
  salary_currency: z.string().length(3).default('USD'),
  is_confidential: z.boolean().default(false),
  custom_fields: z.record(z.unknown()).default({}),
})

export const updateJobSchema = createJobSchema.partial()

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
